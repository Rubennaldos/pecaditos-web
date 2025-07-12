
/**
 * BANNERS PROMOCIONALES FINALES
 * 
 * Banners al final de la página para:
 * - Promociones de temporada
 * - Invitación a seguir redes sociales
 * - Suscripción a newsletter
 * - Programa de fidelidad
 * 
 * PARA PERSONALIZAR:
 * - Cambiar promociones estacionales
 * - Modificar links a redes sociales
 * - Conectar formulario de newsletter
 */

export const PromotionalBanners = () => {
  return (
    <section className="py-12 bg-stone-50">
      <div className="container mx-auto px-4">
        <div className="space-y-8">
          {/* Banner de suscripción */}
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
              ¡Suscríbete y obtén 15% OFF en tu primer pedido!
            </h2>
            <p className="text-amber-100 mb-6 max-w-2xl mx-auto">
              Recibe ofertas exclusivas, nuevos sabores y promociones especiales 
              directamente en tu email.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu email aquí..."
                className="flex-1 px-4 py-3 rounded-lg text-stone-800 placeholder:text-stone-500"
              />
              <button className="bg-white text-amber-600 px-6 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors">
                Suscribirme
              </button>
            </div>
            <p className="text-xs text-amber-100 mt-3">
              * Promoción válida solo para nuevos suscriptores
            </p>
          </div>

          {/* Banners de redes sociales */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Instagram */}
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <span className="text-2xl">📸</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">@pecaditosintegrales</h3>
                    <p className="text-pink-100 text-sm">Síguenos en Instagram</p>
                  </div>
                </div>
                <p className="text-pink-100 mb-4">
                  Ve nuestras galletas recién horneadas, recetas exclusivas y clientes felices.
                </p>
                <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-purple-50 transition-colors">
                  Seguir ahora
                </button>
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full"></div>
            </div>

            {/* WhatsApp */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">+51 999 123 456</h3>
                    <p className="text-green-100 text-sm">Contáctanos por WhatsApp</p>
                  </div>
                </div>
                <p className="text-green-100 mb-4">
                  Asesoría personalizada, pedidos especiales y soporte inmediato.
                </p>
                <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-50 transition-colors">
                  Escribir ahora
                </button>
              </div>
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full"></div>
            </div>
          </div>

          {/* Banner de programa de fidelidad */}
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-8 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-display font-bold text-stone-800 mb-4">
                🏆 Programa de Clientes Frecuentes
              </h2>
              <p className="text-stone-600 mb-6">
                Acumula puntos con cada compra y canjéalos por descuentos, 
                productos gratuitos y beneficios exclusivos.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="font-semibold text-stone-800 mb-1">Acumula puntos</h4>
                  <p className="text-xs text-stone-600">1 punto por cada S/ 10 gastado</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🎁</div>
                  <h4 className="font-semibold text-stone-800 mb-1">Canjea premios</h4>
                  <p className="text-xs text-stone-600">100 puntos = S/ 10 de descuento</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">⭐</div>
                  <h4 className="font-semibold text-stone-800 mb-1">Beneficios VIP</h4>
                  <p className="text-xs text-stone-600">Acceso a ofertas exclusivas</p>
                </div>
              </div>
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold">
                Unirme al programa
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
