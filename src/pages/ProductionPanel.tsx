
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { 
  Factory, 
  Package2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Minus,
  Search,
  Filter,
  LogOut,
  User
} from 'lucide-react';

/**
 * PANEL DE PRODUCCIÓN - CONTROL DE STOCK Y FABRICACIÓN
 * 
 * Funcionalidades específicas para el perfil de producción:
 * - Ver cantidades a fabricar según pedidos
 * - Control de stock en tiempo real
 * - Sumar y restar stock de productos
 * - Alertas de bajo stock automáticas
 * - Reportes de producción y inventario
 * - Filtros por categoría y estado
 * - Planificación de producción diaria/semanal
 * 
 * ACCESO: Solo usuarios con perfil "produccion" y admin (impersonación)
 * RUTA: /produccion
 */

const ProductionPanel = () => {
  const { user, logout } = useAdmin();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');

  // Mock data - En producción conectar con Firebase
  const mockInventory = [
    {
      id: 'PROD001',
      nombre: 'Granola Premium',
      categoria: 'granolas',
      stockActual: 15,
      stockMinimo: 20,
      stockMaximo: 100,
      unidadMedida: 'bolsas',
      costoPorUnidad: 8.50,
      precioVenta: 15.00,
      demandaDiaria: 8,
      tiempoProduccion: '2 horas',
      ultimaProduccion: '2024-01-10',
      estado: 'bajo_stock'
    },
    {
      id: 'PROD002', 
      nombre: 'Mix Frutos Secos',
      categoria: 'mixes',
      stockActual: 45,
      stockMinimo: 30,
      stockMaximo: 80,
      unidadMedida: 'bolsas',
      costoPorUnidad: 12.00,
      precioVenta: 22.00,
      demandaDiaria: 12,
      tiempoProduccion: '1.5 horas',
      ultimaProduccion: '2024-01-11',
      estado: 'stock_ok'
    },
    {
      id: 'PROD003',
      nombre: 'Barras Energéticas',
      categoria: 'barras',
      stockActual: 5,
      stockMinimo: 15,
      stockMaximo: 60,
      unidadMedida: 'unidades',
      costoPorUnidad: 3.50,
      precioVenta: 8.00,
      demandaDiaria: 15,
      tiempoProduccion: '3 horas',
      ultimaProduccion: '2024-01-09',
      estado: 'stock_critico'
    }
  ];

  const categories = ['todas', 'granolas', 'mixes', 'barras', 'snacks', 'combos'];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleStockChange = (productId: string, change: number) => {
    console.log(`📦 Ajustando stock de ${productId}: ${change > 0 ? '+' : ''}${change}`);
    // Aquí iría la lógica de actualización en Firebase
  };

  const handleProduceMore = (productId: string, quantity: number) => {
    console.log(`🏭 Produciendo ${quantity} unidades de ${productId}`);
    // Aquí iría la lógica de registro de producción
  };

  const getStockStatusColor = (estado: string) => {
    switch (estado) {
      case 'stock_critico': return 'bg-red-100 text-red-800 border-red-200';
      case 'bajo_stock': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'stock_ok': return 'bg-green-100 text-green-800 border-green-200';
      case 'sobre_stock': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStockPercentage = (actual: number, minimo: number, maximo: number) => {
    return ((actual - minimo) / (maximo - minimo)) * 100;
  };

  const filteredInventory = mockInventory.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'todas' || item.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalProducts = mockInventory.length;
  const lowStockProducts = mockInventory.filter(item => item.estado === 'bajo_stock' || item.estado === 'stock_critico').length;
  const criticalStockProducts = mockInventory.filter(item => item.estado === 'stock_critico').length;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header del Panel */}
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Factory className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-800">Panel de Producción</h1>
              <p className="text-sm text-stone-600">Control de stock y fabricación</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-amber-100 rounded-full">
              <User className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                {user?.name || 'Usuario Producción'}
              </span>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Alertas críticas */}
        {criticalStockProducts > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-bold text-red-800">¡ATENCIÓN! Stock Crítico</h3>
                <p className="text-red-700 text-sm">
                  {criticalStockProducts} producto{criticalStockProducts > 1 ? 's tienen' : ' tiene'} stock crítico y requieren producción inmediata.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">Total Productos</p>
                  <p className="text-2xl font-bold text-stone-600">{totalProducts}</p>
                </div>
                <Package2 className="h-8 w-8 text-stone-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">Stock Bajo</p>
                  <p className="text-2xl font-bold text-yellow-600">{lowStockProducts}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">Stock Crítico</p>
                  <p className="text-2xl font-bold text-red-600">{criticalStockProducts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">En Producción</p>
                  <p className="text-2xl font-bold text-blue-600">2</p>
                </div>
                <Factory className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    placeholder="Buscar producto por nombre o código..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(category => (
                  <Button 
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    size="sm"
                    className="capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de inventario */}
        <div className="space-y-4">
          {filteredInventory.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{item.nombre}</h3>
                      <Badge className={getStockStatusColor(item.estado)}>
                        {item.estado.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="capitalize">{item.categoria}</Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-stone-600">Stock Actual:</p>
                        <p className="font-bold text-2xl">{item.stockActual} {item.unidadMedida}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-stone-600">Rango Óptimo:</p>
                        <p className="font-medium">{item.stockMinimo} - {item.stockMaximo} {item.unidadMedida}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-stone-600">Demanda Diaria:</p>
                        <p className="font-medium">{item.demandaDiaria} {item.unidadMedida}</p>
                      </div>
                    </div>

                    {/* Barra de progreso de stock */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-stone-600 mb-1">
                        <span>Mínimo: {item.stockMinimo}</span>
                        <span>Actual: {item.stockActual}</span>
                        <span>Máximo: {item.stockMaximo}</span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.estado === 'stock_critico' ? 'bg-red-500' :
                            item.estado === 'bajo_stock' ? 'bg-yellow-500' :
                            item.estado === 'stock_ok' ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ 
                            width: `${Math.max(0, Math.min(100, getStockPercentage(item.stockActual, item.stockMinimo, item.stockMaximo)))}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-stone-600">Tiempo de Producción:</p>
                        <p className="font-medium">{item.tiempoProduccion}</p>
                      </div>
                      
                      <div>
                        <p className="text-stone-600">Última Producción:</p>
                        <p className="font-medium">{item.ultimaProduccion}</p>
                      </div>
                      
                      <div>
                        <p className="text-stone-600">Costo/Precio:</p>
                        <p className="font-medium">S/ {item.costoPorUnidad} / S/ {item.precioVenta}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {/* Controles de stock */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStockChange(item.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStockChange(item.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Botón de producir más */}
                    {(item.estado === 'bajo_stock' || item.estado === 'stock_critico') && (
                      <Button 
                        size="sm" 
                        onClick={() => handleProduceMore(item.id, item.stockMaximo - item.stockActual)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Factory className="h-4 w-4 mr-2" />
                        Producir
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductionPanel;

/*
INSTRUCCIONES PARA PERSONALIZAR:

1. CONECTAR CON FIREBASE:
   - Reemplazar mockInventory con datos de Firebase
   - Implementar actualizaciones de stock en tiempo real
   - Sincronizar con sistema de pedidos para calcular demanda

2. FUNCIONALIDADES A IMPLEMENTAR:
   - Alertas automáticas por email/WhatsApp
   - Planificación automática de producción
   - Códigos de barras para control de inventario
   - Reportes de costos y rentabilidad
   - Predicción de demanda con IA

3. PERSONALIZACIÓN:
   - Configurar niveles de stock por producto
   - Personalizar alertas y notificaciones
   - Integrar con proveedores y compras
   - Agregar fotos de productos

4. DATOS MOCK:
   - Actualizar con productos reales
   - Conectar con costos reales
   - Implementar historial de producción

ESTE PANEL ESTÁ DISEÑADO PARA:
- Personal de producción y cocina
- Control eficiente de inventario
- Planificación de producción
- Optimización de costos
*/
