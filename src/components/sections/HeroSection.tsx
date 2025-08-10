// src/components/sections/HeroSection.tsx
import { useEffect, useState } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../../config/firebase';

type Hero = {
  brandName?: string;
  subtitle?: string;
  description?: string;
  slogan?: string;
  // Puede ser dataURL (base64) o URL normal
  logo?: string;
};

async function ensureAnon() {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch {
      // ignoramos si ya hay sesión o cualquier detalle menor
    }
  }
}

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hero, setHero] = useState<Hero | null>(null);

  useEffect(() => {
    setIsVisible(true);

    let unsubscribe = () => {};

    (async () => {
      // Necesario porque tus reglas piden auth != null
      await ensureAnon();

      // Escuchar /hero en tiempo real
      unsubscribe = onValue(ref(db, 'hero'), async (snap) => {
        const data = (snap.exists() ? (snap.val() as Hero) : null);

        if (!data) {
          // Fallback opcional desde /empresa
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
    })();

    return () => unsubscribe();
  }, []);

  const brandName = hero?.brandName || 'Pecaditos';
  const logoSrc = hero?.logo || '';
  const subtitle = hero?.subtitle || 'Los mejores sabores artesanales, directamente a tu mesa';
  const description = hero?.description || '';
  const slogan = hero?.slogan || '';

  return (
    <section className="relative container mx-auto px-4 py-8 lg:py-16 flex flex-col items-center justify-center">
      {/* Botón Admin */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => (window.location.href = '/login?type=admin')}
          className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition-all duration-200"
        >
          Usuario administrador
        </button>
      </div>

      <div className="flex flex-col items-center space-y-6 w-full">
        {/* Logo */}
        {logoSrc ? (
          <div className="flex flex-col items-center space-y-4">
            <img
              src={logoSrc}
              alt={brandName ? `${brandName} - Logo` : 'Logo'}
              className="w-32 h-32 lg:w-40 lg:h-40 object-cover rounded-full shadow-xl"
            />
          </div>
        ) : null}

        {/* Título y subtítulo */}
        <div className="text-center space-y-4 w-full">
          <h1
            className={`text-4xl lg:text-6xl font-bold text-gray-900 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Bienvenido a <span className="text-amber-600">{brandName}</span>
          </h1>

          {subtitle && (
            <p
              className={`text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto transition-all duration-1000 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Descripción + chips */}
        {description && (
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
        )}

        {/* Slogan */}
        {slogan && (
          <blockquote className="text-[#a18a6e] italic text-lg border-l-4 border-[#d8c6a2] pl-4 mt-4">
            “{slogan}”
          </blockquote>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
