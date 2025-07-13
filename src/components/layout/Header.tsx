
import { useState } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useWholesaleAuth } from '@/contexts/WholesaleAuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Hooks de autenticación
  const { user: retailUser, userData: retailUserData, logout: retailLogout } = useAuth();
  const { user: wholesaleUser, logout: wholesaleLogout } = useWholesaleAuth();
  const { user: adminUser, logout: adminLogout } = useAdmin();

  // Determinar usuario activo y obtener el nombre correctamente
  const currentUser = adminUser || wholesaleUser || retailUser;
  const userType = adminUser ? 'Admin' : wholesaleUser ? 'Mayorista' : retailUser ? 'Cliente' : null;
  
  // Obtener el nombre del usuario según su tipo
  const userName = adminUser?.name || 
                   wholesaleUser?.name || 
                   retailUserData?.name || 
                   retailUser?.displayName || 
                   retailUser?.email || 
                   '';

  const handleLogout = async () => {
    try {
      // Cerrar sesión según el tipo de usuario
      if (adminUser) await adminLogout();
      else if (wholesaleUser) await wholesaleLogout();
      else if (retailUser) await retailLogout();
      
      // Redirigir al inicio
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const navigateToProfile = () => {
    // Redirigir según el tipo de usuario
    if (adminUser) navigate('/admin');
    else if (wholesaleUser) navigate('/mayorista');
    // Para retail user, redirigir a login ya que el catálogo está oculto
    else if (retailUser) navigate('/login');
    
    setIsMenuOpen(false);
  };

  return (
    <header className="lg:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo móvil */}
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-semibold text-foreground">Pecaditos</span>
        </div>

        {/* Controles */}
        <div className="flex items-center space-x-2">
          {/* Indicador de usuario logueado */}
          {currentUser && (
            <div className="hidden sm:flex items-center space-x-2 px-2 py-1 bg-secondary rounded-full">
              <User className="h-3 w-3 text-secondary-foreground" />
              <span className="text-xs text-secondary-foreground font-medium">
                {userType}
              </span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {isMenuOpen && (
        <div className="bg-background border-t border-border px-4 py-3">
          <nav className="space-y-2">
            {/* Usuario logueado */}
            {currentUser ? (
              <>
                <div className="py-2 px-3 bg-muted rounded-lg mb-3">
                  <p className="text-sm font-medium text-foreground">
                    {userName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userType}
                  </p>
                </div>
                
                <button 
                  onClick={navigateToProfile}
                  className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
                >
                  Mi Panel
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full py-2 text-destructive hover:text-destructive/80 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              /* Usuario no logueado */
              <>
                <button 
                  onClick={() => {
                    navigate('/login');
                    setIsMenuOpen(false);
                  }}
                  className="block py-2 text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Iniciar Sesión
                </button>
              </>
            )}
            
            {/* Enlaces comunes */}
            <hr className="border-border my-3" />
            
            <button 
              onClick={() => {
                navigate('/seguimiento');
                setIsMenuOpen(false);
              }}
              className="block py-2 text-foreground hover:text-primary transition-colors"
            >
              Seguimiento de Pedidos
            </button>
            
            <a href="#contacto" className="block py-2 text-foreground hover:text-primary transition-colors">
              Contacto
            </a>
            <a href="#nosotros" className="block py-2 text-foreground hover:text-primary transition-colors">
              Quiénes somos
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

/*
FUNCIONALIDAD DEL HEADER UNIFICADO:

DETECCIÓN AUTOMÁTICA DE USUARIO:
- Detecta automáticamente el tipo de usuario logueado
- Muestra información del usuario en el menú móvil
- Indicador visual del tipo de usuario
- Obtiene el nombre correctamente desde userData o displayName de Firebase

NAVEGACIÓN POR PERFIL:
- Admin -> /admin
- Mayorista -> /mayorista  
- Cliente -> /login (catálogo minorista oculto)

FUNCIONES:
- Logout unificado para todos los tipos de usuario
- Navegación a página de perfil correspondiente
- Acceso directo a seguimiento de pedidos
- Toggle de modo oscuro

PERSONALIZACIÓN:
- Modificar rutas de navegación según necesidades
- Cambiar colores del indicador de usuario
- Agregar más enlaces en el menú móvil
- Personalizar comportamiento de logout
*/
