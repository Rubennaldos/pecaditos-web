
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, User, KeyRound, AlertCircle } from 'lucide-react';

interface DeliveryPersonLoginProps {
  deliveryPersons: Array<{ id: string; name: string; phone: string; tempCode?: string }>;
  onLogin: (personId: string) => void;
  onCancel: () => void;
}

const DeliveryPersonLogin = ({ deliveryPersons, onLogin, onCancel }: DeliveryPersonLoginProps) => {
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [error, setError] = useState('');

  const selectedPerson = deliveryPersons.find(p => p.id === selectedPersonId);

  const handleLogin = () => {
    if (!selectedPerson) return;

    // Por ahora usamos códigos temporales simples, después se manejarán desde admin
    const tempCode = selectedPerson.tempCode || '1234';
    
    if (enteredCode === tempCode) {
      onLogin(selectedPersonId);
    } else {
      setError('Código incorrecto. Intente nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-stone-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-stone-800">
            Acceso de Repartidor
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!selectedPersonId ? (
            // Selección de repartidor
            <>
              <Label className="text-sm font-medium text-stone-700">
                Selecciona tu nombre:
              </Label>
              <div className="space-y-2">
                {deliveryPersons.map((person) => (
                  <Button
                    key={person.id}
                    onClick={() => setSelectedPersonId(person.id)}
                    variant="outline"
                    className="w-full h-12 justify-start border-stone-300 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <User className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{person.name}</div>
                      <div className="text-xs text-stone-500">{person.phone}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </>
          ) : (
            // Ingreso de código
            <>
              <div className="text-center mb-4">
                <p className="text-stone-600">Bienvenido,</p>
                <p className="font-semibold text-stone-800">{selectedPerson.name}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="access-code" className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  Código de acceso temporal:
                </Label>
                <Input
                  id="access-code"
                  type="password"
                  placeholder="Ingrese su código"
                  value={enteredCode}
                  onChange={(e) => {
                    setEnteredCode(e.target.value);
                    setError('');
                  }}
                  className="text-center"
                  onKeyPress={(e) => e.key === 'Enter' && enteredCode && handleLogin()}
                />
                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleLogin}
                  disabled={!enteredCode}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Ingresar
                </Button>
                <Button
                  onClick={() => {
                    setSelectedPersonId('');
                    setEnteredCode('');
                    setError('');
                  }}
                  variant="outline"
                  className="border-stone-300 text-stone-600"
                >
                  Cambiar
                </Button>
              </div>
            </>
          )}
          
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full text-stone-600 border-stone-300 hover:bg-stone-50"
            >
              Volver al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryPersonLogin;
