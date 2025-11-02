
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminDelivery } from '@/contexts/AdminDeliveryContext';
import { MessageSquare, Send, User } from 'lucide-react';

interface SendMessageModalProps {
  persons: any[];
  isOpen: boolean;
  onClose: () => void;
}

export const SendMessageModal = ({ persons, isOpen, onClose }: SendMessageModalProps) => {
  const { sendMessageToPerson } = useAdminDelivery();
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('general');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!selectedPersonId || !message.trim()) {
      alert('Por favor selecciona un repartidor y escribe un mensaje');
      return;
    }

    sendMessageToPerson(selectedPersonId, message);
    
    // Reset form
    setSelectedPersonId('');
    setMessage('');
    setMessageType('general');
    onClose();
  };

  const messageTemplates = {
    general: '',
    urgente: '🚨 URGENTE: ',
    recordatorio: '📋 Recordatorio: ',
    felicitacion: '🎉 ¡Felicitaciones! ',
    instruccion: '📋 Instrucciones: '
  };

  const selectedPerson = persons.find(p => p.id === selectedPersonId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Enviar Mensaje
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Repartidor destinatario</Label>
            <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un repartidor" />
              </SelectTrigger>
              <SelectContent>
                {persons.filter(p => p.isActive !== false).map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {person.name} - {person.phone}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPerson && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">{selectedPerson.name}</p>
                    <p className="text-sm text-blue-600">{selectedPerson.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label>Tipo de mensaje</Label>
            <Select value={messageType} onValueChange={(value) => {
              setMessageType(value);
              setMessage(messageTemplates[value as keyof typeof messageTemplates] + message.replace(/^(🚨 URGENTE: |📋 Recordatorio: |🎉 ¡Felicitaciones! |📋 Instrucciones: )/, ''));
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">💬 General</SelectItem>
                <SelectItem value="urgente">🚨 Urgente</SelectItem>
                <SelectItem value="recordatorio">📋 Recordatorio</SelectItem>
                <SelectItem value="felicitacion">🎉 Felicitación</SelectItem>
                <SelectItem value="instruccion">📋 Instrucción</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mensaje</Label>
            <Textarea
              placeholder="Escribe tu mensaje aquí..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <div className="text-xs text-stone-500 text-right">
              {message.length}/500 caracteres
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSend}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!selectedPersonId || !message.trim() || message.length > 500}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Mensaje
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
