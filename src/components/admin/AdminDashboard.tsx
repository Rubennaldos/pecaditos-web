
import { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  Users, 
  Truck, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  Settings,
  Shield,
  Building
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdmin } from '@/contexts/AdminContext';
import { GlobalDashboard } from './GlobalDashboard';
import { SystemConfiguration } from './SystemConfiguration';

export const AdminDashboard = () => {
  const { user } = useAdmin();
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="global-dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="global-dashboard">Dashboard Global</TabsTrigger>
          <TabsTrigger value="system-config">Configuración</TabsTrigger>
          <TabsTrigger value="promotions">Promociones</TabsTrigger>
          <TabsTrigger value="locations">Ubicaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="global-dashboard">
          <GlobalDashboard />
        </TabsContent>

        <TabsContent value="system-config">
          <SystemConfiguration />
        </TabsContent>

        <TabsContent value="promotions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Gestión de Promociones
              </CardTitle>
              <CardDescription>Administra campañas y promociones mayoristas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-stone-600">Módulo de promociones - Por implementar</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Campañas Activas</h3>
                      <p className="text-sm text-stone-500">0 campañas en curso</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Promociones Programadas</h3>
                      <p className="text-sm text-stone-500">0 promociones pendientes</p>
                    </CardContent>
                  </Card>
                </div>
                <Button>Crear Nueva Campaña</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Gestión de Ubicaciones
              </CardTitle>
              <CardDescription>Administra puntos de venta y sedes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-stone-600">Módulo de ubicaciones - Por implementar</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Sede Principal</h3>
                      <p className="text-sm text-stone-500">Av. Principal 123, Lima</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Puntos de Venta</h3>
                      <p className="text-sm text-stone-500">3 ubicaciones activas</p>
                    </CardContent>
                  </Card>
                </div>
                <Button>Agregar Ubicación</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
