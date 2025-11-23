#!/bin/bash
# Script para configurar las credenciales de facturación electrónica
# Ejecutar desde la raíz del proyecto: bash setup-facturacion.sh

echo "🔧 Configuración de Facturación Electrónica"
echo "=========================================="
echo ""

# Verificar que Firebase CLI esté instalado
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI no está instalado."
    echo "   Instálalo con: npm install -g firebase-tools"
    exit 1
fi

echo "Configura las credenciales de tu proveedor PSE/OSE:"
echo ""

# Configurar ENDPOINT
echo "📡 Endpoint de la API (ej: https://api-facturacion.com/v1/invoices)"
firebase functions:secrets:set FACTURACION_ENDPOINT

# Configurar TOKEN
echo ""
echo "🔑 Token de autenticación"
firebase functions:secrets:set FACTURACION_TOKEN

# Configurar SECRET
echo ""
echo "🔐 API Secret Key"
firebase functions:secrets:set FACTURACION_SECRET

echo ""
echo "✅ Configuración completada."
echo ""
echo "Próximos pasos:"
echo "1. Despliega las functions: firebase deploy --only functions"
echo "2. Verifica los logs: firebase functions:log"
echo ""
