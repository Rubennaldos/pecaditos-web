import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ModuleCardProps {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
  isActive?: boolean;
  isSuperAdmin?: boolean;
  stats?: { label: string; value: number | string }[];
  onClick: () => void;
}

export const ModuleCard = ({
  name,
  icon: Icon,
  description,
  color,
  isActive,
  isSuperAdmin,
  stats,
  onClick,
}: ModuleCardProps) => {
  const colorClasses = {
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200',
    green: 'bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200',
    amber: 'bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-amber-200',
    red: 'bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-red-200',
    teal: 'bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 border-teal-200',
    indigo: 'bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border-indigo-200',
    rose: 'bg-gradient-to-br from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 border-rose-200',
  };

  const iconColorClasses = {
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    teal: 'text-teal-600',
    indigo: 'text-indigo-600',
    rose: 'text-rose-600',
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 border-2 ${
        colorClasses[color as keyof typeof colorClasses]
      } ${isActive ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className={`h-8 w-8 ${iconColorClasses[color as keyof typeof iconColorClasses]}`} />
          </div>
          {isSuperAdmin && (
            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
              Admin
            </Badge>
          )}
        </div>

        <h3 className="text-lg font-bold text-stone-800 mb-1">{name}</h3>
        <p className="text-sm text-stone-600 mb-4">{description}</p>

        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-stone-200">
            {stats.map((stat, idx) => (
              <div key={idx}>
                <p className="text-xs text-stone-500">{stat.label}</p>
                <p className="text-lg font-bold text-stone-800">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
