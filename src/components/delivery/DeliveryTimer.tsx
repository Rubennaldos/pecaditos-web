
import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface DeliveryTimerProps {
  takenAt: string;
  orderType?: 'normal' | 'urgente';
}

const DeliveryTimer = ({ takenAt, orderType = 'normal' }: DeliveryTimerProps) => {
  const [timeInfo, setTimeInfo] = useState({ hoursLeft: 0, isExpired: false, isUrgent: false });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const takenDate = new Date(takenAt);
      const timeLimit = orderType === 'urgente' ? 12 : 24; // 12h urgentes, 24h normales
      
      const limitDate = new Date(takenDate.getTime() + (timeLimit * 60 * 60 * 1000));
      const difference = limitDate.getTime() - now.getTime();
      const hoursLeft = Math.floor(difference / (1000 * 60 * 60));
      const minutesLeft = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeInfo({
        hoursLeft: Math.max(0, hoursLeft),
        minutesLeft: Math.max(0, minutesLeft),
        isExpired: difference <= 0,
        isUrgent: hoursLeft <= 12 && hoursLeft > 0,
        totalMinutesLeft: Math.max(0, Math.floor(difference / (1000 * 60)))
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, [takenAt, orderType]);

  const getTimerColor = () => {
    if (timeInfo.isExpired) return 'text-red-600';
    if (timeInfo.isUrgent || timeInfo.hoursLeft <= 12) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBackgroundColor = () => {
    if (timeInfo.isExpired) return 'bg-red-50 border-red-200';
    if (timeInfo.isUrgent || timeInfo.hoursLeft <= 12) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const formatTime = () => {
    if (timeInfo.isExpired) {
      return 'TIEMPO AGOTADO';
    }
    
    if (timeInfo.hoursLeft > 0) {
      return `${timeInfo.hoursLeft}h ${timeInfo.minutesLeft || 0}m restantes`;
    }
    
    return `${timeInfo.minutesLeft || 0}m restantes`;
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getBackgroundColor()}`}>
      {timeInfo.isExpired ? (
        <AlertTriangle className={`h-3 w-3 ${getTimerColor()} animate-pulse`} />
      ) : (
        <Clock className={`h-3 w-3 ${getTimerColor()}`} />
      )}
      <span className={`${getTimerColor()} ${timeInfo.isExpired ? 'animate-pulse font-bold' : ''}`}>
        {formatTime()}
      </span>
    </div>
  );
};

export default DeliveryTimer;
