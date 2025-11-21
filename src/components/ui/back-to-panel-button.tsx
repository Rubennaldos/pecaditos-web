import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface BackToPanelButtonProps {
  to?: string;
  label?: string;
}

export const BackToPanelButton = ({ 
  to = '/panel-control', 
  label = 'Volver al Panel' 
}: BackToPanelButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(to)}
      className="fixed top-4 left-4 z-[100] bg-white/95 backdrop-blur-sm hover:bg-white border border-stone-300 shadow-md transition-all"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
};
