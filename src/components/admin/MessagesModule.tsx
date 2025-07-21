import { useState } from 'react';
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

export const MessagesModule = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      title: "Nuevo catálogo de productos",
      content: "¡Hemos actualizado nuestro catálogo con deliciosas galletas de temporada! 🍪✨",
      image: "/placeholder.svg?height=200&width=400",
      recipients: ["mayoristas", "pedidos"],
      sentBy: "Admin General",
      sentAt: "2024-07-18 10:30:00",
      status: "enviado",
      readBy: ["mayorista1@email.com", "pedidos@pecaditos.com"]
    },
    {
      id: 2,
      title: "Actualización de horarios",
      content: "Estimados colaboradores, les informamos que a partir del lunes próximo tendremos nuevos horarios de atención.",
      image: "",
      recipients: ["pedidos", "reparto", "produccion"],
      sentBy: "Admin General", 
      sentAt: "2024-07-17 15:20:00",
      status: "enviado",
      readBy: ["pedidos@pecaditos.com"]
    }
  ]);

  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageFilter, setMessageFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    image: '',
    recipients: [],
    isGlobal: false
  });

  const profiles = [
    { value: 'mayoristas', label: 'Mayoristas', count: 25 },
    { value: 'pedidos', label: 'Módulo Pedidos', count: 3 },
    { value: 'reparto', label: 'Módulo Reparto', count: 5 },
    { value: 'produccion', label: 'Módulo Producción', count: 4 },
    { value: 'cobranzas', label: 'Módulo Cobranzas', count: 2 }
  ];

  // Los números entre paréntesis indican usuarios activos en cada perfil

  const handleSendMessage = () => {
    if (!newMessage.title || !newMessage.content || newMessage.recipients.length === 0) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el título, contenido y selecciona al menos un destinatario.",
        variant: "destructive"
      });
      return;
    }

    const message = {
      id: Date.now(),
      ...newMessage,
      sentBy: "Admin General",
      sentAt: new Date().toLocaleString('es-PE'),
      status: "enviado",
      readBy: []
    };

    setMessages([message, ...messages]);
    setNewMessage({ title: '', content: '', image: '', recipients: [], isGlobal: false });
    setShowNewMessageModal(false);

    const recipientCount = newMessage.recipients.reduce((acc, profile) => {
      const p = profiles.find(prof => prof.value === profile);
      return acc + (p ? p.count : 0);
    }, 0);

    toast({
      title: "Mensaje enviado",
      description: `Mensaje enviado exitosamente a ${recipientCount} destinatarios.`,
    });
  };

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

  const filteredMessages = messages.filter(message => {
    const matchesFilter = messageFilter === 'all' || message.recipients.includes(messageFilter);
    const matchesSearch = message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getMessagePreview = (content) => {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Mensajes del Sistema</h1>
          <p className="text-stone-600 mt-1">Envía mensajes interactivos a usuarios y perfiles</p>
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
                Crea un mensaje interactivo para enviar a los usuarios del sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="message-title">Título del Mensaje</Label>
                <Input 
                  id="message-title"
                  value={newMessage.title}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Nueva actualización del sistema"
                />
              </div>

              <div>
                <Label htmlFor="message-content">Contenido</Label>
                <Textarea 
                  id="message-content"
                  value={newMessage.content}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escribe tu mensaje aquí... Puedes usar emojis 😊"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="message-image">Imagen (Opcional)</Label>
                <div className="space-y-3">
                  <Input 
                    id="message-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        setNewMessage(prev => ({ ...prev, image: URL.createObjectURL(e.target.files[0]) }));
                      }
                    }}
                    className="mb-2"
                  />
                  {newMessage.image && (
                    <div className="space-y-2">
                      <img src={newMessage.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setNewMessage(prev => ({ ...prev, image: '' }))}
                        className="w-full text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Eliminar imagen
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Destinatarios</Label>
                <p className="text-xs text-stone-500 mb-3">
                  Los números indican usuarios activos en cada perfil
                </p>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {profiles.map((profile) => (
                    <div key={profile.value} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-stone-50">
                      <Checkbox 
                        id={profile.value}
                        checked={newMessage.recipients.includes(profile.value)}
                        onCheckedChange={(checked) => handleRecipientChange(profile.value, checked)}
                      />
                      <Label htmlFor={profile.value} className="text-sm font-medium flex-1">
                        {profile.label}
                      </Label>
                      <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded">
                        {profile.count} usuarios
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vista previa del mensaje */}
              {(newMessage.title || newMessage.content) && (
                <div>
                  <Label>Vista Previa</Label>
                  <div className="mt-2 p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 animate-fade-in">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-800">{newMessage.title || "Título del mensaje"}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {newMessage.image && (
                      <img src={newMessage.image} alt="Message" className="w-full max-w-xs rounded-lg mb-3" />
                    )}
                    <p className="text-stone-700 text-sm">{newMessage.content || "Contenido del mensaje..."}</p>
                    <div className="mt-3 pt-2 border-t border-blue-200">
                      <span className="text-xs text-blue-600">Admin General • Ahora</span>
                    </div>
                  </div>
                </div>
              )}
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

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Buscar mensajes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                {profiles.map((profile) => (
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
              <p className="text-gray-500">No se encontraron mensajes que coincidan con los filtros.</p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => (
            <Card key={message.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-stone-800">{message.title}</h3>
                    <p className="text-stone-600 text-sm mt-1">{getMessagePreview(message.content)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedMessage(message)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {message.image && (
                  <img src={message.image} alt="Message" className="w-full max-w-xs rounded-lg mb-4" />
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {message.recipients.map((recipient) => {
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
                      {message.sentAt}
                    </span>
                    <span>Por: {message.sentBy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {message.readBy.length} visto{message.readBy.length !== 1 ? 's' : ''}
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
                  {selectedMessage.recipients.map((recipient) => {
                    const profile = profiles.find(p => p.value === recipient);
                    return (
                      <Badge key={recipient} variant="secondary">
                        {profile?.label || recipient} ({profile?.count || 0})
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
                    <p className="font-medium">{selectedMessage.sentAt}</p>
                  </div>
                  <div>
                    <span className="text-stone-600">Leído por:</span>
                    <p className="font-medium">{selectedMessage.readBy.length} usuarios</p>
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