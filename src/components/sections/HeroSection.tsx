
import { useEffect, useState } from 'react';

export const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="container mx-auto px-4 py-8 lg:py-16">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[60vh]">
        
        {/* Lado izquierdo - Logo, eslogan y texto */}
        <div className={`space-y-6 text-center lg:text-left transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          
          {/* Logo grande - centrado en móvil, izquierda en desktop */}
          <div className="flex flex-col items-center lg:items-start space-y-4">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-primary via-primary to-secondary rounded-3xl flex items-center justify-center shadow-warm transform hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-3xl lg:text-4xl">P</span>
            </div>
          </div>

          {/* Eslogan principal */}
          <div className="space-y-3">
            <h1 className="text-4xl lg:text-6xl font-bold text-gradient leading-tight">
              Pecaditos Integrales
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground font-medium">
              Sabor auténtico, salud natural
            </p>
          </div>

          {/* Texto de bienvenida */}
          <div className="space-y-4 max-w-lg">
            <p className="text-lg text-foreground leading-relaxed">
              Descubre nuestras galletas artesanales hechas con ingredientes 100% integrales. 
              Cada bocado es una experiencia única que cuida tu bienestar.
            </p>
            
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                Sin preservantes
              </span>
              <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-medium">
                Ingredientes naturales
              </span>
              <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium">
                Recetas artesanales
              </span>
            </div>
          </div>

          {/* Frase motivacional */}
          <blockquote className="text-muted-foreground italic text-lg border-l-4 border-primary pl-4">
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
