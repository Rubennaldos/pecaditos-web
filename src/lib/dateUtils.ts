/**
 * Utilidades de fecha en español para el CRM Pecaditos
 * 
 * Funciones para formatear fechas de forma amigable y localizada.
 */

/**
 * Formatea una fecha de forma relativa ("Hace 5 minutos", "Ayer", etc.)
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'Hace un momento';
  }

  if (diffMins < 60) {
    return diffMins === 1 ? 'Hace 1 minuto' : `Hace ${diffMins} minutos`;
  }

  if (diffHours < 24) {
    return diffHours === 1 ? 'Hace 1 hora' : `Hace ${diffHours} horas`;
  }

  if (diffDays === 1) {
    return 'Ayer';
  }

  if (diffDays < 7) {
    return `Hace ${diffDays} días`;
  }

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? 'Hace 1 semana' : `Hace ${weeks} semanas`;
  }

  // Para fechas más antiguas, mostrar la fecha completa
  return formatDate(then);
}

/**
 * Formatea una fecha en español (ej: "15 de diciembre de 2025")
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formatea fecha corta (ej: "15 dic")
 */
export function formatDateShort(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Formatea fecha y hora (ej: "15 dic, 14:30")
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formatea solo la hora (ej: "14:30")
 */
export function formatTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Retorna el nombre del día de la semana
 */
export function getDayName(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', { weekday: 'long' });
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date: Date | string | number): boolean {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

/**
 * Verifica si una fecha es ayer
 */
export function isYesterday(date: Date | string | number): boolean {
  const d = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
}

/**
 * Verifica si una fecha está vencida
 */
export function isOverdue(date: Date | string | number): boolean {
  const d = new Date(date);
  const now = new Date();
  return d < now;
}

/**
 * Calcula días hasta una fecha (negativo si ya pasó)
 */
export function daysUntil(date: Date | string | number): number {
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formatea un rango de fechas
 */
export function formatDateRange(start: Date | string, end: Date | string): string {
  const s = new Date(start);
  const e = new Date(end);
  
  // Mismo día
  if (s.toDateString() === e.toDateString()) {
    return `${formatDate(s)}, ${formatTime(s)} - ${formatTime(e)}`;
  }
  
  // Mismo mes
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} - ${e.getDate()} de ${s.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
  }
  
  // Diferente mes
  return `${formatDateShort(s)} - ${formatDateShort(e)}`;
}

/**
 * Obtiene el inicio del día (00:00:00)
 */
export function startOfDay(date: Date | string | number = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Obtiene el fin del día (23:59:59)
 */
export function endOfDay(date: Date | string | number = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

