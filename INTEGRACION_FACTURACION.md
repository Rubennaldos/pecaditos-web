# 🧾 Integración de Facturación Electrónica - PECADITOS CRM

## 📝 Resumen

Sistema de facturación electrónica integrado con Firebase Cloud Functions que emite comprobantes electrónicos automáticamente cuando se crea un pedido.

## 🏗️ Arquitectura

```
┌─────────────────┐
│   Frontend      │
│  (React App)    │
└────────┬────────┘
         │
         │ createOrder()
         ▼
┌─────────────────┐
│ firebaseService │
│      .ts        │
└────────┬────────┘
         │
         │ 1. Guarda pedido en Firebase RTDB
         │ 2. Genera ORD-### correlativo
         │ 3. Llama a issueElectronicInvoice (async)
         │
         ▼
┌─────────────────┐
│ Cloud Function  │
│ issueElectronic │
│    Invoice      │
└────────┬────────┘
         │
         │ HTTP POST
         ▼
┌─────────────────┐
│  API PSE/OSE    │
│     SUNAT       │
└─────────────────┘
```

## ⚙️ Instalación

### 1. Instalar Dependencias

```bash
cd functions
npm install axios
```

### 2. Configurar Credenciales

**Opción A: Usando Firebase CLI (Recomendado)**

Ejecuta el script de configuración:

**Windows:**
```bash
setup-facturacion.bat
```

**Linux/Mac:**
```bash
bash setup-facturacion.sh
```

**Opción B: Manual**

```bash
firebase functions:secrets:set FACTURACION_ENDPOINT
# Ingresa: https://api-tu-proveedor.com/v1/facturacion

firebase functions:secrets:set FACTURACION_TOKEN
# Ingresa: tu_token_de_autenticacion

firebase functions:secrets:set FACTURACION_SECRET
# Ingresa: tu_api_secret_key
```

### 3. Desplegar Functions

```bash
firebase deploy --only functions
```

## 📋 Archivos Modificados

### Backend (Firebase Functions)

**`functions/src/index.ts`**
- ✅ Agregada función `issueElectronicInvoice`
- ✅ Tipos `OrderRT` y `OrderItem` compatibles con el frontend
- ✅ Manejo de errores y validaciones
- ✅ Cálculo automático de IGV (18%)
- ✅ Timeout de 10 segundos

### Frontend

**`src/services/firebaseService.ts`**
- ✅ Import de `getFunctions` y `httpsCallable`
- ✅ Integración en `createOrder()` (línea 174+)
- ✅ Llamada asíncrona no bloqueante
- ✅ Guardado de estado en `orders/{id}/billing`

## 🔄 Flujo de Facturación

1. **Usuario crea pedido** → QuickOrderModal, AdminPanel, etc.
2. **Frontend llama a** `createOrder(orderData)`
3. **firebaseService.ts:**
   - Guarda pedido en `/orders/{id}`
   - Genera `orderNumber` (ORD-001, ORD-002, etc.)
   - **Llama asíncronamente** a `issueElectronicInvoice`
   - Retorna inmediatamente (no espera facturación)
4. **Cloud Function recibe datos:**
   - Valida RUC, total, items
   - Mapea items al formato PSE/OSE
   - Calcula IGV y valores unitarios
   - Envía POST a API del proveedor
5. **Resultado:**
   - ✅ **Éxito:** Guarda en `billing.invoiceIssued = true` + datos de factura
   - ❌ **Error:** Guarda en `billing.invoiceIssued = false` + mensaje de error

## 📊 Estructura de Datos

### Entrada (OrderRT)
```typescript
{
  id: "firebase_id",
  orderNumber: "ORD-001",
  total: 162.00,
  client: {
    ruc: "20123456789",
    legalName: "EMPRESA SAC",
    commercialName: "Mi Negocio"
  },
  customerAddress: "Av. Principal 123",
  items: [
    { name: "Hamburguesa Clásica", quantity: 12, price: 8.50 }
  ]
}
```

