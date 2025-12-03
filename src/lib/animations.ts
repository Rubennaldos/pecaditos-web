/**
 * Clases de animación reutilizables para el CRM Pecaditos
 * 
 * Usa estas clases en componentes para añadir animaciones consistentes.
 * Todas las animaciones usan Tailwind CSS.
 */

/**
 * Animaciones de entrada (aparecer)
 */
export const fadeIn = {
  /** Fade in simple */
  base: 'animate-in fade-in duration-300',
  /** Fade in desde arriba */
  fromTop: 'animate-in fade-in slide-in-from-top-4 duration-300',
  /** Fade in desde abajo */
  fromBottom: 'animate-in fade-in slide-in-from-bottom-4 duration-300',
  /** Fade in desde la izquierda */
  fromLeft: 'animate-in fade-in slide-in-from-left-4 duration-300',
  /** Fade in desde la derecha */
  fromRight: 'animate-in fade-in slide-in-from-right-4 duration-300',
  /** Zoom in */
  zoom: 'animate-in fade-in zoom-in-95 duration-300',
};

/**
 * Animaciones de salida (desaparecer)
 */
export const fadeOut = {
  /** Fade out simple */
  base: 'animate-out fade-out duration-200',
  /** Fade out hacia arriba */
  toTop: 'animate-out fade-out slide-out-to-top-4 duration-200',
  /** Fade out hacia abajo */
  toBottom: 'animate-out fade-out slide-out-to-bottom-4 duration-200',
  /** Zoom out */
  zoom: 'animate-out fade-out zoom-out-95 duration-200',
};

/**
 * Animaciones de hover para cards
 */
export const cardHover = {
  /** Elevación suave */
  lift: 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
  /** Escala suave */
  scale: 'transition-transform duration-200 hover:scale-[1.02]',
  /** Borde brillante */
  glow: 'transition-shadow duration-200 hover:shadow-lg hover:shadow-primary/20',
  /** Combinación completa */
  full: 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50',
};

/**
 * Animaciones para botones
 */
export const buttonAnimation = {
  /** Click suave */
  press: 'active:scale-95 transition-transform duration-100',
  /** Brillo al hover */
  shine: 'relative overflow-hidden after:absolute after:inset-0 after:bg-white/10 after:translate-x-[-100%] hover:after:translate-x-[100%] after:transition-transform after:duration-500',
};

/**
 * Animaciones de estado
 */
export const stateAnimations = {
  /** Pulso para alertas */
  pulse: 'animate-pulse',
  /** Rebote para notificaciones */
  bounce: 'animate-bounce',
  /** Spin para loading */
  spin: 'animate-spin',
  /** Ping para badges */
  ping: 'animate-ping',
};

/**
 * Genera clases de delay para animaciones escalonadas
 * @param index - Índice del elemento
 * @param baseDelay - Delay base en ms (default 50)
 */
export function staggerDelay(index: number, baseDelay: number = 50): string {
  const delay = index * baseDelay;
  return `animation-delay: ${delay}ms; opacity: 0; animation-fill-mode: forwards;`;
}

/**
 * Genera clases para animación de lista escalonada
 */
export function getStaggerClass(index: number): string {
  const delays = [
    'delay-0',
    'delay-75',
    'delay-100',
    'delay-150',
    'delay-200',
    'delay-300',
    'delay-500',
    'delay-700',
  ];
  return delays[Math.min(index, delays.length - 1)] || '';
}

/**
 * Clases para transiciones de página
 */
export const pageTransition = {
  enter: 'animate-in fade-in slide-in-from-right-4 duration-300',
  exit: 'animate-out fade-out slide-out-to-left-4 duration-200',
};

/**
 * Clases para modales
 */
export const modalAnimation = {
  overlay: {
    enter: 'animate-in fade-in duration-200',
    exit: 'animate-out fade-out duration-150',
  },
  content: {
    enter: 'animate-in fade-in zoom-in-95 duration-200',
    exit: 'animate-out fade-out zoom-out-95 duration-150',
  },
};

