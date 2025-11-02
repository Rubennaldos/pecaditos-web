import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  AlertTriangle,
  Truck,
  Plus,
  Minus,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Scan
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

/* =========================
   Unidades y helpers
   ========================= */
type UnitDef = { code: string; label: string; factor: number }; // factor en unidad base

function toBase(qty: number, unit: UnitDef) {
  return qty * unit.factor;
}
function fromBase(qtyBase: number, unit: UnitDef) {
  return qtyBase / unit.factor;
}
function findUnit(units: UnitDef[], code: string): UnitDef {
  const u = units.find((x) => x.code === code);
  return u || units[0];
}

/* =========================
   Tipos
   ========================= */
interface LogisticsItem {
  id: string;
  name: string;

  /** Stock SIEMPRE en unidad base */
  currentQuantity: number;

  /** Mín/Máx también en unidad base */
  minQuantity: number;
  maxQuantity: number;

  /** Unidad base y alternativas */
  baseUnit: string; // ej: "kg", "L", "unid"
  units: UnitDef[]; // ej: [{code:"kg",label:"kg",factor:1}, {code:"sack25",label:"Saco 25 kg",factor:25}]
  defaultDisplayUnit?: string; // ej: "sack25"

  category: string;
  requiresRefrigeration: boolean;
  suppliers: string[];
  expirationDate?: string;
  lastUpdated: string;
  updatedBy: string;
  lot?: string;
}

interface Movement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'entry' | 'exit';

  /** Cantidad original (en la unidad elegida en UI) */
  quantity: number;
  /** Unidad elegida en UI (ej: sack25, kg) */
  unitCode: string;
  /** Cantidad convertida a base (para auditoría) */
  quantityBase: number;

  reason: string;
  user: string;
  timestamp: string;
  lot?: string;
}

/* =========================
   Módulo principal
   ========================= */
