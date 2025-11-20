import React, { useState, useEffect } from 'react';

// ==========================================
// 1. IMPORTS & CONFIG
// ==========================================

// Firebase
import { db, auth } from '@/config/firebase';
import {
  ref,
  onValue,
  push,
  set,
  update,
  remove,
  get,
  query,
  orderByChild,
  equalTo
} from 'firebase/database';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Services & Hooks
import { formatAuthCredentials } from '@/services/auth';
import { useToast } from '@/hooks/use-toast';

// External Libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// UI Components (Shadcn/ui)
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';

// Custom Components
import UbigeoSelector from '@/components/UbigeoSelector';

// Icons
import {
  Search, Plus, Edit, Trash2, Building, FileText, Download,
  ExternalLink, Shield, Eye, CheckCircle, AlertTriangle,
  XCircle, DollarSign, Package, Star, Lock, Unlock,
  ShoppingCart, Truck, Factory, BarChart3, MapPin, Check,
  Upload, FileSpreadsheet
} from 'lucide-react';

// ==========================================
// 2. INTERFACES & TYPES
// ==========================================

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
  departamento?: string;
  provincia?: string;
  distrito?: string;
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
  authUid?: string;
  accessModules?: string[];
  portalLoginRuc?: string;
  pin?: string;
}

// ==========================================
// 3. CONSTANTS
// ==========================================

// Módulos disponibles (id, nombre, icono, color base)
// IMPORTANTE: Los IDs deben coincidir con los módulos usados en ProtectedRoute (App.tsx)
const AVAILABLE_MODULES = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3, color: 'purple' },
  { id: 'catalog', name: 'Catálogo', icon: ShoppingCart, color: 'blue' },
  { id: 'orders', name: 'Pedidos', icon: Package, color: 'indigo' },
  { id: 'tracking', name: 'Seguimiento', icon: Truck, color: 'amber' },
  { id: 'delivery', name: 'Reparto', icon: Truck, color: 'green' },
  { id: 'production', name: 'Producción', icon: Factory, color: 'orange' },
  { id: 'billing', name: 'Cobranzas', icon: DollarSign, color: 'red' },
  { id: 'logistics', name: 'Logística', icon: Truck, color: 'cyan' },
  { id: 'locations', name: 'Ubicaciones', icon: MapPin, color: 'teal' },
  { id: 'reports', name: 'Reportes', icon: BarChart3, color: 'violet' }
];

// ==========================================
// 4. UTILITY FUNCTIONS (Reports)
// ==========================================

// Reporte PDF
export const generateClientReportPDF = (client: Client) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Reporte Detallado de Cliente', 14, 16);
  doc.setFontSize(12);
  doc.text(`Razón Social: ${client.razonSocial}`, 14, 26);
  doc.text(`RUC/DNI: ${client.rucDni}`, 14, 34);
  doc.text(`Dirección Fiscal: ${client.direccionFiscal}`, 14, 42);
  doc.text(`Estado: ${client.estado}`, 14, 50);

  let nextY = 58;

  // Tabla de Sedes
  if (client.sedes?.length > 0) {
    doc.text('Sedes:', 14, nextY + 2);
    autoTable(doc, {
      startY: nextY + 6,
      head: [['Nombre', 'Dirección', 'Responsable', 'Teléfono', 'Distrito']],
      body: client.sedes.map(s => [
        s.nombre,
        s.direccion,
        s.responsable,
        s.telefono,
        s.distrito || ''
      ])
    });
    nextY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : nextY + 30;
  } else nextY += 18;

  // Tabla de Contactos
  if (client.contactos?.length > 0) {
    doc.text('Contactos:', 14, nextY + 2);
    autoTable(doc, {
      startY: nextY + 6,
      head: [['Tipo', 'Nombre', 'DNI', 'Celular', 'Correo']],
      body: client.contactos.map(c => [c.tipo, c.nombre, c.dni, c.celular, c.correo])
    });
    if (client.observaciones) {
      const lastY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 110;
      doc.text('Observaciones:', 14, lastY);
      doc.text(client.observaciones, 14, lastY + 8);
    }
  }
  doc.save(`Reporte_${client.razonSocial || client.rucDni}.pdf`);
};

