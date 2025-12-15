/**
 * Constantes y configuración para el Panel de Administración
 * Centraliza colores, módulos y configuraciones para evitar duplicación
 */

import {
  BarChart3,
  Package,
  Truck,
  Factory,
  DollarSign,
  Settings,
  Building,
  MapPin,
  MessageSquare,
  UserCog,
  ShoppingBag,
  FileCheck,
  LucideIcon,
} from 'lucide-react';

/**
 * Mapeo de colores para los módulos del panel
 * Gradientes con efectos hover y sombras
 */
export const MODULE_COLOR_MAP: Record<string, string> = {
  purple: 'bg-gradient-to-br from-purple-500/90 to-violet-600/90 hover:from-purple-600 hover:to-violet-700 shadow-lg shadow-purple-500/30 hover:shadow-purple-600/50',
  blue: 'bg-gradient-to-br from-sky-500/90 to-blue-600/90 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/30 hover:shadow-sky-600/50',
  green: 'bg-gradient-to-br from-emerald-500/90 to-green-600/90 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-600/50',
  amber: 'bg-gradient-to-br from-amber-500/90 to-orange-600/90 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30 hover:shadow-amber-600/50',
  red: 'bg-gradient-to-br from-rose-500/90 to-red-600/90 hover:from-rose-600 hover:to-red-700 shadow-lg shadow-rose-500/30 hover:shadow-rose-600/50',
  teal: 'bg-gradient-to-br from-teal-500/90 to-cyan-600/90 hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/30 hover:shadow-teal-600/50',
  indigo: 'bg-gradient-to-br from-indigo-500/90 to-blue-600/90 hover:from-indigo-600 hover:to-blue-700 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-600/50',
  rose: 'bg-gradient-to-br from-pink-500/90 to-rose-600/90 hover:from-pink-600 hover:to-rose-700 shadow-lg shadow-pink-500/30 hover:shadow-pink-600/50',
  emerald: 'bg-gradient-to-br from-emerald-500/90 to-teal-600/90 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-600/50',
} as const;

/**
 * Tipo para colores válidos de módulos
 */
export type ModuleColor = keyof typeof MODULE_COLOR_MAP;

/**
 * Estadística de un módulo
 */
export interface ModuleStat {
  label: string;
  value: string;
}

/**
 * Definición de un módulo del panel de administración
 */
export interface AdminModule {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: ModuleColor;
  stats?: ModuleStat[];
}

/**
 * Lista de módulos disponibles en el panel de administración
 */
export const ADMIN_MODULES: AdminModule[] = [
  {
    id: 'dashboard',
    name: 'Dashboard Global',
    icon: BarChart3,
    description: 'Vista completa del sistema',
    color: 'purple',
    stats: [
      { label: 'Pedidos Hoy', value: '24' },
      { label: 'En Proceso', value: '12' },
    ],
  },
  {
    id: 'clients-access',
    name: 'Clientes y Accesos',
    icon: UserCog,
    description: 'Gestión de clientes con usuarios y permisos',
    color: 'rose',
    stats: [
      { label: 'Clientes', value: '-' },
      { label: 'Usuarios', value: '-' },
    ],
  },
  {
    id: 'orders-admin',
    name: 'Módulo Pedidos',
    icon: Package,
    description: 'Control total de pedidos',
    color: 'blue',
    stats: [
      { label: 'Pendientes', value: '8' },
      { label: 'Urgentes', value: '3' },
    ],
  },
  {
    id: 'delivery-admin',
    name: 'Módulo Reparto',
    icon: Truck,
    description: 'Supervisión de entregas',
    color: 'green',
    stats: [
      { label: 'En Ruta', value: '5' },
      { label: 'Entregados', value: '18' },
    ],
  },
  {
    id: 'production-admin',
    name: 'Módulo Producción',
    icon: Factory,
    description: 'Control de inventario',
    color: 'amber',
    stats: [
      { label: 'Stock Bajo', value: '4' },
      { label: 'Productos', value: '47' },
    ],
  },
  {
    id: 'billing-admin',
    name: 'Módulo Cobranzas',
    icon: DollarSign,
    description: 'Supervisión financiera',
    color: 'red',
    stats: [
      { label: 'Por Cobrar', value: 'S/. 12K' },
      { label: 'Vencidas', value: '7' },
    ],
  },
  {
    id: 'customers-admin',
    name: '¿Dónde nos ubicamos?',
    icon: MapPin,
    description: 'Ubicaciones y puntos de venta',
    color: 'blue',
    stats: [
      { label: 'Total', value: '142' },
      { label: 'Activos', value: '98' },
    ],
  },
  {
    id: 'catalogs-admin',
    name: 'Catálogos por Cliente',
    icon: ShoppingBag,
    description: 'Gestión de catálogos personalizados',
    color: 'emerald',
    stats: [
      { label: 'Clientes', value: '-' },
      { label: 'Productos', value: '-' },
    ],
  },
  {
    id: 'business-admin',
    name: 'Administración de Catálogo al por Mayor',
    icon: Building,
    description: 'Catálogos y promociones',
    color: 'teal',
  },
  {
    id: 'logistics',
    name: 'Módulo Logística',
    icon: Truck,
    description: 'Inventario y compras',
    color: 'indigo',
  },
  {
    id: 'system-config',
    name: 'Configuración',
    icon: Settings,
    description: 'Sistema y parámetros',
    color: 'purple',
  },
  {
    id: 'locations',
    name: 'Ubicaciones',
    icon: MapPin,
    description: 'Sedes y puntos de venta',
    color: 'indigo',
  },
  {
    id: 'audit',
    name: 'Auditoría',
    icon: FileCheck,
    description: 'Logs y seguimiento',
    color: 'rose',
  },
  {
    id: 'messages',
    name: 'Mensajes',
    icon: MessageSquare,
    description: 'Comunicación interna',
    color: 'blue',
  },
];

/**
 * Mapeo de alias para verificación de acceso a módulos
 * Permite que diferentes nombres accedan al mismo módulo
 */
export const MODULE_ALIAS_MAP: Record<string, string[]> = {
  'orders-admin': ['orders', 'pedidos'],
  'delivery-admin': ['delivery', 'reparto'],
  'production-admin': ['production', 'produccion'],
  'billing-admin': ['billing', 'cobranzas'],
  'customers-admin': ['locations', 'customers', 'ubicaciones'],
  'catalogs-admin': ['catalogs-admin', 'catalogs', 'catalogo', 'catalog'],
  'dashboard': ['dashboard', 'admin'],
  'clients-access': ['clients-access', 'clients', 'clientes'],
};

/**
 * Verifica si un usuario tiene acceso a un módulo específico
 */
export const hasModuleAccess = (
  moduleId: string,
  userModules: string[],
  isAdmin: boolean
): boolean => {
  // Los administradores tienen acceso a todo
  if (isAdmin) return true;
  
  if (!userModules || userModules.length === 0) return false;
  
  // Coincidencia exacta
  if (userModules.includes(moduleId)) return true;
  
  // Intentar con la base antes del guión: orders-admin -> orders
  const base = moduleId.split('-')[0];
  if (userModules.includes(base)) return true;
  
  // Verificar aliases
  const aliases = MODULE_ALIAS_MAP[moduleId] || [];
  for (const alias of aliases) {
    if (userModules.includes(alias)) return true;
  }
  
  return false;
};

/**
 * Obtiene la clase CSS de color para un módulo
 */
export const getModuleColorClass = (color: ModuleColor): string => {
  return MODULE_COLOR_MAP[color] || MODULE_COLOR_MAP.blue;
};



