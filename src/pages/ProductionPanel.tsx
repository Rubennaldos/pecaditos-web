import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Package2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  BarChart3,
  LogOut,
  Edit3,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Edit,
  History,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { AdminProductionProvider, useAdminProduction } from '@/contexts/AdminProductionContext';
import { ProductCard } from '@/components/production/ProductCard';
import { AlertParametersModal } from '@/components/production/AlertParametersModal';
import { MovementHistoryModal } from '@/components/production/MovementHistoryModal';
import { AdminModeToggle } from '@/components/production/AdminModeToggle';
import { ProductionEditModal } from '@/components/production/ProductionEditModal';
import { ProductionHistoryModal } from '@/components/production/ProductionHistoryModal';
import { ProductionDeleteModal } from '@/components/production/ProductionDeleteModal';

// *** MOCK DATA DE PRODUCTOS Y STOCK ***
// CAMBIAR POR INTEGRACIÓN CON FIREBASE
const mockProducts = [
  {
    id: "prod_001",
    name: "Galletas Integrales Avena",
    flavor: "Avena",
    currentStock: 45,
    requiredStock: 80,
    optimalStock: 120,
    isFrequent: true,
    alertLevels: {
      low: 40,
      critical: 5,
      good: 100,
      excellent: 200
    },
    batches: [
      { id: "LOTE-2024-001", quantity: 25, productionDate: "2024-01-10" },
      { id: "LOTE-2024-002", quantity: 20, productionDate: "2024-01-12" }
    ]
  },
  {
    id: "prod_002",
    name: "Galletas Integrales Quinua",
    flavor: "Quinua",
    currentStock: 180,
    requiredStock: 60,
    optimalStock: 100,
    isFrequent: true,
    alertLevels: {
      low: 40,
      critical: 5,
      good: 100,
      excellent: 200
    },
    batches: [
      { id: "LOTE-2024-003", quantity: 100, productionDate: "2024-01-08" },
      { id: "LOTE-2024-004", quantity: 80, productionDate: "2024-01-14" }
    ]
  },
  {
    id: "prod_003",
    name: "Galletas Integrales Coco",
    flavor: "Coco",
    currentStock: 25,
    requiredStock: 90,
    optimalStock: 120,
    isFrequent: true,
    alertLevels: {
      low: 40,
      critical: 5,
      good: 100,
      excellent: 200
    },
    batches: [
      { id: "LOTE-2024-005", quantity: 25, productionDate: "2024-01-13" }
    ]
  },
  {
    id: "prod_004",
    name: "Galletas Integrales Chía",
    flavor: "Chía",
    currentStock: 3,
    requiredStock: 50,
    optimalStock: 80,
    isFrequent: true,
    alertLevels: {
      low: 40,
      critical: 5,
      good: 100,
      excellent: 200
    },
    batches: [
      { id: "LOTE-2024-006", quantity: 3, productionDate: "2024-01-05" }
    ]
  },
  {
    id: "prod_005",
    name: "Galletas Integrales Mix",
    flavor: "Mix Especial",
    currentStock: 250,
    requiredStock: 40,
    optimalStock: 100,
    isFrequent: true,
    alertLevels: {
      low: 40,
      critical: 5,
      good: 100,
      excellent: 200
    },
    batches: [
      { id: "LOTE-2024-007", quantity: 150, productionDate: "2024-01-11" },
      { id: "LOTE-2024-008", quantity: 100, productionDate: "2024-01-15" }
    ]
  },
  // Productos poco frecuentes
  {
    id: "prod_006",
    name: "Galletas Integrales Sésamo",
    flavor: "Sésamo",
    currentStock: 0,
    requiredStock: 10,
    optimalStock: 50,
    isFrequent: false,
    alertLevels: {
      low: 40,
      critical: 5,
      good: 100,
      excellent: 200
    },
    batches: []
  },
  {
    id: "prod_007",
    name: "Galletas Integrales Amaranto",
    flavor: "Amaranto",
    currentStock: 5,
    requiredStock: 15,
    optimalStock: 40,
    isFrequent: false,
    alertLevels: {
      low: 40,
      critical: 5,
      good: 100,
      excellent: 200
    },
    batches: []
  }
];

