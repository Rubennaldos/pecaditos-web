// functions/src/index.ts
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { defineString, defineSecret } from "firebase-functions/params";
import axios from "axios";

initializeApp();

// --- CONFIGURACIÓN DE CREDENCIALES (usando parámetros de entorno) ---
const API_ENDPOINT = defineString("FACTURACION_ENDPOINT");
const API_TOKEN = defineString("FACTURACION_TOKEN");
const API_SECRET = defineString("FACTURACION_SECRET");

// Token para consultas de RUC/DNI (APIs públicas de Perú) - USANDO SECRETO
const consultasToken = defineSecret("CONSULTAS_TOKEN");

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
 * Implementa estrategia de fallback: intenta V2 primero, si falla usa V1 (legacy).
 * Configurado para usar Firebase Secrets de forma correcta.
 * 
 * @param data - { tipo: 'ruc' | 'dni', numero: string }
 * @returns { success: true, data: { ... } } con los datos encontrados
 */
export const consultarDocumento = onCall(
  { 
    region: "us-central1",
    secrets: [consultasToken] // Declarar el secreto que usa esta función
  },
  async (req) => {
    const { tipo, numero } = req.data as { tipo?: string; numero?: string };

    // Obtener el token del secreto con fallback a variable de entorno
    const token = consultasToken.value() || process.env.CONSULTAS_TOKEN;
    
    // Log de debug para verificar si el token existe
    console.log("[consultarDocumento] Debug Token:", token ? "Token existe ✓" : "Token es NULL ✗");
    console.log("[consultarDocumento] Tipo:", tipo, "| Numero:", numero);

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

    // Validar que el token esté configurado
    if (!token) {
      console.error("[consultarDocumento] ERROR: Token no configurado");
      throw new HttpsError(
        "failed-precondition",
        "Token de API no configurado. Ejecuta: firebase functions:secrets:set CONSULTAS_TOKEN"
      );
    }

    /**
     * Función auxiliar para intentar consulta con fallback V2 → V1
     */
    const consultarConFallback = async (urlV2: string, urlV1: string, tipoDoc: string) => {
      let response;

      try {
        // INTENTO 1: API V2 (formato moderno)
        console.log(`[consultarDocumento] Intentando ${tipoDoc} V2: ${urlV2}`);
        
        response = await axios.get(urlV2, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          timeout: 15000,
          validateStatus: (status) => status < 500,
        });

        console.log(`[consultarDocumento] V2 Status: ${response.status}`);

        // Si V2 funciona (200), usamos esa respuesta
        if (response.status === 200 && response.data) {
          console.log(`[consultarDocumento] ✓ V2 exitosa`);
          return { response, apiVersion: "V2" };
        }

        // Si V2 devuelve 404, intentamos V1
        if (response.status === 404) {
          console.log(`[consultarDocumento] V2 devolvió 404, intentando V1...`);
          throw new Error("V2_NOT_FOUND"); // Trigger fallback
        }

        // Otros errores de V2 (401, 403, etc.)
        if (response.status === 401 || response.status === 403) {
          throw new HttpsError(
            "permission-denied",
            "Token de API inválido o sin permisos. Verifica tu token en apis.net.pe"
          );
        }

        throw new HttpsError(
          "failed-precondition",
          `Error en API V2 (${response.status}): ${response.data?.message || "Sin datos"}`
        );

      } catch (errorV2: any) {
        // Si el error es 404 o error de conexión de V2, intentamos V1
        if (errorV2.message === "V2_NOT_FOUND" || errorV2.response?.status === 404 || errorV2.code === "ENOTFOUND") {
          console.log(`[consultarDocumento] Fallback: Intentando ${tipoDoc} V1: ${urlV1}`);
          
          try {
            // INTENTO 2: API V1 (formato legacy con query params)
            response = await axios.get(urlV1, {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
                "Content-Type": "application/json",
              },
              timeout: 15000,
              validateStatus: (status) => status < 500,
            });

            console.log(`[consultarDocumento] V1 Status: ${response.status}`);

            if (response.status === 200 && response.data) {
              console.log(`[consultarDocumento] ✓ V1 exitosa (fallback)`);
              return { response, apiVersion: "V1" };
            }

            // Errores de V1
            if (response.status === 404) {
              throw new HttpsError(
                "not-found",
                `${tipoDoc} ${numero} no encontrado en los registros`
              );
            }

            if (response.status === 401 || response.status === 403) {
              throw new HttpsError(
                "permission-denied",
                "Token de API inválido o sin permisos"
              );
            }

            throw new HttpsError(
              "failed-precondition",
              `Error en API V1 (${response.status}): ${response.data?.message || "Sin datos"}`
            );

          } catch (errorV1: any) {
            console.error(`[consultarDocumento] Error V1:`, errorV1.message);
            
            // Si V1 también falla, lanzar el error
            if (errorV1 instanceof HttpsError) {
              throw errorV1;
            }

            throw new HttpsError(
              "internal",
              `Error en ambas versiones de API (V2 y V1): ${errorV1.message}`
            );
          }
        } else {
          // Si no es un error 404, lanzar el error original de V2
          if (errorV2 instanceof HttpsError) {
            throw errorV2;
          }
          throw new HttpsError(
            "internal",
            `Error en API V2: ${errorV2.message}`
          );
        }
      }
    };

    try {
      let result;

      if (tipo === "ruc") {
        const urlV2 = `https://api.apis.net.pe/v2/sunat/ruc/${numero}`;
        const urlV1 = `https://api.apis.net.pe/v1/ruc?numero=${numero}`;
        
        result = await consultarConFallback(urlV2, urlV1, "RUC");
        
        console.log(`[consultarDocumento] Respuesta RUC (${result.apiVersion}):`, result.response.data);

        // Normalizar respuesta (funciona para V1 y V2)
        const data = result.response.data;
        
        return {
          success: true,
          apiVersion: result.apiVersion,
          data: {
            numeroDocumento: data.numeroDocumento || data.ruc || numero,
            razonSocial: data.razonSocial || data.nombre || data.nombre_o_razon_social || "",
            estado: data.estado || data.estado_del_contribuyente || "ACTIVO",
            condicion: data.condicion || data.condicion_de_domicilio || "",
            direccion: data.direccion || data.direccion_completa || "",
            departamento: data.departamento || data.ubigeo?.[0] || "",
            provincia: data.provincia || data.ubigeo?.[1] || "",
            distrito: data.distrito || data.ubigeo?.[2] || "",
            ubigeo: data.ubigeo || "",
          },
        };

      } else {
        // DNI
        const urlV2 = `https://api.apis.net.pe/v2/reniec/dni/${numero}`;
        const urlV1 = `https://api.apis.net.pe/v1/dni?numero=${numero}`;
        
        result = await consultarConFallback(urlV2, urlV1, "DNI");
        
        console.log(`[consultarDocumento] Respuesta DNI (${result.apiVersion}):`, result.response.data);

        // Normalizar respuesta (funciona para V1 y V2)
        const data = result.response.data;
        
        const nombreCompleto = [
          data.nombres || data.primer_nombre || "",
          data.apellidoPaterno || data.apellido_paterno || "",
          data.apellidoMaterno || data.apellido_materno || "",
        ]
          .filter((n) => n)
          .join(" ");

        return {
          success: true,
          apiVersion: result.apiVersion,
          data: {
            numeroDocumento: data.numeroDocumento || data.dni || numero,
            nombreCompleto,
            nombres: data.nombres || data.primer_nombre || "",
            apellidoPaterno: data.apellidoPaterno || data.apellido_paterno || "",
            apellidoMaterno: data.apellidoMaterno || data.apellido_materno || "",
          },
        };
      }

    } catch (error: any) {
      // Log del error completo para debugging
      console.error(`[consultarDocumento] Error final consultando ${tipo}:`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
      });

      // Si ya es un HttpsError, re-lanzarlo
      if (error.code && error.message && error.code.includes('/')) {
        throw error;
      }

      // Errores genéricos
      if (error.code === "ECONNABORTED") {
        throw new HttpsError(
          "deadline-exceeded",
          "Timeout: La API tardó demasiado en responder"
        );
      }

      if (error.response?.status === 429) {
        throw new HttpsError(
          "resource-exhausted",
          "Límite de consultas alcanzado. Intenta más tarde."
        );
      }

      throw new HttpsError(
        "internal",
        `Error de conexión: ${error.message}`
      );
    }
  }
);