### Salida (guardado en Firebase)
```typescript
orders/{id}/billing: {
  invoiceIssued: true,
  invoiceData: {
    sunat_response_code: "0",
    numero_comprobante: "F001-00001",
    pdf_url: "https://...",
    xml_url: "https://..."
  },
  invoiceIssuedAt: "2025-11-20T15:30:00Z"
}
```

### En caso de error
```typescript
orders/{id}/billing: {
  invoiceIssued: false,
  invoiceError: "Error en la validación SUNAT: RUC no válido",
  invoiceAttemptedAt: "2025-11-20T15:30:00Z"
}
```

## 🧪 Testing

### Local (Emulador)
```bash
cd functions
npm run serve
```

Luego modifica temporalmente `firebaseService.ts` para apuntar al emulador:
```typescript
const functions = getFunctions();
connectFunctionsEmulator(functions, 'localhost', 5001);
```

### Producción
Verifica los logs:
```bash
firebase functions:log --only issueElectronicInvoice
```

O desde la consola:
https://console.firebase.google.com/project/YOUR_PROJECT_ID/functions

## ⚠️ Consideraciones Importantes

### 1. **Asincronía**
La facturación NO bloquea la creación del pedido. El pedido se guarda inmediatamente y la factura se emite en segundo plano.

### 2. **Reintentos**
Si la facturación falla, puedes implementar un Cloud Scheduler o trigger que busque pedidos con `billing.invoiceIssued === false` y reintente la emisión.

### 3. **IGV**
El cálculo asume que el precio almacenado **incluye IGV (18%)**. La función calcula:
- `valor_unitario = precio / 1.18` (sin IGV)
- `total_venta = cantidad * precio` (con IGV)

### 4. **Formato de Comprobante**
Actualmente usa:
- `tipo_comprobante: "01"` (Factura)
- `serie: "F001"`
- `numero: ORD-###` (sin el prefijo ORD)

Ajusta según tu proveedor PSE/OSE.

### 5. **Autenticación**
La función usa `onCall` que requiere autenticación. Si necesitas llamarla sin auth, usa `onRequest` en su lugar.

## 🔐 Seguridad

- ✅ Credenciales en Firebase Secrets (encriptadas)
- ✅ Timeout de 10 segundos
- ✅ Validación de datos obligatorios
- ✅ Manejo de errores de red y API
- ✅ Logs detallados para debugging

## 📈 Monitoreo

Campos a monitorear en Firebase RTDB:

```
orders/{id}/billing/
  ├─ invoiceIssued: boolean
  ├─ invoiceData: object (si éxito)
  ├─ invoiceError: string (si falló)
  ├─ invoiceIssuedAt: timestamp
  └─ invoiceAttemptedAt: timestamp
```

## 🛠️ Troubleshooting

### Error: "Faltan datos obligatorios (RUC, Total o Items)"
**Causa:** El pedido no tiene `client.ruc`, `total` o `items` vacío.
**Solución:** Verifica que el formulario de pedido capture estos datos.

### Error: "Error API de facturación: ..."
**Causa:** El proveedor PSE/OSE rechazó la factura.
**Solución:** Revisa el formato del payload según la documentación de tu PSE.

### Error: "Error de integración: timeout of 10000ms exceeded"
**Causa:** El PSE/OSE tardó más de 10 segundos en responder.
**Solución:** Aumenta el timeout en `index.ts` o contacta a tu proveedor.

### La factura no se emite pero el pedido sí se crea
**Causa:** Error en la Cloud Function después de crear el pedido.
**Solución:** Revisa los logs con `firebase functions:log`.

## 📞 Soporte

- **Documentación PSE/OSE:** Contacta a tu proveedor de facturación electrónica
- **Firebase Functions:** https://firebase.google.com/docs/functions
- **SUNAT - Facturación Electrónica:** https://www.sunat.gob.pe/

## 📄 Documentación Adicional

- [FACTURACION_CONFIG.md](functions/FACTURACION_CONFIG.md) - Configuración detallada
- [Firebase Functions Docs](https://firebase.google.com/docs/functions/callable)
- [Axios Docs](https://axios-http.com/)

---

**Versión:** 1.0.0  
**Fecha:** 20 de Noviembre, 2025  
**Autor:** CRM Pecaditos Team
