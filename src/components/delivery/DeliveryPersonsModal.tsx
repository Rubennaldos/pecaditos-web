
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminDelivery } from '@/contexts/AdminDeliveryContext';
import { Users, Eye, EyeOff, Edit, Key, Phone, User } from 'lucide-react';

interface DeliveryPersonsModalProps {
  persons: any[];
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryPersonsModal = ({ persons, isOpen, onClose }: DeliveryPersonsModalProps) => {
  const { editDeliveryPerson } = useAdminDelivery();
  const [editingPerson, setEditingPerson] = useState<string | null>(null);
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({});
  const [editData, setEditData] = useState<any>({});

  if (!isOpen) return null;

  const handleEdit = (person: any) => {
    setEditingPerson(person.id);
    setEditData({ ...person });
  };

  const handleSave = () => {
    if (editingPerson) {
      editDeliveryPerson(editingPerson, editData);
      setEditingPerson(null);
      setEditData({});
    }
  };

  const toggleCodeVisibility = (personId: string) => {
    setShowCodes(prev => ({ ...prev, [personId]: !prev[personId] }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestión de Repartidores
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Activos ({persons.filter(p => p.isActive !== false).length})</TabsTrigger>
            <TabsTrigger value="inactive">Inactivos ({persons.filter(p => p.isActive === false).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {persons.filter(p => p.isActive !== false).map((person) => (
                <Card key={person.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {person.name}
                      </div>
                      <Badge className="bg-green-100 text-green-800">Activo</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {editingPerson === person.id ? (
                      <div className="space-y-3">
                        <div>
                          <Label>Nombre</Label>
                          <Input
                            value={editData.name || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Teléfono</Label>
                          <Input
                            value={editData.phone || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Código de Acceso</Label>
                          <Input
                            value={editData.tempCode || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, tempCode: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                            Guardar
                          </Button>
                          <Button 
                            onClick={() => setEditingPerson(null)} 
                            variant="outline" 
                            size="sm"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-stone-400" />
                          <span>{person.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Key className="h-3 w-3 text-stone-400" />
                          <span>
                            {showCodes[person.id] ? person.tempCode : '••••'}
                          </span>
                          <Button
                            onClick={() => toggleCodeVisibility(person.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            {showCodes[person.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </div>
                        {person.lastLogin && (
                          <div className="text-xs text-stone-500">
                            Último acceso: {new Date(person.lastLogin).toLocaleString()}
                          </div>
                        )}
                        <Button 
                          onClick={() => handleEdit(person)} 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inactive" className="space-y-4">
            <div className="text-center py-8 text-stone-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-stone-300" />
              <p>No hay repartidores inactivos</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
