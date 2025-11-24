@echo off
echo ========================================
echo Configuracion de Consultas RUC/DNI
echo ========================================
echo.

echo Este script te ayudara a configurar el token de API para las consultas de RUC/DNI.
echo.

echo Paso 1: Obtener un Token de API
echo ================================
echo.
echo Visita: https://apis.net.pe/
echo 1. Registrate o inicia sesion
echo 2. Ve a tu dashboard y copia tu API Token
echo 3. Ten el token listo para el siguiente paso
echo.

pause

echo.
echo Paso 2: Configurar el Token en Firebase
echo ========================================
echo.

firebase functions:secrets:set CONSULTAS_TOKEN

echo.
echo Paso 3: Desplegar las Functions
echo ================================
echo.

cd functions
call npm run build
firebase deploy --only functions

echo.
echo ========================================
echo Configuracion Completada!
echo ========================================
echo.
echo Ya puedes usar la funcionalidad de busqueda de RUC/DNI en tu aplicacion.
echo.

pause
