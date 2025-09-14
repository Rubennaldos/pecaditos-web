// src/components/billing/BillingToBePaidAdmin.tsx
import { useMemo, useState } from 'react';

// UI
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

// Icons
import {
  Phone,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Download,
  Calendar,
  Clock,
  DollarSign,
  CreditCard,
  FileText,
  Search,
  Bell,
  Copy,
  X,
} from 'lucide-react';

// Hooks/contexts
import { useAdminBilling } from '../../contexts/AdminBillingContext';
import { useToast } from '../../hooks/use-toast';
import {
  useBilling,
  type Invoice as HookInvoice,
  type Client as HookClient,
} from '../../hooks/useBilling';

type SortKey = 'amount_desc' | 'amount_asc' | 'overdue_desc' | 'overdue_asc';

type UIInvoice = {
  id: string;
  orderNumber?: string;
  amount: number;
  issueDate?: string | number;
  dueDate?: string | number;
  status: 'pending' | 'overdue' | 'paid' | 'rejected';
  daysOverdue: number;
  paymentMethod?: string;
};

type UIClient = {
  clientId: string;
  client: string;
  comercialName?: string;
  ruc?: string;
  phone?: string;
  totalDebt: number;
  overdueDays: number;
  invoices: UIInvoice[];
};

const toDate = (v?: string | number) => {
  if (v === undefined || v === null || v === '') return undefined;
  const d = typeof v === 'number' ? new Date(v) : new Date(String(v));
  return Number.isNaN(d.getTime()) ? undefined : d;
};

const todayYMD = () => new Date().toISOString().slice(0, 10);

export const BillingToBePaidAdmin = () => {
  const { sendReminder } = useAdminBilling();
  const { toast } = useToast();
  const { invoices: rawInvoices, clients: rawClients } = useBilling();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('amount_desc');

  // Modals
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<UIInvoice | null>(null);

  // Forms
  const [collectData, setCollectData] = useState({
    amount: '',
    date: todayYMD(),
    operationNumber: '',
    bank: '',
    responsible: '',
  });

  const [commitmentData, setCommitmentData] = useState({
    date: '',
    observation: '',
    sendWhatsApp: false,
  });

  const [creditNoteData, setCreditNoteData] = useState({
    number: '',
    reason: '',
    date: todayYMD(),
    amount: '',
    authCode: '',
  });

  // ---------- Transformación ----------
  const clientsData: UIClient[] = useMemo(() => {
    const byClient: Record<string, UIClient> = {};
    const now = Date.now();

    const getClient = (id: string): HookClient | undefined => rawClients[id];

    (rawInvoices as HookInvoice[]).forEach((inv) => {
      if (!inv) return;
      if (inv.status !== 'pending' && inv.status !== 'overdue') return;

      const c = getClient(inv.clientId);
      if (!byClient[inv.clientId]) {
        byClient[inv.clientId] = {
          clientId: inv.clientId,
          client: c?.nombre ?? c?.comercial ?? inv.clientId,
          comercialName: c?.comercial,
          ruc: c?.ruc,
          phone: c?.telefono ?? c?.whatsapp,
          totalDebt: 0,
          overdueDays: 0,
          invoices: [],
        };
      }

      const due = toDate(inv.dueDate);
      const daysOver =
        due && due.getTime() < now ? Math.ceil((now - due.getTime()) / 86400000) : 0;

      const uiInv: UIInvoice = {
        id: inv.id,
        // ⬇️ FIX: aquí debe ir el CÓDIGO VISIBLE de la orden, no el ID
        orderNumber: inv.orderNumber, // <- antes estaba inv.orderId
        amount: Number(inv.amount || 0),
        issueDate: inv.createdAt,
        dueDate: inv.dueDate,
        status: inv.status,
        daysOverdue: daysOver,
        paymentMethod: undefined,
      };

      byClient[inv.clientId].invoices.push(uiInv);
      byClient[inv.clientId].totalDebt += uiInv.amount;
      byClient[inv.clientId].overdueDays = Math.max(byClient[inv.clientId].overdueDays, daysOver);
    });

    Object.values(byClient).forEach((c) =>
      c.invoices.sort(
        (a, b) => (toDate(a.dueDate)?.getTime() || 0) - (toDate(b.dueDate)?.getTime() || 0),
      ),
    );

    return Object.values(byClient);
  }, [rawInvoices, rawClients]);

  // ---------- Helpers / Actions ----------
  const findClientByInvoice = (invoice: UIInvoice) =>
    clientsData.find((c) => c.invoices.some((inv) => inv.id === invoice.id));

  const handleCollect = (invoice: UIInvoice) => {
    setSelectedInvoice(invoice);
    setCollectData((prev) => ({
      ...prev,
      amount: invoice.amount.toString(),
      date: todayYMD(),
    }));
    setShowCollectModal(true);
  };

  const handleCommitment = (invoice: UIInvoice) => {
    setSelectedInvoice(invoice);
    setCommitmentData({ date: '', observation: '', sendWhatsApp: false });
    setShowCommitmentModal(true);
  };

  const handleCreditNote = (invoice: UIInvoice) => {
    setSelectedInvoice(invoice);
    setCreditNoteData({
      number: '',
      reason: '',
      date: todayYMD(),
      amount: invoice.amount.toString(),
      authCode: '',
    });
    setShowCreditNoteModal(true);
  };

  const handleWhatsApp = (invoice: UIInvoice) => {
    const client = findClientByInvoice(invoice);
    if (!client || !client.phone) return;
    const message = `Hola ${client.comercialName ?? client.client}, le recordamos que tiene una factura pendiente (${invoice.id}) por S/ ${invoice.amount.toFixed(
      2,
    )} con vencimiento el ${
      toDate(invoice.dueDate)?.toLocaleDateString('es-PE') ?? '-'
    }. Gracias.`;
    const num = client.phone.replace(/\D/g, '');
    if (!num) return;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleWarning = (invoice: UIInvoice) => {
    setSelectedInvoice(invoice);
    setShowWarningDialog(true);
  };

  const handleDownloadPDF = (invoice: UIInvoice) => {
    toast({ title: 'Descarga iniciada', description: `Descargando PDF de ${invoice.id}` });
  };

  const handleCall = (phone?: string) => {
    if (!phone) return;
    const num = phone.replace(/\D/g, '');
    if (!num) return;
    window.open(`tel:${num}`, '_self');
  };

  // ---------- Confirmaciones ----------
  const confirmCollect = () => {
    if (!collectData.amount || !collectData.date || !collectData.responsible) {
      toast({
        title: 'Error',
        description: 'Complete los campos obligatorios',
        variant: 'destructive',
      });
      return;
    }
    // TODO: persistir en DB (marcar invoice paid + movimiento)
    toast({ title: 'Pago registrado', description: `Pago de S/ ${collectData.amount}` });
    setShowCollectModal(false);
    setSelectedInvoice(null);
    setCollectData({ amount: '', date: todayYMD(), operationNumber: '', bank: '', responsible: '' });
  };

  const confirmCommitment = () => {
    if (!commitmentData.date) {
      toast({
        title: 'Error',
        description: 'Seleccione la fecha de compromiso',
        variant: 'destructive',
      });
      return;
    }
    // TODO: persistir en DB
    if (commitmentData.sendWhatsApp && selectedInvoice) handleWhatsApp(selectedInvoice);
    toast({
      title: 'Compromiso registrado',
      description: `Para el ${toDate(commitmentData.date)?.toLocaleDateString('es-PE') ?? '-'}`,
    });
    setShowCommitmentModal(false);
    setSelectedInvoice(null);
    setCommitmentData({ date: '', observation: '', sendWhatsApp: false });
  };

  const getWarningMessage = (invoice: UIInvoice) => {
    const c = findClientByInvoice(invoice);
    if (!c) return '';
    return `Estimado cliente ${c.client}, tiene una factura pendiente (${invoice.id}) por S/ ${invoice.amount.toFixed(
      2,
    )} con vencimiento el ${
      toDate(invoice.dueDate)?.toLocaleDateString('es-PE') ?? '-'
    }. Por favor, regularice su pago.`;
  };

  const copyWarningMessage = () => {
    if (!selectedInvoice) return;
    navigator.clipboard.writeText(getWarningMessage(selectedInvoice));
    toast({ title: 'Mensaje copiado', description: 'Se copió al portapapeles' });
  };

  const confirmWarning = () => {
    if (!selectedInvoice) return;
    const c = findClientByInvoice(selectedInvoice);
    if (!c) return;

    sendReminder({
      clientId: c.clientId,
      message: getWarningMessage(selectedInvoice),
    });

    toast({ title: 'Advertencia enviada', description: c.comercialName ?? c.client });
    setShowWarningDialog(false);
    setSelectedInvoice(null);
  };

  // ---------- Filtros & orden ----------
  const filteredClients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return clientsData;
    return clientsData.filter(
      (client) =>
        (client.ruc ?? '').toLowerCase().includes(term) ||
        client.client.toLowerCase().includes(term) ||
        (client.comercialName ?? '').toLowerCase().includes(term),
    );
  }, [clientsData, searchTerm]);

  const sortedClients = useMemo(() => {
    const arr = [...filteredClients];
    switch (sortBy) {
      case 'amount_desc':
        arr.sort((a, b) => b.totalDebt - a.totalDebt);
        break;
      case 'amount_asc':
        arr.sort((a, b) => a.totalDebt - b.totalDebt);
        break;
      case 'overdue_desc':
        arr.sort((a, b) => b.overdueDays - a.overdueDays);
        break;
      case 'overdue_asc':
        arr.sort((a, b) => a.overdueDays - b.overdueDays);
        break;
    }
    return arr;
  }, [filteredClients, sortBy]);

  // ---------- UI ----------
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">
          Cuentas por Cobrar - Vista por Cliente
        </h2>
        <p className="text-stone-600">Gestión completa de facturas pendientes agrupadas por cliente</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Clientes con deuda vencida</p>
                <p className="text-2xl font-bold text-red-700">
                  {sortedClients.filter((c) => c.overdueDays > 0).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Total Adeudado</p>
                <p className="text-2xl font-bold text-orange-700">
                  S/ {sortedClients.reduce((sum, c) => sum + c.totalDebt, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Facturas pendientes</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {sortedClients.reduce((sum, c) => sum + c.invoices.length, 0)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Mayor deudor</p>
                <p className="text-lg font-bold text-blue-700">
                  S/ {Math.max(0, ...sortedClients.map((c) => c.totalDebt)).toFixed(2)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Buscar cliente, RUC, razón social..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amount_desc">Mayor deuda</SelectItem>
                <SelectItem value="amount_asc">Menor deuda</SelectItem>
                <SelectItem value="overdue_desc">Más días vencidos</SelectItem>
                <SelectItem value="overdue_asc">Menos días vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients */}
      <div className="space-y-4">
        {sortedClients.map((client) => (
          <Card
            key={client.clientId}
            className={`hover:shadow-lg transition-all ${
              client.overdueDays > 0 ? 'border-red-300 bg-red-50' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {client.client}
                    <Badge
                      className={
                        client.overdueDays > 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {client.overdueDays > 0 ? `${client.overdueDays} días vencido` : 'Al día'}
                    </Badge>
                  </CardTitle>
                  <div className="mt-1 space-y-1">
                    <p className="text-stone-600 text-sm">Comercial: {client.comercialName ?? '-'}</p>
                    <p className="text-stone-500 text-xs">RUC: {client.ruc ?? '-'}</p>
                    <p className="text-stone-500 text-xs">Teléfono: {client.phone ?? '-'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-red-600">S/ {client.totalDebt.toFixed(2)}</div>
                  <div className="text-sm text-stone-500">
                    {client.invoices.length} facturas pendientes
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {client.invoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-stone-800">{invoice.id}</p>
                        {invoice.orderNumber && (
                          <p className="text-sm text-stone-600">Orden: {invoice.orderNumber}</p>
                        )}
                        <p className="text-xs text-stone-500">
                          Vence:{' '}
                          {toDate(invoice.dueDate)?.toLocaleDateString('es-PE') ?? '—'}{' '}
                          ({invoice.daysOverdue} días vencida)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-stone-800">S/ {invoice.amount.toFixed(2)}</p>
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          {invoice.paymentMethod ?? 'crédito'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        onClick={() => handleCollect(invoice)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Cobrar
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleCommitment(invoice)}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Compromiso
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleCreditNote(invoice)}
                        variant="outline"
                        className="text-purple-600 border-purple-300 hover:bg-purple-50"
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        N. Crédito
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleWarning(invoice)}
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Bell className="h-4 w-4 mr-1" />
                        Advertir
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleDownloadPDF(invoice)}
                        variant="outline"
                        className="text-stone-600 border-stone-300 hover:bg-stone-50"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleCall(client.phone)}
                        variant="outline"
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        disabled={!client.phone}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Llamar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Warning Message Dialog */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Mensaje de Advertencia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedInvoice && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Mensaje que se enviará:</p>
                  <p className="text-sm text-gray-700">{getWarningMessage(selectedInvoice)}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyWarningMessage} variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Mensaje
                  </Button>
                  <Button
                    onClick={confirmWarning}
                    className="bg-red-600 hover:bg-red-700 text-white flex-1"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Enviar WhatsApp
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowWarningDialog(false)}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Collect Payment Modal */}
      <Dialog open={showCollectModal} onOpenChange={setShowCollectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Monto *</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={collectData.amount}
                  onChange={(e) => setCollectData({ ...collectData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Fecha *</label>
                <Input
                  type="date"
                  value={collectData.date}
                  onChange={(e) => setCollectData({ ...collectData, date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Número de Operación</label>
              <Input
                type="text"
                value={collectData.operationNumber}
                onChange={(e) =>
                  setCollectData({ ...collectData, operationNumber: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Banco</label>
              <Input
                type="text"
                value={collectData.bank}
                onChange={(e) => setCollectData({ ...collectData, bank: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Responsable *</label>
              <Input
                type="text"
                value={collectData.responsible}
                onChange={(e) => setCollectData({ ...collectData, responsible: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={confirmCollect}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Registrar Pago
              </Button>
              <Button variant="outline" onClick={() => setShowCollectModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Commitment Modal */}
      <Dialog open={showCommitmentModal} onOpenChange={setShowCommitmentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compromiso de Pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">Fecha de Compromiso *</label>
              <Input
                type="date"
                value={commitmentData.date}
                onChange={(e) => setCommitmentData({ ...commitmentData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Observaciones</label>
              <Textarea
                placeholder="Ingrese observaciones adicionales"
                value={commitmentData.observation}
                onChange={(e) =>
                  setCommitmentData({ ...commitmentData, observation: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendWhatsApp"
                checked={commitmentData.sendWhatsApp}
                onChange={(e) =>
                  setCommitmentData({ ...commitmentData, sendWhatsApp: e.target.checked })
                }
                className="rounded"
              />
              <label htmlFor="sendWhatsApp" className="text-sm font-medium text-stone-700">
                Enviar recordatorio por WhatsApp
              </label>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={confirmCommitment}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Registrar Compromiso
              </Button>
              <Button variant="outline" onClick={() => setShowCommitmentModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credit Note Modal */}
      <Dialog open={showCreditNoteModal} onOpenChange={setShowCreditNoteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar Nota de Crédito</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Número *</label>
                <Input
                  type="text"
                  value={creditNoteData.number}
                  onChange={(e) =>
                    setCreditNoteData({ ...creditNoteData, number: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Fecha *</label>
                <Input
                  type="date"
                  value={creditNoteData.date}
                  onChange={(e) =>
                    setCreditNoteData({ ...creditNoteData, date: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Motivo *</label>
              <Input
                type="text"
                value={creditNoteData.reason}
                onChange={(e) =>
                  setCreditNoteData({ ...creditNoteData, reason: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Monto *</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={creditNoteData.amount}
                  onChange={(e) =>
                    setCreditNoteData({ ...creditNoteData, amount: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Código de Autorización
                </label>
                <Input
                  type="text"
                  value={creditNoteData.authCode}
                  onChange={(e) =>
                    setCreditNoteData({ ...creditNoteData, authCode: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Generar Nota de Crédito
              </Button>
              <Button variant="outline" onClick={() => setShowCreditNoteModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
