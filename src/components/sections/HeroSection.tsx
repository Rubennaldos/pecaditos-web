import { useEffect, useState } from 'react';

export const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative container mx-auto px-4 py-8 lg:py-16 flex flex-col items-center justify-center">
      {/* Botón Admin en esquina superior izquierda */}
      <div className="absolute top-4 left-4">
        <button 
          onClick={() => window.location.href = '/login?type=admin'} 
          className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition-all duration-200"
        >
          Usuario administrador
        </button>
      </div>

      <div className="flex flex-col items-center space-y-6 w-full">
        {/* Logo centrado y grande */}
        <div className="flex flex-col items-center lg:items-start space-y-4">
          <img
            src="https://images.unsplash.com/photo-1572635196184-84e35138cf62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
            alt="Pecaditos - Galletas Artesanales"
            className="w-32 h-32 lg:w-40 lg:h-40 object-cover rounded-full shadow-xl"
          />
        </div>

        {/* Título principal */}
        <div className="text-center space-y-4 w-full">
          <h1 className={`text-4xl lg:text-6xl font-bold text-gray-900 transition-all duration-1000 ${
            isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
          }`}>
            Bienvenido a <span className="text-amber-600">Pecaditos</span>
          </h1>
          
          <p className={`text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
          }`}>
            Los mejores sabores artesanales, directamente a tu mesa
          </p>
        </div>

        {/* Texto de bienvenida */}
        <div className="space-y-4 max-w-lg text-center">
          <p className="text-lg text-[#473729] leading-relaxed">
            Descubre nuestras galletas artesanales hechas con ingredientes 100% integrales. 
            Cada bocado es una experiencia única que cuida tu bienestar.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-[#f3e5d2] text-[#473729] rounded-full text-sm font-medium">
              Sin preservantes
            </span>
            <span className="px-3 py-1 bg-[#e2dbc9] text-[#473729] rounded-full text-sm font-medium">
              Ingredientes naturales
            </span>
            <span className="px-3 py-1 bg-[#e6e1d7] text-[#473729] rounded-full text-sm font-medium">
              Recetas artesanales
            </span>
          </div>
        </div>

        {/* Frase motivacional */}
        <blockquote className="text-[#a18a6e] italic text-lg border-l-4 border-[#d8c6a2] pl-4 mt-4">
          "Porque cuidarte nunca fue tan delicioso"
        </blockquote>
      </div>
    </section>
  );
};