import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { ref, onValue, push, set, update, remove } from "firebase/database";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Building, 
  FileText, 
  Download,
  ExternalLink,
  Shield,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  DollarSign,
  Calendar,
  Package,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SedeComment {
  id: string;
  user: string;
  comment: string;
  rating: number;
  createdAt: number;
}

interface ClientSede {
  id: string;
  nombre: string;
  direccion: string;
  responsable: string;
  telefono: string;
  principal: boolean;
  googleMapsUrl?: string;
  distrito?: string;
  comentarios?: SedeComment[];
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
// --- EXPORTAR PDF DETALLADO ---
export const generateClientReportPDF = (client) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Reporte Detallado de Cliente", 14, 16);

  doc.setFontSize(12);
  doc.text(`Razón Social: ${client.razonSocial}`, 14, 26);
  doc.text(`RUC/DNI: ${client.rucDni}`, 14, 34);
  doc.text(`Dirección Fiscal: ${client.direccionFiscal}`, 14, 42);
  doc.text(`Estado: ${client.estado}`, 14, 50);

  let nextY = 58;

  // Sedes
if (client.sedes?.length > 0) {
  doc.text("Sedes:", 14, nextY + 2);
  autoTable(doc, {
    startY: nextY + 6,
    head: [["Nombre", "Dirección", "Responsable", "Teléfono", "Distrito"]],
    body: client.sedes.map(s => [
      s.nombre,
      s.direccion,
      s.responsable,
      s.telefono,
      s.distrito || ""
    ]),
  });
  // 👇 Así accedes correctamente a lastAutoTable sin que TypeScript se queje:
  nextY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : nextY + 30;
} else {
  nextY += 18;
}
  // Contactos
  if (client.contactos?.length > 0) {
    doc.text("Contactos:", 14, nextY + 2);
    autoTable(doc, {
      startY: nextY + 6,
      head: [["Tipo", "Nombre", "DNI", "Celular", "Correo"]],
      body: client.contactos.map(c => [
        c.tipo,
        c.nombre,
        c.dni,
        c.celular,
        c.correo,
      ]),
    });
 // Observaciones
if (client.observaciones) {
  // 👇 Usar 'as any' para que TypeScript no marque error:
  const lastY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 110;
  doc.text("Observaciones:", 14, lastY);
  doc.text(client.observaciones, 14, lastY + 8);
}
}
  doc.save(`Reporte_${client.razonSocial || client.rucDni}.pdf`);
};

// --- EXPORTAR EXCEL ---
export const generateClientReportExcel = (client) => {
  const ws1 = XLSX.utils.json_to_sheet([
    {
      "Razón Social": client.razonSocial,
      "RUC/DNI": client.rucDni,
      "Dirección Fiscal": client.direccionFiscal,
      "Estado": client.estado,
      "Observaciones": client.observaciones
    }
  ]);
  const ws2 = XLSX.utils.json_to_sheet(client.sedes || []);
  const ws3 = XLSX.utils.json_to_sheet(client.contactos || []);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, "Cliente");
  XLSX.utils.book_append_sheet(wb, ws2, "Sedes");
  XLSX.utils.book_append_sheet(wb, ws3, "Contactos");

  XLSX.writeFile(wb, `Reporte_${client.razonSocial || client.rucDni}.xlsx`);
};

