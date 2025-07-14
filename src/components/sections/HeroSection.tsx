import { useEffect, useState } from 'react';

export const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="container mx-auto px-4 py-8 lg:py-16 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-6 w-full">
        {/* Logo centrado y grande */}
        <div className="flex flex-col items-center space-y-4">
          {/* Cambia el src de abajo por la ruta de tu logo cuando puedas subirlo */}
          <img
            src="https://placehold.co/128x128?text=Logo" // ← REEMPLAZA ESTA LÍNEA por tu logo, ejemplo: "/logo-pecaditos.png"
            alt="Logo Pecaditos"
            className="w-28 h-28 lg:w-36 lg:h-36 rounded-3xl shadow-lg object-cover"
          />
        </div>

        {/* Eslogan principal */}
        <div className="space-y-2 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-[#473729] leading-tight">
            Pecaditos Integrales
          </h1>
          <p className="text-xl lg:text-2xl text-[#bfa780] font-medium">
            Sabor auténtico, salud natural
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
