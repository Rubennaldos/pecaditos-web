
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Package2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Calendar,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';

/**
 * PANEL DE PRODUCCIÓN - CONTROL DE STOCK Y PRODUCCIÓN
 * 
 * Funcionalidades principales:
 * - Vista de stock por producto/sabor
 * - Alertas visuales por nivel de stock
 * - Solo permite agregar stock (con lote obligatorio)
 * - Parámetros de alertas configurables por admin
 * - Sistema FIFO (First In, First Out)
 * - Dashboards visual con colores
 * 
 * *** MOCK DATA - INTEGRAR CON FIREBASE REALTIME DATABASE ***
 */

// *** MOCK DATA DE PRODUCTOS Y STOCK ***
// CAMBIAR POR INTEGRACIÓN CON FIREBASE
const mockProducts = [
  {
    id: "prod_001",
    name: "Galletas Integrales Avena",
    flavor: "Avena",
    currentStock: 45,
    requiredStock: 80, // Basado en pedidos pendientes
    optimalStock: 120,
    alertLevels: {
      low: 40,
      critical: 5,
      good: 100,
      excellent: 200
    },
    batches: [
      { id: "LOTE-2024-001", quantity: 25, productionDate: "2024-01-10", expiryDate: "2024-03-10" },
      { id: "LOTE-2024-002", quantity: 20, productionDate: "2024-01-12", expiryDate: "2024-03-12" }
    ]
  },
  {
    id: "prod_002",
    name: "Galletas Integrales Quinua",
    flavor: "Quinua",
    currentStock: 180,
    requiredStock: 60,
    optimalStock: 100,
    alertLevels: {
      low: 40,
      critical: 5,
      good: 100,
      excellent: 200
    },
    batches: [
      { id: "LOTE-2024-003", quantity: 100, productionDate: "2024-01-08", expiryDate: "2024-03-08" },
      { id: "LOTE-2024-004", quantity: 80, productionDate: "2024-01-14", expiryDate: "2024-03-14" }
    ]
  },
  {
    id: "prod_003",
    name: "Galletas Integrales Coco",
    flavor: "Coco",
    currentStock: 25,
    requiredStock: 90,
    optimalStock: 120,
    alertLevels: {
      low: 40,
      critical: 5,
      good: 100,
      excellent: 200
    },
    batches: [
      { id: "LOTE-2024-005", quantity: 25, productionDate: "2024-01-13", expiryDate: "2024-03-13" }
    ]
  },
  {
    id: "prod_004",
    name: "Galletas Integrales Chía",
    flavor: "Chía",
    currentStock: 3,
    requiredStock: 50,
    optimalStock: 80,
    alertLevels: {
      low: 40,
      critical: 5,
      good: 100,
      excellent: 200
    },
    batches: [
      { id: "LOTE-2024-006", quantity: 3, productionDate: "2024-01-05", expiryDate: "2024-03-05" }
    ]
  },
  {
    id: "prod_005",
    name: "Galletas Integrales Mix",
    flavor: "Mix Especial",
    currentStock: 250,
    requiredStock: 40,
    optimalStock: 100,
    alertLevels: {
      low: 40,
      critical: 5,
      good: 100,
      excellent: 200
    },
    batches: [
      { id: "LOTE-2024-007", quantity: 150, productionDate: "2024-01-11", expiryDate: "2024-03-11" },
      { id: "LOTE-2024-008", quantity: 100, productionDate: "2024-01-15", expiryDate: "2024-03-15" }
    ]
  }
];

