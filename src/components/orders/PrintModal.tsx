
import { useState } from 'react';
import { Printer, Eye, X } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PrintModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onPrint: (order: any, format: string, editedData: any) => void;
}

const PrintModal = ({ order, isOpen, onClose, onPrint }: PrintModalProps) => {
  const [format, setFormat] = useState<'A4' | 'A5' | 'ticket'>('A4');
  const [showPreview, setShowPreview] = useState(false);
  const [editedData, setEditedData] = useState({
    businessName: 'Pecaditos Integrales SAC',
    branch: 'Sede Central',
    contactPhone: '+51 999 888 777',
    customerName: order?.customerName || '',
    customerPhone: order?.customerPhone || '',
    customerAddress: order?.customerAddress || '',
    paymentMethod: order?.paymentMethod || '',
    orderType: order?.orderType || '',
    notes: order?.notes || '',
    deliveryCost: '0.00'
  });

  const generateTrackingURL = () => {
    const baseURL = window.location.origin;
    return `${baseURL}/seguimiento/${order?.id}`;
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    onPrint(order, format, editedData);
    onClose();
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'contado': return 'Contado';
      case 'credito_15': return 'Crédito 15 días';
      case 'credito_30': return 'Crédito 30 días';
      default: return method;
    }
  };

  const getOrderTypeText = (type: string) => {
    switch (type) {
      case 'normal': return 'Pedido Normal';
      case 'reposicion': return 'Reposición';
      case 'degustacion': return 'Degustación';
      case 'cambio': return 'Cambio';
      default: return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Configurar Impresión - {order?.id}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Configuración de formato */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Formato de Impresión</Label>
              <Select value={format} onValueChange={(value: 'A4' | 'A5' | 'ticket') => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4 (21x29.7 cm)</SelectItem>
                  <SelectItem value="A5">A5 (14.8x21 cm)</SelectItem>
                  <SelectItem value="ticket">Ticket 80mm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Datos del negocio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datos del Negocio</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre Comercial</Label>
                <Input
                  value={editedData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Sede</Label>
                <Input
                  value={editedData.branch}
                  onChange={(e) => handleInputChange('branch', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono de Contacto</Label>
                <Input
                  value={editedData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Costo de Envío (S/)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editedData.deliveryCost}
                  onChange={(e) => handleInputChange('deliveryCost', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Datos del cliente y pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datos del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Input
                  value={editedData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono Cliente</Label>
                <Input
                  value={editedData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Dirección</Label>
                <Input
                  value={editedData.customerAddress}
                  onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Método de Pago</Label>
                <Select value={editedData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contado">Contado</SelectItem>
                    <SelectItem value="credito_15">Crédito 15 días</SelectItem>
                    <SelectItem value="credito_30">Crédito 30 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Pedido</Label>
                <Select value={editedData.orderType} onValueChange={(value) => handleInputChange('orderType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Pedido Normal</SelectItem>
                    <SelectItem value="reposicion">Reposición</SelectItem>
                    <SelectItem value="degustacion">Degustación</SelectItem>
                    <SelectItem value="cambio">Cambio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Observaciones</Label>
                <Textarea
                  value={editedData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview del documento */}
          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Vista Previa - {format.toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`border-2 border-dashed border-sand-300 p-4 ${
                  format === 'A4' ? 'aspect-[21/29.7]' : 
                  format === 'A5' ? 'aspect-[14.8/21]' : 'w-80 mx-auto'
                } bg-white text-black text-sm`}>
                  <div className="space-y-4">
                    <div className="text-center border-b pb-2">
                      <h2 className="font-bold text-lg">{editedData.businessName}</h2>
                      <p>{editedData.branch}</p>
                      <p>{editedData.contactPhone}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><strong>Pedido:</strong> {order?.id}</div>
                      <div><strong>Fecha:</strong> {new Date().toLocaleDateString()}</div>
                      <div><strong>Cliente:</strong> {editedData.customerName}</div>
                      <div><strong>Teléfono:</strong> {editedData.customerPhone}</div>
                    </div>
                    
                    <div className="text-xs">
                      <strong>Dirección:</strong> {editedData.customerAddress}
                    </div>
                    
                    <div className="border-y py-2">
                      <h3 className="font-semibold mb-2">Productos:</h3>
                      {order?.items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span>{item.product} x{item.quantity}</span>
                          <span>S/ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs">Subtotal: S/ {order?.total?.toFixed(2)}</div>
                      <div className="text-xs">Envío: S/ {editedData.deliveryCost}</div>
                      <div className="font-bold">Total: S/ {(parseFloat(order?.total || 0) + parseFloat(editedData.deliveryCost)).toFixed(2)}</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        <div><strong>Pago:</strong> {getPaymentMethodText(editedData.paymentMethod)}</div>
                        <div><strong>Tipo:</strong> {getOrderTypeText(editedData.orderType)}</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="bg-white p-2 rounded">
                          <QRCode
                            value={generateTrackingURL()}
                            size={format === 'ticket' ? 64 : 80}
                            level="M"
                          />
                        </div>
                        <span className="text-xs mt-1">Seguimiento</span>
                      </div>
                    </div>
                    
                    {editedData.notes && (
                      <div className="text-xs border-t pt-2">
                        <strong>Observaciones:</strong> {editedData.notes}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Ocultar' : 'Ver'} Preview
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir {format.toUpperCase()}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrintModal;
