// src/components/orders/OrderConfirmationModal.tsx
import { useState } from 'react';
import { X, Download, Copy, Check, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  orderData: {
    clientName: string;
    ruc?: string;
    legalName?: string;
    address?: string;
    phone?: string;
    items: Array<{
      productName: string;
      quantity: number;
      price: number;
      unit: string;
    }>;
    total: number;
    createdAt: string;
  };
};

export const OrderConfirmationModal = ({ isOpen, onClose, orderNumber, orderData }: Props) => {
  const [copied, setCopied] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const whatsappMessage = `¡Pedido Registrado Exitosamente! 🎉

Estimado(a) ${orderData.clientName},

Muchas gracias por confiar en nosotros. Tu pedido ha sido registrado correctamente.

Tu número de orden es: ${orderNumber}

Resumen del pedido:
${orderData.items.map((item, idx) => `${idx + 1}. ${item.productName} - ${item.quantity} ${item.unit} × S/ ${item.price.toFixed(2)}`).join('\n')}

Total: S/ ${orderData.total.toFixed(2)}

¡Gracias por tu preferencia!
PECADITOS INTEGRALES S.A.C.`;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    toast({
      title: 'Copiado',
      description: 'Número de orden copiado al portapapeles',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedMessage(true);
    toast({
      title: '¡Mensaje copiado!',
      description: 'El mensaje completo ha sido copiado al portapapeles',
    });
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = 20;

    // Encabezado de la empresa
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PECADITOS INTEGRALES S.A.C.', margin, yPos);
    
    yPos += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('RUC: 20550404517', margin, yPos);
    
    yPos += 5;
    const addressText = 'AV. ALAMEDA DEL CORREGIDOR NRO. M-2 LT.32B, LIMA - LIMA';
    const addressLines = doc.splitTextToSize(addressText, pageWidth - margin * 2);
    doc.text(addressLines, margin, yPos);
    yPos += 5 * addressLines.length;
    
    doc.text('Email: pecaditosintegrales@hotmail.com', margin, yPos);

    // Línea separadora
    yPos += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // Título del documento
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('ORDEN DE PEDIDO', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 7;
    doc.setFontSize(12);
    doc.text(orderNumber, pageWidth / 2, yPos, { align: 'center' });

    // Información del pedido
    yPos += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('FECHA DE EMISIÓN:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    const dateStr = new Date(orderData.createdAt).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    doc.text(dateStr, margin + 50, yPos);

    // Información del cliente
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE:', margin, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    if (orderData.legalName) {
      doc.text(orderData.legalName, margin, yPos);
      yPos += 5;
    }
    
    if (orderData.ruc) {
      doc.setFont('helvetica', 'bold');
      doc.text('RUC:', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(orderData.ruc, margin + 15, yPos);
      yPos += 5;
    }

    if (orderData.address) {
      doc.setFont('helvetica', 'bold');
      doc.text('DIRECCIÓN:', margin, yPos);
      doc.setFont('helvetica', 'normal');
      const addressLines = doc.splitTextToSize(orderData.address, pageWidth - margin * 2 - 30);
      doc.text(addressLines, margin + 30, yPos);
      yPos += 5 * addressLines.length;
    }

    if (orderData.phone) {
      doc.setFont('helvetica', 'bold');
      doc.text('TELÉFONO:', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(orderData.phone, margin + 30, yPos);
      yPos += 5;
    }

    // Tabla de productos
    yPos += 10;
    
    // Verificar si necesitamos una nueva página
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFillColor(37, 99, 235);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, yPos - 5, pageWidth - margin * 2, 8, 'F');
    
    doc.text('CANT.', margin + 2, yPos);
    doc.text('UNIDAD', margin + 20, yPos);
    doc.text('DESCRIPCIÓN', margin + 45, yPos);
    doc.text('P.UNIT', pageWidth - margin - 35, yPos);
    doc.text('TOTAL', pageWidth - margin - 10, yPos, { align: 'right' });

    yPos += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    // Items
    orderData.items.forEach((item) => {
      // Verificar si necesitamos una nueva página
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      const total = item.quantity * item.price;
      
      doc.text(String(item.quantity), margin + 2, yPos);
      doc.text(item.unit.toUpperCase(), margin + 20, yPos);
      
      const descLines = doc.splitTextToSize(item.productName, 90);
      doc.text(descLines, margin + 45, yPos);
      
      doc.text(item.price.toFixed(2), pageWidth - margin - 35, yPos);
      doc.text(total.toFixed(2), pageWidth - margin - 10, yPos, { align: 'right' });
      
      yPos += 5 * Math.max(1, descLines.length);
    });

    // Línea separadora antes de totales
    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // Totales
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // Verificar espacio para totales
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }

    doc.text('SUBTOTAL:', pageWidth - margin - 50, yPos);
    doc.text(`S/ ${orderData.total.toFixed(2)}`, pageWidth - margin - 10, yPos, { align: 'right' });

    yPos += 8;
    doc.setFontSize(12);
    doc.text('TOTAL:', pageWidth - margin - 50, yPos);
    doc.setTextColor(37, 99, 235);
    doc.text(`S/ ${orderData.total.toFixed(2)}`, pageWidth - margin - 10, yPos, { align: 'right' });

    // Nota al pie
    yPos += 15;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    const note = 'Gracias por su preferencia. Para cualquier consulta contactar a pecaditosintegrales@hotmail.com';
    const noteLines = doc.splitTextToSize(note, pageWidth - margin * 2);
    doc.text(noteLines, pageWidth / 2, yPos, { align: 'center' });

    // Guardar PDF
    doc.save(`Pedido-${orderNumber}.pdf`);
    
    toast({
      title: 'PDF Descargado',
      description: 'El pedido ha sido descargado exitosamente',
    });
  };

  const handlePrint = () => {
    generatePDF();
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <div className="text-center py-8">
          {/* Icono de éxito */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>

          {/* Mensaje principal */}
          <h2 className="text-3xl font-bold text-stone-800 mb-3">
            ¡Pedido Registrado Exitosamente! 🎉
          </h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-4">
            <p className="text-lg text-stone-700 mb-2">
              Estimado(a) <span className="font-semibold">{orderData.clientName}</span>,
            </p>
            <p className="text-stone-600 mb-4">
              Muchas gracias por confiar en nosotros. Tu pedido ha sido registrado correctamente.
            </p>
            
            <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
              <p className="text-sm text-stone-500 mb-2">Tu número de orden es:</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-bold text-blue-600">{orderNumber}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyOrderNumber}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Botón para copiar mensaje completo */}
            <Button
              onClick={handleCopyMessage}
              variant="outline"
              className="w-full border-blue-300 hover:bg-blue-50 text-blue-700"
            >
              {copiedMessage ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-green-600">Mensaje copiado para WhatsApp</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar mensaje completo para WhatsApp
                </>
              )}
            </Button>
          </div>

          {/* Resumen del pedido */}
          <div className="bg-stone-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-bold text-stone-800 mb-3">Resumen del Pedido</h3>
            <div className="space-y-2 mb-3">
              {orderData.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.productName}</span>
                  <span className="font-medium">
                    {item.quantity} {item.unit} × S/ {item.price.toFixed(2)}
                  </span>
                </div>
              ))}
              {orderData.items.length > 3 && (
                <p className="text-xs text-stone-500">
                  y {orderData.items.length - 3} producto(s) más...
                </p>
              )}
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-blue-600">S/ {orderData.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={generatePDF}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-blue-300 hover:bg-blue-50"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>

          <p className="text-xs text-stone-500 mt-6">
            Recibirás una confirmación por correo electrónico con los detalles de tu pedido
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
