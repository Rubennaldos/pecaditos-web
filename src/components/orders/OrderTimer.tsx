
import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface OrderTimerProps {
  status: string;
  createdAt: string;
  acceptedAt?: string;
  readyAt?: string;
  orderType?: string;
}

const OrderTimer = ({ status, createdAt, acceptedAt, readyAt, orderType }: OrderTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, isExpired: false });
  const [progressValue, setProgressValue] = useState(100);

  const getTimeLimit = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pendiente':
        return 24; // 24 horas para aceptar
      case 'en_preparacion':
        return 48; // 48 horas para preparar
      case 'listo':
        return 48; // 48 horas para entregar
      default:
        return 24;
    }
  };

  const getStatusText = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pendiente':
        return 'para aceptar el pedido';
      case 'en_preparacion':
        return 'para completar preparación';
      case 'listo':
        return 'para entregar';
      default:
        return 'para procesar';
    }
  };

  const getTimerColor = (hours: number, isExpired: boolean) => {
    if (isExpired) return 'text-red-600';
    if (hours <= 6) return 'text-red-500';
    if (hours <= 12) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (hours: number, isExpired: boolean) => {
    if (isExpired) return 'bg-red-500';
    if (hours <= 6) return 'bg-red-400';
    if (hours <= 12) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      let referenceDate: Date;
      
      switch (status) {
        case 'pendiente':
          referenceDate = new Date(createdAt);
          break;
        case 'en_preparacion':
          referenceDate = acceptedAt ? new Date(acceptedAt) : new Date(createdAt);
          break;
        case 'listo':
          referenceDate = readyAt ? new Date(readyAt) : new Date(createdAt);
          break;
        default:
          referenceDate = new Date(createdAt);
      }

      const timeLimit = getTimeLimit(status);
      const limitDate = new Date(referenceDate.getTime() + (timeLimit * 60 * 60 * 1000));
      const now = new Date();
      const difference = limitDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, isExpired: true });
        setProgressValue(0);
      } else {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        const totalMinutesLimit = timeLimit * 60;
        const remainingMinutes = hours * 60 + minutes;
        const progress = Math.max(0, Math.min(100, (remainingMinutes / totalMinutesLimit) * 100));
        
        setTimeLeft({ hours, minutes, isExpired: false });
        setProgressValue(progress);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, [status, createdAt, acceptedAt, readyAt]);

  if (status === 'entregado' || status === 'cancelado') {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-stone-500" />
        <span className="text-sm text-stone-600">
          {timeLeft.isExpired ? (
            <span className="text-red-600 font-medium flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              VENCIDO
            </span>
          ) : (
            <span className={getTimerColor(timeLeft.hours, timeLeft.isExpired)}>
              {timeLeft.hours > 0 && `${timeLeft.hours}h `}
              {timeLeft.minutes}m {getStatusText(status)}
            </span>
          )}
        </span>
      </div>
      
      <div className="space-y-1">
        <Progress 
          value={progressValue} 
          className="h-2"
        />
        <div className="flex items-center gap-2">
          {timeLeft.isExpired && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              URGENTE
            </Badge>
          )}
          {!timeLeft.isExpired && timeLeft.hours <= 6 && (
            <Badge className="bg-yellow-500 text-white text-xs">
              PRÓXIMO A VENCER
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTimer;
