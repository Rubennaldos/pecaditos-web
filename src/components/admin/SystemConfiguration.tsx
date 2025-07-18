
import { useState } from 'react';
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

export const SystemConfiguration = () => {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Pecaditos Dulces',
    businessName: 'Pecaditos Dulces S.A.C.',
    ruc: '20123456789',
    fiscalAddress: 'Av. Principal 123, Lima, Perú',
    phone: '+51 999 888 777',
    phone2: '+51 999 888 778',
    email: 'info@pecaditosdulces.com',
    website: 'www.pecaditosdulces.com',
    description: 'Empresa especializada en galletas artesanales',
    slogan: 'Dulzura que conquista corazones',
    welcomeMessage: 'Bienvenidos a Pecaditos Dulces',
    facebook: 'https://facebook.com/pecaditosdulces',
    instagram: 'https://instagram.com/pecaditosdulces',
    whatsapp: '+51999888777',
    tiktok: 'https://tiktok.com/@pecaditosdulces',
    youtube: 'https://youtube.com/pecaditosdulces',
    businessHours: {
      monday: { open: '08:00', close: '18:00', active: true },
      tuesday: { open: '08:00', close: '18:00', active: true },
      wednesday: { open: '08:00', close: '18:00', active: true },
      thursday: { open: '08:00', close: '18:00', active: true },
      friday: { open: '08:00', close: '18:00', active: true },
      saturday: { open: '08:00', close: '14:00', active: true },
      sunday: { open: '09:00', close: '13:00', active: false }
    },
    logo: '',
    favicon: ''
  });

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

  const [users, setUsers] = useState([
    { id: 1, name: 'Admin General', email: 'admin@pecaditos.com', profile: 'admin', active: true, createdAt: '2024-01-15' },
    { id: 2, name: 'María García', email: 'pedidos@pecaditos.com', profile: 'pedidos', active: true, createdAt: '2024-02-20' },
    { id: 3, name: 'Carlos López', email: 'reparto@pecaditos.com', profile: 'reparto', active: true, createdAt: '2024-03-10' },
    { id: 4, name: 'Ana Rodríguez', email: 'cobranzas@pecaditos.com', profile: 'cobranzas', active: false, createdAt: '2024-04-05' },
    { id: 5, name: 'Jorge Silva', email: 'produccion@pecaditos.com', profile: 'produccion', active: true, createdAt: '2024-05-12' }
  ]);

  const [userSearch, setUserSearch] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [notifications, setNotifications] = useState({
    orders: { email: true, whatsapp: true, system: true },
    payments: { email: true, whatsapp: false, system: true },
    stock: { email: true, whatsapp: false, system: true },
    deliveries: { email: false, whatsapp: true, system: true },
    general: { email: true, whatsapp: false, system: true }
  });

  const [auditLogs] = useState([
    { id: 1, user: 'Admin General', action: 'Creó cliente', module: 'Clientes', timestamp: '2024-07-18 10:30:00', details: 'Cliente: Empresa ABC S.A.C.' },
    { id: 2, user: 'María García', action: 'Editó pedido', module: 'Pedidos', timestamp: '2024-07-18 09:15:22', details: 'Pedido #PD-001 - Cambió estado a En Preparación' },
    { id: 3, user: 'Carlos López', action: 'Completó entrega', module: 'Reparto', timestamp: '2024-07-18 08:45:10', details: 'Entrega #E-001 - Cliente satisfecho' },
    { id: 4, user: 'Admin General', action: 'Configuró usuario', module: 'Sistema', timestamp: '2024-07-17 16:20:33', details: 'Desactivó usuario Ana Rodríguez' },
    { id: 5, user: 'Jorge Silva', action: 'Actualizó stock', module: 'Producción', timestamp: '2024-07-17 14:10:15', details: 'Producto: Galletas de Chocolate - Stock: 150 unidades' }
  ]);

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

  const handleSaveCompany = () => {
    toast({
      title: "Configuración guardada",
      description: "Los datos de la empresa se han actualizado correctamente.",
    });
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Configuración del Sistema</h1>
        <p className="text-stone-600 mt-1">Administra usuarios, parámetros y configuración general</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="parameters">Parámetros</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="audit">Auditoría</TabsTrigger>
        </TabsList>

        {/* Información de Empresa */}
        <TabsContent value="company" className="space-y-6">
          {/* Vista Previa del Dispositivo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Vista Previa del Sistema
                </span>
                <div className="flex gap-2">
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
              </CardTitle>
              <CardDescription>
                Previsualiza cómo se verá el sistema completo con la información de tu empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`border-2 rounded-lg overflow-hidden bg-white shadow-lg ${
                devicePreview === 'mobile' ? 'max-w-sm mx-auto' : 'w-full max-w-4xl mx-auto'
              } transition-all duration-300`}>
                {/* Header simulado */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {companyInfo.logo ? (
                        <img src={companyInfo.logo} alt="Logo" className="w-10 h-10 rounded-full bg-white p-1" />
                      ) : (
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {companyInfo.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg">{companyInfo.name}</h3>
                        {devicePreview === 'desktop' && (
                          <p className="text-amber-100 text-sm">{companyInfo.slogan}</p>
                        )}
                      </div>
                    </div>
                    {devicePreview === 'desktop' && (
                      <div className="flex gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {companyInfo.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {companyInfo.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Contenido simulado */}
                <div className="p-6 space-y-4">
                  <div className="text-center">
                    <h4 className="text-xl font-semibold text-stone-800 mb-2">
                      {companyInfo.welcomeMessage}
                    </h4>
                    <p className="text-stone-600">{companyInfo.description}</p>
                  </div>
                  
                  {devicePreview === 'desktop' ? (
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2"></div>
                        <p className="font-medium">Pedidos</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2"></div>
                        <p className="font-medium">Producción</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="w-12 h-12 bg-purple-500 rounded-full mx-auto mb-2"></div>
                        <p className="font-medium">Reparto</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">Pedidos</span>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Producción</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Footer simulado */}
                <div className="bg-stone-100 p-4 text-center text-sm text-stone-600">
                  <p>{companyInfo.fiscalAddress}</p>
                  {devicePreview === 'desktop' && companyInfo.businessName && (
                    <p className="mt-1">{companyInfo.businessName} - RUC: {companyInfo.ruc}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Información General */}
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
                      value={companyInfo.name}
                      onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="business-name">Razón Social</Label>
                    <Input 
                      id="business-name"
                      value={companyInfo.businessName}
                      onChange={(e) => setCompanyInfo({...companyInfo, businessName: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company-ruc">RUC</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="company-ruc"
                      value={companyInfo.ruc}
                      onChange={(e) => setCompanyInfo({...companyInfo, ruc: e.target.value})}
                      placeholder="20123456789"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (companyInfo.ruc) {
                          toast({
                            title: "Consultando SUNAT",
                            description: "Obteniendo datos de la empresa...",
                          });
                          // Aquí iría la integración con API SUNAT/RENIEC
                          setTimeout(() => {
                            toast({
                              title: "Datos obtenidos",
                              description: "Información actualizada desde SUNAT.",
                            });
                          }, 2000);
                        }
                      }}
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
                    value={companyInfo.fiscalAddress}
                    onChange={(e) => setCompanyInfo({...companyInfo, fiscalAddress: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-phone">Teléfono Principal</Label>
                    <Input 
                      id="company-phone"
                      value={companyInfo.phone}
                      onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-phone2">Teléfono Secundario</Label>
                    <Input 
                      id="company-phone2"
                      value={companyInfo.phone2}
                      onChange={(e) => setCompanyInfo({...companyInfo, phone2: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company-email">Email Corporativo</Label>
                  <Input 
                    id="company-email"
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="slogan">Slogan</Label>
                  <Input 
                    id="slogan"
                    value={companyInfo.slogan}
                    onChange={(e) => setCompanyInfo({...companyInfo, slogan: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="welcome-message">Mensaje de Bienvenida</Label>
                  <Input 
                    id="welcome-message"
                    value={companyInfo.welcomeMessage}
                    onChange={(e) => setCompanyInfo({...companyInfo, welcomeMessage: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="company-description">Descripción</Label>
                  <Textarea 
                    id="company-description"
                    value={companyInfo.description}
                    onChange={(e) => setCompanyInfo({...companyInfo, description: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Redes Sociales y Branding */}
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
                      value={companyInfo.facebook}
                      onChange={(e) => setCompanyInfo({...companyInfo, facebook: e.target.value})}
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
                      value={companyInfo.instagram}
                      onChange={(e) => setCompanyInfo({...companyInfo, instagram: e.target.value})}
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
                      value={companyInfo.whatsapp}
                      onChange={(e) => setCompanyInfo({...companyInfo, whatsapp: e.target.value})}
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
                      value={companyInfo.tiktok}
                      onChange={(e) => setCompanyInfo({...companyInfo, tiktok: e.target.value})}
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
                      value={companyInfo.youtube}
                      onChange={(e) => setCompanyInfo({...companyInfo, youtube: e.target.value})}
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

          {/* Horarios de Atención */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horarios de Atención
              </CardTitle>
              <CardDescription>Configura los horarios de atención por día</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {daysOfWeek.map(day => (
                  <div key={day.key} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-24">
                      <Label className="font-medium">{day.label}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={companyInfo.businessHours[day.key].active}
                        onCheckedChange={(checked) => setCompanyInfo({
                          ...companyInfo,
                          businessHours: {
                            ...companyInfo.businessHours,
                            [day.key]: { ...companyInfo.businessHours[day.key], active: checked }
                          }
                        })}
                      />
                      {companyInfo.businessHours[day.key].active && (
                        <>
                          <Input 
                            type="time"
                            value={companyInfo.businessHours[day.key].open}
                            onChange={(e) => setCompanyInfo({
                              ...companyInfo,
                              businessHours: {
                                ...companyInfo.businessHours,
                                [day.key]: { ...companyInfo.businessHours[day.key], open: e.target.value }
                              }
                            })}
                            className="w-32"
                          />
                          <span className="text-muted-foreground">a</span>
                          <Input 
                            type="time"
                            value={companyInfo.businessHours[day.key].close}
                            onChange={(e) => setCompanyInfo({
                              ...companyInfo,
                              businessHours: {
                                ...companyInfo.businessHours,
                                [day.key]: { ...companyInfo.businessHours[day.key], close: e.target.value }
                              }
                            })}
                            className="w-32"
                          />
                        </>
                      )}
                      {!companyInfo.businessHours[day.key].active && (
                        <span className="text-muted-foreground text-sm">Cerrado</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
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
      </Tabs>
    </div>
  );
};
