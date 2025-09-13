// src/components/billing/BillingSidebar.tsx
import {
  type LucideIcon,
  LayoutDashboard,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Users,
  History,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Section } from './types';
import * as React from 'react';

type BillingSidebarProps = {
  activeSection: Section;
  // Importante: usar el mismo tipo que devuelve useState<Section>
  setActiveSection: React.Dispatch<React.SetStateAction<Section>>;
};

type MenuItem = {
  id: Section;
  label: string;
  icon: LucideIcon;
};

export const BillingSidebar: React.FC<BillingSidebarProps> = ({
  activeSection,
  setActiveSection,
}) => {
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'to-be-paid', label: 'Por Cobrar', icon: AlertCircle },
    { id: 'paid', label: 'Cobrado', icon: CheckCircle },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'reports', label: 'Reportes', icon: FileText },
  ];

  return (
    <div className="w-64 bg-white border-r border-stone-200 h-[calc(100vh-80px)] overflow-y-auto">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors',
                activeSection === item.id
                  ? 'bg-green-100 text-green-700 font-medium'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