// Reporte Excel
export const generateClientReportExcel = (client: Client) => {
  const ws1 = XLSX.utils.json_to_sheet([
    {
      'Razón Social': client.razonSocial,
      'RUC/DNI': client.rucDni,
      'Dirección Fiscal': client.direccionFiscal,
      Estado: client.estado,
      Observaciones: client.observaciones
    }
  ]);
  const ws2 = XLSX.utils.json_to_sheet(client.sedes || []);
  const ws3 = XLSX.utils.json_to_sheet(client.contactos || []);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Cliente');
  XLSX.utils.book_append_sheet(wb, ws2, 'Sedes');
  XLSX.utils.book_append_sheet(wb, ws3, 'Contactos');
  XLSX.writeFile(wb, `Reporte_${client.razonSocial || client.rucDni}.xlsx`);
};

// Generar plantilla de importación masiva
export const generateBulkImportTemplate = () => {
  const workbook = XLSX.utils.book_new();

  // Instrucciones
  const instructions = [
    ['PLANTILLA DE IMPORTACIÓN MASIVA DE CLIENTES'],
    [],
    ['INSTRUCCIONES:'],
    ['1. Complete los datos en la hoja "Clientes" (campos obligatorios marcados con *)'],
    ['2. Complete las sedes en la hoja "Sedes" (vincular por RUC/DNI del cliente)'],
    ['3. Complete los contactos en la hoja "Contactos" (vincular por RUC/DNI del cliente)'],
    ['4. Los módulos de acceso deben separarse por punto y coma (;)'],
    ['5. Módulos disponibles: dashboard;catalog;orders;tracking;delivery;production;billing;logistics;locations;reports'],
    ['6. Guarde el archivo y use el botón "Importar Clientes" para subirlo'],
    [],
    ['NOTAS IMPORTANTES:'],
    ['- El RUC/DNI debe ser único para cada cliente'],
    ['- El estado puede ser: activo, suspendido, moroso'],
    ['- Si desea crear acceso al portal, ingrese un PIN de 4 dígitos'],
    ['- Para marcar una sede como principal, use "SI" o "NO"'],
    ['- Los tipos de contacto pueden ser: pago, admin, pedidos']
  ];

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
  XLSX.utils.book_append_sheet(workbook, wsInstructions, 'Instrucciones');

  // Hoja de Clientes
  const clientsData = [
    ['RUC/DNI*', 'Razón Social*', 'Dirección Fiscal*', 'Departamento', 'Provincia', 'Distrito', 'Email Facturación*', 'Estado*', 'Lista de Precio', 'Frecuencia Compras', 'Horario Entrega', 'Condición Pago', 'Límite Crédito', 'Observaciones', 'PIN (4 dígitos)', 'Módulos de Acceso'],
    ['20123456789', 'Ejemplo SAC', 'Av. Principal 123', 'Lima', 'Lima', 'Miraflores', 'facturacion@ejemplo.com', 'activo', 'Lista A', 'Semanal', '8am - 12pm', 'Crédito 30 días', '10000', 'Cliente de ejemplo', '1234', 'catalog;orders;tracking']
  ];

  const wsClients = XLSX.utils.aoa_to_sheet(clientsData);
  XLSX.utils.book_append_sheet(workbook, wsClients, 'Clientes');

  // Hoja de Sedes
  const sedesData = [
    ['RUC/DNI Cliente*', 'Nombre Sede*', 'Dirección*', 'Distrito', 'Responsable*', 'Teléfono*', 'Principal (SI/NO)*', 'Google Maps URL'],
    ['20123456789', 'Sede Central', 'Av. Principal 123', 'Miraflores', 'Juan Pérez', '987654321', 'SI', ''],
    ['20123456789', 'Sede Callao', 'Av. Colonial 456', 'Callao', 'María García', '987654322', 'NO', '']
  ];

  const wsSedes = XLSX.utils.aoa_to_sheet(sedesData);
  XLSX.utils.book_append_sheet(workbook, wsSedes, 'Sedes');

  // Hoja de Contactos
  const contactosData = [
    ['RUC/DNI Cliente*', 'Tipo (pago/admin/pedidos)*', 'Nombre*', 'DNI*', 'Celular*', 'Correo*'],
    ['20123456789', 'pago', 'Juan Pérez', '12345678', '987654321', 'juan.perez@ejemplo.com'],
    ['20123456789', 'pedidos', 'María García', '87654321', '987654322', 'maria.garcia@ejemplo.com']
  ];

  const wsContactos = XLSX.utils.aoa_to_sheet(contactosData);
  XLSX.utils.book_append_sheet(workbook, wsContactos, 'Contactos');

  XLSX.writeFile(workbook, 'Plantilla_Importacion_Clientes.xlsx');
};

