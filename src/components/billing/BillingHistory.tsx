import { useState } from 'react';
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
  Eye,
  History
} from 'lucide-react';
import { useAdminBilling } from '@/contexts/AdminBillingContext';

export const BillingHistory = () => {
  const { isAdminMode, editMovement, deleteMovement } = useAdminBilling();
  const [filterType, setFilterType] = useState('todos');
  const [filterClient, setFilterClient] = useState('');
  const [filterMonth, setFilterMonth] = useState('todos');
  const [selectedMovement, setSelectedMovement] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Mock movements data
  const movements = [
    {
      id: "MOV-001",
      type: "payment_received",
      client: "Bodega Don Carlos",
      amount: 480.00,
      date: "2024-01-16T10:30:00",
      description: "Pago de factura FAC-2024-001",
      method: "Efectivo",
      user: "cobranzas@pecaditos.com"
    },
    {
      id: "MOV-002",
      type: "invoice_issued",
      client: "Restaurante La Plaza",
      amount: 1200.00,
      date: "2024-01-15T14:20:00",
      description: "Factura por pedido PEC-2024-015",
      method: "Crédito 30 días",
      user: "pedidos@pecaditos.com"
    },
    {
      id: "MOV-003",
      type: "payment_commitment",
      client: "Distribuidora El Sol SAC",
      amount: 345.00,
      date: "2024-01-15T09:15:00",
      description: "Compromiso de pago para el 25/01/2024",
      method: "Compromiso",
      user: "cobranzas@pecaditos.com"
    },
    {
      id: "MOV-004",
      type: "invoice_rejected",
      client: "Minimarket Los Andes",
      amount: 750.00,
      date: "2024-01-14T16:45:00",
      description: "Factura rechazada por falta de pago",
      method: "Rechazo",
      user: "cobranzas@pecaditos.com"
    },
    {
      id: "MOV-005",
      type: "payment_received",
      client: "Restaurante La Plaza",
      amount: 850.00,
      date: "2024-01-12T11:00:00",
      description: "Pago de factura FAC-2024-002",
      method: "Transferencia",
      user: "cobranzas@pecaditos.com"
    }
  ];

  const getMovementInfo = (type: string) => {
    switch (type) {
      case 'payment_received':
        return { 
          color: 'bg-green-100 text-green-800', 
          text: 'Pago Recibido', 
          icon: CheckCircle 
        };
      case 'invoice_issued':
        return { 
          color: 'bg-blue-100 text-blue-800', 
          text: 'Factura Emitida', 
          icon: DollarSign 
        };
      case 'payment_commitment':
        return { 
          color: 'bg-orange-100 text-orange-800', 
          text: 'Compromiso de Pago', 
          icon: Calendar 
        };
      case 'invoice_rejected':
        return { 
          color: 'bg-red-100 text-red-800', 
          text: 'Factura Rechazada', 
          icon: X 
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800', 
          text: type, 
          icon: Clock 
        };
    }
  };

  const handleEditMovement = (movement: any) => {
    setSelectedMovement(movement);
    setShowEditModal(true);
  };

  const handleDeleteMovement = (movement: any) => {
    setSelectedMovement(movement);
    setShowDeleteModal(true);
  };

  const handleViewDetail = (movement: any) => {
    setSelectedMovement(movement);
    setShowDetailModal(true);
  };

  const confirmEdit = (changes: any) => {
    editMovement(selectedMovement.id, changes);
    setShowEditModal(false);
    setSelectedMovement(null);
  };

  const confirmDelete = (reason: string) => {
    deleteMovement(selectedMovement.id, reason);
    setShowDeleteModal(false);
    setSelectedMovement(null);
  };

  const filteredMovements = movements.filter(movement => {
    const matchesType = filterType === 'todos' || movement.type === filterType;
    const matchesClient = !filterClient || movement.client.toLowerCase().includes(filterClient.toLowerCase());
    // Add month filter logic here
    return matchesType && matchesClient;
  });

  const exportToExcel = () => {
    console.log('Exportando historial a Excel...');
    // TODO: Implement Excel export
  };

  const exportToPDF = () => {
    console.log('Exportando historial a PDF...');
    // TODO: Implement PDF export
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
                <SelectItem value="2024-01">Enero 2024</SelectItem>
                <SelectItem value="2023-12">Diciembre 2023</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={exportToExcel}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button
                variant="outline"
                onClick={exportToPDF}
                className="flex-1"
              >
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
                        S/ {movement.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-stone-500">
                        {new Date(movement.date).toLocaleString()}
                      </div>
                    </div>

                    {/* Admin Controls */}
                    {isAdminMode && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetail(movement)}
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
                          onClick={() => handleDeleteMovement(movement)}
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
                  <p className="font-semibold">S/ {selectedMovement.amount.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600">Fecha</label>
                  <p className="font-semibold">{new Date(selectedMovement.date).toLocaleString()}</p>
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
                <Input defaultValue={selectedMovement.description} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Monto</label>
                <Input type="number" defaultValue={selectedMovement.amount} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Método</label>
                <Select defaultValue={selectedMovement.method}>
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
                  onClick={() => confirmEdit({})}
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
                <Input placeholder="Ingrese el motivo..." />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => confirmDelete("Motivo de prueba")}
                  className="bg-red-600 hover:bg-red-700 text-white flex-1"
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
