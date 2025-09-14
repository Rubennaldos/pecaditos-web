// src/components/billing/BillingClients.tsx
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Star,
  Phone,
  MessageSquare,
  Edit,
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock,
  Gift,
  Search,
  Smile,
  Frown,
  Meh,
  Bell,
} from 'lucide-react';
import { useAdminBilling } from '@/contexts/AdminBillingContext';

// ---- FIREBASE (usa el db ya inicializado) ----
import { db } from '@/config/firebase'; // ⚠️ si no usas alias @, cambia a: '../config/firebase'
import { onValue, ref, update } from 'firebase/database';

// Tipado base del cliente (campos opcionales para tolerar esquemas distintos)
type Client = {
  id: string;
  name?: string;            // razón social
  comercialName?: string;   // nombre comercial
  ruc?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;

  rating?: number;          // 0..5
  paymentTerms?: string;    // 'contado' | 'credito_15'...
  creditLimit?: number;
  currentDebt?: number;
  lastPayment?: number | string; // timestamp o ISO
  avgPaymentDays?: number;
  paymentHistory?: Array<{ date?: string; status?: string; days?: number }>;

  promotionEligible?: boolean;
  status?: string; // redundante si calculas desde rating
};

export const BillingClients = () => {
  const { isAdminMode, sendWarningMessage } = useAdminBilling();
  const [filterStatus, setFilterStatus] = useState<'todos' | 'excelente' | 'puntual' | 'regular' | 'moroso'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showMorosityWarning, setShowMorosityWarning] = useState(false);

  // ---- Datos desde Firebase - Integrado con usuarios del sistema ----
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    // Leer desde usuarios del sistema en lugar de clientes
    const usersRef = ref(db, 'users');
    const configRef = ref(db, 'configuration/system');
    
    const unsubUsers = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val() || {};
      
      // Filtrar solo usuarios que sean clientes (no admin/staff)
      const clientUsers = Object.entries<any>(usersData)
        .filter(([_, user]) => user?.role === 'client' || user?.userType === 'client')
        .map(([id, user]) => ({
          id,
          name: user?.razonSocial || user?.name || user?.companyName || '',
          comercialName: user?.comercial || user?.comercialName || user?.businessName || '',
          ruc: user?.ruc || user?.taxId || '',
          phone: user?.telefono || user?.phone || user?.mobile || '',
          whatsapp: user?.whatsapp || user?.phone || '',
          email: user?.email || '',
          rating: Number(user?.creditRating || user?.rating || 3),
          paymentTerms: user?.paymentTerms || user?.creditTerms || 'contado',
          creditLimit: Number(user?.creditLimit || 0),
          currentDebt: Number(user?.currentDebt || 0),
          lastPayment: user?.lastPayment || null,
          avgPaymentDays: Number(user?.avgPaymentDays || 0),
          paymentHistory: Array.isArray(user?.paymentHistory) ? user.paymentHistory : [],
          promotionEligible: Boolean(user?.promotionEligible || user?.creditRating >= 4),
          status: user?.status || 'active',
          // Datos adicionales del sistema de configuración
          sede: user?.sede || user?.location || '',
          district: user?.district || '',
          province: user?.province || '',
          department: user?.department || ''
        }));
      
      setClients(clientUsers);
    });

    return () => {
      try { unsubUsers(); } catch {}
    };
  }, []);

  // Helpers de UI
  const getStatusInfo = (rating = 0) => {
    if (rating >= 4.5) return { color: 'bg-green-100 text-green-800', text: 'Excelente', icon: CheckCircle };
    if (rating >= 3.5) return { color: 'bg-blue-100 text-blue-800', text: 'Puntual', icon: Clock };
    if (rating >= 2)   return { color: 'bg-yellow-100 text-yellow-800', text: 'Regular', icon: Meh };
    return { color: 'bg-red-100 text-red-800', text: 'Moroso', icon: AlertTriangle };
  };

  const renderCreditStars = (rating = 0) => (
    <div className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.round(rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  const renderPaymentFace = (rating = 0) => {
    if (rating >= 4) return <Smile className="h-6 w-6 text-green-500" />;
    if (rating >= 2.5) return <Meh className="h-6 w-6 text-yellow-500" />;
    return <Frown className="h-6 w-6 text-red-500" />;
  };

  const renderPaymentHistory = (history: Client['paymentHistory'] = []) => (
    <div className="flex gap-1">
      {history.slice(0, 10).map((p, idx) => {
        let color = 'bg-gray-300';
        if (p?.status === 'on_time' || p?.status === 'early') color = 'bg-green-500';
        else if (p?.status === 'late') color = 'bg-yellow-500';
        else if (p?.status === 'very_late') color = 'bg-red-500';
        return (
          <div
            key={idx}
            className={`w-2 h-6 rounded-sm ${color}`}
            title={`${p?.date ?? ''} - ${p?.status ?? ''} ${p?.days ? `(${p.days} días)` : ''}`}
          />
        );
      })}
    </div>
  );

  const getPromotionPercentage = (rating = 0) => {
    if (rating >= 5) return 5;
    if (rating >= 4) return 3;
    if (rating >= 3) return 1;
    return 0;
  };

  const sendPromotion = (client: Client) => {
    const discount = getPromotionPercentage(client.rating);
    alert(`Enviando promoción de ${discount}% a ${client.name || client.comercialName || client.ruc}`);
    // Implementa WhatsApp/SMS/email real aquí
  };

  const sendMorosityWarning = (client: Client) => {
    const message = `AVISO IMPORTANTE: ${client.name ?? client.comercialName ?? client.ruc}, su cuenta presenta morosidad. Se aplicará sobrecargo administrativo del 10% por retraso en pagos. Regularice su situación a la brevedad para evitar restricciones. Pecaditos del Mar.`;
    try {
      // Si tu provider expone sendWarningMessage, úsalo, si no, cae en alert
      if (typeof sendWarningMessage === 'function') {
        sendWarningMessage(client.ruc ?? client.id, message);
      } else {
        alert(message);
      }
    } finally {
      setShowMorosityWarning(false);
      setSelectedClient(null);
    }
  };

  // Guardar edición
  const handleSaveEdit = async (updatedFields: Partial<Client>) => {
    if (!selectedClient?.id) return;
    try {
      await update(ref(db, `clients/${selectedClient.id}`), updatedFields);
      setShowEditModal(false);
      setSelectedClient(null);
    } catch {
      alert('Error actualizando cliente');
    }
  };

  // Filtro
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const rating = Number(client.rating ?? 0);
      let realStatus: 'excelente' | 'puntual' | 'regular' | 'moroso';
      if (rating >= 4.5) realStatus = 'excelente';
      else if (rating >= 3.5) realStatus = 'puntual';
      else if (rating >= 2) realStatus = 'regular';
      else realStatus = 'moroso';

      const okStatus = filterStatus === 'todos' || realStatus === filterStatus;
      const term = searchTerm.trim().toLowerCase();
      const okSearch =
        !term ||
        (client.name ?? '').toLowerCase().includes(term) ||
        (client.comercialName ?? '').toLowerCase().includes(term) ||
        (client.ruc ?? '').includes(term);

      return okStatus && okSearch;
    });
  }, [clients, filterStatus, searchTerm]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Gestión de Clientes</h2>
        <p className="text-stone-600">
          Estado financiero, comportamiento de pago y sistema de promociones
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="RUC, razón social, nombre comercial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="excelente">Excelente (5★)</SelectItem>
                <SelectItem value="puntual">Puntual (4★)</SelectItem>
                <SelectItem value="regular">Regular (3★)</SelectItem>
                <SelectItem value="moroso">Moroso (≤2★)</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-stone-600 flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              Sistema automático de promociones
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <div className="space-y-4">
        {filteredClients.map((client) => {
          const rating = Number(client.rating ?? 0);
          const statusInfo = getStatusInfo(rating);
          const StatusIcon = statusInfo.icon;
          const promotionDiscount = getPromotionPercentage(rating);

          return (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center">
                      {renderPaymentFace(rating)}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {client.name || client.comercialName || client.ruc}
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.text}
                        </Badge>
                        {client.promotionEligible && promotionDiscount > 0 && (
                          <Badge className="bg-green-100 text-green-800">
                            <Gift className="h-3 w-3 mr-1" />
                            {promotionDiscount}% Dcto
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-stone-600 text-sm">
                        Comercial: {client.comercialName || '-'}
                      </p>
                      <p className="text-stone-500 text-xs">RUC: {client.ruc || '-'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-2">
                      {renderCreditStars(rating)}
                      <span className="text-sm text-stone-600 ml-2">({rating.toFixed(1)}/5.0)</span>
                    </div>
                    <div className="text-sm text-stone-500">
                      Último pago:{' '}
                      {client.lastPayment
                        ? new Date(client.lastPayment).toLocaleDateString()
                        : '-'}
                    </div>
                    <div className="text-xs text-stone-400">
                      Promedio: {client.avgPaymentDays ?? 0} días
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  {/* Contacto */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-stone-400" />
                      <span>{client.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-stone-400" />
                      <span className="truncate">{client.email || '-'}</span>
                    </div>
                  </div>

                  {/* Financiero */}
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Límite:</span>{' '}
                      S/ {(client.creditLimit ?? 0).toFixed(2)}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Deuda:</span>
                      <span
                        className={
                          (client.currentDebt ?? 0) > 0
                            ? 'text-red-600 font-bold ml-1'
                            : 'text-green-600 ml-1'
                        }
                      >
                        S/ {(client.currentDebt ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Términos:</span>{' '}
                      {client.paymentTerms || '-'}
                    </div>
                  </div>

                  {/* Comportamiento */}
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Comportamiento:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderPaymentHistory(client.paymentHistory)}
                      <span className="text-xs text-stone-500">Últimos 10</span>
                    </div>
                    <div className="text-xs text-stone-500">
                      Verde: Puntual | Amarillo: Tardío | Rojo: Muy tardío
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-300 hover:bg-blue-50 flex-1"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        {client.phone || 'Llamar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-300 hover:bg-green-50 flex-1"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>

                    {client.promotionEligible && promotionDiscount > 0 && (
                      <Button
                        size="sm"
                        onClick={() => sendPromotion(client)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Gift className="h-4 w-4 mr-2" />
                        Enviar Promoción {promotionDiscount}%
                      </Button>
                    )}

                    {/* Advertencia por morosidad */}
                    {rating <= 2 && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedClient(client);
                          setShowMorosityWarning(true);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Advertencia por Morosidad
                      </Button>
                    )}

                    {rating === 0 && (
                      <div className="w-full bg-red-50 border border-red-200 rounded p-2 text-center">
                        <p className="text-xs text-red-800 font-medium">
                          ⚠️ CRÉDITO DESACTIVADO - Solo Admin General puede reactivar
                        </p>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedClient(client);
                        setShowEditModal(true);
                      }}
                      className="text-stone-600 border-stone-300 hover:bg-stone-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Condiciones
                    </Button>
                  </div>
                </div>

                {/* Info de promociones */}
                {promotionDiscount === 0 && rating < 3 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <AlertTriangle className="h-4 w-4 inline mr-2" />
                      Cliente sin promociones. Puede aplicar recargo administrativo por morosidad.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal Editar */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Editar Condiciones del Cliente</CardTitle>
              <p className="text-stone-600">{selectedClient.name || selectedClient.comercialName}</p>
              <div className="flex items-center gap-2">
                {renderCreditStars(selectedClient.rating)}
                <span className="text-sm">({(selectedClient.rating ?? 0).toFixed(1)}/5.0)</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Términos de Pago</label>
                  <Select
                    defaultValue={selectedClient.paymentTerms ?? 'contado'}
                    onValueChange={(value) =>
                      setSelectedClient({ ...selectedClient, paymentTerms: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contado">Contado</SelectItem>
                      <SelectItem value="credito_15">Crédito 15 días</SelectItem>
                      <SelectItem value="credito_30">Crédito 30 días</SelectItem>
                      <SelectItem value="credito_45">Crédito 45 días</SelectItem>
                      <SelectItem value="credito_60">Crédito 60 días</SelectItem>
                      <SelectItem value="contra_entrega">Pago contra entrega</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Límite de Crédito</label>
                  <Input
                    type="number"
                    value={selectedClient.creditLimit ?? 0}
                    onChange={(e) =>
                      setSelectedClient({
                        ...selectedClient,
                        creditLimit: Number(e.target.value || 0),
                      })
                    }
                    placeholder="S/ 0.00"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 mb-2">
                  <Star className="h-4 w-4 inline mr-2" />
                  Sistema Automático de Promociones:
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• 5 estrellas = 5% descuento automático</li>
                  <li>• 4 estrellas = 3% descuento automático</li>
                  <li>• 3 estrellas = 1% descuento automático</li>
                  <li>• Menos de 3 estrellas = Sin promociones</li>
                  <li>• 0–1 estrella = Posible recargo administrativo</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  onClick={() =>
                    handleSaveEdit({
                      paymentTerms: selectedClient.paymentTerms,
                      creditLimit: selectedClient.creditLimit ?? 0,
                    })
                  }
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Advertencia por Morosidad */}
      {showMorosityWarning && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-red-800">Confirmar Advertencia por Morosidad</CardTitle>
              <p className="text-stone-600">
                {selectedClient.name || selectedClient.comercialName || selectedClient.ruc}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <Bell className="h-4 w-4 inline mr-2" />
                  Se enviará una advertencia formal por morosidad con notificación de sobrecargo
                  administrativo del 10%.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Mensaje a enviar:</strong>
                  <br />
                  "AVISO IMPORTANTE: {selectedClient.name || selectedClient.comercialName || selectedClient.ruc}, su
                  cuenta presenta morosidad. Se aplicará sobrecargo administrativo del 10% por retraso en pagos.
                  Regularice su situación a la brevedad para evitar restricciones. Pecaditos del Mar."
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => sendMorosityWarning(selectedClient)}
                  className="bg-red-600 hover:bg-red-700 text-white flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Confirmar Envío
                </Button>
                <Button variant="outline" onClick={() => setShowMorosityWarning(false)}>
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