// Procesar importación masiva
export const processBulkImport = async (file: File, toast: any) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const clientsSheet = workbook.Sheets['Clientes'];
        if (!clientsSheet) {
          throw new Error('No se encontró la hoja "Clientes"');
        }
        const clientsData: any[] = XLSX.utils.sheet_to_json(clientsSheet);

        const sedesSheet = workbook.Sheets['Sedes'];
        const sedesData: any[] = sedesSheet ? XLSX.utils.sheet_to_json(sedesSheet) : [];

        const contactosSheet = workbook.Sheets['Contactos'];
        const contactosData: any[] = contactosSheet ? XLSX.utils.sheet_to_json(contactosSheet) : [];

        const clientsRef = ref(db, 'clients');
        let createdCount = 0;
        let errorCount = 0;

        for (const row of clientsData) {
          try {
            const rucDni = row['RUC/DNI*']?.toString().trim();
            if (!rucDni) continue;

            const clientSedes = sedesData
              .filter(s => s['RUC/DNI Cliente*']?.toString().trim() === rucDni)
              .map((s, idx) => ({
                id: `sede_${Date.now()}_${idx}`,
                nombre: s['Nombre Sede*'] || '',
                direccion: s['Dirección*'] || '',
                distrito: s['Distrito'] || '',
                responsable: s['Responsable*'] || '',
                telefono: s['Teléfono*']?.toString() || '',
                principal: s['Principal (SI/NO)*']?.toString().toUpperCase() === 'SI',
                googleMapsUrl: s['Google Maps URL'] || ''
              }));

            const clientContactos = contactosData
              .filter(c => c['RUC/DNI Cliente*']?.toString().trim() === rucDni)
              .map(c => ({
                tipo: c['Tipo (pago/admin/pedidos)*'] || 'pedidos',
                nombre: c['Nombre*'] || '',
                dni: c['DNI*']?.toString() || '',
                celular: c['Celular*']?.toString() || '',
                correo: c['Correo*'] || ''
              }));

            const modulesStr = row['Módulos de Acceso']?.toString() || '';
            const accessModules = modulesStr
              .split(';')
              .map(m => m.trim())
              .filter(m => m);

            const newClient = {
              rucDni,
              razonSocial: row['Razón Social*'] || '',
              direccionFiscal: row['Dirección Fiscal*'] || '',
              departamento: row['Departamento'] || '',
              provincia: row['Provincia'] || '',
              distrito: row['Distrito'] || '',
              emailFacturacion: row['Email Facturación*'] || '',
              estado: (row['Estado*'] || 'activo').toLowerCase(),
              listaPrecio: row['Lista de Precio'] || 'Lista A',
              frecuenciaCompras: row['Frecuencia Compras'] || '',
              horarioEntrega: row['Horario Entrega'] || '',
              condicionPago: row['Condición Pago'] || '',
              limiteCredito: parseFloat(row['Límite Crédito'] || '0'),
              observaciones: row['Observaciones'] || '',
              fechaCreacion: new Date().toLocaleDateString('es-PE'),
              montoDeuda: 0,
              sedes: clientSedes,
              contactos: clientContactos,
              accessModules,
              pin: row['PIN (4 dígitos)']?.toString() || '',
              portalLoginRuc: rucDni
            };

            const newClientRef = push(clientsRef);
            
            if (newClient.pin && newClient.pin.length === 4) {
              try {
                const { email, password } = formatAuthCredentials(rucDni, newClient.pin);
                const credential = await createUserWithEmailAndPassword(auth, email, password);
                
                await set(ref(db, `usuarios/${credential.user.uid}`), {
                  nombre: newClient.razonSocial,
                  correo: email,
                  rol: 'retailUser',
                  activo: true,
                  accessModules: newClient.accessModules,
                  portalLoginRuc: rucDni
                });

                await set(newClientRef, {
                  ...newClient,
                  authUid: credential.user.uid
                });
              } catch (authError: any) {
                await set(newClientRef, newClient);
              }
            } else {
              await set(newClientRef, newClient);
            }

            createdCount++;
          } catch (error) {
            console.error('Error procesando cliente:', error);
            errorCount++;
          }
        }

        toast({
          title: 'Importación completada',
          description: `${createdCount} clientes creados. ${errorCount} errores.`
        });

        resolve({ createdCount, errorCount });
      } catch (error: any) {
        toast({
          title: 'Error en importación',
          description: error.message,
          variant: 'destructive'
        });
        reject(error);
      }
    };

    reader.onerror = () => {
      toast({
        title: 'Error leyendo archivo',
        description: 'No se pudo leer el archivo',
        variant: 'destructive'
      });
      reject(new Error('Error leyendo archivo'));
    };

    reader.readAsArrayBuffer(file);
  });
};

// ==========================================
// 5. MAIN COMPONENT
// ==========================================

export const ClientsAccessManagement = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Fetch Clients
  useEffect(() => {
    const clientsRef = ref(db, 'clients');
    const unsubscribe = onValue(clientsRef, snapshot => {
      const data = snapshot.val();
      if (!data) {
        setClients([]);
        return;
      }
      const arr: Client[] = Object.entries(data).map(([id, client]: any) => ({
        ...client,
        id,
        sedes: client.sedes
          ? Object.entries(client.sedes).map(([sid, sede]: any) => ({
              ...sede,
              id: sid,
              comentarios: sede.comentarios ? Object.values(sede.comentarios) : []
            }))
          : []
      }));
      setClients(arr);
    });
    return () => unsubscribe();
  }, []);

  // Logic: Save Client (Create or Edit)
  const saveClient = async (client: Partial<Client>, isEdit?: boolean): Promise<boolean> => {
    const clientsRef = ref(db, 'clients');
    // Normaliza datos y asegura accessModules
    const cleanClientData = {
      ...client,
      pin: client.pin || null,
      portalLoginRuc: client.rucDni || null,
      sedes: client.sedes || null,
      contactos: client.contactos || null,
      accessModules: client.accessModules || []
    };

    try {
      // EDITAR
      if (isEdit && client.id) {
        // Si no tiene usuario y se ingresó PIN válido, creamos acceso
        if (!client.authUid && client.rucDni && client.pin && client.pin.length === 4) {
          try {
            const { email, password } = formatAuthCredentials(client.rucDni, client.pin);
            const credential = await createUserWithEmailAndPassword(auth, email, password);

            // Crear nodo usuario con permisos
            await set(ref(db, `usuarios/${credential.user.uid}`), {
              nombre: client.razonSocial,
              correo: email,
              rol: 'retailUser',
              activo: true,
              accessModules: cleanClientData.accessModules,
              portalLoginRuc: client.rucDni
            });

            // Actualizar cliente con authUid
            await update(ref(db, `clients/${client.id}`), {
              ...cleanClientData,
              authUid: credential.user.uid
            });

            // Refuerzo: asegurar permisos en usuario
            await update(ref(db, `usuarios/${credential.user.uid}`), {
              accessModules: cleanClientData.accessModules
            });

            toast({ title: 'Acceso creado', description: 'Credenciales generadas (RUC + PIN)' });
          } catch (authError: any) {
            if (authError.code === 'auth/email-already-in-use') {
              // Buscar usuario existente por RUC o correo y vincular + actualizar permisos
              let foundUid: string | undefined;
              try {
                const qByRuc = query(ref(db, 'usuarios'), orderByChild('portalLoginRuc'), equalTo(client.rucDni!));
                const snapRuc = await get(qByRuc);
                if (snapRuc.exists()) {
                  foundUid = Object.keys(snapRuc.val())[0];
                } else {
                  const { email } = formatAuthCredentials(client.rucDni!, client.pin!);
                  const qByEmail = query(ref(db, 'usuarios'), orderByChild('correo'), equalTo(email));
                  const snapEmail = await get(qByEmail);
                  if (snapEmail.exists()) {
                    foundUid = Object.keys(snapEmail.val())[0];
                  }
                }

                if (foundUid) {
                  await update(ref(db, `usuarios/${foundUid}`), {
                    accessModules: cleanClientData.accessModules,
                    portalLoginRuc: client.rucDni
                  });
                  await update(ref(db, `clients/${client.id}`), {
                    ...cleanClientData,
                    authUid: foundUid
                  });
                  toast({
                    title: 'Acceso vinculado',
                    description: 'Usuario existente vinculado y permisos actualizados.'
                  });
                } else {
                  toast({
                    title: 'Aviso',
                    description: 'El acceso ya existía pero no se pudo vincular automáticamente.',
                    variant: 'destructive'
                  });
                }
              } catch {
                toast({
                  title: 'Error',
                  description: 'No se pudo vincular el acceso existente.',
                  variant: 'destructive'
                });
              }
            } else {
              throw authError;
            }
          }
        } else {
          // Solo actualizar datos del cliente
          await update(ref(db, `clients/${client.id}`), cleanClientData);
          // Asegurar que permisos queden en el nodo de usuario si existe
          if (client.authUid) {
            await update(ref(db, `usuarios/${client.authUid}`), {
              accessModules: cleanClientData.accessModules
            });
          }
          toast({ title: 'Cliente actualizado', description: 'Actualizado correctamente' });
        }

        return true;
      }

      // CREAR
      let authUid: string | undefined;

      if (client.rucDni && client.pin && client.pin.length === 4) {
        try {
          const { email, password } = formatAuthCredentials(client.rucDni, client.pin);
          const credential = await createUserWithEmailAndPassword(auth, email, password);
          authUid = credential.user.uid;

          // Crear nodo usuario con permisos
          await set(ref(db, `usuarios/${authUid}`), {
            nombre: client.razonSocial,
            correo: email,
            rol: 'retailUser',
            activo: true,
            accessModules: cleanClientData.accessModules,
            portalLoginRuc: client.rucDni
          });

          toast({ title: 'Usuario portal creado', description: 'Acceso habilitado (RUC + PIN)' });
        } catch (authError: any) {
          if (authError.code === 'auth/email-already-in-use') {
            // Buscar por RUC y actualizar permisos
            const qByRuc = query(ref(db, 'usuarios'), orderByChild('portalLoginRuc'), equalTo(client.rucDni!));
            const snapRuc = await get(qByRuc);
            if (snapRuc.exists()) {
              authUid = Object.keys(snapRuc.val())[0];
              await update(ref(db, `usuarios/${authUid}`), {
                accessModules: cleanClientData.accessModules
              });
              toast({
                title: 'Acceso existente',
                description: 'Vinculado y permisos actualizados.'
              });
            } else {
              toast({
                title: 'Aviso',
                description: 'El acceso ya existía. Se podrá vincular manualmente.',
                variant: 'default'
              });
            }
          } else {
            throw authError;
          }
        }
      }

      // Crear registro del cliente
      const newClientRef = push(clientsRef);
      await set(newClientRef, {
        ...cleanClientData,
        authUid: authUid || null,
        fechaCreacion: Date.now()
      });

      // Refuerzo: asegurar permisos también en usuarios si hay authUid
      if (authUid) {
        await update(ref(db, `usuarios/${authUid}`), {
          accessModules: cleanClientData.accessModules
        });
      }

      toast({ title: 'Cliente creado', description: 'Registro almacenado correctamente' });
      return true;
    } catch (error: any) {
      let errorMsg = 'No se pudo guardar el cliente.';
      if (error.code === 'auth/invalid-email') errorMsg = 'Email interno inválido.';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      return false;
    }
  };

  const deleteClient = (id: string) => {
    remove(ref(db, `clients/${id}`));
    // Nota: si se desea también limpiar permisos en usuarios/{authUid}, podría leerse y borrarse.
    toast({ title: 'Cliente eliminado' });
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      await processBulkImport(file, toast);
    } catch (error) {
      console.error('Error en importación:', error);
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  // Filter logic
  const filteredClients = clients.filter(
    client =>
      client.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.rucDni?.includes(searchTerm) ||
      client.sedes?.some(sede => sede.nombre?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        );
      case 'suspendido':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Suspendido
          </Badge>
        );
      case 'moroso':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Moroso
          </Badge>
        );
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Gestión de Clientes</h1>
          <p className="text-stone-600 mt-1">Administración completa de clientes y ubicaciones</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Buscar por razón social, RUC, sede..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={generateBulkImportTemplate}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Descargar Plantilla
          </Button>
          
          <Button
            variant="outline"
            disabled={isImporting}
            onClick={() => document.getElementById('file-import')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? 'Importando...' : 'Importar Clientes'}
          </Button>
          <input
            id="file-import"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileImport}
            className="hidden"
          />
          
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
      </div>

      {/* Client List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClients.map(client => (
              <div
                key={client.id}
                className="border rounded-lg p-4 hover:bg-stone-50 transition-colors"
              >
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
                    {client.authUid ? (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        <Lock className="h-3 w-3 mr-1" />
                        Con Acceso
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                        <Unlock className="h-3 w-3 mr-1" />
                        Sin Acceso
                      </Badge>
                    )}

                    {/* View Details Button */}
                    <Dialog
                      open={isViewModalOpen && selectedClient?.id === client.id}
                      onOpenChange={open => {
                        if (!open) setSelectedClient(null);
                        setIsViewModalOpen(open);
                      }}
                    >
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

                    {/* Edit Button */}
                    <Dialog
                      open={isEditModalOpen && selectedClient?.id === client.id}
                      onOpenChange={open => {
                        if (!open) setSelectedClient(null);
                        setIsEditModalOpen(open);
                      }}
                    >
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

                    {/* Reports Dropdown */}
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

                    {/* Delete Button */}
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

// ==========================================
// 6. SUB-COMPONENTS (Forms & Details)
// ==========================================

const ClientForm = ({
  client,
  onSave,
  onFinish
}: {
  client?: Client;
  onSave: (data: Partial<Client>, isEdit?: boolean) => Promise<boolean>;
  onFinish: () => void;
}) => {
  const { toast } = useToast();
  const [tipoCliente, setTipoCliente] = useState<string>('RUC');
  const [pin, setPin] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [accessModules, setAccessModules] = useState<string[]>(client?.accessModules || []);
  const [formData, setFormData] = useState({
    id: client?.id || '',
    razonSocial: client?.razonSocial || '',
    rucDni: client?.rucDni || '',
    direccionFiscal: client?.direccionFiscal || '',
    departamento: client?.departamento || '',
    provincia: client?.provincia || '',
    distrito: client?.distrito || '',
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

  const toggleModule = (id: string) => {
    setAccessModules(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!formData.razonSocial || !formData.rucDni) {
      toast({
        title: 'Error',
        description: 'Complete los campos obligatorios',
        variant: 'destructive'
      });
      return;
    }
    if (!client && pin && pin.length !== 4) {
      toast({
        title: 'PIN inválido',
        description: 'El PIN debe tener 4 dígitos',
        variant: 'destructive'
      });
      return;
    }
    setIsSaving(true);
    const data: Partial<Client> = {
      ...formData,
      portalLoginRuc: formData.rucDni,
      pin: pin || null,
      accessModules,
      sedes: undefined,
      contactos: undefined
    };

    try {
      const success = await onSave({ ...data, sedes, contactos }, !!client);
      if (success) onFinish();
    } finally {
      setIsSaving(false);
    }
  };

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
        comentarios: []
      }
    ]);
  };

  const deleteSede = (id: string) => {
    setSedes(sedes.filter(s => s.id !== id));
  };

  const addContacto = () => {
    setContactos([
      ...contactos,
      { tipo: 'admin', nombre: '', dni: '', celular: '', correo: '' }
    ]);
  };

  const deleteContacto = (idx: number) => {
    setContactos(contactos.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sedes">Sedes</TabsTrigger>
          <TabsTrigger value="contactos">Contactos</TabsTrigger>
          <TabsTrigger value="comercial">Comercial</TabsTrigger>
          <TabsTrigger value="access">Acceso</TabsTrigger>
        </TabsList>

        {/* Tab: General */}
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoCliente">Tipo de Cliente *</Label>
              <Select value={tipoCliente} onValueChange={setTipoCliente}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Identificacion">Identificación</SelectItem>
                  <SelectItem value="RUC">RUC</SelectItem>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="CE">CE</SelectItem>
                  <SelectItem value="PASAPORTE">PASAPORTE</SelectItem>
                  <SelectItem value="DOC.TRI.NO.DISP.SIN.RUC">
                    DOC.TRI.NO.DISP.SIN.RUC
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rucDni">RUC/DNI *</Label>
              <div className="flex gap-2">
                <Input
                  id="rucDni"
                  value={formData.rucDni}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, rucDni: e.target.value }))
                  }
                  placeholder="20123456789"
                />
                {tipoCliente === 'RUC' && (
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    SUNAT
                  </Button>
                )}
                {tipoCliente === 'DNI' && (
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    RENIEC
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="razonSocial">Razón Social *</Label>
              <Input
                id="razonSocial"
                value={formData.razonSocial}
                onChange={e =>
                  setFormData(prev => ({ ...prev, razonSocial: e.target.value }))
                }
                placeholder="Nombre de la empresa"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Ubicación (Perú)</Label>
              <UbigeoSelector
                departamento={formData.departamento}
                provincia={formData.provincia}
                distrito={formData.distrito}
                onChange={data =>
                  setFormData(prev => ({
                    ...prev,
                    departamento: data.departamento,
                    provincia: data.provincia,
                    distrito: data.distrito
                  }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="direccionFiscal">Dirección Específica</Label>
              <Input
                id="direccionFiscal"
                value={formData.direccionFiscal}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    direccionFiscal: e.target.value
                  }))
                }
                placeholder="Calle, número, referencia"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailFacturacion">Email Facturación</Label>
              <Input
                id="emailFacturacion"
                type="email"
                value={formData.emailFacturacion}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    emailFacturacion: e.target.value
                  }))
                }
                placeholder="facturacion@empresa.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value: any) =>
                  setFormData(prev => ({ ...prev, estado: value }))
                }
              >
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
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    observaciones: e.target.value
                  }))
                }
                placeholder="Notas internas sobre el cliente"
                rows={3}
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab: Sedes */}
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
                        onChange={e => {
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
                        onChange={e => {
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
                        onChange={e => {
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
                        onChange={e => {
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
                        onChange={e => {
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
                        onChange={e => {
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
                          onCheckedChange={checked => {
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
                      <Button
                        variant="outline"
                        className="text-red-600"
                        onClick={() => deleteSede(sede.id)}
                      >
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

        {/* Tab: Contactos */}
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
                        onChange={e => {
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
                        onChange={e => {
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
                        onChange={e => {
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
                        onChange={e => {
                          const newContactos = [...contactos];
                          newContactos[idx].correo = e.target.value;
                          setContactos(newContactos);
                        }}
                        placeholder="contacto@empresa.com"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      className="text-red-600"
                      onClick={() => deleteContacto(idx)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Comercial */}
        <TabsContent value="comercial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lista de Precios</Label>
              <Select
                value={formData.listaPrecio}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, listaPrecio: value }))
                }
              >
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
              <Select
                value={formData.frecuenciaCompras}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, frecuenciaCompras: value }))
                }
              >
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
              <Select
                value={formData.condicionPago}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, condicionPago: value }))
                }
              >
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
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    limiteCredito: Number(e.target.value)
                  }))
                }
                placeholder="0"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Horario de Entrega Preferido</Label>
              <Input
                value={formData.horarioEntrega}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    horarioEntrega: e.target.value
                  }))
                }
                placeholder="Ej: Lunes a Viernes 8:00-17:00"
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab: Acceso */}
        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Acceso Portal (RUC + PIN)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 p-4 bg-stone-50 rounded-lg">
                <div className="space-y-2">
                  <Label>Usuario (RUC)</Label>
                  <Input
                    value={formData.rucDni}
                    disabled
                    className="bg-stone-100 text-stone-700 font-mono"
                  />
                  <p className="text-xs text-stone-500">
                    Este RUC será el identificador de acceso.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>PIN (4 dígitos)</Label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    placeholder="Ej: 1234"
                    value={pin}
                    onChange={e =>
                      setPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                    }
                    maxLength={4}
                    className="font-mono tracking-widest"
                    disabled={!!client?.authUid}
                  />
                  <p className="text-xs text-stone-500">
                    El PIN se convertirá internamente en credenciales seguras.
                  </p>
                </div>
                {client?.authUid ? (
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    <Lock className="h-3 w-3 mr-1" />
                    Con Acceso
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                    <Unlock className="h-3 w-3 mr-1" />
                    Sin Acceso
                  </Badge>
                )}
                <p className="text-xs text-amber-600">
                  El email interno se genera usando RUC + PIN.
                </p>
              </div>

              {/* Permisos de Módulos */}
              <Card className="border border-stone-200">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Permisos de Módulos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-stone-500">
                    Seleccione qué módulos puede ver este cliente en el portal.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {AVAILABLE_MODULES.map(m => {
                      const ActiveIcon = m.icon;
                      const active = accessModules.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleModule(m.id)}
                          className={
                            'group relative flex flex-col items-center justify-center rounded-md border text-xs py-3 px-2 transition ' +
                            (active
                              ? `border-${m.color}-500 bg-${m.color}-500 text-white shadow`
                              : 'border-stone-200 bg-stone-100 text-stone-600 hover:bg-stone-200')
                          }
                        >
                          <ActiveIcon
                            className={
                              'h-4 w-4 mb-1 ' + (active ? 'text-white' : 'text-stone-500')
                            }
                          />
                          <span className="font-medium">{m.name}</span>
                          {active && (
                            <Check className="absolute top-1 right-1 h-4 w-4 text-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-xs text-stone-500">
                    Módulos activos: {accessModules.length || 0}
                  </div>
                </CardContent>
              </Card>

              {client?.authUid && (
                <div className="text-xs text-stone-500">
                  Acceso ya creado. Para cambiar PIN no se muestra aquí.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onFinish}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Guardando...' : (client ? 'Actualizar' : 'Crear') + ' Cliente'}
        </Button>
      </div>
    </div>
  );
};

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
                    {client.estado === 'activo' && (
                      <Badge className="bg-green-100 text-green-800">Activo</Badge>
                    )}
                    {client.estado === 'suspendido' && (
                      <Badge className="bg-yellow-100 text-yellow-800">Suspendido</Badge>
                    )}
                    {client.estado === 'moroso' && (
                      <Badge className="bg-red-100 text-red-800">Moroso</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sedes" className="space-y-4">
          <div className="space-y-6">
            {(client.sedes || []).map(sede => (
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
                    <div className="text-sm text-stone-600">
                      Responsable: {sede.responsable} - {sede.telefono}
                    </div>
                    {sede.distrito && (
                      <div className="text-xs text-stone-500">Distrito: {sede.distrito}</div>
                    )}
                    {sede.googleMapsUrl && (
                      <div className="mt-2">
                        <a
                          href={sede.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
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
                {(client.contactos || []).map((contacto, idx) => (
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

  const paginated = showAll ? allComments : allComments.slice(0, 5);

  useEffect(() => {
    setAllComments([...comentarios].sort((a, b) => b.createdAt - a.createdAt));
  }, [comentarios]);

  const avg =
    allComments.length > 0
      ? (allComments.reduce((acc, c) => acc + c.rating, 0) / allComments.length).toFixed(2)
      : '0';

  const handleSend = () => {
    if (!newComment || !user) return;
    const comentario: SedeComment = {
      id: Date.now().toString(),
      user,
      comment: newComment,
      rating: newRating,
      createdAt: Date.now()
    };
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
              <SelectItem key={n} value={String(n)}>
                {n} estrellas
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSend}>Enviar</Button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {paginated.map(c => (
          <div key={c.id} className="border rounded-lg p-2 bg-gray-50">
            <div className="flex items-center gap-1">
              {Array.from({ length: c.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400" />
              ))}
              <span className="text-xs ml-2 text-gray-800 font-bold">{c.user}</span>
              <span className="text-xs text-gray-400 ml-2">
                {new Date(c.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="text-sm">{c.comment}</div>
          </div>
        ))}
      </div>
      {allComments.length > 5 && (
        <Button variant="ghost" className="mt-2" onClick={() => setShowAll(v => !v)}>
          {showAll ? 'Ver menos' : 'Ver todos'}
        </Button>
      )}
    </div>
  );
};

export default ClientsAccessManagement;