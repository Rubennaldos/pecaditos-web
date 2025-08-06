
import LivePreview from '../LivePreview';
import { useState } from 'react';
import { db } from '../../config/firebase'; // Ajusta el path si tu archivo es diferente
import { ref, onValue, push, update, remove } from "firebase/database";
import { useEffect } from "react";
import React from "react";
import { 
  Settings, 
  Users, 
  Building, 
  Shield, 
  Database, 
  Bell,
  Palette,
  Globe,
  Mail,
  Phone,
  MapPin,
  Search,
  Plus,
  Trash2,
  Edit,
  Key,
  ToggleLeft,
  ToggleRight,
  Download,
  Eye,
  Calendar,
  Clock,
  Smartphone,
  Monitor,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MessageCircle,
  UserPlus,
  Filter,
  FileText,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { CardFooter } from '@/components/ui/card';

// --- Types para notificaciones y auditoría ---
// (Pega esto después de los imports)

type NotificationModule = {
  email: boolean;
  whatsapp: boolean;
  system: boolean;
};

type Notifications = {
  orders?: NotificationModule;
  payments?: NotificationModule;
  stock?: NotificationModule;
  deliveries?: NotificationModule;
  general?: NotificationModule;
};

type AuditLog = {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  details: string;
};

export const SystemConfiguration = () => {

const [companyInfo, setCompanyInfo] = useState<any>({});
const [loadingCompany, setLoadingCompany] = useState(true);
const [showPreview, setShowPreview] = useState(false);
// Consulta SUNAT / RENIEC usando la API pública de apisperu
const consultarRucDni = async () => {
  const numero = companyInfo.ruc;
  if (!numero) {
    toast({ title: "Error", description: "Debes ingresar un RUC o DNI.", variant: "destructive" });
    return;
  }

  let url = "";
  if (numero.length === 8) {
    url = `https://dniruc.apisperu.com/api/v1/dni/${numero}`;
  } else if (numero.length === 11) {
    url = `https://dniruc.apisperu.com/api/v1/ruc/${numero}`;
  } else {
    toast({ title: "Formato inválido", description: "Debe ser DNI (8 dígitos) o RUC (11 dígitos).", variant: "destructive" });
    return;
  }

  toast({ title: "Consultando...", description: "Obteniendo datos desde SUNAT/RENIEC..." });

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (numero.length === 8 && data.success) {
      setCompanyInfo({
        ...companyInfo,
        businessName: `${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`,
        fiscalAddress: "",
      });
      toast({ title: "¡DNI encontrado!", description: "Datos cargados correctamente." });
    } else if (numero.length === 11 && data.success) {
      setCompanyInfo({
        ...companyInfo,
        businessName: data.razonSocial,
        fiscalAddress: data.direccion,
        estado: data.estado,
        condicion: data.condicion,
      });
      toast({ title: "¡RUC encontrado!", description: "Datos cargados correctamente." });
    } else {
      toast({ title: "No encontrado", description: "No se encontró información para el número ingresado.", variant: "destructive" });
    }
  } catch (e) {
    toast({ title: "Error", description: "No se pudo consultar SUNAT/RENIEC.", variant: "destructive" });
  }
};

useEffect(() => {
  const refEmpresa = ref(db, "empresa");
  const unsub = onValue(refEmpresa, snap => {
    setCompanyInfo(snap.val() || {});

    setLoadingCompany(false);
  });
  return () => unsub();
}, []);



  const [devicePreview, setDevicePreview] = useState('desktop'); // 'desktop' | 'mobile'

  const [systemSettings, setSystemSettings] = useState({
    maxDeliveryTime: 120,
    criticalStock: 5,
    lowStock: 40,
    overduePaymentDays: 15,
    autoNotifications: true,
    whatsappIntegration: false,
    emailNotifications: true
  });
const [users, setUsers] = useState([]);


  const [userSearch, setUserSearch] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

const [notifications, setNotifications] = useState<Notifications>({});
const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

useEffect(() => {
  // Cargar notificaciones
  const notificationsRef = ref(db, 'notifications');
  onValue(notificationsRef, (snapshot) => {
    const data = snapshot.val();
    setNotifications(data || {});
  });

  // Cargar auditoría
  const auditRef = ref(db, 'auditLogs');
  onValue(auditRef, (snapshot) => {
    const data = snapshot.val();
    // Convierte el objeto en array y añade el id de la key
    const logs = data
      ? Object.entries(data).map(([id, value]: [string, any]) => ({ id, ...(value as AuditLog) }))
      : [];
    setAuditLogs(logs);
  });
}, []);

  const [auditFilter, setAuditFilter] = useState({ user: '', module: 'all', dateFrom: '', dateTo: '' });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.profile.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredAuditLogs = auditLogs.filter(log => {
    return (!auditFilter.user || log.user.toLowerCase().includes(auditFilter.user.toLowerCase())) &&
           (!auditFilter.module || auditFilter.module === 'all' || log.module.toLowerCase().includes(auditFilter.module.toLowerCase()));
  });

  const daysOfWeek = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  const handleSaveCompany = async () => {
  if (!companyInfo) return;
  try {
    await update(ref(db, "empresa"), companyInfo);
    toast({
      title: "Configuración guardada",
      description: "Los datos de la empresa se han actualizado correctamente.",
    });
  } catch (error) {
    toast({
      title: "Error al guardar",
      description: "No se pudo guardar la información. Intenta nuevamente.",
      variant: "destructive"
    });
  }
};

  const handleUserAction = (action, user) => {
    switch(action) {
      case 'edit':
        setSelectedUser(user);
        setShowUserModal(true);
        break;
      case 'reset':
        toast({
          title: "Contraseña restablecida",
          description: `Se ha enviado una nueva contraseña al email de ${user.name}.`,
        });
        break;
      case 'toggle':
        setUsers(users.map(u => 
          u.id === user.id ? { ...u, active: !u.active } : u
        ));
        toast({
          title: user.active ? "Usuario desactivado" : "Usuario activado",
          description: `${user.name} ha sido ${user.active ? 'desactivado' : 'activado'}.`,
        });
        break;
      case 'delete':
        setUsers(users.filter(u => u.id !== user.id));
        toast({
          title: "Usuario eliminado",
          description: `${user.name} ha sido eliminado del sistema.`,
          variant: "destructive"
        });
        break;
    }
  };

  const handleExportAudit = () => {
    toast({
      title: "Exportando auditoría",
      description: "El reporte se descargará en unos momentos.",
    });
  };
// --- FOOTER CONFIGURABLE ----
const iconOptions = [
  "MapPin","Mail","Phone","Clock","FileText","Users","Facebook","Instagram","Twitter","Youtube","MessageCircle","ExternalLink"
];
const lucideIcons = { MapPin, Mail, Phone, Clock, FileText, Users, Facebook, Instagram, Twitter, Youtube, MessageCircle, ExternalLink };

const [footerSections, setFooterSections] = useState<any[]>([]);
const [footerLoading, setFooterLoading] = useState(true);

useEffect(() => {
  const footerRef = ref(db, 'footer/sections');
  return onValue(footerRef, snap => {
    setFooterSections(snap.val() || []);
    setFooterLoading(false);
  });
}, []);

const handleSaveFooter = async () => {
  await update(ref(db, 'footer'), { sections: footerSections });
  toast({ title: "Footer guardado", description: "Los cambios se guardaron correctamente." });
};

const handleAddSection = () => {
  setFooterSections([
    ...footerSections,
    { title: "", items: [] }
  ]);
};

const handleDeleteSection = (idx: number) => {
  setFooterSections(footerSections.filter((_, i) => i !== idx));
};

const handleEditSectionTitle = (idx: number, title: string) => {
  setFooterSections(footerSections.map((sec, i) => i === idx ? { ...sec, title } : sec));
};

const handleAddItem = (sectionIdx: number) => {
  setFooterSections(footerSections.map((sec, i) => i === sectionIdx
    ? { ...sec, items: [...(sec.items||[]), { label: "", value: "", type: "text", icon: "FileText" }] }
    : sec
  ));
};

const handleDeleteItem = (sectionIdx: number, itemIdx: number) => {
  setFooterSections(footerSections.map((sec, i) => i === sectionIdx
    ? { ...sec, items: sec.items.filter((_:any, j:number) => j !== itemIdx) }
    : sec
  ));
};

const handleEditItem = (sectionIdx: number, itemIdx: number, field: string, value: any) => {
  setFooterSections(footerSections.map((sec, i) => i === sectionIdx
    ? {
        ...sec,
        items: sec.items.map((item:any, j:number) => j === itemIdx ? { ...item, [field]: value } : item)
      }
    : sec
  ));
};

if (loadingCompany || !companyInfo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-500">Cargando configuración de empresa...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Configuración del Sistema</h1>
        <p className="text-stone-600 mt-1">Administra usuarios, parámetros y configuración general</p>
      </div>
      <LivePreview companyInfo={companyInfo} />

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="parameters">Parámetros</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="audit">Auditoría</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        {/* Información de Empresa */}
<TabsContent value="company" className="space-y-6">
  <div className="flex items-center justify-between mb-4">
    <h1 className="text-3xl font-bold text-stone-800">Configuración del Sistema</h1>
    <Button variant="outline" onClick={() => setShowPreview(true)}>
      <Eye className="h-5 w-5 mr-2" />
      Mostrar Vista Previa
    </Button>
  </div>

  {showPreview && (
    <Dialog open={showPreview} onOpenChange={setShowPreview}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Vista Previa del Sistema</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4 mb-4">
          <Button
            variant={devicePreview === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDevicePreview('desktop')}
          >
            <Monitor className="h-4 w-4 mr-1" />
            Ver como PC
          </Button>
          <Button
            variant={devicePreview === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDevicePreview('mobile')}
          >
            <Smartphone className="h-4 w-4 mr-1" />
            Ver como Móvil
          </Button>
        </div>
       <LivePreview companyInfo={companyInfo} />
      </DialogContent>
    </Dialog>
  )}

  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Datos de la Empresa
        </CardTitle>
        <CardDescription>Información básica y fiscal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company-name">Nombre Comercial</Label>
            <Input 
              id="company-name"
              value={companyInfo.name || ""}
              onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="business-name">Razón Social</Label>
            <Input 
              id="business-name"
              value={companyInfo.businessName || ""}
              onChange={(e) => setCompanyInfo({ ...companyInfo, businessName: e.target.value })}
            />
          </div>
        </div>
        <div>
  <Label htmlFor="company-ruc">RUC/DNI</Label>
  <div className="flex gap-2">
    <Input
      id="company-ruc"
      value={companyInfo.ruc || ""}
      onChange={(e) => setCompanyInfo({ ...companyInfo, ruc: e.target.value })}
      placeholder="20123456789"
      disabled={loadingCompany}
    />
    <Button
      variant="outline"
      size="sm"
      onClick={consultarRucDni}
      disabled={loadingCompany}
    >
      <Search className="h-4 w-4" />
    </Button>
  </div>
  <p className="text-xs text-stone-500 mt-1">
    Consultará datos en SUNAT/RENIEC automáticamente
  </p>
</div>

        <div>
          <Label htmlFor="fiscal-address">Dirección Fiscal</Label>
          <Input 
            id="fiscal-address"
            value={companyInfo.fiscalAddress || ""}
            onChange={(e) => setCompanyInfo({ ...companyInfo, fiscalAddress: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company-phone">Teléfono Principal</Label>
            <Input 
              id="company-phone"
              value={companyInfo.phone || ""}
              onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="company-phone2">Teléfono Secundario</Label>
            <Input 
              id="company-phone2"
              value={companyInfo.phone2 || ""}
              onChange={(e) => setCompanyInfo({ ...companyInfo, phone2: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="company-email">Email Corporativo</Label>
          <Input 
            id="company-email"
            type="email"
            value={companyInfo.email || ""}
            onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="slogan">Slogan</Label>
          <Input 
            id="slogan"
            value={companyInfo.slogan || ""}
            onChange={(e) => setCompanyInfo({ ...companyInfo, slogan: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="welcome-message">Mensaje de Bienvenida</Label>
          <Input 
            id="welcome-message"
            value={companyInfo.welcomeMessage || ""}
            onChange={(e) => setCompanyInfo({ ...companyInfo, welcomeMessage: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="company-description">Descripción</Label>
          <Textarea 
            id="company-description"
            value={companyInfo.description || ""}
            onChange={(e) => setCompanyInfo({ ...companyInfo, description: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Redes Sociales
          </CardTitle>
          <CardDescription>Enlaces a perfiles sociales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="facebook" className="flex items-center gap-2">
              <Facebook className="h-4 w-4" />
              Facebook
            </Label>
            <Input 
              id="facebook"
              value={companyInfo.facebook || ""}
              onChange={(e) => setCompanyInfo({ ...companyInfo, facebook: e.target.value })}
              placeholder="https://facebook.com/tuempresa"
            />
          </div>
          <div>
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram
            </Label>
            <Input 
              id="instagram"
              value={companyInfo.instagram || ""}
              onChange={(e) => setCompanyInfo({ ...companyInfo, instagram: e.target.value })}
              placeholder="https://instagram.com/tuempresa"
            />
          </div>
          <div>
            <Label htmlFor="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Label>
            <Input 
              id="whatsapp"
              value={companyInfo.whatsapp || ""}
              onChange={(e) => setCompanyInfo({ ...companyInfo, whatsapp: e.target.value })}
              placeholder="+51999888777"
            />
          </div>
          <div>
            <Label htmlFor="tiktok" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              TikTok
            </Label>
            <Input 
              id="tiktok"
              value={companyInfo.tiktok || ""}
              onChange={(e) => setCompanyInfo({ ...companyInfo, tiktok: e.target.value })}
              placeholder="https://tiktok.com/@tuempresa"
            />
          </div>
          <div>
            <Label htmlFor="youtube" className="flex items-center gap-2">
              <Youtube className="h-4 w-4" />
              YouTube
            </Label>
            <Input 
              id="youtube"
              value={companyInfo.youtube || ""}
              onChange={(e) => setCompanyInfo({ ...companyInfo, youtube: e.target.value })}
              placeholder="https://youtube.com/tuempresa"
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Identidad Visual
          </CardTitle>
          <CardDescription>Logo y elementos visuales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="logo-upload">Logo Principal</Label>
            <Input id="logo-upload" type="file" accept="image/*" />
            <p className="text-xs text-muted-foreground mt-1">
              Recomendado: PNG con fondo transparente, 300x300px
            </p>
          </div>
          <div>
            <Label htmlFor="favicon-upload">Favicon</Label>
            <Input id="favicon-upload" type="file" accept="image/*" />
            <p className="text-xs text-muted-foreground mt-1">
              Recomendado: 32x32px, formato ICO/PNG
            </p>
          </div>
          <Button variant="outline" className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            Previsualizar Logo
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
  <div className="flex justify-end mt-6">
    <Button onClick={handleSaveCompany} className="px-8">
      Guardar Configuración de Empresa
    </Button>
  </div>
</TabsContent>


        {/* Gestión de Usuarios */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestión de Usuarios
                </span>
                <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSelectedUser(null)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Agregar Usuario
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedUser ? 'Modifica los datos del usuario' : 'Crea un nuevo usuario en el sistema'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="user-name">Nombre Completo</Label>
                        <Input id="user-name" defaultValue={selectedUser?.name || ''} />
                      </div>
                      <div>
                        <Label htmlFor="user-email">Email</Label>
                        <Input id="user-email" type="email" defaultValue={selectedUser?.email || ''} />
                      </div>
                      <div>
                        <Label htmlFor="user-profile">Perfil</Label>
                        <Select defaultValue={selectedUser?.profile || ''}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un perfil" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin General</SelectItem>
                            <SelectItem value="pedidos">Pedidos</SelectItem>
                            <SelectItem value="produccion">Producción</SelectItem>
                            <SelectItem value="reparto">Reparto</SelectItem>
                            <SelectItem value="cobranzas">Cobranzas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {!selectedUser && (
                        <div>
                          <Label htmlFor="user-password">Contraseña Temporal</Label>
                          <Input id="user-password" type="password" placeholder="Contraseña inicial" />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowUserModal(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={() => {
                        setShowUserModal(false);
                        toast({
                          title: selectedUser ? "Usuario actualizado" : "Usuario creado",
                          description: selectedUser ? "Los datos se han actualizado correctamente." : "El nuevo usuario ha sido creado exitosamente.",
                        });
                      }}>
                        {selectedUser ? 'Actualizar' : 'Crear Usuario'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>Administra usuarios y perfiles del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Buscador */}
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o perfil..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {/* Lista de Usuarios */}
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.name}</p>
                          <Badge variant={user.active ? 'default' : 'secondary'}>
                            {user.active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Creado: {new Date(user.createdAt).toLocaleDateString('es-PE')}
                        </p>
                      </div>
                      <Badge variant="outline" className={
                        user.profile === 'admin' ? 'border-purple-200 text-purple-700' :
                        user.profile === 'pedidos' ? 'border-blue-200 text-blue-700' :
                        user.profile === 'produccion' ? 'border-green-200 text-green-700' :
                        user.profile === 'reparto' ? 'border-orange-200 text-orange-700' :
                        'border-pink-200 text-pink-700'
                      }>
                        {user.profile.charAt(0).toUpperCase() + user.profile.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUserAction('toggle', user)}
                      >
                        {user.active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        {user.active ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUserAction('edit', user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUserAction('reset', user)}
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUserAction('delete', user)}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron usuarios con los criterios de búsqueda.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parámetros del Sistema */}
        <TabsContent value="parameters">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Parámetros Operativos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="delivery-time">Tiempo Máximo de Entrega (minutos)</Label>
                  <Input 
                    id="delivery-time"
                    type="number"
                    value={systemSettings.maxDeliveryTime}
                    onChange={(e) => setSystemSettings({...systemSettings, maxDeliveryTime: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="critical-stock">Stock Crítico (unidades)</Label>
                  <Input 
                    id="critical-stock"
                    type="number"
                    value={systemSettings.criticalStock}
                    onChange={(e) => setSystemSettings({...systemSettings, criticalStock: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="low-stock">Stock Bajo (unidades)</Label>
                  <Input 
                    id="low-stock"
                    type="number"
                    value={systemSettings.lowStock}
                    onChange={(e) => setSystemSettings({...systemSettings, lowStock: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="overdue-days">Días para Factura Vencida</Label>
                  <Input 
                    id="overdue-days"
                    type="number"
                    value={systemSettings.overduePaymentDays}
                    onChange={(e) => setSystemSettings({...systemSettings, overduePaymentDays: parseInt(e.target.value)})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configuración de Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones Automáticas</Label>
                    <p className="text-sm text-stone-500">Enviar alertas del sistema</p>
                  </div>
                  <Switch 
                    checked={systemSettings.autoNotifications}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, autoNotifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Integración WhatsApp</Label>
                    <p className="text-sm text-stone-500">Mensajes automáticos</p>
                  </div>
                  <Switch 
                    checked={systemSettings.whatsappIntegration}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, whatsappIntegration: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones Email</Label>
                    <p className="text-sm text-stone-500">Reportes y alertas por email</p>
                  </div>
                  <Switch 
                    checked={systemSettings.emailNotifications}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, emailNotifications: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6">
            <Button>Guardar Configuración</Button>
          </div>
        </TabsContent>

        {/* Sistema de Notificaciones */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Centro de Notificaciones
              </CardTitle>
              <CardDescription>Configura alertas y recordatorios automáticos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notifications).map(([module, settings]) => (
                <div key={module} className="border rounded-lg p-4">
                  <h4 className="font-medium text-lg mb-3 capitalize">
                    {module === 'orders' ? 'Pedidos' :
                     module === 'payments' ? 'Pagos' :
                     module === 'stock' ? 'Inventario' :
                     module === 'deliveries' ? 'Entregas' :
                     'General'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">Email</span>
                      </div>
                      <Switch 
                        checked={settings.email}
                        onCheckedChange={(checked) => setNotifications({
                          ...notifications,
                          [module]: { ...settings, email: checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">WhatsApp</span>
                      </div>
                      <Switch 
                        checked={settings.whatsapp}
                        onCheckedChange={(checked) => setNotifications({
                          ...notifications,
                          [module]: { ...settings, whatsapp: checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="text-sm">Sistema</span>
                      </div>
                      <Switch 
                        checked={settings.system}
                        onCheckedChange={(checked) => setNotifications({
                          ...notifications,
                          [module]: { ...settings, system: checked }
                        })}
                      />
                    </div>
                  </div>
                  
                  {/* Vista previa de notificación */}
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Vista previa:</p>
                    <div className="text-sm">
                      {module === 'orders' && "🔔 Nuevo pedido recibido: #PD-001 por S/. 150.00"}
                      {module === 'payments' && "💰 Pago registrado: #PAG-001 por S/. 150.00"}
                      {module === 'stock' && "📦 Stock bajo: Galletas de Chocolate (5 unidades)"}
                      {module === 'deliveries' && "🚚 Entrega completada: #ENT-001"}
                      {module === 'general' && "ℹ️ Notificación general del sistema"}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => {
              toast({
                title: "Notificaciones configuradas",
                description: "Las preferencias de notificaciones se han guardado correctamente.",
              });
            }}>
              Guardar Configuración de Notificaciones
            </Button>
          </div>
        </TabsContent>

        {/* Auditoría */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Auditoría del Sistema
                </span>
                <Button onClick={handleExportAudit} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Reporte
                </Button>
              </CardTitle>
              <CardDescription>Registro completo de actividades del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
                <div>
                  <Label htmlFor="filter-user">Usuario</Label>
                  <Input
                    id="filter-user"
                    placeholder="Filtrar por usuario..."
                    value={auditFilter.user}
                    onChange={(e) => setAuditFilter({...auditFilter, user: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="filter-module">Módulo</Label>
                  <Select value={auditFilter.module} onValueChange={(value) => setAuditFilter({...auditFilter, module: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los módulos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="clientes">Clientes</SelectItem>
                      <SelectItem value="pedidos">Pedidos</SelectItem>
                      <SelectItem value="produccion">Producción</SelectItem>
                      <SelectItem value="reparto">Reparto</SelectItem>
                      <SelectItem value="cobranzas">Cobranzas</SelectItem>
                      <SelectItem value="sistema">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filter-date-from">Desde</Label>
                  <Input
                    id="filter-date-from"
                    type="date"
                    value={auditFilter.dateFrom}
                    onChange={(e) => setAuditFilter({...auditFilter, dateFrom: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="filter-date-to">Hasta</Label>
                  <Input
                    id="filter-date-to"
                    type="date"
                    value={auditFilter.dateTo}
                    onChange={(e) => setAuditFilter({...auditFilter, dateTo: e.target.value})}
                  />
                </div>
              </div>



              {/* Tabla de Auditoría */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Acción</TableHead>
                      <TableHead>Módulo</TableHead>
                      <TableHead>Detalles</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(log.timestamp).toLocaleString('es-PE')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">
                                {log.user.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="text-sm font-medium">{log.user}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={
                            log.module === 'Clientes' ? 'bg-blue-100 text-blue-700' :
                            log.module === 'Pedidos' ? 'bg-green-100 text-green-700' :
                            log.module === 'Reparto' ? 'bg-orange-100 text-orange-700' :
                            log.module === 'Sistema' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {log.module}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm text-muted-foreground truncate">
                            {log.details}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Detalle de Auditoría</DialogTitle>
                                <DialogDescription>
                                  Información completa de la acción registrada
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Usuario</Label>
                                    <p className="text-sm font-medium">{log.user}</p>
                                  </div>
                                  <div>
                                    <Label>Fecha y Hora</Label>
                                    <p className="text-sm">{new Date(log.timestamp).toLocaleString('es-PE')}</p>
                                  </div>
                                  <div>
                                    <Label>Acción</Label>
                                    <p className="text-sm">{log.action}</p>
                                  </div>
                                  <div>
                                    <Label>Módulo</Label>
                                    <p className="text-sm">{log.module}</p>
                                  </div>
                                </div>
                                <div>
                                  <Label>Detalles Completos</Label>
                                  <p className="text-sm mt-1 p-3 bg-muted rounded">{log.details}</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredAuditLogs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron registros de auditoría con los filtros aplicados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Editor del Footer (Secciones & Enlaces)
      </CardTitle>
      <CardDescription>
        Administra el contenido y enlaces de tu footer. 
      </CardDescription>
    </CardHeader>
    <CardContent>
      {footerLoading && (
        <div className="text-center py-6 text-stone-400">Cargando footer...</div>
      )}
      {!footerLoading && (
        <div className="space-y-8">
          {footerSections.map((section, idx) => (
            <div key={idx} className="border p-4 rounded-lg bg-stone-50 mb-2">
              <div className="flex items-center gap-2 mb-3">
                <Input
                  placeholder="Título de la sección (ej: Contacto, Información...)"
                  value={section.title}
                  onChange={e => handleEditSectionTitle(idx, e.target.value)}
                  className="font-bold text-lg"
                />
                <Button variant="outline" size="icon" onClick={() => handleDeleteSection(idx)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleAddItem(idx)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                {section.items?.map((item:any, j:number) => (
                  <div key={j} className="flex items-end gap-2 bg-white p-2 rounded">
                    <Select
                      value={item.icon}
                      onValueChange={val => handleEditItem(idx, j, "icon", val)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Icono" />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map(ic => (
                          <SelectItem key={ic} value={ic}>
                            <span className="flex items-center gap-2">
                              {lucideIcons[ic] && React.createElement(lucideIcons[ic], { className: "w-4 h-4" })}
                              {ic}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Subtítulo/Texto"
                      value={item.label}
                      onChange={e => handleEditItem(idx, j, "label", e.target.value)}
                    />
                    <Select
                      value={item.type}
                      onValueChange={val => handleEditItem(idx, j, "type", val)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="link">Link</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Teléfono</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder={
                        item.type === "link"
                          ? "URL https://..."
                          : item.type === "email"
                          ? "correo@dominio.com"
                          : item.type === "phone"
                          ? "+51..."
                          : "Valor (opcional)"
                      }
                      value={item.value}
                      onChange={e => handleEditItem(idx, j, "value", e.target.value)}
                    />
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteItem(idx, j)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {(!section.items || section.items.length === 0) && (
                  <div className="text-stone-400 text-sm pl-1">No hay ítems en esta sección</div>
                )}
              </div>
            </div>
          ))}
          <Button variant="default" onClick={handleAddSection}>
            <Plus className="mr-2 w-4 h-4" />
            Agregar Sección
          </Button>
        </div>
      )}
    </CardContent>
    <CardFooter className="flex justify-end">
      <Button onClick={handleSaveFooter}>Guardar Footer</Button>
    </CardFooter>
  </Card>
</TabsContent>
      </Tabs>
    </div> 
  );
};