export const LogisticsAdminModule = () => {
  // Datos de ejemplo (en producción los traerás de tu DB)
  const [items, setItems] = useState<LogisticsItem[]>([
    {
      id: '1',
      name: 'Avena para galletas',
      // TODO: Estos valores son en KG (unidad base)
      currentQuantity: 200,
      minQuantity: 50,
      maxQuantity: 500,
      baseUnit: 'kg',
      units: [
        { code: 'kg', label: 'kg', factor: 1 },
        { code: 'sack25', label: 'Saco 25 kg', factor: 25 },
        { code: 'sack50', label: 'Saco 50 kg', factor: 50 }
      ],
      defaultDisplayUnit: 'sack25',
      category: 'Harinas',
      requiresRefrigeration: false,
      suppliers: ['Makro', 'Parada'],
      expirationDate: '2024-12-15',
      lastUpdated: '2024-07-20',
      updatedBy: 'admin@pecaditos.com',
      lot: 'AV-2024-001'
    },
    {
      id: '2',
      name: 'Leche Fresca',
      // Base en litros
      currentQuantity: 25, // 25 L
      minQuantity: 15,
      maxQuantity: 40,
      baseUnit: 'L',
      units: [
        { code: 'L', label: 'Litro', factor: 1 },
        { code: 'box12L', label: 'Caja 12 L', factor: 12 }
      ],
      defaultDisplayUnit: 'L',
      category: 'Lácteos',
      requiresRefrigeration: true,
      suppliers: ['Productores', 'Mercado de frutas'],
      expirationDate: '2024-07-25',
      lastUpdated: '2024-07-21',
      updatedBy: 'logistica@pecaditos.com',
      lot: 'LF-2024-015'
    }
  ]);

  const [movements, setMovements] = useState<Movement[]>([
    {
      id: '1',
      itemId: '1',
      itemName: 'Avena para galletas',
      type: 'exit',
      quantity: 1,
      unitCode: 'sack25',
      quantityBase: 25,
      reason: 'Producción galletas',
      user: 'logistica@pecaditos.com',
      timestamp: '2024-07-21 10:30',
      lot: 'AV-2024-001'
    }
  ]);

  const [whatsappConfig, setWhatsappConfig] = useState({
    enabled: false,
    phoneNumber: '',
    lowStockEnabled: true,
    expirationEnabled: true,
    outOfStockEnabled: true
  });

  const [filters, setFilters] = useState({
    category: '',
    name: '',
    status: ''
  });

  const [activeTab, setActiveTab] = useState('overview');

  const categories = ['Harinas', 'Lácteos', 'Conservas', 'Condimentos', 'Frutas', 'Verduras'];
  const suppliers = ['Makro', 'Parada', 'Productores', 'Mercado de frutas'];

  // Filtrar items según criterios
  const filteredItems = items.filter(item => {
    const matchesCategory = !filters.category || filters.category === 'all' || item.category === filters.category;
    const matchesName = !filters.name || item.name.toLowerCase().includes(filters.name.toLowerCase());

    let matchesStatus = true;
    if (filters.status === 'low') matchesStatus = item.currentQuantity <= item.minQuantity;
    if (filters.status === 'high') matchesStatus = item.currentQuantity >= item.maxQuantity;
    if (filters.status === 'normal') matchesStatus = item.currentQuantity > item.minQuantity && item.currentQuantity < item.maxQuantity;

    return matchesCategory && matchesName && matchesStatus;
  });

  // Items con stock bajo (todo en unidad base)
  const lowStockItems = items.filter(item => item.currentQuantity <= item.minQuantity);

  // Items próximos a vencer (en 7 días)
  const expiringItems = items.filter(item => {
    if (!item.expirationDate) return false;
    const expDate = new Date(item.expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiration <= 7 && daysUntilExpiration > 0;
  });

  // WhatsApp simulado
  const sendWhatsAppNotification = async (message: string) => {
    if (!whatsappConfig.enabled || !whatsappConfig.phoneNumber) return;
    console.log(`WhatsApp a ${whatsappConfig.phoneNumber}: ${message}`);
    toast({ title: 'Notificación WhatsApp enviada', description: `Mensaje enviado a ${whatsappConfig.phoneNumber}` });
  };

  // Orden de compra automática (usa unidad base para cálculo)
  const generatePurchaseOrder = () => {
    if (lowStockItems.length === 0) {
      toast({ title: 'No hay productos con stock bajo', description: 'Todos los productos tienen stock suficiente' });
      return;
    }
    const orderDetails = lowStockItems
      .map(item => {
        const neededBase = Math.max(item.maxQuantity - item.currentQuantity, 0);
        return `${item.name}: ${neededBase} ${item.baseUnit} (Stock: ${item.currentQuantity} ${item.baseUnit})`;
      })
      .join('\n');

    toast({ title: 'Orden de compra generada', description: `Se generó orden para ${lowStockItems.length} productos` });
    setTimeout(() => {
      sendWhatsAppNotification(`🛒 ORDEN DE COMPRA AUTOMÁTICA\n\nProductos requeridos:\n${orderDetails}\n\nFecha: ${new Date().toLocaleDateString()}`);
    }, 800);
  };

  // Ajustar stock con conversión
  const updateStock = (
    itemId: string,
    quantityOriginal: number,
    unitCode: string,
    type: 'entry' | 'exit',
    reason: string
  ) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const unit = findUnit(item.units, unitCode);
    const qtyBase = toBase(quantityOriginal, unit);

    const newQuantityBase = type === 'entry' ? item.currentQuantity + qtyBase : item.currentQuantity - qtyBase;

    if (newQuantityBase < 0) {
      toast({ title: 'Error', description: 'No hay suficiente stock para esta operación', variant: 'destructive' });
      return;
    }

    // Warning FIFO si corresponde
    if (type === 'exit' && expiringItems.some(ei => ei.id === itemId)) {
      toast({ title: '⚠️ Verificación FIFO', description: 'Verifique que sale primero lo más antiguo', variant: 'destructive' });
    }

    // Actualizar item (en base)
    setItems(prev =>
      prev.map(i =>
        i.id === itemId ? { ...i, currentQuantity: newQuantityBase, lastUpdated: new Date().toISOString().split('T')[0] } : i
      )
    );

    // Registrar movimiento
    const newMovement: Movement = {
      id: Date.now().toString(),
      itemId,
      itemName: item.name,
      type,
      quantity: quantityOriginal,
      unitCode: unit.code,
      quantityBase: qtyBase,
      reason,
      user: 'admin@pecaditos.com',
      timestamp: new Date().toLocaleString(),
      lot: item.lot
    };
    setMovements(prev => [newMovement, ...prev]);

    // Verificar alertas luego del cambio
    setTimeout(() => {
      checkAlerts(itemId, newQuantityBase);
    }, 100);

    toast({
      title: `${type === 'entry' ? 'Ingreso' : 'Egreso'} registrado`,
      description: `${item.name}: ${quantityOriginal} ${unit.label} (${qtyBase} ${item.baseUnit})`
    });
  };

  // Verificar alertas
  const checkAlerts = (itemId: string, newQuantityBase: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (newQuantityBase <= item.minQuantity && whatsappConfig.lowStockEnabled) {
      sendWhatsAppNotification(`🔴 STOCK BAJO\n${item.name}\nStock: ${newQuantityBase} ${item.baseUnit}\nMínimo: ${item.minQuantity} ${item.baseUnit}\n\n¡Reponer!`);
    }
    if (newQuantityBase === 0 && whatsappConfig.outOfStockEnabled) {
      sendWhatsAppNotification(`❌ SIN STOCK\n${item.name}\n\n¡Producto agotado! Generar orden de compra inmediata.`);
    }
  };

  // Verificar vencimientos diariamente
  useEffect(() => {
    if (!whatsappConfig.expirationEnabled) return;
    expiringItems.forEach(item => {
      const expDate = new Date(item.expirationDate!);
      const today = new Date();
      const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      if (daysUntilExpiration <= 3) {
        sendWhatsAppNotification(`⏰ PRÓXIMO A VENCER\n${item.name}\nVence en: ${daysUntilExpiration} días\nFecha vencimiento: ${item.expirationDate}\n\n¡Usar con prioridad!`);
      }
    });
  }, [items, whatsappConfig.expirationEnabled]);

  const getStockStatusColor = (item: LogisticsItem) => {
    if (item.currentQuantity <= item.minQuantity) return 'bg-red-100 text-red-800';
    if (item.currentQuantity >= item.maxQuantity) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  /* ============
     Vistas
     ============ */
  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock Bajo</p>
                <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Por Vencer</p>
                <p className="text-2xl font-bold text-amber-600">{expiringItems.length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Movimientos Hoy</p>
                <p className="text-2xl font-bold">
                  {movements.filter(m => m.timestamp.includes(new Date().toLocaleDateString())).length}
                </p>
              </div>
              <Truck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(lowStockItems.length > 0 || expiringItems.length > 0) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map(item => (
                <p key={item.id} className="text-sm text-red-700">
                  🔴 {item.name} - Stock: {item.currentQuantity} {item.baseUnit} (Mín: {item.minQuantity} {item.baseUnit})
                </p>
              ))}
              {expiringItems.map(item => (
                <p key={item.id} className="text-sm text-amber-700">
                  ⏰ {item.name} - Vence: {item.expirationDate}
                </p>
              ))}
            </div>
            {lowStockItems.length > 0 && (
              <Button onClick={generatePurchaseOrder} className="mt-4" size="sm">
                <Truck className="h-4 w-4 mr-2" />
                Generar Orden de Compra
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Inventario */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inventario de Logística</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Scan className="h-4 w-4 mr-2" />
                Escanear
              </Button>
            </div>
          </div>
          <CardDescription>Vista con conversión de unidades (almacenado en unidad base)</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label>Buscar por nombre</Label>
              <Input
                placeholder="Nombre del producto..."
                value={filters.name}
                onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Categoría</Label>
              <Select value={filters.category || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? '' : value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estado de Stock</Label>
              <Select value={filters.status || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="low">Stock Bajo</SelectItem>
                  <SelectItem value="normal">Stock Normal</SelectItem>
                  <SelectItem value="high">Stock Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ category: '', name: '', status: '' })}
                className="mt-1"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>

          {/* Lista de items */}
          <div className="space-y-3">
            {filteredItems.map(item => (
              <InventoryRow
                key={item.id}
                item={item}
                expiring={expiringItems.some(e => e.id === item.id)}
                onAdjust={(qty, unitCode, type) =>
                  updateStock(item.id, qty, unitCode, type, type === 'entry' ? 'Ingreso manual admin' : 'Egreso manual admin')
                }
                getStockStatusColor={getStockStatusColor}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotifications = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Configuración de Notificaciones WhatsApp
        </CardTitle>
        <CardDescription>
          Configura las notificaciones automáticas que se enviarán por WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Activar notificaciones WhatsApp</Label>
            <p className="text-sm text-muted-foreground">Enviar alertas automáticas por WhatsApp</p>
          </div>
          <Switch
            checked={whatsappConfig.enabled}
            onCheckedChange={(checked) => setWhatsappConfig(prev => ({ ...prev, enabled: checked }))}
          />
        </div>

        {whatsappConfig.enabled && (
          <>
            <div>
              <Label>Número de WhatsApp</Label>
              <Input
                placeholder="+51 999 999 999"
                value={whatsappConfig.phoneNumber}
                onChange={(e) => setWhatsappConfig(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Incluye el código de país (ej: +51 para Perú)
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Tipos de notificaciones</h4>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Stock bajo</Label>
                  <p className="text-sm text-muted-foreground">Cuando un producto llega al mínimo</p>
                </div>
                <Switch
                  checked={whatsappConfig.lowStockEnabled}
                  onCheckedChange={(checked) => setWhatsappConfig(prev => ({ ...prev, lowStockEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Productos por vencer</Label>
                  <p className="text-sm text-muted-foreground">Cuando un producto vence en 3 días o menos</p>
                </div>
                <Switch
                  checked={whatsappConfig.expirationEnabled}
                  onCheckedChange={(checked) => setWhatsappConfig(prev => ({ ...prev, expirationEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Sin stock</Label>
                  <p className="text-sm text-muted-foreground">Cuando un producto se agota completamente</p>
                </div>
                <Switch
                  checked={whatsappConfig.outOfStockEnabled}
                  onCheckedChange={(checked) => setWhatsappConfig(prev => ({ ...prev, outOfStockEnabled: checked }))}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={() => sendWhatsAppNotification('🧪 Mensaje de prueba del sistema de logística Pecaditos. ¡Todo funciona correctamente!')}
                variant="outline"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Enviar mensaje de prueba
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderMovements = () => (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Movimientos</CardTitle>
        <CardDescription>Registro completo de ingresos y egresos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {movements.map(movement => (
            <div key={movement.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {movement.type === 'entry' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">{movement.itemName}</p>
                    <p className="text-sm text-muted-foreground">
                      {movement.type === 'entry' ? 'Ingreso' : 'Egreso'} de {movement.quantity}{' '}
                      {movement.unitCode} ({movement.quantityBase} {items.find(i => i.id === movement.itemId)?.baseUnit})
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{movement.timestamp}</p>
                  <p>{movement.user}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Motivo: {movement.reason}</p>
              {movement.lot && <p className="text-sm text-muted-foreground">Lote: {movement.lot}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Panel de Logística (Admin)</h1>
        <p className="text-stone-600 mt-1">Acceso completo al sistema de logística con permisos de administrador</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones WhatsApp</TabsTrigger>
          <TabsTrigger value="movements">Historial</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          {renderNotifications()}
        </TabsContent>

        <TabsContent value="movements" className="mt-6">
          {renderMovements()}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema</CardTitle>
              <CardDescription>Configuraciones avanzadas solo para administrador</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configuraciones adicionales del sistema de logística se agregarán aquí...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* =========================
   Fila de inventario (UI por ítem)
   ========================= */
function InventoryRow({
  item,
  expiring,
  onAdjust,
  getStockStatusColor
}: {
  item: LogisticsItem;
  expiring: boolean;
  onAdjust: (qty: number, unitCode: string, type: 'entry' | 'exit') => void;
  getStockStatusColor: (i: LogisticsItem) => string;
}) {
  const [unitCode, setUnitCode] = useState<string>(item.defaultDisplayUnit || item.units[0].code);
  const unit = findUnit(item.units, unitCode);

  const [qty, setQty] = useState<number>(1);

  const displayedStock = fromBase(item.currentQuantity, unit);

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-medium">{item.name}</h3>
            <Badge variant="outline">{item.category}</Badge>
            {item.requiresRefrigeration && <Badge variant="secondary">❄️ Refrigeración</Badge>}
            <Badge className={getStockStatusColor(item)}>
              Stock: {Number(displayedStock.toFixed(3))} {unit.label}
            </Badge>
            {expiring && <Badge variant="destructive">⏰ Próximo a vencer</Badge>}
          </div>

          <div className="mt-2 text-sm text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-4">
            <span>
              Min: {item.minQuantity} {item.baseUnit} | Max: {item.maxQuantity} {item.baseUnit}
            </span>
            <span>Proveedores: {item.suppliers.join(', ')}</span>
            <span>Vence: {item.expirationDate || 'N/A'}</span>
            <span>Lote: {item.lot || 'N/A'}</span>
          </div>
        </div>

        <div className="flex items-end gap-2">
          <div className="w-36">
            <Label className="text-xs">Unidad</Label>
            <Select value={unitCode} onValueChange={setUnitCode}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Unidad" />
              </SelectTrigger>
              <SelectContent>
                {item.units.map(u => (
                  <SelectItem key={u.code} value={u.code}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-28">
            <Label className="text-xs">Cantidad</Label>
            <Input
              className="h-8"
              type="number"
              min={0}
              step="1"
              value={qty}
              onChange={(e) => setQty(Math.max(0, Number(e.target.value) || 0))}
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>

          <div className="flex gap-1 pb-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAdjust(qty, unitCode, 'entry')}
              title={`Ingresar ${qty} ${unit.label}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAdjust(qty, unitCode, 'exit')}
              title={`Egresar ${qty} ${unit.label}`}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
