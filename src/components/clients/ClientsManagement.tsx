import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CreditCard, 
  FileText, 
  Download, 
  ExternalLink,
  Shield,
  Eye,
  History,
  CheckCircle,
  AlertTriangle,
  XCircle,
  User,
  DollarSign,
  Calendar,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data interfaces
interface ClientSede {
  id: string;
  nombre: string;
  direccion: string;
  responsable: string;
  telefono: string;
  principal: boolean;
  coordenadas?: {
    lat: number;
    lng: number;
  };
}

interface ClientContact {
  tipo: 'pago' | 'admin' | 'pedidos';
  nombre: string;
  dni: string;
  celular: string;
  correo: string;
}

interface Client {
  id: string;
  razonSocial: string;
  rucDni: string;
  direccionFiscal: string;
  sedes: ClientSede[];
  contactos: ClientContact[];
  listaPrecio: string;
  frecuenciaCompras: string;
  horarioEntrega: string;
  condicionPago: string;
  limiteCredito?: number;
  emailFacturacion: string;
  observaciones: string;
  estado: 'activo' | 'suspendido' | 'moroso';
  fechaCreacion: string;
  ultimaCompra?: string;
  montoDeuda?: number;
}

// Mock clients data
const mockClients: Client[] = [
  {
    id: '1',
    razonSocial: 'CORPORACION LIMA SAC',
    rucDni: '20123456789',
    direccionFiscal: 'AV. LIMA 123, LIMA, LIMA',
    sedes: [
      {
        id: '1',
        nombre: 'Sede Principal',
        direccion: 'AV. LIMA 123, LIMA',
        responsable: 'Juan Pérez',
        telefono: '987654321',
        principal: true,
        coordenadas: { lat: -12.0464, lng: -77.0428 }
      }
    ],
    contactos: [
      {
        tipo: 'pago',
        nombre: 'María González',
        dni: '12345678',
        celular: '987654321',
        correo: 'pagos@corporacionlima.com'
      }
    ],
    listaPrecio: 'Mayorista A',
    frecuenciaCompras: 'Semanal',
    horarioEntrega: 'Lunes a Viernes 8:00-17:00',
    condicionPago: 'Crédito 30 días',
    limiteCredito: 50000,
    emailFacturacion: 'facturacion@corporacionlima.com',
    observaciones: 'Cliente preferencial, excelente historial de pagos',
    estado: 'activo',
    fechaCreacion: '2024-01-15',
    ultimaCompra: '2024-07-15',
    montoDeuda: 15750
  },
  {
    id: '2',
    razonSocial: 'DISTRIBUIDORA NORTE EIRL',
    rucDni: '20987654321',
    direccionFiscal: 'JR. COMERCIO 456, TRUJILLO, LA LIBERTAD',
    sedes: [
      {
        id: '2',
        nombre: 'Almacén Central',
        direccion: 'JR. COMERCIO 456, TRUJILLO',
        responsable: 'Carlos Mendoza',
        telefono: '987123456',
        principal: true
      }
    ],
    contactos: [
      {
        tipo: 'admin',
        nombre: 'Ana Torres',
        dni: '87654321',
        celular: '987123456',
        correo: 'admin@distribuidoranorte.com'
      }
    ],
    listaPrecio: 'Mayorista B',
    frecuenciaCompras: 'Quincenal',
    horarioEntrega: 'Lunes a Sábado 7:00-16:00',
    condicionPago: 'Crédito 15 días',
    limiteCredito: 25000,
    emailFacturacion: 'facturas@distribuidoranorte.com',
    observaciones: 'Requiere confirmación telefónica antes de entregas',
    estado: 'activo',
    fechaCreacion: '2024-02-10',
    ultimaCompra: '2024-07-10',
    montoDeuda: 8200
  }
];