const ProductionPanel = () => {
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const [showAddStock, setShowAddStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newStockData, setNewStockData] = useState({
    quantity: '',
    loteId: '',
    productionDate: '',
    expiryDate: ''
  });

  // *** FUNCIÓN PARA OBTENER COLOR Y ESTADO DEL STOCK ***
  const getStockStatus = (product: any) => {
    const { currentStock, alertLevels } = product;
    
    if (currentStock <= alertLevels.critical) {
      return {
        status: 'critical',
        color: 'bg-red-100 border-red-500 text-red-800',
        bgColor: 'bg-red-500',
        icon: AlertTriangle,
        pulse: true,
        text: 'CRÍTICO'
      };
    } else if (currentStock <= alertLevels.low) {
      return {
        status: 'low',
        color: 'bg-orange-100 border-orange-500 text-orange-800',
        bgColor: 'bg-orange-500',
        icon: TrendingDown,
        pulse: false,
        text: 'BAJO'
      };
    } else if (currentStock >= alertLevels.excellent) {
      return {
        status: 'excellent',
        color: 'bg-green-100 border-green-500 text-green-800',
        bgColor: 'bg-green-500',
        icon: TrendingUp,
        pulse: true,
        text: 'EXCELENTE'
      };
    } else if (currentStock >= alertLevels.good) {
      return {
        status: 'good',
        color: 'bg-green-100 border-green-400 text-green-700',
        bgColor: 'bg-green-400',
        icon: CheckCircle,
        pulse: false,
        text: 'BUENO'
      };
    } else {
      return {
        status: 'normal',
        color: 'bg-blue-100 border-blue-400 text-blue-700',
        bgColor: 'bg-blue-400',
        icon: Package2,
        pulse: false,
        text: 'NORMAL'
      };
    }
  };

  // *** FUNCIÓN PARA AGREGAR STOCK ***
  const handleAddStock = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowAddStock(true);
    }
  };

  // *** FUNCIÓN PARA CONFIRMAR AGREGAR STOCK ***
  const confirmAddStock = () => {
    if (!newStockData.quantity || !newStockData.loteId || !newStockData.productionDate || !newStockData.expiryDate) {
      alert('Todos los campos son obligatorios');
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
      productionDate: '',
      expiryDate: ''
    });
  };

  // *** CERRAR SESIÓN ***
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // *** ESTADÍSTICAS GENERALES ***
  const totalProducts = mockProducts.length;
  const criticalProducts = mockProducts.filter(p => getStockStatus(p).status === 'critical').length;
  const lowStockProducts = mockProducts.filter(p => getStockStatus(p).status === 'low').length;
  const goodStockProducts = mockProducts.filter(p => ['good', 'excellent'].includes(getStockStatus(p).status)).length;

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

        {/* Cuadros de Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProducts.map((product) => {
            const status = getStockStatus(product);
            const IconComponent = status.icon;
            
            return (
              <Card 
                key={product.id} 
                className={`${status.color} border-2 ${status.pulse ? 'animate-pulse' : ''} hover:shadow-lg transition-all`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold">
                        {product.flavor}
                      </CardTitle>
                      <CardDescription className="text-stone-600">
                        {product.name}
                      </CardDescription>
                    </div>
                    <div className={`w-12 h-12 ${status.bgColor} rounded-full flex items-center justify-center`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Stock Actual vs Requerido */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Stock Actual:</span>
                      <Badge className={status.color}>
                        {product.currentStock} unidades
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Requerido:</span>
                      <span className="text-sm font-medium">{product.requiredStock}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Óptimo:</span>
                      <span className="text-sm font-medium">{product.optimalStock}</span>
                    </div>
                  </div>

                  {/* Barra de Progreso Visual */}
                  <div className="space-y-2">
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${status.bgColor}`}
                        style={{ 
                          width: `${Math.min((product.currentStock / product.optimalStock) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {status.text}
                      </Badge>
                    </div>
                  </div>

                  {/* Lotes (FIFO) */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Lotes (FIFO):
                    </div>
                    {product.batches.slice(0, 2).map((batch, index) => (
                      <div key={batch.id} className="text-xs bg-white bg-opacity-50 p-2 rounded">
                        <div className="font-medium">{batch.id}</div>
                        <div>Cantidad: {batch.quantity} | Vence: {new Date(batch.expiryDate).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>

                  {/* Botón para Agregar Stock */}
                  <Button
                    onClick={() => handleAddStock(product.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Stock
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Información de Alertas */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Configuración de Alertas
            </CardTitle>
            <CardDescription>
              Los parámetros de alertas solo pueden ser modificados por el administrador general
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-red-50 border border-red-200 rounded">
                <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <div className="font-medium text-red-800">Crítico</div>
                <div className="text-red-600">≤ 5 unidades</div>
                <div className="text-xs text-red-500 mt-1">Parpadeo rojo</div>
              </div>
              <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded">
                <TrendingDown className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <div className="font-medium text-orange-800">Bajo</div>
                <div className="text-orange-600">40-70 unidades</div>
                <div className="text-xs text-orange-500 mt-1">Naranja</div>
              </div>
              <div className="text-center p-3 bg-green-50 border border-green-200 rounded">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="font-medium text-green-800">Bueno</div>
                <div className="text-green-600">+100 unidades</div>
                <div className="text-xs text-green-500 mt-1">Verde</div>
              </div>
              <div className="text-center p-3 bg-green-50 border border-green-300 rounded">
                <TrendingUp className="h-6 w-6 text-green-700 mx-auto mb-2" />
                <div className="font-medium text-green-900">Excelente</div>
                <div className="text-green-700">+200 unidades</div>
                <div className="text-xs text-green-600 mt-1">Parpadeo verde</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <label className="text-sm font-medium">Número de Lote *</label>
                <Input
                  placeholder="Ej: LOTE-2024-009"
                  value={newStockData.loteId}
                  onChange={(e) => setNewStockData({...newStockData, loteId: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de Producción *</label>
                <Input
                  type="date"
                  value={newStockData.productionDate}
                  onChange={(e) => setNewStockData({...newStockData, productionDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de Vencimiento *</label>
                <Input
                  type="date"
                  value={newStockData.expiryDate}
                  onChange={(e) => setNewStockData({...newStockData, expiryDate: e.target.value})}
                />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Importante:</strong> El sistema usa FIFO (First In, First Out). 
                  Los lotes con fechas de vencimiento más cercanas se utilizarán primero.
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
    </div>
  );
};

export default ProductionPanel;

/*
INSTRUCCIONES PARA INTEGRACIÓN CON FIREBASE:

1. ESTRUCTURA DE DATOS:
   /products/{productId}: {
     name: string,
     flavor: string,
     currentStock: number,
     requiredStock: number (calculado automáticamente por pedidos),
     optimalStock: number,
     alertLevels: {
       low: number,
       critical: number,
       good: number,
       excellent: number
     }
   }

   /batches/{batchId}: {
     productId: string,
     loteId: string,
     quantity: number,
     productionDate: timestamp,
     expiryDate: timestamp,
     status: 'active' | 'depleted'
   }

2. FUNCIONALIDADES A IMPLEMENTAR:
   - Cálculo automático de stock requerido basado en pedidos
   - Alertas push cuando stock es crítico
   - Sistema FIFO automático
   - Reportes de producción
   - Previsión de demanda
   - Integración con área de pedidos

3. CONFIGURACIÓN DE ALERTAS (solo admin puede cambiar):
   - Crítico: ≤ 5 unidades (rojo parpadeante)
   - Bajo: 40-70 unidades (naranja)
   - Normal: 71-99 unidades (azul)
   - Bueno: 100-199 unidades (verde)
   - Excelente: ≥ 200 unidades (verde parpadeante)

4. MEJORAS SUGERIDAS:
   - Códigos de barras para lotes
   - Trazabilidad completa
   - Control de calidad por lote
   - Estadísticas de rotación
   - Predicción de vencimientos

5. PERSONALIZACIÓN:
   - Cambiar productos según catálogo real
   - Modificar parámetros de alertas
   - Agregar campos personalizados
   - Configurar unidades de medida
*/
