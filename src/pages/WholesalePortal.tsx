// src/pages/WholesalePortal.tsx
import { useState, useMemo } from 'react';
import { Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WholesaleCartProvider } from '@/contexts/WholesaleCartContext';
import { WholesaleCatalog } from '@/components/wholesale/WholesaleCatalog';
import { WholesaleStickyCart } from '@/components/wholesale/WholesaleStickyCart';
import { CategorySelector } from '@/components/catalog/CategorySelector';
import { WholesaleOrderHistory } from '@/components/wholesale/WholesaleOrderHistory';
import { WholesaleProfileEditor } from '@/components/wholesale/WholesaleProfileEditor';
import { WholesalePromotions } from '@/components/wholesale/WholesalePromotions';
import { RepeatOrderModal } from '@/components/wholesale/RepeatOrderModal';
import { useToast } from '@/hooks/use-toast';
import { useWholesaleCustomer } from '@/hooks/useWholesaleCustomer';

// (opcional) logout real con Firebase Auth
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/config/firebase';

const WholesalePortalContent = () => {
  const { toast } = useToast();

  // Datos del cliente (RTDB/Auth) —> usa tu hook, SIN mocks
  const { loading, displayName, data, updateProfile } = useWholesaleCustomer() as any;

  const customer = useMemo(() => {
    return {
      name:
        data?.nombreComercial ||
        data?.razonSocial ||
        displayName ||
        'Cliente mayorista',
      email: data?.email || data?.correo || '',
      phone: data?.telefono || data?.whatsapp || '',
      address: data?.direccion || '',
    };
  }, [data, displayName]);

  // UI state
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showPromotions, setShowPromotions] = useState(false);
  const [showRepeatOrder, setShowRepeatOrder] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(getAuth(app));
    } catch {
      // noop
    }
    toast({
      title: 'Sesión cerrada',
      description: 'Has salido de tu cuenta mayorista exitosamente.',
    });
    setShowAccountMenu(false);
    window.location.href = '/';
  };

  const handleRepeatOrder = (orderId: string) => {
    setShowRepeatOrder(true);
    setShowOrderHistory(false);
    toast({
      title: 'Repitiendo pedido',
      description: `Preparando repetición del pedido ${orderId}`,
    });
  };

  const handleProfileSave = async (payload: any) => {
    try {
      // Si tu hook expone updateProfile, úsalo (ignora si no existe)
      if (typeof updateProfile === 'function') {
        await updateProfile(payload);
      }
      toast({
        title: 'Datos actualizados',
        description: 'Tu información personal ha sido actualizada correctamente.',
      });
      setShowProfileEditor(false);
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'No se pudo actualizar el perfil.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-stone-800">Pecaditos Mayoristas</h1>
                <span className="text-sm text-blue-600">Portal Mayorista</span>
              </div>
            </div>

            {/* Búsqueda */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  type="text"
                  placeholder="Buscar productos mayoristas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-stone-50 border-stone-200 focus:border-blue-300"
                />
              </div>
            </div>

            {/* Acciones de usuario */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAccountMenu((v) => !v)}
                  className="bg-white hover:bg-stone-50"
                >
                  <User className="h-4 w-4 mr-2" />
                  Mi cuenta
                </Button>

                {/* Menú Mi Cuenta */}
                {showAccountMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-stone-200 rounded-lg shadow-xl z-50">
                    <div className="p-4 border-b border-stone-100">
                      <h3 className="font-semibold text-stone-800">
                        {loading ? 'Cargando…' : `¡Hola, ${customer.name}!`}
                      </h3>
                      {customer.email ? (
                        <p className="text-sm text-stone-600">{customer.email}</p>
                      ) : null}
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowOrderHistory(true);
                          setShowAccountMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-stone-50 text-sm"
                      >
                        📋 Historial de pedidos
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileEditor(true);
                          setShowAccountMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-stone-50 text-sm"
                      >
                        ✏️ Cambiar datos personales
                      </button>
                      <button
                        onClick={() => {
                          setShowPromotions(true);
                          setShowAccountMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-stone-50 text-sm"
                      >
                        🎁 Ver promociones activas
                      </button>
                      <div className="border-t border-stone-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left hover:bg-red-50 text-sm text-red-600"
                        >
                          🚪 Salir de la cuenta
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Carrito compacto */}
              <WholesaleStickyCart isCompact />
            </div>
          </div>
        </div>
      </header>

      {/* Bienvenida */}
      <div className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-stone-800 mb-2">
            {loading ? 'Cargando…' : `¡Bienvenido, ${customer.name}!`}
          </h2>
          <p className="text-stone-600">
            Descuentos especiales • Pedidos rápidos • Atención personalizada
          </p>
        </div>
      </div>

      {/* Categorías dinámicas */}
      <div className="bg-white py-4 border-b border-stone-100">
        <CategorySelector
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Condiciones */}
      <div className="bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <button
            id="showConditions"
            onClick={() => {
              const modal = document.getElementById('conditionsModal');
              if (modal) modal.style.display = 'flex';
            }}
            className="text-blue-600 hover:text-blue-700 font-medium underline"
          >
            Ver condiciones y beneficios mayoristas
          </button>
        </div>
      </div>

      {/* Modal condiciones */}
      <div
        id="conditionsModal"
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        style={{ display: 'none' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
        }}
      >
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-blue-600">
              Condiciones y Beneficios Mayoristas
            </h2>
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
                <h3 className="text-lg font-bold text-blue-600 mb-3">🎯 Precios Exclusivos Mayoristas</h3>
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
                <h3 className="text-lg font-bold text-green-600 mb-3">📦 Pedido Mínimo S/ 300</h3>
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

      {/* Catálogo */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <WholesaleCatalog selectedCategory={selectedCategory} searchQuery={searchQuery} />
      </div>

      {/* Modales */}
      <WholesaleOrderHistory
        isOpen={showOrderHistory}
        onClose={() => setShowOrderHistory(false)}
        onRepeatOrder={handleRepeatOrder}
      />

      <WholesaleProfileEditor
        isOpen={showProfileEditor}
        onClose={() => setShowProfileEditor(false)}
        onSave={handleProfileSave}
        // Puedes pasarle datos actuales si el componente lo admite:
        // initialValues={data}
      />

      <WholesalePromotions isOpen={showPromotions} onClose={() => setShowPromotions(false)} />

      <RepeatOrderModal isOpen={showRepeatOrder} onClose={() => setShowRepeatOrder(false)} />
    </div>
  );
};

const WholesalePortal = () => {
  return (
    <WholesaleCartProvider>
      <WholesalePortalContent />
    </WholesaleCartProvider>
  );
};

export default WholesalePortal;
