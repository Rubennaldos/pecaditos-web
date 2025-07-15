
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
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const SystemConfiguration = () => {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Pecaditos Dulces',
    ruc: '20123456789',
    address: 'Av. Principal 123, Lima, Perú',
    phone: '+51 999 888 777',
    email: 'info@pecaditosdulces.com',
    website: 'www.pecaditosdulces.com',
    description: 'Empresa especializada en galletas artesanales',
    logo: '',
    favicon: ''
  });

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
    { id: 1, name: 'Admin General', email: 'admin@pecaditos.com', profile: 'admin', active: true },
    { id: 2, name: 'María García', email: 'pedidos@pecaditos.com', profile: 'pedidos', active: true },
    { id: 3, name: 'Carlos López', email: 'reparto@pecaditos.com', profile: 'reparto', active: true }
  ]);

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
        <TabsContent value="company">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Información General
                </CardTitle>
                <CardDescription>Datos básicos de la empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-name">Nombre de Empresa</Label>
                    <Input 
                      id="company-name"
                      value={companyInfo.name}
                      onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-ruc">RUC</Label>
                    <Input 
                      id="company-ruc"
                      value={companyInfo.ruc}
                      onChange={(e) => setCompanyInfo({...companyInfo, ruc: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company-address">Dirección</Label>
                  <Input 
                    id="company-address"
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-phone">Teléfono</Label>
                    <Input 
                      id="company-phone"
                      value={companyInfo.phone}
                      onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-email">Email</Label>
                    <Input 
                      id="company-email"
                      value={companyInfo.email}
                      onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company-description">Descripción</Label>
                  <Textarea 
                    id="company-description"
                    value={companyInfo.description}
                    onChange={(e) => setCompanyInfo({...companyInfo, description: e.target.value})}
                  />
                </div>
                <Button>Guardar Cambios</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Identidad Visual
                </CardTitle>
                <CardDescription>Logo, colores y branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="logo-upload">Logo Principal</Label>
                  <Input id="logo-upload" type="file" accept="image/*" />
                  <p className="text-xs text-stone-500 mt-1">Recomendado: 200x80px, PNG/JPG</p>
                </div>
                <div>
                  <Label htmlFor="favicon-upload">Favicon</Label>
                  <Input id="favicon-upload" type="file" accept="image/*" />
                  <p className="text-xs text-stone-500 mt-1">Recomendado: 32x32px, ICO/PNG</p>
                </div>
                <div>
                  <Label>Vista Previa Actual</Label>
                  <div className="p-4 border rounded-lg bg-stone-50">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">P</span>
                    </div>
                  </div>
                </div>
                <Button>Actualizar Identidad</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gestión de Usuarios */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestión de Usuarios
              </CardTitle>
              <CardDescription>Administra usuarios y perfiles del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Usuarios Activos</h3>
                  <Button>Agregar Usuario</Button>
                </div>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-stone-600">
                            {user.name.split(' ')[0][0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-stone-500">{user.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.profile === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.profile === 'pedidos' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {user.profile.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={user.active} />
                        <Button variant="outline" size="sm">Editar</Button>
                        <Button variant="outline" size="sm">Resetear Clave</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Centro de Notificaciones
              </CardTitle>
              <CardDescription>Configura alertas y recordatorios automáticos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-stone-600">Funcionalidad de notificaciones - Por implementar</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auditoría */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Auditoría del Sistema
              </CardTitle>
              <CardDescription>Registro completo de actividades</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-stone-600">Sistema de auditoría - Por implementar</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
