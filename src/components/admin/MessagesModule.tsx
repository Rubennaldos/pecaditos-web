import { useState, useEffect } from 'react';
import { ref, push, onValue } from 'firebase/database';
import { db } from '@/config/firebase'; // Tu config de Firebase
import { 
  MessageSquare, 
  Plus, 
  Send, 
  X, 
  Users, 
  Image as ImageIcon,
  Smile,
  Filter,
  Search,
  Calendar,
  Clock,
  Eye,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

/**
 * Para el ejemplo, aquí van los perfiles (luego reemplaza por tu base de datos de usuarios)
 */
const [profiles, setProfiles] = useState([]);

export const MessagesModule = ({ usuarioActual }) => {
  // usuarioActual = { id: 'admin_1', rol: 'admin', email: 'admin@pecaditos.com' }
  const [messages, setMessages] = useState([]);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageFilter, setMessageFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [activePopupMessage, setActivePopupMessage] = useState(null);

  // Formulario de nuevo mensaje
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    image: '',
    recipients: [],
  });

  // ---- Cargar mensajes desde Firebase ----
  useEffect(() => {
    const messagesRef = ref(db, 'mensajes');
    const unsub = onValue(messagesRef, (snap) => {
      const data = snap.val() || {};
      // Convierte en array y ordena por fecha descendente
      const arr = Object.entries(data)
        .map(([id, value]) => ({ id, ...value }))
        .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
      setMessages(arr);
    });
    return () => unsub();
  }, []);

  // ---- Mostrar Pop-up al entrar si hay mensajes activos para este usuario ----
  useEffect(() => {
    // Filtra mensajes que le corresponden al usuario actual
    if (!usuarioActual) return;
    const mensajesParaUsuario = messages.filter(
      (m) =>
        (m.recipients && m.recipients.includes('all')) || // para todos
        (m.recipients && m.recipients.includes(usuarioActual.id))
    );
    if (mensajesParaUsuario.length > 0) {
      setActivePopupMessage(mensajesParaUsuario[0]); // Muestra solo el más reciente (puedes cambiar la lógica)
      setShowPopup(true);
    }
  }, [messages, usuarioActual]);

  // ---- Enviar mensaje (guarda en Firebase) ----
  const handleSendMessage = async () => {
    if (!newMessage.title || !newMessage.content || newMessage.recipients.length === 0) {
      toast({
        title: "Campos requeridos",
        description: "Completa título, contenido y destinatarios.",
        variant: "destructive"
      });
      return;
    }
    const message = {
      ...newMessage,
      sentBy: usuarioActual ? usuarioActual.email : 'Admin General',
      sentAt: new Date().toISOString(),
      status: "enviado",
      readBy: [],
    };
    // Guarda en Firebase
    await push(ref(db, 'mensajes'), message);
    setNewMessage({ title: '', content: '', image: '', recipients: [] });
    setShowNewMessageModal(false);
    toast({
      title: "Mensaje enviado",
      description: "El mensaje se ha guardado y se mostrará a los destinatarios seleccionados.",
      variant: "default"
    });
  };

  // ---- Destinatarios, selección múltiple ----
  const handleRecipientChange = (profile, checked) => {
    if (checked) {
      setNewMessage(prev => ({
        ...prev,
        recipients: [...prev.recipients, profile]
      }));
    } else {
      setNewMessage(prev => ({
        ...prev,
        recipients: prev.recipients.filter(r => r !== profile)
      }));
    }
  };

  // ---- Filtrado de mensajes (para la tabla) ----
  const filteredMessages = messages.filter(message => {
    const matchesFilter =
      messageFilter === 'all' ||
      (message.recipients && message.recipients.includes(messageFilter));
    const matchesSearch =
      message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getMessagePreview = (content) => content.length > 100 ? content.substring(0, 100) + '...' : content;

  // ---- UI ----
  return (
    <div className="space-y-6">
      {/* POP-UP de mensaje importante al entrar */}
      {showPopup && activePopupMessage && (
        <Dialog open={showPopup} onOpenChange={() => setShowPopup(false)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {activePopupMessage.title}
              </DialogTitle>
              <DialogDescription>
                Este es un mensaje importante enviado por el administrador.
              </DialogDescription>
            </DialogHeader>
            {activePopupMessage.image && (
              <img src={activePopupMessage.image} alt="img" className="w-full rounded-xl mb-3" />
            )}
            <p className="text-stone-700">{activePopupMessage.content}</p>
            <DialogFooter>
              <Button onClick={() => setShowPopup(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* CABECERA */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Mensajes del Sistema</h1>
          <p className="text-stone-600 mt-1">Envía mensajes tipo anuncio, avisos o recordatorios a usuarios y perfiles</p>
        </div>
        <Dialog open={showNewMessageModal} onOpenChange={setShowNewMessageModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Mensaje
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Mensaje</DialogTitle>
              <DialogDescription>
                Crea un mensaje para uno, varios o todos los usuarios
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="message-title">Título</Label>
                <Input
                  id="message-title"
                  value={newMessage.title}
                  onChange={e => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Mantenimiento del sistema"
                />
              </div>
              <div>
                <Label htmlFor="message-content">Contenido</Label>
                <Textarea
                  id="message-content"
                  value={newMessage.content}
                  onChange={e => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escribe tu mensaje aquí"
                  rows={4}
                />
              </div>
              <div>
                <Label>Imagen (opcional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = ev => {
                        setNewMessage(prev => ({ ...prev, image: ev.target.result }));
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }}
                />
                {newMessage.image && (
                  <img src={newMessage.image} alt="Preview" className="w-32 h-32 object-cover mt-2 rounded-lg" />
                )}
              </div>
              <div>
                <Label>Destinatarios</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {profiles.map(profile => (
                    <div key={profile.value} className="flex items-center space-x-3">
                      <Checkbox
                        id={profile.value}
                        checked={newMessage.recipients.includes(profile.value)}
                        onCheckedChange={checked => handleRecipientChange(profile.value, checked)}
                      />
                      <Label htmlFor={profile.value} className="flex-1">
                        {profile.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowNewMessageModal(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!newMessage.title || !newMessage.content || newMessage.recipients.length === 0}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensaje
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar mensajes..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={messageFilter} onValueChange={setMessageFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por destinatario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los mensajes</SelectItem>
                {profiles.map(profile => (
                  <SelectItem key={profile.value} value={profile.value}>
                    {profile.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de mensajes */}
      <div className="grid gap-4">
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No hay mensajes</h3>
              <p className="text-gray-500">No se encontraron mensajes.</p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map(message => (
            <Card key={message.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-stone-800">{message.title}</h3>
                    <p className="text-stone-600 text-sm mt-1">{getMessagePreview(message.content)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedMessage(message)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {/* Eliminar mensaje: opcional */}
                  </div>
                </div>
                {message.image && (
                  <img src={message.image} alt="Message" className="w-full max-w-xs rounded-lg mb-4" />
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {message.recipients.map(recipient => {
                    const profile = profiles.find(p => p.value === recipient);
                    return (
                      <Badge key={recipient} variant="secondary">
                        {profile?.label || recipient}
                      </Badge>
                    );
                  })}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between items-center text-sm text-stone-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(message.sentAt).toLocaleString('es-PE')}
                    </span>
                    <span>Por: {message.sentBy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {message.readBy ? message.readBy.length : 0} visto{message.readBy && message.readBy.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de detalle del mensaje */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.title}</DialogTitle>
            <DialogDescription>
              Detalles del mensaje enviado
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                {selectedMessage.image && (
                  <div className="flex justify-center mb-4">
                    <img src={selectedMessage.image} alt="Message" className="max-w-sm max-h-64 rounded-lg object-contain" />
                  </div>
                )}
                <p className="text-stone-700">{selectedMessage.content}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Destinatarios:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMessage.recipients.map(recipient => {
                    const profile = profiles.find(p => p.value === recipient);
                    return (
                      <Badge key={recipient} variant="secondary">
                        {profile?.label || recipient}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Estadísticas de lectura:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-stone-600">Enviado:</span>
                    <p className="font-medium">{new Date(selectedMessage.sentAt).toLocaleString('es-PE')}</p>
                  </div>
                  <div>
                    <span className="text-stone-600">Leído por:</span>
                    <p className="font-medium">{selectedMessage.readBy ? selectedMessage.readBy.length : 0} usuarios</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMessage(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
