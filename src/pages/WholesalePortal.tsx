
import { useState } from 'react';
import { WholesaleAuthProvider, useWholesaleAuth } from '@/contexts/WholesaleAuthContext';
import { WholesaleCartProvider } from '@/contexts/WholesaleCartContext';
import { WholesaleLogin } from '@/components/wholesale/WholesaleLogin';
import { WholesaleDashboard } from '@/components/wholesale/WholesaleDashboard';
import { WholesaleCatalog } from '@/components/wholesale/WholesaleCatalog';
import { WholesaleStickyCart } from '@/components/wholesale/WholesaleStickyCart';
import { CategorySelector } from '@/components/catalog/CategorySelector';
import { CatalogHeader } from '@/components/catalog/CatalogHeader';
import { HeroBanner } from '@/components/catalog/HeroBanner';
import { PromoBanners } from '@/components/catalog/PromoBanners';
import { FAQSection } from '@/components/catalog/FAQSection';
import { PromotionalBanners } from '@/components/catalog/PromotionalBanners';

/**
 * PORTAL MAYORISTA PRINCIPAL
 * 
 * Página completa del portal mayorista en ruta /mayorista con:
 * - Login exclusivo para mayoristas
 * - Dashboard con datos del negocio
 * - Catálogo con precios mayoristas
 * - Carrito con pedido mínimo S/ 300
 * - Múltiplos de 6 unidades obligatorios
 * 
 * CARACTERÍSTICAS:
 * - Ruta independiente: /mayorista
 * - No interfiere con landing ni catálogo minorista
 * - Diseño coherente con la marca
 * - 100% responsive y profesional
 * 
 * PARA PERSONALIZAR:
 * - Modificar colores y estilos en los componentes
 * - Cambiar validaciones de pedido mínimo
 * - Agregar más funcionalidades específicas
 * - Conectar con Firebase para datos reales
 */

