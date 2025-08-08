import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Filter, 
  Clock, 
  CheckCircle, 
  X, 
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

// FIREBASE
import { getDatabase, ref, onValue, update, remove } from 'firebase/database';
import { app } from '@/config/firebase'; // Ajusta la ruta si es necesario

type Movement = {
  id: string;
  type?: string;
  client?: string;
  amount?: number | string;
  date?: string;
  description?: string;
  method?: string;
  user?: string;
};

export const BillingHistory = () => {
  const [isAdminMode] = useState(true); // O usa tu contexto real
  const [filterType, setFilterType] = useState('todos');
  const [filterClient, setFilterClient] = useState('');
  const [filterMonth, setFilterMonth] = useState('todos');
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [editData, setEditData] = useState<any>({});
  const [deleteReason, setDeleteReason] = useState('');

  // Lectura de Firebase RTDB y conversión a array
  useEffect(() => {
    const db = getDatabase(app);
    const movementsRef = ref(db, 'billingMovements');
    const unsubscribe = onValue(movementsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return setMovements([]);
      // Convierte a array y asegura tipado
      const array = Object.entries(data).map(([id, val]) =>
        typeof val === 'object' && val !== null
          ? { id, ...val }
          : { id }
      ) as Movement[];

      // SOLO ordena los que tengan 'date', el resto queda al final
      const withDate = array.filter(item => !!item.date);
      const withoutDate = array.filter(item => !item.date);

      withDate.sort((a, b) => 
        new Date(b.date!).getTime() - new Date(a.date!).getTime()
      );

      setMovements([...withDate, ...withoutDate]);
    });
    return () => unsubscribe();
  }, []);

  const getMovementInfo = (type?: string) => {
    switch (type) {
      case 'payment_received':
        return { color: 'bg-green-100 text-green-800', text: 'Pago Recibido', icon: CheckCircle };
      case 'invoice_issued':
        return { color: 'bg-blue-100 text-blue-800', text: 'Factura Emitida', icon: DollarSign };
      case 'payment_commitment':
        return { color: 'bg-orange-100 text-orange-800', text: 'Compromiso de Pago', icon: Calendar };
      case 'invoice_rejected':
        return { color: 'bg-red-100 text-red-800', text: 'Factura Rechazada', icon: X };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: type, icon: Clock };
    }
  };

  // Editar movimiento en Firebase
  const confirmEdit = async () => {
    if (!selectedMovement) return;
    const db = getDatabase(app);
    const refMov = ref(db, `billingMovements/${selectedMovement.id}`);
    await update(refMov, editData);
    setShowEditModal(false);
    setSelectedMovement(null);
  };

  // Eliminar movimiento en Firebase
  const confirmDelete = async () => {
    if (!selectedMovement) return;
    const db = getDatabase(app);
    await remove(ref(db, `billingMovements/${selectedMovement.id}`));
    setShowDeleteModal(false);
    setSelectedMovement(null);
    setDeleteReason('');
  };

  const handleEditMovement = (movement: Movement) => {
    setSelectedMovement(movement);
    setEditData({
      description: movement.description ?? '',
      amount: movement.amount ?? '',
      method: movement.method ?? '',
    });
    setShowEditModal(true);
  };

  const filteredMovements = movements.filter(movement => {
    const matchesType = filterType === 'todos' || movement.type === filterType;
    const matchesClient = !filterClient || (movement.client ?? '').toLowerCase().includes(filterClient.toLowerCase());
    const matchesMonth = filterMonth === 'todos' || (movement.date ?? '').startsWith(filterMonth);
    return matchesType && matchesClient && matchesMonth;
  });

  const exportToExcel = () => {
    alert('Exportando historial a Excel... (aquí va tu lógica)');
  };

  const exportToPDF = () => {
    alert('Exportando historial a PDF... (aquí va tu lógica)');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Historial de Movimientos</h2>
        <p className="text-stone-600">Registro completo de actividades financieras</p>
      </div>
      {/* Filters and Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Exportación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de movimiento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="payment_received">Pagos Recibidos</SelectItem>
                <SelectItem value="invoice_issued">Facturas Emitidas</SelectItem>
                <SelectItem value="payment_commitment">Compromisos</SelectItem>
                <SelectItem value="invoice_rejected">Rechazos</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Buscar cliente..."
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
            />
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los meses</SelectItem>
                {[...new Set(movements.map(m => m.date?.slice(0, 7)))].filter(Boolean).map(mes => (
                  <SelectItem key={mes} value={mes!}>
                    {new Date(mes! + '-01').toLocaleString('es-PE', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToExcel} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" onClick={exportToPDF} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movements List */}
      <div className="space-y-4">
        {filteredMovements.map((movement) => {
          const movementInfo = getMovementInfo(movement.type);
          const MovementIcon = movementInfo.icon;
          return (
            <Card key={movement.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${movementInfo.color.replace('text-', 'bg-').replace('-800', '-100')}`}>
                      <MovementIcon className={`h-5 w-5 ${movementInfo.color.replace('bg-', 'text-').replace('-100', '-600')}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-stone-800">{movement.client}</h3>
                        <Badge className={movementInfo.color}>
                          {movementInfo.text}
                        </Badge>
                      </div>
                      <p className="text-sm text-stone-600">{movement.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-stone-500">
                        <span>Método: {movement.method}</span>
                        <span>Usuario: {movement.user}</span>
                        <span>ID: {movement.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                      <div className={`text-lg font-bold ${
                        movement.type === 'payment_received' ? 'text-green-600' : 
                        movement.type === 'invoice_rejected' ? 'text-red-600' : 
                        'text-stone-800'
                      }`}>
                        {movement.type === 'payment_received' ? '+' : ''}
                        S/ {Number(movement.amount ?? 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-stone-500">
                        {movement.date && new Date(movement.date).toLocaleString()}
                      </div>
                    </div>
                    {isAdminMode && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setSelectedMovement(movement); setShowDetailModal(true); }}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditMovement(movement)}
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setSelectedMovement(movement); setShowDeleteModal(true); }}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="border-stone-200 bg-stone-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-stone-600">Total Movimientos</p>
              <p className="text-2xl font-bold text-stone-800">{filteredMovements.length}</p>
            </div>
            <div>
              <p className="text-sm text-green-600">Pagos Recibidos</p>
              <p className="text-2xl font-bold text-green-700">
                {filteredMovements.filter(m => m.type === 'payment_received').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Facturas Emitidas</p>
              <p className="text-2xl font-bold text-blue-700">
                {filteredMovements.filter(m => m.type === 'invoice_issued').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movement Detail Modal */}
      {showDetailModal && selectedMovement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Detalle Completo del Movimiento</CardTitle>
              <p className="text-stone-600">ID: {selectedMovement.id}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-stone-600">Cliente</label>
                  <p className="font-semibold">{selectedMovement.client}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600">Tipo</label>
                  <p className="font-semibold">{getMovementInfo(selectedMovement.type).text}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600">Monto</label>
                  <p className="font-semibold">S/ {Number(selectedMovement.amount ?? 0).toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600">Fecha</label>
                  <p className="font-semibold">{selectedMovement.date && new Date(selectedMovement.date).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600">Método</label>
                  <p className="font-semibold">{selectedMovement.method}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600">Usuario Responsable</label>
                  <p className="font-semibold">{selectedMovement.user}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-stone-600">Descripción</label>
                <p className="bg-stone-50 p-3 rounded-lg">{selectedMovement.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1"
                >
                  Cerrar
                </Button>
                {isAdminMode && (
                  <Button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEditMovement(selectedMovement);
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Movement Edit Modal */}
      {showEditModal && selectedMovement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Editar Movimiento</CardTitle>
              <p className="text-stone-600">ID: {selectedMovement.id}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Input
                  value={editData.description || ''}
                  onChange={e => setEditData({ ...editData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Monto</label>
                <Input
                  type="number"
                  value={editData.amount || ''}
                  onChange={e => setEditData({ ...editData, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Método</label>
                <Select
                  value={editData.method || ''}
                  onValueChange={v => setEditData({ ...editData, method: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                    <SelectItem value="Yape">Yape</SelectItem>
                    <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={confirmEdit}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  Guardar Cambios
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Movement Delete Modal */}
      {showDeleteModal && selectedMovement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-red-800">Eliminar Movimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>¿Está seguro de eliminar este movimiento? Esta acción no se puede deshacer.</p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo de eliminación</label>
                <Input
                  placeholder="Ingrese el motivo..."
                  value={deleteReason}
                  onChange={e => setDeleteReason(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white flex-1"
                  disabled={!deleteReason}
                >
                  Confirmar Eliminación
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
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
