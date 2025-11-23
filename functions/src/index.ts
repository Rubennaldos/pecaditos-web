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
