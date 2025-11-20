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

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    toast({
      title: 'Copiado',
      description: 'Número de orden copiado al portapapeles',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
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
    doc.text('AV. ALAMEDA DEL CORREGIDOR NRO. M-2 LT.32B, LIMA - LIMA', margin, yPos);
    
    yPos += 5;
    doc.text('Email: pecaditosintegrales@hotmail.com', margin, yPos);

    // Línea separadora
    yPos += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // Título del documento
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // azul
    doc.text('FACTURA ELECTRÓNICA', pageWidth / 2, yPos, { align: 'center' });
    
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
    doc.text(new Date(orderData.createdAt).toLocaleDateString('es-PE'), margin + 50, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('FECHA DE VENCIMIENTO:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(orderData.createdAt).toLocaleDateString('es-PE'), margin + 50, yPos);

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

    // Tabla de productos
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(37, 99, 235);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, yPos - 5, pageWidth - margin * 2, 8, 'F');
    
    doc.text('CANT.', margin + 2, yPos);
    doc.text('UNIDAD', margin + 20, yPos);
    doc.text('DESCRIPCIÓN', margin + 45, yPos);
    doc.text('P.UNIT', pageWidth - margin - 40, yPos);
    doc.text('DTO.', pageWidth - margin - 25, yPos);
    doc.text('TOTAL', pageWidth - margin - 10, yPos, { align: 'right' });

    yPos += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    // Items
    orderData.items.forEach((item) => {
      const total = item.quantity * item.price;
      
      doc.text(String(item.quantity), margin + 2, yPos);
      doc.text(item.unit.toUpperCase(), margin + 20, yPos);
      
      const descLines = doc.splitTextToSize(item.productName, 80);
      doc.text(descLines, margin + 45, yPos);
      
      doc.text(item.price.toFixed(2), pageWidth - margin - 40, yPos);
      doc.text('0', pageWidth - margin - 25, yPos);
      doc.text(total.toFixed(2), pageWidth - margin - 10, yPos, { align: 'right' });
      
      yPos += 6 * descLines.length;
    });

    // Línea separadora antes de totales
    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // Totales
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('OP. GRAVADAS: S/', pageWidth - margin - 50, yPos);
    doc.text(orderData.total.toFixed(2), pageWidth - margin - 10, yPos, { align: 'right' });

    yPos += 6;
    doc.text('IGV: S/', pageWidth - margin - 50, yPos);
    doc.text('0.00', pageWidth - margin - 10, yPos, { align: 'right' });

    yPos += 6;
    doc.setFontSize(12);
    doc.text('TOTAL A PAGAR: S/', pageWidth - margin - 50, yPos);
    doc.text(orderData.total.toFixed(2), pageWidth - margin - 10, yPos, { align: 'right' });

    // Nota al pie
    yPos += 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    const note = 'Para consultar el Comprobante ingresar a https://pecaditos.sv4.insap.pe/buscar';
    doc.text(note, pageWidth / 2, yPos, { align: 'center' });

    // Información adicional
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Información adicional', margin, yPos);
    
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('PD-2542', margin, yPos);

    // Bancos
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('BANCO DE CREDITO DEL PERU (BCP) ', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text('Soles Nº: 191-18409948-0-05', margin + 70, yPos);

    yPos += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('BANCO INTERAMERICANO DE FINANZAS (BANBIF) ', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text('Soles Nº: 002-191-11840994800556', margin + 70, yPos);

    // Guardar PDF
    doc.save(`Pedido-${orderNumber}.pdf`);
    
    toast({
      title: 'PDF Descargado',
      description: 'El pedido ha sido descargado exitosamente',
    });
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
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-lg text-stone-700 mb-4">
              Estimado(a) <span className="font-semibold">{orderData.clientName}</span>,
            </p>
            <p className="text-stone-600 mb-4">
              Muchas gracias por confiar en nosotros. Tu pedido ha sido registrado correctamente.
            </p>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
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
              onClick={() => {
                generatePDF();
                window.print();
              }}
              variant="outline"
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
