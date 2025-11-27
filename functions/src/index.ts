// functions/src/index.ts
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { defineString } from "firebase-functions/params";
import axios from "axios";

initializeApp();

// --- CONFIGURACIÓN DE CREDENCIALES (usando parámetros de entorno) ---
const API_ENDPOINT = defineString("FACTURACION_ENDPOINT");
const API_TOKEN = defineString("FACTURACION_TOKEN");
const API_SECRET = defineString("FACTURACION_SECRET");

// Token para consultas de RUC/DNI (APIs públicas de Perú)
const CONSULTAS_TOKEN = defineString("CONSULTAS_TOKEN");

// --- TIPOS COMPATIBLES CON OrderRT ---
type OrderItem = {
  name?: string;
  product?: string;
  title?: string;
  quantity?: number;
  price?: number;
};

type OrderRT = {
  id?: string;
  orderNumber?: string;
  status?: string;
  createdAt?: string | number;
  total?: number;
  items?: OrderItem[];
  client?: {
    ruc?: string;
    legalName?: string;
    commercialName?: string;
  };
  customerAddress?: string;
  customerPhone?: string;
  notes?: string;
};

export const createUser = onCall({ region: "us-central1" }, async (req) => {
  const { email, password, nombre, isAdmin } = (req.data || {}) as {
    email?: string; password?: string; nombre?: string; isAdmin?: boolean;
  };

  if (!email || !password || !nombre) {
    throw new HttpsError("invalid-argument",
      "Faltan campos requeridos: email, password, nombre");
  }

  try {
    const userRecord = await getAuth().createUser({
      email, password, displayName: nombre, disabled: false,
    });
    const uid = userRecord.uid;

    await getDatabase().ref(`usuarios/${uid}`).set({
      nombre,
      correo: email,
      isAdmin: isAdmin || false,
      activo: true,
      createdAt: new Date().toISOString(),
      accessModules: [],
      permissions: [],
    });

    return { ok: true, uid };
  } catch (err: any) {
    throw new HttpsError("internal", err?.message || "Error creando usuario");
  }
});

/**
 * Cloud Function que llama a la API del PSE/OSE para emitir la factura electrónica.
 * @param data - La data del pedido (OrderRT).
 */
