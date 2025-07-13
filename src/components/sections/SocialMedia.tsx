
import { useState } from 'react';
import { MessageCircle, Instagram, Facebook } from 'lucide-react';

export const SocialMedia = () => {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: 'https://wa.me/51999999999?text=Hola, me interesa conocer más sobre Pecaditos Integrales',
      color: 'from-green-400 to-green-600',
      description: 'Consultas y pedidos'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com/pecaditos_integrales',
      color: 'from-pink-400 via-purple-500 to-indigo-500',
      description: 'Fotos y novedades'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://facebook.com/pecaditos.integrales',
      color: 'from-blue-500 to-blue-700',
      description: 'Comunidad y eventos'
    },
    {
      name: 'TikTok',
      icon: () => (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
        </svg>
      ),
      url: 'https://tiktok.com/@pecaditos_integrales',
      color: 'from-primary to-secondary',
      description: 'Videos y recetas'
    }
  ];

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center space-y-8">
        
        {/* Título */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-foreground">
            Síguenos en nuestras redes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mantente conectado para recibir promociones exclusivas, nuevos sabores y contenido delicioso
          </p>
        </div>

        {/* Iconos de redes sociales - centrados */}
        <div className="flex flex-wrap justify-center gap-6">
          {socialLinks.map((social) => {
            const IconComponent = social.icon;
            return (
              <div 
                key={social.name}
                className="group"
                onMouseEnter={() => setHoveredSocial(social.name)}
                onMouseLeave={() => setHoveredSocial(null)}
              >
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    block p-4 rounded-2xl transition-all duration-300 transform
                    bg-gradient-to-br ${social.color} hover-glow
                    hover:scale-110 hover:shadow-xl group-hover:-rotate-3
                    shadow-lg
                  `}
                >
                  {/* Ícono */}
                  <div className="text-white">
                    <IconComponent />
                  </div>
                </a>
                
                {/* Tooltip/descripción */}
                <div className={`
                  mt-3 transition-all duration-300 transform
                  ${hoveredSocial === social.name ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                `}>
                  <h4 className="font-semibold text-foreground">
                    {social.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {social.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
