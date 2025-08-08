// src/components/sections/HeroSection.tsx
import { useEffect, useState } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { db } from '@/config/firebase';

type Hero = {
  brandName?: string;
  subtitle?: string;
  description?: string;
  slogan?: string;
  logo?: string; // puede ser data URL (base64) o URL normal
};

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hero, setHero] = useState<Hero | null>(null);

  useEffect(() => {
    setIsVisible(true);

    // Lee landing/hero en tiempo real (solo lectura pública)
    const unsubscribe = onValue(ref(db, 'landing/hero'), async (snap) => {
      const data = snap.val() as Hero | null;

      if (!data) {
        // Respaldo desde /empresa si no hay landing/hero
        try {
          const empresaSnap = await get(ref(db, 'empresa'));
          const e = empresaSnap.val() || {};
          setHero({
            brandName: e.name || e.businessName || '',
            subtitle: e.welcomeMessage || '',
            description: e.description || '',
            slogan: e.slogan || '',
            logo: e.logo || e.logoUrl || '',
          });
        } catch {
          setHero(null);
        }
      } else {
        setHero(data);
      }
    });

    return () => unsubscribe();
  }, []);

  const brandName = hero?.brandName || '';
  const logoSrc = hero?.logo || '';
  const subtitle = hero?.subtitle || '';
  const description = hero?.description || '';
  const slogan = hero?.slogan || '';

  return (
    <section className="relative container mx-auto px-4 py-8 lg:py-16 flex flex-col items-center justify-center">
      <div className="absolute top-4 left-4">
        <button
          onClick={() => (window.location.href = '/login?type=admin')}
          className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition-all duration-200"
        >
          Usuario administrador
        </button>
      </div>

      <div className="flex flex-col items-center space-y-6 w-full">
        {logoSrc ? (
          <div className="flex flex-col items-center lg:items-start space-y-4">
            <img
              src={logoSrc}
              alt={brandName ? `${brandName} - Logo` : 'Logo'}
              className="w-32 h-32 lg:w-40 lg:h-40 object-cover rounded-full shadow-xl"
            />
          </div>
        ) : null}

        <div className="text-center space-y-4 w-full">
          <h1
            className={`text-4xl lg:text-6xl font-bold text-gray-900 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Bienvenido a <span className="text-amber-600">{brandName}</span>
          </h1>

          {subtitle ? (
            <p
              className={`text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto transition-all duration-1000 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        {description ? (
          <div className="space-y-4 max-w-lg text-center">
            <p className="text-lg text-[#473729] leading-relaxed">{description}</p>
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
        ) : null}

        {slogan ? (
          <blockquote className="text-[#a18a6e] italic text-lg border-l-4 border-[#d8c6a2] pl-4 mt-4">
            “{slogan}”
          </blockquote>
        ) : null}
      </div>
    </section>
  );
};

export default HeroSection;
