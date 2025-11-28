/**
 * COMPONENTE DE NAVEGACIÓN INTELIGENTE
 * Botón "Volver al Panel" que funciona en TODOS los módulos
 * 
 * Características:
 * - Detección automática del contexto del usuario
 * - Navegación inteligente con fallbacks
 * - Accesible desde cualquier módulo o modal
 * - Z-index alto para estar siempre visible
 * - Responsive: oculta texto en móviles
 */

import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface BackToPanelButtonProps {
  /** Ruta personalizada (opcional). Si no se provee, se detecta automáticamente */
  to?: string;
  /** Etiqueta del botón (opcional) */
  label?: string;
  /** Variante del botón */
  variant?: 'default' | 'ghost' | 'outline';
  /** Mostrar ícono de home en lugar de flecha */
  showHome?: boolean;
}

export const BackToPanelButton = ({ 
  to, 
  label,
  variant = 'ghost',
  showHome = false,
}: BackToPanelButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Intentar obtener perfil, si falla usar null (para contextos sin auth)
  let perfil = null;
  try {
    const auth = useAuth();
    perfil = auth?.perfil;
  } catch (error) {
    // useAuth no disponible en este contexto, continuar sin perfil
    console.debug('BackToPanelButton: useAuth no disponible, usando navegación básica');
  }

  /**
   * LÓGICA INTELIGENTE DE NAVEGACIÓN
   * Determina automáticamente a dónde volver según:
   * 1. Parámetro 'to' si se provee (prioridad)
   * 2. Contexto de la página actual
   * 3. Rol del usuario (admin, producción, delivery, etc.)
   * 4. Fallback al panel principal
   */
  const getBackRoute = (): string => {
    // Si se provee una ruta explícita, usarla
    if (to) return to;

    // Obtener la ruta actual
    const currentPath = location.pathname;

    // Mapeo inteligente de rutas
    const routeMap: Record<string, string> = {
      // Módulos de pedidos
      '/pedidos': '/panel-control',
      '/orders': '/panel-control',
      
      // Módulos de producción
      '/produccion': '/panel-control',
      '/production': '/panel-control',
      
      // Módulos de delivery
      '/delivery': '/panel-control',
      '/despacho': '/panel-control',
      
      // Módulos de facturación
      '/billing': '/panel-control',
      '/facturacion': '/panel-control',
      
      // Módulos de logística
      '/logistics': '/panel-control',
      '/logistica': '/panel-control',
      
      // Módulos de catálogo
      '/catalogo': '/panel-control',
      '/catalog': '/panel-control',
      
      // Módulos de tracking
      '/tracking': '/panel-control',
      '/seguimiento': '/panel-control',
      
      // Portal mayorista
      '/mayorista': '/panel-control',
      '/wholesale': '/panel-control',
    };

    // Buscar mapeo exacto
    if (routeMap[currentPath]) {
      return routeMap[currentPath];
    }

    // Buscar mapeo parcial (para rutas con parámetros)
    for (const [key, value] of Object.entries(routeMap)) {
      if (currentPath.startsWith(key)) {
        return value;
      }
    }

    // Fallback basado en rol del usuario (si está disponible)
    const userRole = perfil?.rol || perfil?.role;
    if (userRole) {
      const roleMap: Record<string, string> = {
        admin: '/panel-control',
        adminGeneral: '/panel-control',
        production: '/produccion',
        delivery: '/delivery',
        billing: '/billing',
        logistics: '/logistica',
      };
      
      if (roleMap[userRole]) {
        return roleMap[userRole];
      }
    }

    // Fallback final: siempre al panel principal
    return '/panel-control';
  };

  /**
   * Maneja el click con navegación segura
   * Previene errores si el router no está disponible
   */
  const handleClick = () => {
    try {
      const route = getBackRoute();
      navigate(route);
    } catch (error) {
      console.error('Error al navegar:', error);
      // Fallback a navegación nativa del navegador
      window.location.href = '/panel-control';
    }
  };

  // Determinar etiqueta inteligente
  const buttonLabel = label || (showHome ? 'Inicio' : 'Volver al Panel');
  const Icon = showHome ? Home : ArrowLeft;

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleClick}
      className="fixed top-4 left-4 z-[100] bg-white/95 backdrop-blur-sm hover:bg-white border border-stone-200 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
      title={buttonLabel}
    >
      <Icon className="h-4 w-4 mr-2" />
      <span className="hidden sm:inline font-medium">{buttonLabel}</span>
    </Button>
  );
};
