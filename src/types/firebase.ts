/**
 * Tipos para Firebase y servicios del CRM Pecaditos
 * 
 * Este archivo centraliza las interfaces de datos para garantizar
 * tipado fuerte en todo el sistema.
 */

/**
 * Datos para registrar un nuevo usuario
 */
export interface UserRegistrationData {
  name: string;
  phone?: string;
  address?: string;
  role?: 'admin' | 'cliente' | 'mayorista' | 'repartidor' | 'produccion';
  permissions?: string[];
}

/**
 * Perfil de usuario almacenado en Firebase
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  rol?: string;
  role?: string;
  activo?: boolean;
  accessModules?: string[];
  permissions?: string[];
  createdAt: string;
  updatedAt?: string;
}

/**
 * Estado de billing de un pedido
 */
export interface OrderBilling {
  status: 'pending' | 'invoiced' | 'por_cobrar' | 'paid' | 'error';
  invoiceIssued: boolean;
  invoiceData?: any;
  invoiceIssuedAt?: string;
  invoiceError?: string;
  invoiceAttemptedAt?: string;
  sentToCollectionAt?: string;
  pendingManualInvoice?: boolean;
  note?: string;
}

/**
 * Item de un pedido
 */
export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

/**
 * Información del cliente en un pedido
 */
export interface OrderCustomer {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

/**
 * Cliente comercial (mayorista)
 */
export interface OrderClient {
  id?: string;
  commercialName?: string;
  legalName?: string;
  name?: string;
  ruc?: string;
}

/**
 * Información de envío
 */
export interface OrderShipping {
  address: string;
  siteName?: string;
  eta?: string;
  district?: string;
}

/**
 * Ubicación de entrega
 */
export interface DeliveryLocation {
  lat: number;
  lng: number;
}

/**
 * Metadata para actualización de delivery
 */
export interface DeliveryUpdateMetadata {
  assignedTo?: string;
  deliveryNotes?: string;
  deliveryLocation?: DeliveryLocation;
  [key: string]: any;
}

/**
 * Opciones para crear un pedido
 */
export interface CreateOrderOptions {
  /** Si es true, no emite factura electrónica */
  skipInvoice?: boolean;
  /** Canal de origen: retail, wholesale, quick */
  channel?: 'retail' | 'wholesale' | 'quick';
}

/**
 * Resultado de una operación de delivery
 */
export interface DeliveryUpdateResult {
  success: boolean;
  orderId: string;
  status: string;
  previousStatus?: string;
  updates: Record<string, any>;
}

/**
 * Factura/Invoice para cobranzas
 */
export interface Invoice {
  id: string;
  orderId: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  createdAt: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  ruc?: string | null;
  phone?: string | null;
}

/**
 * Estados posibles de un pedido
 */
export type OrderStatus = 
  | 'pendiente'
  | 'en_preparacion'
  | 'listo'
  | 'en_ruta'
  | 'entregado'
  | 'rechazado'
  | 'cancelado';

/**
 * Estados de delivery
 */
export type DeliveryStatus = 'en_ruta' | 'entregado';

/**
 * Prioridad de un pedido
 */
export type OrderPriority = 'normal' | 'urgent';

/**
 * Canal de origen del pedido
 */
export type OrderChannel = 'retail' | 'wholesale' | 'quick';




