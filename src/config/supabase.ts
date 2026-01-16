// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Validar que las variables de entorno existan
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Faltan credenciales de Supabase.\n' +
    'Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env'
  );
}

// Crear cliente de Supabase con configuración optimizada
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'pecaditos-crm',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Tipos de la base de datos (se pueden generar automáticamente con Supabase CLI)
export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          email: string;
          nombre: string;
          telefono: string | null;
          rol: 'admin' | 'adminGeneral' | 'pedidos' | 'reparto' | 'produccion' | 'cobranzas' | 'mayorista' | 'cliente' | 'logistica';
          activo: boolean;
          permissions: any;
          access_modules: string[];
          avatar_url: string | null;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['usuarios']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['usuarios']['Insert']>;
      };
      productos: {
        Row: {
          id: string;
          codigo: string;
          nombre: string;
          descripcion: string | null;
          categoria_id: string | null;
          precio_minorista: number;
          precio_mayorista: number | null;
          imagen_url: string | null;
          ingredientes: string[];
          disponible: boolean;
          destacado: boolean;
          stock_actual: number;
          stock_minimo: number;
          unidad_medida: string;
          peso_gramos: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['productos']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['productos']['Insert']>;
      };
      pedidos: {
        Row: {
          id: string;
          numero_orden: string;
          cliente_id: string | null;
          usuario_id: string | null;
          tipo_pedido: 'minorista' | 'mayorista';
          canal: string;
          estado: 'pendiente' | 'en_preparacion' | 'listo' | 'en_ruta' | 'entregado' | 'rechazado';
          subtotal: number;
          descuento: number;
          igv: number;
          total: number;
          metodo_pago: string | null;
          direccion_entrega: string | null;
          distrito_entrega: string | null;
          referencia_entrega: string | null;
          telefono_contacto: string | null;
          nombre_contacto: string | null;
          asignado_a: string | null;
          notas: string | null;
          notas_internas: string | null;
          created_at: string;
          accepted_at: string | null;
          ready_at: string | null;
          taken_at: string | null;
          delivered_at: string | null;
          rejected_at: string | null;
          updated_at: string;
          ip_address: string | null;
          user_agent: string | null;
        };
        Insert: Omit<Database['public']['Tables']['pedidos']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['pedidos']['Insert']>;
      };
      clientes: {
        Row: {
          id: string;
          usuario_id: string | null;
          tipo: 'minorista' | 'mayorista';
          ruc: string | null;
          razon_social: string | null;
          nombre_comercial: string;
          direccion: string | null;
          distrito: string | null;
          provincia: string | null;
          departamento: string | null;
          referencia_direccion: string | null;
          telefono: string | null;
          email: string | null;
          contacto_nombre: string | null;
          contacto_cargo: string | null;
          condicion_pago: string;
          credito_limite: number;
          credito_usado: number;
          activo: boolean;
          notas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clientes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clientes']['Insert']>;
      };
      facturas: {
        Row: {
          id: string;
          pedido_id: string | null;
          cliente_id: string;
          numero_factura: string;
          serie: string;
          correlativo: number;
          subtotal: number;
          igv: number;
          total: number;
          estado: 'pending' | 'por_cobrar' | 'pagada' | 'vencida' | 'anulada';
          fecha_emision: string;
          fecha_vencimiento: string;
          fecha_pago: string | null;
          sunat_cdr: string | null;
          sunat_estado: string | null;
          sunat_mensaje: string | null;
          xml_url: string | null;
          pdf_url: string | null;
          emitida_por: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['facturas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['facturas']['Insert']>;
      };
    };
    Views: {
      vista_pedidos_resumen: {
        Row: {
          estado: string;
          tipo_pedido: string;
          total_pedidos: number;
          total_ventas: number;
          ticket_promedio: number;
          primer_pedido: string;
          ultimo_pedido: string;
        };
      };
      vista_stock_alertas: {
        Row: {
          id: string;
          codigo: string;
          nombre: string;
          stock_actual: number;
          stock_minimo: number;
          categoria: string;
          estado_stock: string;
        };
      };
      vista_facturas_vencidas: {
        Row: {
          id: string;
          numero_factura: string;
          total: number;
          fecha_emision: string;
          fecha_vencimiento: string;
          dias_vencido: number;
          cliente: string;
          telefono: string;
          email: string;
        };
      };
    };
    Functions: {
      generar_numero_orden: {
        Returns: string;
      };
    };
  };
};

// Helper para logs de desarrollo
export const logSupabaseInfo = () => {
  if (import.meta.env.DEV) {
    console.log('🗄️  Supabase configurado:', {
      url: supabaseUrl,
      proyecto: supabaseUrl?.split('//')[1]?.split('.')[0],
    });
  }
};

// Ejecutar al cargar
logSupabaseInfo();

export default supabase;