const WholesalePortalContent = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Portal mayorista siempre disponible - sin autenticación requerida
  return (
    <WholesaleCartProvider>
      <div className="min-h-screen bg-background">
        {/* Header mayorista */}
        <CatalogHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isMayorista={true}
        />

        {/* Dashboard mayorista - sin autenticación */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-2">🏪 Bienvenido al Portal Mayorista</h1>
            <p className="text-blue-100">Descuentos especiales • Pedidos mínimos • Atención personalizada</p>
          </div>
        </div>

        {/* Banner promocional */}
        <div className="relative">
          <HeroBanner />
          {/* Overlay para diferenciar mayorista */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-blue-600/20 flex items-center justify-center">
            <div className="bg-white/95 px-4 py-2 rounded-full shadow-lg">
              <span className="text-blue-600 font-bold text-sm">PORTAL MAYORISTA</span>
            </div>
          </div>
        </div>

        {/* Selector de categorías */}
        <CategorySelector 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Banner con botón expandible para condiciones */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-6">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <button 
              id="showConditions"
              onClick={() => {
                const modal = document.getElementById('conditionsModal');
                if (modal) modal.style.display = 'flex';
              }}
              className="bg-white rounded-lg px-6 py-3 shadow-md hover:shadow-lg transition-shadow text-blue-600 font-semibold"
            >
              📋 Mostrar Condiciones y Beneficios Mayoristas
            </button>
          </div>
        </div>

        {/* Modal de Condiciones (inicialmente oculto) */}
        <div 
          id="conditionsModal" 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          style={{ display: 'none' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.currentTarget.style.display = 'none';
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-blue-600">Condiciones y Beneficios Mayoristas</h2>
              <button 
                onClick={() => {
                  const modal = document.getElementById('conditionsModal');
                  if (modal) modal.style.display = 'none';
                }}
                className="text-stone-400 hover:text-stone-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-blue-600 mb-3">
                    🎯 Precios Exclusivos Mayoristas
                  </h3>
                  <p className="text-stone-600 text-sm mb-4">
                    Hasta 25% de descuento en pedidos grandes. Múltiplos de 6 unidades obligatorios.
                  </p>
                  <div className="text-sm text-stone-700 space-y-2">
                    <div className="flex justify-between">
                      <span>• 6-11 unidades:</span>
                      <span className="font-bold text-green-600">10% descuento</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• 12-23 unidades:</span>
                      <span className="font-bold text-green-600">15% descuento</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• 24+ unidades:</span>
                      <span className="font-bold text-green-600">25% descuento</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-green-600 mb-3">
                    📦 Pedido Mínimo S/ 300
                  </h3>
                  <p className="text-stone-600 text-sm mb-4">
                    Compra al por mayor con descuentos especiales y atención personalizada.
                  </p>
                  <div className="text-sm text-stone-700 space-y-2">
                    <div>• Sin costo de delivery en pedidos +S/ 500</div>
                    <div>• Facturación empresarial disponible</div>
                    <div>• Soporte dedicado vía WhatsApp</div>
                    <div>• Plazos de pago extendidos para clientes frecuentes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal con catálogo y carrito */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Catálogo mayorista */}
            <div className="flex-1">
              <WholesaleCatalog 
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
              />
              
              {/* FAQ específico para mayoristas */}
              <div className="mt-12">
                <FAQSection isMayorista={true} />
              </div>
            </div>

            {/* Carrito sticky mayorista */}
            <div className="hidden lg:block w-80">
              <WholesaleStickyCart />
            </div>
          </div>
        </div>

        {/* Banners promocionales finales */}
        <PromotionalBanners isMayorista={true} />

        {/* Carrito móvil flotante */}
        <div className="lg:hidden">
          <WholesaleStickyCart />
        </div>
      </div>
    </WholesaleCartProvider>
  );
};

// Componente principal sin providers de autenticación
const WholesalePortal = () => {
  return (
    <WholesaleCartProvider>
      <WholesalePortalContent />
    </WholesaleCartProvider>
  );
};

export default WholesalePortal;

/*
INSTRUCCIONES DE USO Y PERSONALIZACIÓN:

1. RUTA:
   - Esta página se accede desde /mayorista
   - Completamente independiente de landing (/) y catálogo (/catalogo)

2. CREDENCIALES DE PRUEBA:
   - Usuario: distribuidora@ejemplo.com
   - Contraseña: password123
   - Usuario 2: minimarket@ejemplo.com
   - Contraseña: password123

3. CARACTERÍSTICAS MAYORISTAS:
   - Pedido mínimo: S/ 300
   - Cantidades: múltiplos de 6 únicamente
   - Descuentos automáticos por volumen:
     * 6-11 unidades: 10% descuento
     * 12-23 unidades: 15% descuento  
     * 24+ unidades: 25% descuento
   - Precios mayoristas (20% menos que minorista)

4. CÓDIGOS DE DESCUENTO DISPONIBLES:
   - MAYORISTA15: 15% descuento adicional
   - ENERO2024: 10% descuento enero
   - NUEVOCLIENTE: 20% descuento nuevo cliente

5. PARA CONECTAR CON FIREBASE:
   - Reemplazar mock data en WholesaleAuthContext
   - Conectar carrito con Realtime Database
   - Implementar autenticación real con Firebase Auth
   - Sincronizar pedidos con sistema de facturación

6. PERSONALIZACIÓN:
   - Modificar colores en los componentes (azul/blue para mayorista)
   - Cambiar pedido mínimo en WholesaleCartContext
   - Ajustar descuentos en calculateWholesalePrice
   - Agregar más validaciones según necesidades del negocio

7. FLUJO DE USO:
   - Usuario ingresa a /mayorista
   - Login con credenciales mayoristas
   - Ve dashboard con datos de su negocio
   - Navega catálogo con precios especiales
   - Agrega productos (múltiplos de 6)
   - Carrito valida pedido mínimo S/ 300
   - Procede a checkout mayorista
*/