export const ClientsManagement = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // --- Cargar clientes desde Firebase al iniciar
  useEffect(() => {
    const clientsRef = ref(db, 'clients');
    const unsubscribe = onValue(clientsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setClients([]);
        return;
      }
      // Convertir objeto a array
      const arr: Client[] = Object.entries(data).map(([id, client]: any) => ({
        ...client,
        id,
        sedes: client.sedes
          ? Object.entries(client.sedes).map(([sid, sede]: any) => ({
              ...sede,
              id: sid,
              comentarios: sede.comentarios
                ? Object.values(sede.comentarios)
                : []
            }))
          : [],
      }));
      setClients(arr);
    });
    return () => unsubscribe();
  }, []);

  // --- Guardar cliente (nuevo o edición)
 const saveClient = (client: Partial<Client>, isEdit?: boolean) => {
  const clientsRef = ref(db, 'clients');
  if (isEdit && client.id) {
    // ACTUALIZA todo el objeto, incluyendo sedes y contactos
    update(ref(db, `clients/${client.id}`), {
      ...client
    });
    toast({ title: "Cliente actualizado", description: "Actualizado correctamente" });
  } else {
    const newClientRef = push(clientsRef);
    set(newClientRef, {
      ...client,
      fechaCreacion: Date.now()
    });
    toast({ title: "Cliente creado", description: "Guardado correctamente" });
  }
};


  // --- Eliminar cliente
  const deleteClient = (id: string) => {
    remove(ref(db, `clients/${id}`));
    toast({ title: "Cliente eliminado" });
  };

  // --- Filtrar clientes para buscar
  const filteredClients = clients.filter(client =>
    client.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.rucDni?.includes(searchTerm) ||
    client.sedes?.some(sede => sede.nombre?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- Mostrar estado
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

  // --- Generar reporte (mock)
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
          <p className="text-stone-600 mt-1">Administración completa de clientes y ubicaciones</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Shield className="h-3 w-3" />
            SuperAdmin
          </div>
        </div>
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
            <ClientForm onSave={saveClient} onFinish={() => setIsCreateModalOpen(false)} />
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
  {/* Ver */}
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

  {/* Editar */}
  <Dialog open={isEditModalOpen && selectedClient?.id === client.id} onOpenChange={(open) => {
    if (!open) setSelectedClient(null);
    setIsEditModalOpen(open);
  }}>
    <DialogTrigger asChild>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setSelectedClient(client);
          setIsEditModalOpen(true);
        }}
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
          onSave={saveClient}
          onFinish={() => setIsEditModalOpen(false)}
        />
      )}
    </DialogContent>
  </Dialog>

  {/* Reporte PDF/Excel */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-1" />
        Reporte
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => generateClientReportPDF(client)}>
        PDF
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => generateClientReportExcel(client)}>
        Excel
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  {/* Eliminar */}
  <Button
    variant="outline"
    size="sm"
    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
    onClick={() => deleteClient(client.id)}
  >
    <Trash2 className="h-4 w-4" />
    Eliminar
  </Button>
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