const ProductionPanelContent = () => {
  const navigate = useNavigate();
  const { logout, user } = useAdmin();
  const { isAdminMode } = useAdminProduction();
  const [showAddStock, setShowAddStock] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showInfrequent, setShowInfrequent] = useState(false);
  
  // Admin modals state
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [showAdminHistoryModal, setShowAdminHistoryModal] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  
  const [alertParameters, setAlertParameters] = useState({
    critical: 5,
    low: 40,
    good: 100,
    excellent: 200
  });
  const [newStockData, setNewStockData] = useState({
    quantity: '',
    loteId: '',
    comment: ''
  });

  // Función para obtener urgencia de stock
  const getStockUrgency = (product: any) => {
    const { currentStock, alertLevels } = product;
    if (currentStock <= alertLevels.critical) return 1; // Crítico
    if (currentStock <= alertLevels.low) return 2; // Bajo
    if (currentStock >= alertLevels.excellent) return 4; // Excelente
    if (currentStock >= alertLevels.good) return 3; // Bueno
    return 3; // Normal
  };

  // Separar y ordenar productos por urgencia
  const frequentProducts = mockProducts
    .filter(p => p.isFrequent)
    .sort((a, b) => getStockUrgency(a) - getStockUrgency(b));
  
  const infrequentProducts = mockProducts
    .filter(p => !p.isFrequent)
    .sort((a, b) => getStockUrgency(a) - getStockUrgency(b));

  const renderProductCard = (product: any, isInfrequent = false) => (
    <div key={product.id} className={`relative ${isAdminMode ? 'group' : ''}`}>
      {isAdminMode && (
        <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowEditModal(product.id);
            }}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-blue-100 hover:bg-blue-200 text-blue-600"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowAdminHistoryModal(product.id);
            }}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-green-100 hover:bg-green-200 text-green-600"
          >
            <History className="h-3 w-3" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(product.id);
            }}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-red-100 hover:bg-red-200 text-red-600"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <ProductCard
        product={product}
        onAddStock={handleAddStock}
        onShowHistory={handleShowHistory}
        isInfrequent={isInfrequent}
      />
    </div>
  );

  const handleAddStock = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowAddStock(true);
    }
  };

  const handleShowHistory = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowHistoryModal(true);
    }
  };

  const confirmAddStock = () => {
    if (!newStockData.quantity) {
      alert('La cantidad es obligatoria');
      return;
    }

    console.log('Agregando stock:', {
      productId: selectedProduct?.id,
      ...newStockData
    });

    // TODO: Integrar con Firebase
    setShowAddStock(false);
    setSelectedProduct(null);
    setNewStockData({
      quantity: '',
      loteId: '',
      comment: ''
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleSaveAlertParameters = (parameters: any) => {
    setAlertParameters(parameters);
    console.log('Guardando parámetros de alerta:', parameters);
    // TODO: Integrar con Firebase
  };

  // Estadísticas generales
  const totalProducts = frequentProducts.length;
  const criticalProducts = frequentProducts.filter(p => p.currentStock <= alertParameters.critical).length;
  const lowStockProducts = frequentProducts.filter(p => p.currentStock > alertParameters.critical && p.currentStock <= alertParameters.low).length;
  const goodStockProducts = frequentProducts.filter(p => p.currentStock >= alertParameters.good).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-stone-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <Package2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-800">Panel de Producción</h1>
                <p className="text-stone-600">Control de stock y producción</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-stone-600 border-stone-300 hover:bg-stone-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard de Estadísticas */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package2 className="h-4 w-4 text-stone-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Crítico</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Bueno</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{goodStockProducts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Productos Frecuentes - Ordenados por Urgencia */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-stone-800">Productos Principales</h2>
            <Badge variant="outline" className="text-sm">
              Ordenados por urgencia
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {frequentProducts.map((product) => renderProductCard(product))}
          </div>
        </div>

        {/* Productos Poco Frecuentes - Sección Colapsable */}
        <Collapsible open={showInfrequent} onOpenChange={setShowInfrequent}>
          <Card className="mb-8">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-stone-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg font-semibold text-stone-700">
                      Sabores Poco Frecuentes
                    </div>
                    <Badge variant="secondary">
                      {infrequentProducts.length} productos
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {showInfrequent ? (
                      <>
                        <EyeOff className="h-4 w-4 text-stone-500" />
                        <ChevronUp className="h-4 w-4 text-stone-500" />
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 text-stone-500" />
                        <ChevronDown className="h-4 w-4 text-stone-500" />
                      </>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {showInfrequent ? 'Ocultar' : 'Mostrar'} productos de rotación baja o estacional
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {infrequentProducts.map((product) => renderProductCard(product, true))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Configuración de Alertas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <CardTitle>Configuración de Alertas</CardTitle>
              </div>
              {user?.profile === 'admin' && (
                <Button
                  onClick={() => setShowAlertModal(true)}
                  variant="outline"
                  size="sm"
                  className="text-stone-600 hover:text-stone-800"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
            <CardDescription>
              {user?.profile === 'admin' 
                ? 'Puedes modificar los parámetros de alertas' 
                : 'Los parámetros de alertas solo pueden ser modificados por el administrador general'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-red-50 border border-red-200 rounded">
                <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <div className="font-medium text-red-800">Crítico</div>
                <div className="text-red-600">≤ {alertParameters.critical} unidades</div>
                <div className="text-xs text-red-500 mt-1">Parpadeo rojo</div>
              </div>
              <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded">
                <TrendingDown className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <div className="font-medium text-orange-800">Bajo</div>
                <div className="text-orange-600">{alertParameters.critical + 1}-{alertParameters.low} unidades</div>
                <div className="text-xs text-orange-500 mt-1">Naranja</div>
              </div>
              <div className="text-center p-3 bg-green-50 border border-green-200 rounded">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="font-medium text-green-800">Bueno</div>
                <div className="text-green-600">{alertParameters.good}+ unidades</div>
                <div className="text-xs text-green-500 mt-1">Verde</div>
              </div>
              <div className="text-center p-3 bg-green-50 border border-green-300 rounded">
                <TrendingUp className="h-6 w-6 text-green-700 mx-auto mb-2" />
                <div className="font-medium text-green-900">Excelente</div>
                <div className="text-green-700">{alertParameters.excellent}+ unidades</div>
                <div className="text-xs text-green-600 mt-1">Verde fuerte</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Mode Toggle - REMOVIDO según instrucciones */}

      {/* Admin Modals */}
      {showEditModal && (
        <ProductionEditModal
          record={mockProducts.find(p => p.id === showEditModal)}
          isOpen={!!showEditModal}
          onClose={() => setShowEditModal(null)}
        />
      )}

      {showAdminHistoryModal && (
        <ProductionHistoryModal
          record={mockProducts.find(p => p.id === showAdminHistoryModal)}
          isOpen={!!showAdminHistoryModal}
          onClose={() => setShowAdminHistoryModal(null)}
        />
      )}

      {showDeleteModal && (
        <ProductionDeleteModal
          record={mockProducts.find(p => p.id === showDeleteModal)}
          isOpen={!!showDeleteModal}
          onClose={() => setShowDeleteModal(null)}
        />
      )}

      {/* Modal para Agregar Stock */}
      {showAddStock && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Agregar Stock</CardTitle>
              <CardDescription>
                {selectedProduct.name} - {selectedProduct.flavor}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cantidad *</label>
                <Input
                  type="number"
                  placeholder="Cantidad a agregar"
                  value={newStockData.quantity}
                  onChange={(e) => setNewStockData({...newStockData, quantity: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Número de Lote (opcional)</label>
                <Input
                  placeholder="Ej: LOTE-2024-009"
                  value={newStockData.loteId}
                  onChange={(e) => setNewStockData({...newStockData, loteId: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Comentario (opcional)</label>
                <Input
                  placeholder="Descripción del ingreso"
                  value={newStockData.comment}
                  onChange={(e) => setNewStockData({...newStockData, comment: e.target.value})}
                />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Nota:</strong> El lote será obligatorio en futuras versiones para mejor trazabilidad.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={confirmAddStock}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Stock
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddStock(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Parámetros de Alertas */}
      {showAlertModal && (
        <AlertParametersModal
          onClose={() => setShowAlertModal(false)}
          onSave={handleSaveAlertParameters}
          currentParameters={alertParameters}
        />
      )}

      {/* Modal de Historial de Movimientos */}
      {showHistoryModal && selectedProduct && (
        <MovementHistoryModal
          product={selectedProduct}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
};

const ProductionPanel = () => {
  return (
    <AdminProductionProvider>
      <ProductionPanelContent />
    </AdminProductionProvider>
  );
};

export default ProductionPanel;
