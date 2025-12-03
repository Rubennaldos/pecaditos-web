/**
 * Logger configurable para el sistema CRM Pecaditos
 * 
 * En desarrollo muestra todos los logs, en producción solo errores críticos.
 * Usa emojis para fácil identificación visual de tipos de log.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Configuración basada en el entorno
const config: LoggerConfig = {
  enabled: import.meta.env.DEV || import.meta.env.VITE_DEBUG_MODE === 'true',
  minLevel: import.meta.env.DEV ? 'debug' : 'warn',
};

const shouldLog = (level: LogLevel): boolean => {
  if (!config.enabled && level !== 'error') return false;
  return LOG_LEVELS[level] >= LOG_LEVELS[config.minLevel];
};

const formatMessage = (emoji: string, prefix: string, message: string): string => {
  return `${emoji} [${prefix}] ${message}`;
};

/**
 * Logger del sistema con soporte para diferentes niveles
 */
export const logger = {
  /**
   * Log de debug - solo visible en desarrollo
   */
  debug: (message: string, ...args: any[]) => {
    if (shouldLog('debug')) {
      console.log(formatMessage('🔍', 'DEBUG', message), ...args);
    }
  },

  /**
   * Log informativo - operaciones exitosas
   */
  info: (message: string, ...args: any[]) => {
    if (shouldLog('info')) {
      console.log(formatMessage('✅', 'INFO', message), ...args);
    }
  },

  /**
   * Log de advertencia - situaciones a revisar
   */
  warn: (message: string, ...args: any[]) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('⚠️', 'WARN', message), ...args);
    }
  },

  /**
   * Log de error - problemas críticos (siempre visible)
   */
  error: (message: string, ...args: any[]) => {
    console.error(formatMessage('❌', 'ERROR', message), ...args);
  },

  /**
   * Log de pedido creado
   */
  orderCreated: (orderNumber: string, orderId: string) => {
    if (shouldLog('info')) {
      console.log(formatMessage('📦', 'PEDIDO', `Creado: ${orderNumber} (ID: ${orderId})`));
    }
  },

  /**
   * Log de cambio de estado de pedido
   */
  orderStatusChanged: (orderId: string, from: string, to: string) => {
    if (shouldLog('info')) {
      console.log(formatMessage('🔄', 'ESTADO', `Pedido ${orderId}: ${from} → ${to}`));
    }
  },

  /**
   * Log de delivery
   */
  delivery: (orderId: string, status: string) => {
    if (shouldLog('info')) {
      console.log(formatMessage('🚚', 'DELIVERY', `${orderId} → ${status}`));
    }
  },

  /**
   * Log de facturación
   */
  billing: (message: string, ...args: any[]) => {
    if (shouldLog('info')) {
      console.log(formatMessage('💰', 'BILLING', message), ...args);
    }
  },

  /**
   * Log de Firebase/Base de datos
   */
  database: (message: string, ...args: any[]) => {
    if (shouldLog('debug')) {
      console.log(formatMessage('🔥', 'FIREBASE', message), ...args);
    }
  },

  /**
   * Log de autenticación
   */
  auth: (message: string, ...args: any[]) => {
    if (shouldLog('info')) {
      console.log(formatMessage('🔐', 'AUTH', message), ...args);
    }
  },
};

export default logger;

