// src/components/admin/SystemConfiguration.tsx
import React, { useEffect, useState } from 'react';
import LivePreview from '../LivePreview';

import { ref, onValue, update } from 'firebase/database';
import { db } from '../../config/firebase';

import { LandingConfig } from './LandingConfig';
import UsersAdmin from './UsersAdmin';
import FooterEditor from './FooterEditor';

import { Settings, Database, Eye, Calendar } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

type AuditLog = {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string | number;
  details: string;
};

export const SystemConfiguration = () => {
  const [companyInfo, setCompanyInfo] = useState<any>({});
  const [loadingCompany, setLoadingCompany] = useState(true);

  // Cargar /empresa (para la previsualización)
  useEffect(() => {
    const refEmpresa = ref(db, 'empresa');
    const unsub = onValue(refEmpresa, (snap) => {
      setCompanyInfo(snap.val() || {});
      setLoadingCompany(false);
    });
    return () => unsub();
  }, []);

  // Parámetros (solo UI)
  const [systemSettings, setSystemSettings] = useState({
    maxDeliveryTime: 120,
    criticalStock: 5,
    lowStock: 40,
    overduePaymentDays: 15,
    autoNotifications: true,
    whatsappIntegration: false,
    emailNotifications: true,
  });

  // Auditoría
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditFilter, setAuditFilter] = useState({ user: '', module: 'all', dateFrom: '', dateTo: '' });

  useEffect(() => {
    const auditRef = ref(db, 'auditLogs');
    const off = onValue(auditRef, (snapshot) => {
      const data = snapshot.val();
      const logs = data
        ? Object.entries(data).map(([id, value]: [string, any]) => ({ id, ...(value as AuditLog) }))
        : [];
      setAuditLogs(logs);
    });
    return () => off();
  }, []);

  const filteredAuditLogs = auditLogs.filter((log) => {
    return (
      (!auditFilter.user || String(log.user || '').toLowerCase().includes(auditFilter.user.toLowerCase())) &&
      (!auditFilter.module ||
        auditFilter.module === 'all' ||
        String(log.module || '').toLowerCase().includes(auditFilter.module.toLowerCase()))
    );
  });

  const handleSaveCompany = async () => {
    try {
      await update(ref(db, 'empresa'), companyInfo);
      toast({ title: 'Configuración guardada', description: 'Los datos se han actualizado.' });
    } catch {
      toast({ title: 'Error al guardar', description: 'Intenta nuevamente.', variant: 'destructive' });
    }
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

      {/* Mini preview */}
      <LivePreview companyInfo={companyInfo} />

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="parameters">Parámetros</TabsTrigger>
          <TabsTrigger value="audit">Auditoría</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="landing">Inicio</TabsTrigger>
        </TabsList>

        {/* USUARIOS */}
        <TabsContent value="users" className="space-y-6">
          <UsersAdmin />
        </TabsContent>

        {/* PARÁMETROS */}
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
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        maxDeliveryTime: parseInt(e.target.value || '0', 10),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="critical-stock">Stock Crítico (unidades)</Label>
                  <Input
                    id="critical-stock"
                    type="number"
                    value={systemSettings.criticalStock}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        criticalStock: parseInt(e.target.value || '0', 10),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="low-stock">Stock Bajo (unidades)</Label>
                  <Input
                    id="low-stock"
                    type="number"
                    value={systemSettings.lowStock}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        lowStock: parseInt(e.target.value || '0', 10),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="overdue-days">Días para Factura Vencida</Label>
                  <Input
                    id="overdue-days"
                    type="number"
                    value={systemSettings.overduePaymentDays}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        overduePaymentDays: parseInt(e.target.value || '0', 10),
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Seguridad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones Automáticas</Label>
                    <p className="text-sm text-stone-500">Enviar alertas del sistema</p>
                  </div>
                  <Switch
                    checked={systemSettings.autoNotifications}
                    onCheckedChange={(checked) =>
                      setSystemSettings({ ...systemSettings, autoNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Integración WhatsApp</Label>
                    <p className="text-sm text-stone-500">Mensajes automáticos</p>
                  </div>
                  <Switch
                    checked={systemSettings.whatsappIntegration}
                    onCheckedChange={(checked) =>
                      setSystemSettings({ ...systemSettings, whatsappIntegration: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones Email</Label>
                    <p className="text-sm text-stone-500">Reportes y alertas por email</p>
                  </div>
                  <Switch
                    checked={systemSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSystemSettings({ ...systemSettings, emailNotifications: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6">
            <Button onClick={handleSaveCompany}>Guardar Configuración</Button>
          </div>
        </TabsContent>

        {/* AUDITORÍA */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Auditoría del Sistema
                </span>
              </CardTitle>
              <CardDescription>Registro completo de actividades del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
                <div>
                  <Label htmlFor="filter-user">Usuario</Label>
                  <Input
                    id="filter-user"
                    placeholder="Filtrar por usuario..."
                    value={auditFilter.user}
                    onChange={(e) => setAuditFilter({ ...auditFilter, user: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="filter-module">Módulo</Label>
                  <Select
                    value={auditFilter.module}
                    onValueChange={(value) => setAuditFilter({ ...auditFilter, module: value })}
                  >
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
                    onChange={(e) => setAuditFilter({ ...auditFilter, dateFrom: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="filter-date-to">Hasta</Label>
                  <Input
                    id="filter-date-to"
                    type="date"
                    value={auditFilter.dateTo}
                    onChange={(e) => setAuditFilter({ ...auditFilter, dateTo: e.target.value })}
                  />
                </div>
              </div>

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
                      <TableRow key={String(log.id)}>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(Number(log.timestamp)).toLocaleString('es-PE')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{String(log.user || '')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {String(log.action || '')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{String(log.module || '')}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm text-muted-foreground truncate">
                            {String(log.details || '')}
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
                              <div className="space-y-2 text-sm">
                                <div>
                                  <b>Usuario:</b> {String(log.user || '')}
                                </div>
                                <div>
                                  <b>Acción:</b> {String(log.action || '')}
                                </div>
                                <div>
                                  <b>Módulo:</b> {String(log.module || '')}
                                </div>
                                <div>
                                  <b>Fecha:</b>{' '}
                                  {new Date(Number(log.timestamp)).toLocaleString('es-PE')}
                                </div>
                                <div>
                                  <b>Detalles:</b> {String(log.details || '')}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* FOOTER */}
        <TabsContent value="footer" className="space-y-6">
          <FooterEditor />
        </TabsContent>

        {/* INICIO (Landing) */}
        <TabsContent value="landing">
          <LandingConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemConfiguration;