export const ClientsManagement = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    client.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.rucDni.includes(searchTerm) ||
    client.sedes.some(sede => sede.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSunatLookup = async (rucDni: string) => {
    // Simulate SUNAT API call
    toast({
      title: "Consultando SUNAT",
      description: "Buscando datos del RUC/DNI..."
    });

    setTimeout(() => {
      toast({
        title: "Datos encontrados",
        description: "Información completada automáticamente"
      });
    }, 2000);
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(clients.filter(c => c.id !== clientId));
    toast({
      title: "Cliente eliminado",
      description: "El cliente ha sido eliminado correctamente"
    });
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Activo</Badge>;
      case 'suspendido':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300"><AlertTriangle className="h-3 w-3 mr-1" />Suspendido</Badge>;
      case 'moroso':
        return <Badge className="bg-red-100 text-red-800 border-red-300"><XCircle className="h-3 w-3 mr-1" />Moroso</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  const generateClientReport = (client: Client) => {
    toast({
      title: "Generando reporte",
      description: `Creando reporte PDF para ${client.razonSocial}`
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Gestión de Clientes</h1>
          <p className="text-stone-600 mt-1">Administración completa de clientes mayoristas y generales</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Shield className="h-3 w-3" />
            SuperAdmin
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-stone-600">Total Clientes</p>
                <p className="text-2xl font-bold text-blue-600">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-stone-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {clients.filter(c => c.estado === 'activo').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-stone-600">En Seguimiento</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {clients.filter(c => c.estado === 'suspendido').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-stone-600">Morosos</p>
                <p className="text-2xl font-bold text-red-600">
                  {clients.filter(c => c.estado === 'moroso').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Buscar por razón social, RUC, sede..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Cliente</DialogTitle>
            </DialogHeader>
            <ClientForm onSave={() => setIsCreateModalOpen(false)} onCancel={() => setIsCreateModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <div key={client.id} className="border rounded-lg p-4 hover:bg-stone-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-stone-800">{client.razonSocial}</h3>
                      {getStatusBadge(client.estado)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-stone-600">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        RUC: {client.rucDni}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {client.sedes.length} sede(s)
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Deuda: S/. {client.montoDeuda?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={isViewModalOpen && selectedClient?.id === client.id} onOpenChange={(open) => {
                      if (!open) setSelectedClient(null);
                      setIsViewModalOpen(open);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedClient(client)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Detalles del Cliente</DialogTitle>
                        </DialogHeader>
                        {selectedClient && <ClientDetails client={selectedClient} />}
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isEditModalOpen && selectedClient?.id === client.id} onOpenChange={(open) => {
                      if (!open) setSelectedClient(null);
                      setIsEditModalOpen(open);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedClient(client)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Editar Cliente</DialogTitle>
                        </DialogHeader>
                        {selectedClient && (
                          <ClientForm 
                            client={selectedClient}
                            onSave={() => setIsEditModalOpen(false)} 
                            onCancel={() => setIsEditModalOpen(false)} 
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => generateClientReport(client)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Reporte
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará permanentemente el cliente "{client.razonSocial}". 
                            ¿Está seguro de continuar?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteClient(client.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Client Form Component
const ClientForm = ({ client, onSave, onCancel }: { 
  client?: Client; 
  onSave: () => void; 
  onCancel: () => void; 
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    razonSocial: client?.razonSocial || '',
    rucDni: client?.rucDni || '',
    direccionFiscal: client?.direccionFiscal || '',
    listaPrecio: client?.listaPrecio || '',
    frecuenciaCompras: client?.frecuenciaCompras || '',
    horarioEntrega: client?.horarioEntrega || '',
    condicionPago: client?.condicionPago || '',
    limiteCredito: client?.limiteCredito || 0,
    emailFacturacion: client?.emailFacturacion || '',
    observaciones: client?.observaciones || '',
    estado: client?.estado || 'activo'
  });

  const [sedes, setSedes] = useState<ClientSede[]>(client?.sedes || []);
  const [contactos, setContactos] = useState<ClientContact[]>(client?.contactos || []);

  const handleSunatLookup = () => {
    if (formData.rucDni.length >= 8) {
      toast({
        title: "Consultando SUNAT",
        description: "Obteniendo datos..."
      });
      
      // Simulate API response
      setTimeout(() => {
        if (formData.rucDni.startsWith('20')) {
          setFormData(prev => ({
            ...prev,
            razonSocial: 'EMPRESA CONSULTADA SAC',
            direccionFiscal: 'AV. EJEMPLO 123, LIMA, LIMA'
          }));
          toast({
            title: "Datos obtenidos",
            description: "Información completada desde SUNAT"
          });
        }
      }, 1500);
    }
  };

  const addSede = () => {
    const newSede: ClientSede = {
      id: Date.now().toString(),
      nombre: '',
      direccion: '',
      responsable: '',
      telefono: '',
      principal: sedes.length === 0
    };
    setSedes([...sedes, newSede]);
  };

  const addContacto = () => {
    const newContacto: ClientContact = {
      tipo: 'admin',
      nombre: '',
      dni: '',
      celular: '',
      correo: ''
    };
    setContactos([...contactos, newContacto]);
  };

  const handleSave = () => {
    if (!formData.razonSocial || !formData.rucDni) {
      toast({
        title: "Error",
        description: "Complete los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: client ? "Cliente actualizado" : "Cliente creado",
      description: "Los datos han sido guardados correctamente"
    });
    onSave();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sedes">Sedes</TabsTrigger>
          <TabsTrigger value="contactos">Contactos</TabsTrigger>
          <TabsTrigger value="comercial">Comercial</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rucDni">RUC/DNI *</Label>
              <div className="flex gap-2">
                <Input
                  id="rucDni"
                  value={formData.rucDni}
                  onChange={(e) => setFormData(prev => ({ ...prev, rucDni: e.target.value }))}
                  placeholder="20123456789"
                />
                <Button variant="outline" onClick={handleSunatLookup}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  SUNAT
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="razonSocial">Razón Social *</Label>
              <Input
                id="razonSocial"
                value={formData.razonSocial}
                onChange={(e) => setFormData(prev => ({ ...prev, razonSocial: e.target.value }))}
                placeholder="Nombre de la empresa"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="direccionFiscal">Dirección Fiscal</Label>
              <Input
                id="direccionFiscal"
                value={formData.direccionFiscal}
                onChange={(e) => setFormData(prev => ({ ...prev, direccionFiscal: e.target.value }))}
                placeholder="Dirección completa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailFacturacion">Email Facturación</Label>
              <Input
                id="emailFacturacion"
                type="email"
                value={formData.emailFacturacion}
                onChange={(e) => setFormData(prev => ({ ...prev, emailFacturacion: e.target.value }))}
                placeholder="facturacion@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value: any) => setFormData(prev => ({ ...prev, estado: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="suspendido">Suspendido</SelectItem>
                  <SelectItem value="moroso">Moroso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Notas internas sobre el cliente"
                rows={3}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sedes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Sedes del Cliente</h3>
            <Button onClick={addSede}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Sede
            </Button>
          </div>
          <div className="space-y-4">
            {sedes.map((sede, index) => (
              <Card key={sede.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre de Sede</Label>
                      <Input
                        value={sede.nombre}
                        onChange={(e) => {
                          const newSedes = [...sedes];
                          newSedes[index].nombre = e.target.value;
                          setSedes(newSedes);
                        }}
                        placeholder="Sede Principal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Responsable</Label>
                      <Input
                        value={sede.responsable}
                        onChange={(e) => {
                          const newSedes = [...sedes];
                          newSedes[index].responsable = e.target.value;
                          setSedes(newSedes);
                        }}
                        placeholder="Nombre del responsable"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Dirección</Label>
                      <Input
                        value={sede.direccion}
                        onChange={(e) => {
                          const newSedes = [...sedes];
                          newSedes[index].direccion = e.target.value;
                          setSedes(newSedes);
                        }}
                        placeholder="Dirección completa de la sede"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input
                        value={sede.telefono}
                        onChange={(e) => {
                          const newSedes = [...sedes];
                          newSedes[index].telefono = e.target.value;
                          setSedes(newSedes);
                        }}
                        placeholder="987654321"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Switch
                          checked={sede.principal}
                          onCheckedChange={(checked) => {
                            const newSedes = sedes.map((s, i) => ({
                              ...s,
                              principal: i === index ? checked : false
                            }));
                            setSedes(newSedes);
                          }}
                        />
                        Sede Principal
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contactos" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Contactos Principales</h3>
            <Button onClick={addContacto}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Contacto
            </Button>
          </div>
          <div className="space-y-4">
            {contactos.map((contacto, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Contacto</Label>
                      <Select 
                        value={contacto.tipo} 
                        onValueChange={(value: any) => {
                          const newContactos = [...contactos];
                          newContactos[index].tipo = value;
                          setContactos(newContactos);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pago">Responsable de Pago</SelectItem>
                          <SelectItem value="admin">Administrador de Cuenta</SelectItem>
                          <SelectItem value="pedidos">Responsable de Pedidos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Nombre Completo</Label>
                      <Input
                        value={contacto.nombre}
                        onChange={(e) => {
                          const newContactos = [...contactos];
                          newContactos[index].nombre = e.target.value;
                          setContactos(newContactos);
                        }}
                        placeholder="Nombre del contacto"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>DNI</Label>
                      <Input
                        value={contacto.dni}
                        onChange={(e) => {
                          const newContactos = [...contactos];
                          newContactos[index].dni = e.target.value;
                          setContactos(newContactos);
                        }}
                        placeholder="12345678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Celular</Label>
                      <Input
                        value={contacto.celular}
                        onChange={(e) => {
                          const newContactos = [...contactos];
                          newContactos[index].celular = e.target.value;
                          setContactos(newContactos);
                        }}
                        placeholder="987654321"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Correo Electrónico</Label>
                      <Input
                        type="email"
                        value={contacto.correo}
                        onChange={(e) => {
                          const newContactos = [...contactos];
                          newContactos[index].correo = e.target.value;
                          setContactos(newContactos);
                        }}
                        placeholder="contacto@empresa.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comercial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lista de Precios</Label>
              <Select value={formData.listaPrecio} onValueChange={(value) => setFormData(prev => ({ ...prev, listaPrecio: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar lista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mayorista A">Mayorista A</SelectItem>
                  <SelectItem value="Mayorista B">Mayorista B</SelectItem>
                  <SelectItem value="Distribuidor">Distribuidor</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Frecuencia de Compras</Label>
              <Select value={formData.frecuenciaCompras} onValueChange={(value) => setFormData(prev => ({ ...prev, frecuenciaCompras: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semanal">Semanal</SelectItem>
                  <SelectItem value="Quincenal">Quincenal</SelectItem>
                  <SelectItem value="Mensual">Mensual</SelectItem>
                  <SelectItem value="Eventual">Eventual</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Condición de Pago</Label>
              <Select value={formData.condicionPago} onValueChange={(value) => setFormData(prev => ({ ...prev, condicionPago: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar condición" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Al contado">Al contado</SelectItem>
                  <SelectItem value="Crédito 15 días">Crédito 15 días</SelectItem>
                  <SelectItem value="Crédito 30 días">Crédito 30 días</SelectItem>
                  <SelectItem value="Crédito 45 días">Crédito 45 días</SelectItem>
                  <SelectItem value="Contraentrega">Contraentrega</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Límite de Crédito</Label>
              <Input
                type="number"
                value={formData.limiteCredito}
                onChange={(e) => setFormData(prev => ({ ...prev, limiteCredito: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Horario de Entrega Preferido</Label>
              <Input
                value={formData.horarioEntrega}
                onChange={(e) => setFormData(prev => ({ ...prev, horarioEntrega: e.target.value }))}
                placeholder="Ej: Lunes a Viernes 8:00-17:00"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          {client ? 'Actualizar' : 'Crear'} Cliente
        </Button>
      </div>
    </div>
  );
};

// Client Details Component
const ClientDetails = ({ client }: { client: Client }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="facturas">Facturas</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Datos Generales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-stone-600">Razón Social</Label>
                  <p className="font-medium">{client.razonSocial}</p>
                </div>
                <div>
                  <Label className="text-stone-600">RUC/DNI</Label>
                  <p className="font-medium">{client.rucDni}</p>
                </div>
                <div>
                  <Label className="text-stone-600">Dirección Fiscal</Label>
                  <p className="font-medium">{client.direccionFiscal}</p>
                </div>
                <div>
                  <Label className="text-stone-600">Estado</Label>
                  <div className="mt-1">
                    {client.estado === 'activo' && <Badge className="bg-green-100 text-green-800">Activo</Badge>}
                    {client.estado === 'suspendido' && <Badge className="bg-yellow-100 text-yellow-800">Suspendido</Badge>}
                    {client.estado === 'moroso' && <Badge className="bg-red-100 text-red-800">Moroso</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información Comercial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-stone-600">Lista de Precios</Label>
                  <p className="font-medium">{client.listaPrecio}</p>
                </div>
                <div>
                  <Label className="text-stone-600">Condición de Pago</Label>
                  <p className="font-medium">{client.condicionPago}</p>
                </div>
                <div>
                  <Label className="text-stone-600">Límite de Crédito</Label>
                  <p className="font-medium">S/. {client.limiteCredito?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <Label className="text-stone-600">Deuda Actual</Label>
                  <p className="font-medium text-red-600">S/. {client.montoDeuda?.toFixed(2) || '0.00'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sedes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {client.sedes.map((sede) => (
                  <div key={sede.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{sede.nombre}</h4>
                      {sede.principal && <Badge variant="secondary">Principal</Badge>}
                    </div>
                    <p className="text-sm text-stone-600 mb-1">{sede.direccion}</p>
                    <p className="text-sm text-stone-600">Responsable: {sede.responsable} - {sede.telefono}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contactos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {client.contactos.map((contacto, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        {contacto.tipo === 'pago' && 'Pagos'}
                        {contacto.tipo === 'admin' && 'Administrador'}
                        {contacto.tipo === 'pedidos' && 'Pedidos'}
                      </Badge>
                      <span className="font-medium">{contacto.nombre}</span>
                    </div>
                    <div className="text-sm text-stone-600 space-y-1">
                      <p>DNI: {contacto.dni}</p>
                      <p>Celular: {contacto.celular}</p>
                      <p>Email: {contacto.correo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Cambios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium">Cliente creado</p>
                  <p className="text-sm text-stone-600">15 Enero 2024 - Admin General</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="font-medium">Límite de crédito actualizado</p>
                  <p className="text-sm text-stone-600">20 Febrero 2024 - Admin General</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <p className="font-medium">Nueva sede agregada</p>
                  <p className="text-sm text-stone-600">10 Marzo 2024 - Admin General</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facturas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facturas y Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Factura F001-00123</p>
                    <p className="text-sm text-stone-600">15 Julio 2024 - S/. 2,500.00</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Pagada</Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Factura F001-00124</p>
                    <p className="text-sm text-stone-600">10 Julio 2024 - S/. 1,800.00</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reportes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Reporte Completo</span>
                  <span className="text-xs text-stone-600">PDF con toda la información</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col">
                  <Package className="h-6 w-6 mb-2" />
                  <span>Historial de Compras</span>
                  <span className="text-xs text-stone-600">Excel con pedidos y facturas</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col">
                  <DollarSign className="h-6 w-6 mb-2" />
                  <span>Estado de Cuenta</span>
                  <span className="text-xs text-stone-600">Resumen financiero</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>Análisis Temporal</span>
                  <span className="text-xs text-stone-600">Comportamiento por período</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientsManagement;