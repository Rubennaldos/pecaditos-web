import { useState } from 'react';
import { Sparkles, X, Upload, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/config/firebase';
import { ref, update, push, runTransaction } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

interface AIImportOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Local helpers (duplicated subtly from OrdersPanel for isolation)
const pad3 = (n: number) => String(n).padStart(3, '0');
const ensureOrderNumber = async (orderId: string) => {
  const seqRef = ref(db, 'meta/orderSeq');
  const res = await runTransaction(seqRef, (curr) => (typeof curr !== 'number' ? 1 : curr + 1));
  const seq = res.snapshot?.val() ?? 1;
  const orderNumber = `ORD-${pad3(seq)}`;
  await update(ref(db, `orders/${orderId}`), { orderNumber });
  return orderNumber;
};

export const AIImportOrderModal = ({ isOpen, onClose }: AIImportOrderModalProps) => {
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<null | { orderNumber: string; total: number; customerName: string }>(null);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleProcess = async () => {
    if (!jsonText.trim()) {
      toast({ title: 'Sin contenido', description: 'Pega el JSON antes de procesar.' });
      return;
    }
    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      toast({ title: 'JSON inválido', description: 'Revisa el formato del JSON.' });
      return;
    }
    setLoading(true);
    try {
      const newKey = push(ref(db, 'orders')).key;
      if (!newKey) throw new Error('No se pudo generar ID');
      const orderData: any = {
        ...parsed,
        id: newKey,
        status: 'pendiente',
        createdAt: new Date().toISOString(),
      };
      await update(ref(db, `orders/${newKey}`), orderData);
      const orderNumber = await ensureOrderNumber(newKey);
      const computedTotal = typeof orderData.total === 'number'
        ? orderData.total
        : Array.isArray(orderData.items)
          ? orderData.items.reduce((sum: number, it: any) => sum + (Number(it.quantity || 0) * Number(it.price || 0)), 0)
          : 0;
      setSuccessData({
        orderNumber,
        total: computedTotal,
        customerName: orderData.customerName || orderData.client?.commercialName || orderData.client?.name || 'Cliente'
      });
    } catch (err: any) {
      toast({ title: 'Error al importar', description: err?.message || 'Intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAndClose = () => {
    if (!successData) return;
    const msg = `¡Listo ${successData.customerName}! Tu pedido #${successData.orderNumber} por S/ ${successData.total.toFixed(2)} ha sido registrado y ya está en estado Pendiente. Te avisaremos cuando salga a reparto.`;
    try {
      navigator.clipboard.writeText(msg);
      toast({ title: 'Mensaje copiado', description: 'Se copió el mensaje al portapapeles.' });
    } catch {
      toast({ title: 'No se pudo copiar', description: 'Copia manualmente el texto.' });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        {!successData && (
          <>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Sparkles className="h-5 w-5" /> Importar Pedido IA
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  rows={14}
                  placeholder="Pega aquí el JSON generado por Gemini"
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleProcess} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                  <Upload className="h-4 w-4 mr-2" />
                  {loading ? 'Procesando...' : 'Procesar e Ingresar'}
                </Button>
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Cancelar
                </Button>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                El JSON debería representar un único pedido. Se forzará el estado inicial a <strong>pendiente</strong> y se
                asignará correlativo automáticamente.
              </p>
            </CardContent>
          </>
        )}
        {successData && (
          <>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-6 w-6 text-green-600" /> Pedido {successData.orderNumber} creado correctamente
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center py-2">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <Textarea
                readOnly
                rows={6}
                value={`¡Listo ${successData.customerName}! Tu pedido #${successData.orderNumber} por S/ ${successData.total.toFixed(2)} ha sido registrado y ya está en estado Pendiente. Te avisaremos cuando salga a reparto.`}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={handleCopyAndClose} className="bg-green-600 hover:bg-green-700">
                  Copiar y Cerrar
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cerrar sin Copiar
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default AIImportOrderModal;