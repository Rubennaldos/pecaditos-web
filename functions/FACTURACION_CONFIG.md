# Configuración de Facturación Electrónica

## 📋 Requisitos Previos

Para que la integración de facturación electrónica funcione correctamente, necesitas configurar las credenciales de tu proveedor PSE/OSE en Firebase Functions.

## 🔧 Configuración de Variables de Entorno

### Opción 1: Usando Firebase CLI (Recomendado para Producción)

Ejecuta los siguientes comandos en la terminal desde la raíz del proyecto:

```bash
# Configurar el endpoint de la API de facturación
firebase functions:secrets:set FACTURACION_ENDPOINT

# Configurar el token de autenticación
firebase functions:secrets:set FACTURACION_TOKEN

# Configurar el secret/API key
firebase functions:secrets:set FACTURACION_SECRET
```

Cuando se te solicite, ingresa los valores proporcionados por tu proveedor PSE/OSE.

### Opción 2: Archivo .env local (Solo para desarrollo/testing)

Crea un archivo `.env` en la carpeta `functions/` con el siguiente contenido:

```env
FACTURACION_ENDPOINT=https://api-tu-proveedor.com/v1/facturacion
FACTURACION_TOKEN=tu_token_de_autenticacion
FACTURACION_SECRET=tu_api_secret_key
```

⚠️ **IMPORTANTE:** Nunca subas este archivo a Git. Ya está incluido en `.gitignore`.

## 🚀 Despliegue

Una vez configuradas las variables, despliega las functions:

```bash
firebase deploy --only functions
```

## 📡 Estructura de la API

La Cloud Function `issueElectronicInvoice` espera recibir un objeto con la siguiente estructura (compatible con OrderRT):

```typescript
{
  id: "firebase_generated_id",
  orderNumber: "ORD-001",
  total: 162.00,
  client: {
    ruc: "20123456789",
    legalName: "EMPRESA SAC",
    commercialName: "Mi Negocio"
  },
  customerAddress: "Av. Principal 123",
  items: [
    {
      name: "Hamburguesa Clásica",
      quantity: 12,
      price: 8.50
    }
  ]
}
```

### Respuesta Exitosa

```json
{
  "success": true,
  "message": "Factura emitida y aceptada por SUNAT.",
  "data": {
    "sunat_response_code": "0",
    "numero_comprobante": "F001-00001",
    "pdf_url": "https://...",
    "xml_url": "https://..."
  }
}
```

### Respuesta con Error

```json
{
  "error": {
    "code": "failed-precondition",
    "message": "Error en la validación SUNAT: RUC no válido"
  }
}
```

## 🔍 Monitoreo

Para ver los logs de las funciones:

```bash
firebase functions:log
```

O desde la consola de Firebase:
https://console.firebase.google.com/project/YOUR_PROJECT_ID/functions

## 🧪 Testing

Para probar la función localmente con el emulador:

```bash
cd functions
npm run serve
```

Luego puedes llamar a la función desde el cliente apuntando al emulador.

## 📝 Notas Importantes

1. **Asíncrono:** La facturación se ejecuta en segundo plano. El pedido se crea inmediatamente sin esperar la respuesta de SUNAT.

2. **Estado de Facturación:** Se guarda en `orders/{orderId}/billing`:
   - `invoiceIssued: true/false`
   - `invoiceData`: Datos de la factura emitida
   - `invoiceError`: Mensaje de error si falló
   - `invoiceIssuedAt`: Timestamp de emisión

3. **IGV:** El cálculo del IGV (18%) se hace en la función. El precio unitario incluye IGV.

4. **Reintentos:** Si falla la emisión, puedes implementar un sistema de reintentos consultando `orders` donde `billing.invoiceIssued === false`.

## 🔐 Seguridad

- Las credenciales se manejan mediante Firebase Secrets (encriptadas)
- La función solo puede ser llamada por usuarios autenticados (configurable en `onCall`)
- Timeout de 10 segundos para evitar esperas indefinidas

## 📞 Soporte

Para más información sobre tu proveedor PSE/OSE, contacta con tu integrador de facturación electrónica.