// --- FORMULARIO DE CLIENTE, AGREGAR/EDITAR, SEDES Y COMENTARIOS ---
const ClientForm = ({ client, onSave, onFinish }: { 
  client?: Client; 
  onSave: (data: Partial<Client>, isEdit?: boolean) => void; 
  onFinish: () => void;
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    id: client?.id || '',
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

  // Guardar sedes como objeto para compatibilidad Firebase
  const [sedes, setSedes] = useState<ClientSede[]>(client?.sedes || []);
  const [contactos, setContactos] = useState<ClientContact[]>(client?.contactos || []);

  // --- Guardar en Firebase
  const handleSave = () => {
    if (!formData.razonSocial || !formData.rucDni) {
      toast({
        title: "Error",
        description: "Complete los campos obligatorios",
        variant: "destructive"
      });
      return;
    }
    const data: Partial<Client> = {
      ...formData,
      sedes: undefined,
      contactos: undefined,
    };
    // Save main data (resto lo maneja el editor de sedes/contactos, para simplicidad)
    onSave({ ...data, sedes, contactos }, !!client);
    onFinish();
  };

  // --- Agregar Sede
  const addSede = () => {
    setSedes([
      ...sedes,
      {
        id: Date.now().toString(),
        nombre: '',
        direccion: '',
        responsable: '',
        telefono: '',
        principal: sedes.length === 0,
        googleMapsUrl: '',
        distrito: '',
        comentarios: [],
      }
    ]);
  };

  // --- Eliminar Sede
  const deleteSede = (id: string) => {
    setSedes(sedes.filter(s => s.id !== id));
  };

  // --- Agregar Contacto
  const addContacto = () => {
    setContactos([
      ...contactos,
      { tipo: 'admin', nombre: '', dni: '', celular: '', correo: '' }
    ]);
  };

  // --- Eliminar Contacto
  const deleteContacto = (idx: number) => {
    setContactos(contactos.filter((_, i) => i !== idx));
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
        {/* General */}
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
                <Button variant="outline">
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
        {/* Sedes */}
        <TabsContent value="sedes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Sedes del Cliente</h3>
            <Button onClick={addSede}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Sede
            </Button>
          </div>
          <div className="space-y-4">
            {sedes.map((sede, idx) => (
              <Card key={sede.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre de Sede</Label>
                      <Input
                        value={sede.nombre}
                        onChange={(e) => {
                          const newSedes = [...sedes];
                          newSedes[idx].nombre = e.target.value;
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
                          newSedes[idx].responsable = e.target.value;
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
                          newSedes[idx].direccion = e.target.value;
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
                          newSedes[idx].telefono = e.target.value;
                          setSedes(newSedes);
                        }}
                        placeholder="987654321"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Distrito</Label>
                      <Input
                        value={sede.distrito}
                        onChange={(e) => {
                          const newSedes = [...sedes];
                          newSedes[idx].distrito = e.target.value;
                          setSedes(newSedes);
                        }}
                        placeholder="Ej: Miraflores"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Link Google Maps</Label>
                      <Input
                        value={sede.googleMapsUrl}
                        onChange={(e) => {
                          const newSedes = [...sedes];
                          newSedes[idx].googleMapsUrl = e.target.value;
                          setSedes(newSedes);
                        }}
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Switch
                          checked={sede.principal}
                          onCheckedChange={(checked) => {
                            const newSedes = sedes.map((s, i) => ({
                              ...s,
                              principal: i === idx ? checked : false
                            }));
                            setSedes(newSedes);
                          }}
                        />
                        Sede Principal
                      </Label>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button variant="outline" className="text-red-600" onClick={() => deleteSede(sede.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        {/* Contactos */}
        <TabsContent value="contactos" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Contactos Principales</h3>
            <Button onClick={addContacto}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Contacto
            </Button>
          </div>
          <div className="space-y-4">
            {contactos.map((contacto, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Contacto</Label>
                      <Select 
                        value={contacto.tipo} 
                        onValueChange={(value: any) => {
                          const newContactos = [...contactos];
                          newContactos[idx].tipo = value;
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
                          newContactos[idx].nombre = e.target.value;
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
                          newContactos[idx].dni = e.target.value;
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
                          newContactos[idx].celular = e.target.value;
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
                          newContactos[idx].correo = e.target.value;
                          setContactos(newContactos);
                        }}
                        placeholder="contacto@empresa.com"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" className="text-red-600" onClick={() => deleteContacto(idx)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        {/* Comercial */}
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
        <Button variant="outline" onClick={onFinish}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          {client ? 'Actualizar' : 'Crear'} Cliente
        </Button>
      </div>
    </div>
  );
};


// --- DETALLES DE CLIENTE, MOSTRAR SEDES, COMENTARIOS ---
const ClientDetails = ({ client }: { client: Client }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="sedes">Sedes</TabsTrigger>
          <TabsTrigger value="contactos">Contactos</TabsTrigger>
          <TabsTrigger value="comercial">Comercial</TabsTrigger>
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
          </div>
        </TabsContent>
        {/* SEDES CON COMENTARIOS */}
        <TabsContent value="sedes" className="space-y-4">
          <div className="space-y-6">
            {client.sedes.map((sede) => (
              <Card key={sede.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{sede.nombre}</CardTitle>
                    {sede.principal && <Badge variant="secondary">Principal</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <div className="text-sm text-stone-600">{sede.direccion}</div>
                    <div className="text-sm text-stone-600">Responsable: {sede.responsable} - {sede.telefono}</div>
                    {sede.distrito && (
                      <div className="text-xs text-stone-500">Distrito: {sede.distrito}</div>
                    )}
                    {sede.googleMapsUrl && (
                      <div className="mt-2">
                        <a href={sede.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          Ver en Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                  <hr className="my-3" />
                  <SedeComments sedeId={sede.id} comentarios={sede.comentarios || []} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="contactos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contactos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {client.contactos.map((contacto, idx) => (
                  <div key={idx} className="border rounded-lg p-3">
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
        <TabsContent value="comercial" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};


// --- COMPONENTE PARA COMENTARIOS DE SEDE ---
const SedeComments = ({
  sedeId,
  comentarios
}: {
  sedeId: string;
  comentarios: SedeComment[];
}) => {
  const [allComments, setAllComments] = useState<SedeComment[]>(comentarios || []);
  const [showAll, setShowAll] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [user, setUser] = useState('');

  // Simulación de paginación simple (5 por página)
  const paginated = showAll ? allComments : allComments.slice(0, 5);

  useEffect(() => {
    // Se recomienda leer comentarios desde Firebase para producción, por ahora toma los props
    setAllComments(comentarios.sort((a, b) => b.createdAt - a.createdAt));
  }, [comentarios]);

  // --- Calcular promedio
  const avg =
    allComments.length > 0
      ? (allComments.reduce((acc, c) => acc + c.rating, 0) / allComments.length).toFixed(2)
      : "0";

  // --- Agregar comentario (en Firebase)
  const handleSend = async () => {
    if (!newComment || !user) return;
    // Encuentra referencia a sede (depende de cómo guardes en Firebase, aquí sería: clients/{clientId}/sedes/{sedeId}/comentarios)
    // Este demo asume una ruta global: sedesComentarios/{sedeId}
    const comentario: SedeComment = {
      id: Date.now().toString(),
      user,
      comment: newComment,
      rating: newRating,
      createdAt: Date.now(),
    };
    // TODO: Puedes hacer el push directo a tu ruta Firebase si tu estructura lo permite
    setAllComments([comentario, ...allComments]);
    setNewComment('');
    setUser('');
    setNewRating(5);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Star className="h-5 w-5 text-yellow-400" />
        <span className="font-bold">{avg} / 5</span>
        <span className="text-xs text-stone-500">({allComments.length} calificaciones)</span>
      </div>
      {/* AGREGAR COMENTARIO */}
      <div className="mb-3 flex flex-col md:flex-row gap-2">
        <Input
          placeholder="Tu nombre"
          value={user}
          onChange={e => setUser(e.target.value)}
          className="max-w-xs"
        />
        <Input
          placeholder="Escribe un comentario"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <Select value={String(newRating)} onValueChange={v => setNewRating(Number(v))}>
          <SelectTrigger>
            <SelectValue placeholder="Puntaje" />
          </SelectTrigger>
          <SelectContent>
            {[5, 4, 3, 2, 1].map(n => (
              <SelectItem key={n} value={String(n)}>{n} estrellas</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSend}>Enviar</Button>
      </div>
      {/* LISTA DE COMENTARIOS */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {paginated.map((c) => (
          <div key={c.id} className="border rounded-lg p-2 bg-gray-50">
            <div className="flex items-center gap-1">
              {Array.from({ length: c.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400" />
              ))}
              <span className="text-xs ml-2 text-gray-800 font-bold">{c.user}</span>
              <span className="text-xs text-gray-400 ml-2">{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            <div className="text-sm">{c.comment}</div>
          </div>
        ))}
      </div>
      {allComments.length > 5 && (
        <Button variant="ghost" className="mt-2" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Ver menos' : 'Ver todos'}
        </Button>
      )}
    </div>
  );
};

export default ClientsManagement;