export const issueElectronicInvoice = onCall(
  { region: "us-central1" },
  async (req) => {
    const orderData = req.data as OrderRT;

    // 1. Validar datos obligatorios
    if (!orderData.client?.ruc || !orderData.total || !orderData.items?.length) {
      throw new HttpsError(
        "invalid-argument",
        "Faltan datos obligatorios (RUC, Total o Items) para emitir factura."
      );
    }

    // 2. Mapear ITEMS al formato de la API de facturación (Ej. SUNAT/PSE)
    const itemsFacturacion = orderData.items.map((item) => {
      const precio = item.price || 0;
      const cantidad = item.quantity || 0;
      const valorUnitario = (precio / 1.18).toFixed(2); // Sin IGV
      const totalVenta = (cantidad * precio).toFixed(2);

      return {
        unidad_medida: "NIU",
        descripcion: item.name || item.product || item.title || "Producto",
        cantidad,
        precio_unitario: precio.toFixed(2),
        valor_unitario: valorUnitario,
        total_venta: totalVenta,
        tipo_impuesto: "10", // 10=Gravado IGV
      };
    });

    // 3. Construir el JSON de la Factura
    const invoicePayload = {
      // Datos del Comprobante
      tipo_comprobante: "01", // 01=Factura
      serie: "F001",
      numero: orderData.orderNumber?.replace("ORD-", "") || String(Date.now()).slice(-6),

      // Datos del Cliente
      datos_cliente: {
        numero_documento: orderData.client.ruc,
        razon_social: orderData.client.legalName || "Cliente Varios",
        direccion: orderData.customerAddress || "Sin dirección",
      },

      // Totales
      total_a_pagar: orderData.total.toFixed(2),

      // Items del comprobante
      items: itemsFacturacion,

      // Autenticación del PSE
      token_auth: API_TOKEN.value(),
    };

    try {
      // 4. Enviar a la API del Proveedor
      const response = await axios.post(API_ENDPOINT.value(), invoicePayload, {
        headers: {
          Authorization: `Bearer ${API_SECRET.value()}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 segundos
      });

      // 5. Manejar la respuesta
      if (response.data.sunat_response_code === "0") {
        return {
          success: true,
          message: "Factura emitida y aceptada por SUNAT.",
          data: response.data,
        };
      } else {
        throw new HttpsError(
          "failed-precondition",
          response.data.message || "Error en la validación SUNAT"
        );
      }
    } catch (error: any) {
      console.error("Error al emitir factura:", error.message);

      // Distinguir errores de red vs errores de la API
      if (error.response) {
        throw new HttpsError(
          "failed-precondition",
          `Error API de facturación: ${error.response.data?.message || error.message}`
        );
      } else {
        throw new HttpsError(
          "internal",
          `Error de integración: ${error.message}`
        );
      }
    }
  }
);

/**
 * Cloud Function para consultar datos de RUC o DNI desde APIs externas.
 * Usa la API de apis.net.pe V2 con formato correcto de URL y headers.
 * 
 * @param data - { tipo: 'ruc' | 'dni', numero: string }
 * @returns { success: true, data: { ... } } con los datos encontrados
 */
export const consultarDocumento = onCall(
  { region: "us-central1" },
  async (req) => {
    const { tipo, numero } = req.data as { tipo?: string; numero?: string };

    // Validar parámetros
    if (!tipo || !numero) {
      throw new HttpsError(
        "invalid-argument",
        "Debe proporcionar 'tipo' (ruc|dni) y 'numero'"
      );
    }

    if (tipo !== "ruc" && tipo !== "dni") {
      throw new HttpsError(
        "invalid-argument",
        "El tipo debe ser 'ruc' o 'dni'"
      );
    }

    // Validar longitud del documento
    if (tipo === "ruc" && numero.length !== 11) {
      throw new HttpsError(
        "invalid-argument",
        "El RUC debe tener 11 dígitos"
      );
    }

    if (tipo === "dni" && numero.length !== 8) {
      throw new HttpsError(
        "invalid-argument",
        "El DNI debe tener 8 dígitos"
      );
    }

    // Obtener el token de configuración
    const token = CONSULTAS_TOKEN.value();

    if (!token) {
      throw new HttpsError(
        "failed-precondition",
        "Token de API no configurado. Ejecuta: firebase functions:secrets:set CONSULTAS_TOKEN"
      );
    }

    try {
      let apiUrl: string;
      let response;

      if (tipo === "ruc") {
        // URL correcta para API V2 de SUNAT (sin query params, numero en la ruta)
        apiUrl = `https://api.apis.net.pe/v2/sunat/ruc/${numero}`;
        
        console.log(`[consultarDocumento] Consultando RUC: ${numero}`);
        console.log(`[consultarDocumento] URL: ${apiUrl}`);
        
        response = await axios.get(apiUrl, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          timeout: 15000, // 15 segundos de timeout
          validateStatus: (status) => status < 500, // No lanzar error en 4xx
        });

        console.log(`[consultarDocumento] Status: ${response.status}`);
        console.log(`[consultarDocumento] Data:`, response.data);

        // Verificar si hay error en la respuesta
        if (response.status === 401 || response.status === 403) {
          throw new HttpsError(
            "permission-denied",
            "Token de API inválido o sin permisos. Verifica tu token en apis.net.pe"
          );
        }

        if (response.status === 404) {
          throw new HttpsError(
            "not-found",
            `RUC ${numero} no encontrado en los registros de SUNAT`
          );
        }

        if (response.status !== 200 || !response.data) {
          throw new HttpsError(
            "failed-precondition",
            `Error en la API: ${response.data?.message || "Sin datos"}`
          );
        }

        // Estructura de respuesta de RUC:
        // {
        //   "numeroDocumento": "20123456789",
        //   "razonSocial": "EMPRESA SAC",
        //   "estado": "ACTIVO",
        //   "condicion": "HABIDO",
        //   "direccion": "AV. EJEMPLO 123",
        //   "ubigeo": "150101",
        //   "departamento": "LIMA",
        //   "provincia": "LIMA",
        //   "distrito": "LIMA"
        // }

        return {
          success: true,
          data: {
            numeroDocumento: response.data.numeroDocumento || numero,
            razonSocial: response.data.razonSocial || response.data.nombre || "",
            estado: response.data.estado || "ACTIVO",
            condicion: response.data.condicion || "",
            direccion: response.data.direccion || "",
            departamento: response.data.departamento || "",
            provincia: response.data.provincia || "",
            distrito: response.data.distrito || "",
            ubigeo: response.data.ubigeo || "",
          },
        };

      } else {
        // URL correcta para API V2 de RENIEC (sin query params, numero en la ruta)
        apiUrl = `https://api.apis.net.pe/v2/reniec/dni/${numero}`;
        
        console.log(`[consultarDocumento] Consultando DNI: ${numero}`);
        console.log(`[consultarDocumento] URL: ${apiUrl}`);
        
        response = await axios.get(apiUrl, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          timeout: 15000, // 15 segundos de timeout
          validateStatus: (status) => status < 500, // No lanzar error en 4xx
        });

        console.log(`[consultarDocumento] Status: ${response.status}`);
        console.log(`[consultarDocumento] Data:`, response.data);

        // Verificar si hay error en la respuesta
        if (response.status === 401 || response.status === 403) {
          throw new HttpsError(
            "permission-denied",
            "Token de API inválido o sin permisos. Verifica tu token en apis.net.pe"
          );
        }

        if (response.status === 404) {
          throw new HttpsError(
            "not-found",
            `DNI ${numero} no encontrado en los registros de RENIEC`
          );
        }

        if (response.status !== 200 || !response.data) {
          throw new HttpsError(
            "failed-precondition",
            `Error en la API: ${response.data?.message || "Sin datos"}`
          );
        }

        // Estructura de respuesta de DNI:
        // {
        //   "numeroDocumento": "12345678",
        //   "nombres": "JUAN CARLOS",
        //   "apellidoPaterno": "PEREZ",
        //   "apellidoMaterno": "GOMEZ"
        // }

        const nombreCompleto = [
          response.data.nombres || "",
          response.data.apellidoPaterno || "",
          response.data.apellidoMaterno || "",
        ]
          .filter((n) => n)
          .join(" ");

        return {
          success: true,
          data: {
            numeroDocumento: response.data.numeroDocumento || numero,
            nombreCompleto,
            nombres: response.data.nombres || "",
            apellidoPaterno: response.data.apellidoPaterno || "",
            apellidoMaterno: response.data.apellidoMaterno || "",
          },
        };
      }

    } catch (error: any) {
      // Log del error completo para debugging
      console.error(`[consultarDocumento] Error consultando ${tipo}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });

      // Si ya es un HttpsError, re-lanzarlo
      if (error.code && error.message) {
        throw error;
      }

      // Manejar errores de axios
      if (error.response) {
        const status = error.response.status;
        const apiMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          "Error desconocido";

        if (status === 404) {
          throw new HttpsError(
            "not-found",
            `${tipo.toUpperCase()} no encontrado en los registros`
          );
        } else if (status === 401 || status === 403) {
          throw new HttpsError(
            "permission-denied",
            `Token de API inválido o sin permisos (${status}). Mensaje: ${apiMessage}`
          );
        } else if (status === 429) {
          throw new HttpsError(
            "resource-exhausted",
            "Límite de consultas alcanzado. Intenta más tarde."
          );
        } else {
          throw new HttpsError(
            "failed-precondition",
            `Error en la API (${status}): ${apiMessage}`
          );
        }
      } else if (error.code === "ECONNABORTED") {
        throw new HttpsError(
          "deadline-exceeded",
          "Timeout: La API tardó demasiado en responder"
        );
      } else {
        throw new HttpsError(
          "internal",
          `Error de conexión: ${error.message}`
        );
      }
    }
  }
);
