
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export const HeroSection = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <section className="container mx-auto px-4 py-8 lg:py-16">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[60vh]">
        
        {/* Lado izquierdo - Logo, eslogan y texto */}
        <div className={`space-y-6 text-center lg:text-left transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          
          {/* Logo grande */}
          <div className="flex flex-col items-center lg:items-start space-y-4">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-3xl lg:text-4xl">P</span>
            </div>
            
            {/* Toggle modo oscuro - solo desktop */}
            <div className="hidden lg:block">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Eslogan principal */}
          <div className="space-y-3">
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent leading-tight">
              Pecaditos Integrales
            </h1>
            <p className="text-xl lg:text-2xl text-stone-600 dark:text-stone-300 font-medium">
              Sabor auténtico, salud natural
            </p>
          </div>

          {/* Texto de bienvenida */}
          <div className="space-y-4 max-w-lg">
            <p className="text-lg text-stone-700 dark:text-stone-300 leading-relaxed">
              Descubre nuestras galletas artesanales hechas con ingredientes 100% integrales. 
              Cada bocado es una experiencia única que cuida tu bienestar.
            </p>
            
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                Sin preservantes
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                Ingredientes naturales
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
                Recetas artesanales
              </span>
            </div>
          </div>

          {/* Frase motivacional */}
          <blockquote className="text-stone-600 dark:text-stone-400 italic text-lg border-l-4 border-amber-400 pl-4">
            "Porque cuidarte nunca fue tan delicioso"
          </blockquote>
        </div>

        {/* Lado derecho estará vacío en esta sección, las cards van después */}
        <div className="hidden lg:block">
          {/* Espacio reservado para balance visual */}
        </div>
      </div>
    </section>
  );
};
