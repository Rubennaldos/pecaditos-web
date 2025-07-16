
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdminDelivery } from '@/contexts/AdminDeliveryContext';
import { useState } from 'react';
import { Search, Clock, User, FileText, Shield } from 'lucide-react';

interface DeliveryHistoryModalProps {
  delivery: any;
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryHistoryModal = ({ delivery, isOpen, onClose }: DeliveryHistoryModalProps) => {
  const { getDeliveryHistory } = useAdminDelivery();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen || !delivery) return null;

  const history = getDeliveryHistory(delivery.id);
  const filteredHistory = history.filter(h =>
    h.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.performedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'edit': return 'bg-blue-100 text-blue-800';
      case 'status_change': return 'bg-yellow-100 text-yellow-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'restore': return 'bg-purple-100 text-purple-800';
      case 'assign': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'edit': return <FileText className="h-3 w-3" />;
      case 'delete': return <Shield className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historial de Entrega: {delivery.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Buscar en historial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-96">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-stone-500">
                {searchTerm ? 'No se encontraron resultados' : 'No hay historial disponible'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4 hover:bg-stone-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getActionColor(entry.action)}>
                          {getActionIcon(entry.action)}
                          <span className="ml-1 capitalize">{entry.action.replace('_', ' ')}</span>
                        </Badge>
                        <span className="text-sm text-stone-600">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-stone-500">
                        <User className="h-3 w-3" />
                        {entry.performedBy}
                      </div>
                    </div>
                    
                    <p className="text-sm text-stone-700 mb-2">{entry.details}</p>
                    
                    {entry.oldValue && entry.newValue && (
                      <div className="text-xs bg-stone-100 p-2 rounded">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium text-red-600">Antes:</span>
                            <pre className="text-red-700 whitespace-pre-wrap">
                              {JSON.stringify(entry.oldValue, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <span className="font-medium text-green-600">Después:</span>
                            <pre className="text-green-700 whitespace-pre-wrap">
                              {JSON.stringify(entry.newValue, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
