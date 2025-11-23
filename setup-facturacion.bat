@echo off
REM Script para configurar las credenciales de facturación electrónica (Windows)
REM Ejecutar desde la raíz del proyecto: setup-facturacion.bat

echo.
echo 🔧 Configuración de Facturación Electrónica
echo ==========================================
echo.

REM Verificar que Firebase CLI esté instalado
where firebase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Firebase CLI no está instalado.
    echo    Instálalo con: npm install -g firebase-tools
    pause
    exit /b 1
)

echo Configura las credenciales de tu proveedor PSE/OSE:
echo.

REM Configurar ENDPOINT
echo 📡 Endpoint de la API (ej: https://api-facturacion.com/v1/invoices)
firebase functions:secrets:set FACTURACION_ENDPOINT

REM Configurar TOKEN
echo.
echo 🔑 Token de autenticación
firebase functions:secrets:set FACTURACION_TOKEN

REM Configurar SECRET
echo.
echo 🔐 API Secret Key
firebase functions:secrets:set FACTURACION_SECRET

echo.
echo ✅ Configuración completada.
echo.
echo Próximos pasos:
echo 1. Despliega las functions: firebase deploy --only functions
echo 2. Verifica los logs: firebase functions:log
echo.
pause
