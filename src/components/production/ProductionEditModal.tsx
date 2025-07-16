
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAdminProduction } from '@/contexts/AdminProductionContext';
import { Save, X } from 'lucide-react';

interface ProductionEditModalProps {
  record: any;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductionEditModal = ({ record, isOpen, onClose }: ProductionEditModalProps) => {
  const { editProductionRecord } = useAdminProduction();
  const [editedRecord, setEditedRecord] = useState(record || {});
  const [changes, setChanges] = useState<any>({});

  if (!isOpen || !record) return null;

  const handleFieldChange = (field: string, value: any) => {
    setEditedRecord(prev => ({ ...prev, [field]: value }));
    setChanges(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    editProductionRecord(record.id, {
      ...editedRecord,
      lastModified: new Date().toISOString(),
      modifiedBy: 'admin@pecaditos.com'
    });
    onClose();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'add_stock': return 'bg-green-100 text-green-800';
      case 'remove_stock': return 'bg-red-100 text-red-800';
      case 'adjust_stock': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar Registro: {record.id}
            <Badge className={getActionColor(editedRecord.action || 'add_stock')}>
              {editedRecord.action || 'add_stock'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Producto</Label>
              <Input
                value={editedRecord.productName || ''}
                onChange={(e) => handleFieldChange('productName', e.target.value)}
              />
            </div>
            
            <div>
              <Label>Acción</Label>
              <Select
                value={editedRecord.action || 'add_stock'}
                onValueChange={(value) => handleFieldChange('action', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add_stock">Agregar Stock</SelectItem>
                  <SelectItem value="remove_stock">Reducir Stock</SelectItem>
                  <SelectItem value="adjust_stock">Ajustar Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Cantidad</Label>
              <Input
                type="number"
                value={editedRecord.quantity || 0}
                onChange={(e) => handleFieldChange('quantity', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Lote ID</Label>
              <Input
                value={editedRecord.loteId || ''}
                onChange={(e) => handleFieldChange('loteId', e.target.value)}
                placeholder="Opcional"
              />
            </div>
            
            <div>
              <Label>Realizado por</Label>
              <Input
                value={editedRecord.performedBy || ''}
                onChange={(e) => handleFieldChange('performedBy', e.target.value)}
              />
            </div>
            
            <div>
              <Label>Comentarios</Label>
              <Textarea
                value={editedRecord.comment || ''}
                onChange={(e) => handleFieldChange('comment', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        {Object.keys(changes).length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800 font-medium">Cambios detectados:</p>
            <p className="text-xs text-amber-700 mt-1">
              {Object.keys(changes).join(', ')}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={Object.keys(changes).length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
