
import { useState } from 'react';
import { Menu, X, Moon, Sun, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useWholesaleAuth } from '@/contexts/WholesaleAuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  // Hooks de autenticación
  const { user: retailUser, logout: retailLogout } = useAuth();
  const { user: wholesaleUser, logout: wholesaleLogout } = useWholesaleAuth();
  const { user: adminUser, logout: adminLogout } = useAdmin();

  // Determinar usuario activo
  const currentUser = adminUser || wholesaleUser || retailUser;
  const userType = adminUser ? 'Admin' : wholesaleUser ? 'Mayorista' : retailUser ? 'Cliente' : null;
  const userName = adminUser?.name || wholesaleUser?.name || retailUser?.name || '';

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

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
    // Para retail user, cuando esté activo: navigate('/catalogo');
    
    setIsMenuOpen(false);
  };

  return (
    <header className="lg:hidden sticky top-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-700">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo móvil */}
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-semibold text-stone-800 dark:text-stone-200">Pecaditos</span>
        </div>

        {/* Controles */}
        <div className="flex items-center space-x-2">
          {/* Indicador de usuario logueado */}
          {currentUser && (
            <div className="hidden sm:flex items-center space-x-2 px-2 py-1 bg-amber-100 dark:bg-amber-900 rounded-full">
              <User className="h-3 w-3 text-amber-600" />
              <span className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                {userType}
              </span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="p-2"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
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
        <div className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 px-4 py-3">
          <nav className="space-y-2">
            {/* Usuario logueado */}
            {currentUser ? (
              <>
                <div className="py-2 px-3 bg-stone-50 dark:bg-stone-800 rounded-lg mb-3">
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                    {userName}
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    {userType}
                  </p>
                </div>
                
                <button 
                  onClick={navigateToProfile}
                  className="block w-full text-left py-2 text-stone-700 dark:text-stone-300 hover:text-amber-600 transition-colors"
                >
                  Mi Panel
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full py-2 text-red-600 hover:text-red-700 transition-colors"
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
                  className="block py-2 text-amber-600 hover:text-amber-700 font-medium transition-colors"
                >
                  Iniciar Sesión
                </button>
              </>
            )}
            
            {/* Enlaces comunes */}
            <hr className="border-stone-200 dark:border-stone-700 my-3" />
            
            <button 
              onClick={() => {
                navigate('/seguimiento');
                setIsMenuOpen(false);
              }}
              className="block py-2 text-stone-700 dark:text-stone-300 hover:text-amber-600 transition-colors"
            >
              Seguimiento de Pedidos
            </button>
            
            <a href="#contacto" className="block py-2 text-stone-700 dark:text-stone-300 hover:text-amber-600 transition-colors">
              Contacto
            </a>
            <a href="#nosotros" className="block py-2 text-stone-700 dark:text-stone-300 hover:text-amber-600 transition-colors">
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

NAVEGACIÓN POR PERFIL:
- Admin -> /admin
- Mayorista -> /mayorista  
- Cliente -> /catalogo (cuando esté activo)

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
