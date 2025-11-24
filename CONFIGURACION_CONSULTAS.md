# Configuración de Consultas RUC/DNI

## 📋 Resumen
Se ha implementado la funcionalidad de búsqueda automática de datos para RUC y DNI en el sistema CRM.

## 🔧 Cambios Realizados

### Backend (Firebase Cloud Functions)

**Archivo:** `functions/src/index.ts`

Se agregó una nueva Cloud Function llamada `consultarDocumento` que:
- Recibe `{ tipo: 'ruc' | 'dni', numero: string }`
- Valida el formato del documento (11 dígitos para RUC, 8 para DNI)
- Consulta APIs externas para obtener los datos
- Retorna los datos estructurados según el tipo de documento

### Frontend

**Archivos Modificados:**
1. `src/components/admin/ClientsAccessManagement.tsx`
2. `src/components/clients/ClientsManagement.tsx`

**Funcionalidad agregada:**
- Estado de carga (`isSearching`)
- Función `handleSearch()` que llama a la Cloud Function
- Botones SUNAT/RENIEC conectados con:
  - Spinner de carga mientras busca
  - Validación de longitud del documento
  - Auto-completado de campos del formulario

## 🚀 Configuración Necesaria

### 1. Configurar el Token de API

Debes configurar el token para las consultas usando Firebase Functions secrets:

```bash
# En la carpeta raíz del proyecto
firebase functions:secrets:set CONSULTAS_TOKEN
```

Cuando te lo pida, ingresa tu token de API de apis.net.pe (o el servicio que uses).

### 2. Obtener un Token de API

Puedes usar servicios como:

**APIs.net.pe** (Recomendado)
- URL: https://apis.net.pe/
- Endpoints:
  - RUC: `https://api.apis.net.pe/v2/sunat/ruc?numero={ruc}`
  - DNI: `https://api.apis.net.pe/v2/reniec/dni?numero={dni}`
- Incluye token en header: `Authorization: Bearer {token}`

**Otros servicios alternativos:**
- API de SUNAT (oficial pero limitada)
- apiperu.dev
- DNI.pe

### 3. Desplegar las Functions

```bash
cd functions
npm run build
firebase deploy --only functions
```

## 📊 Estructura de Respuesta

### RUC (Consulta SUNAT)
```typescript
{
  success: true,
  data: {
    numeroDocumento: "20123456789",
    razonSocial: "EMPRESA SAC",
    estado: "ACTIVO",
    condicion: "HABIDO",
    direccion: "AV. EJEMPLO 123",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "LIMA",
    ubigeo: "150101"
  }
}
```

### DNI (Consulta RENIEC)
```typescript
{
  success: true,
  data: {
    numeroDocumento: "12345678",
    nombreCompleto: "JUAN CARLOS PEREZ GOMEZ",
    nombres: "JUAN CARLOS",
    apellidoPaterno: "PEREZ",
    apellidoMaterno: "GOMEZ"
  }
}
```

## 🎯 Uso en la Aplicación

### Para el Usuario Final:

1. Abrir el modal "Crear Nuevo Cliente"
2. Seleccionar tipo: RUC o DNI
3. Ingresar el número de documento (11 dígitos para RUC, 8 para DNI)
4. Hacer clic en el botón **SUNAT** o **RENIEC**
5. El sistema automáticamente completará:
   - **RUC:** Razón Social, Dirección, Estado, Departamento, Provincia, Distrito
   - **DNI:** Nombre completo

### Validaciones Implementadas:

✅ Campo RUC/DNI no puede estar vacío  
✅ RUC debe tener exactamente 11 dígitos  
✅ DNI debe tener exactamente 8 dígitos  
✅ Botón deshabilitado mientras busca  
✅ Spinner de carga visual  
✅ Mensajes de error claros  
✅ Toast de confirmación con los datos encontrados  

## 🔒 Seguridad

- El token de API está almacenado de forma segura en Firebase Secrets
- Las consultas se realizan desde el backend (Cloud Functions)
- No se expone el token al frontend
- Validación de permisos y autenticación en cada llamada

## 🐛 Troubleshooting

### Error: "Token de API inválido o sin permisos"
- Verifica que el token esté configurado correctamente
- Asegúrate de que el token tenga créditos/suscripción activa

### Error: "No se encontraron datos"
- El RUC/DNI puede no existir en la base de datos de SUNAT/RENIEC
- Verifica que el número esté correcto

### Error: "Error de conexión"
- Verifica tu conexión a internet
- La API externa puede estar temporalmente fuera de servicio

## 📝 Notas Adicionales

- La consulta toma aproximadamente 2-5 segundos
- Los datos devueltos son oficiales de SUNAT/RENIEC
- El sistema permite editar manualmente cualquier campo después de la consulta
- Si un campo no viene en la API, mantiene su valor actual

## 🔄 Actualizaciones Futuras Sugeridas

- [ ] Caché de consultas para evitar consultas repetidas
- [ ] Historial de consultas realizadas
- [ ] Validación adicional de RUC (dígito verificador)
- [ ] Soporte para más tipos de documentos (Carnet de Extranjería, etc.)
- [ ] Rate limiting para evitar abuso de la API
