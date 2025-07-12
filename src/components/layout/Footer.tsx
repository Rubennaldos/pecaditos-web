
import { MapPin, Phone, Mail, Clock, FileText, Users } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 text-white">
      <div className="container mx-auto px-4 py-12">
        
        {/* Contenido principal del footer */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Información de contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Contacto</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="font-medium">Lima, Perú</p>
                  <p className="text-stone-300">Av. Principal 123, San Borja</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>+51 999 999 999</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>hola@pecaditos.pe</span>
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Horarios</span>
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium">Lunes - Viernes</p>
                <p className="text-stone-300">8:00 AM - 8:00 PM</p>
              </div>
              <div>
                <p className="font-medium">Sábados</p>
                <p className="text-stone-300">9:00 AM - 6:00 PM</p>
              </div>
              <div>
                <p className="font-medium">Domingos</p>
                <p className="text-stone-300">10:00 AM - 4:00 PM</p>
              </div>
            </div>
          </div>

          {/* Enlaces importantes */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Información</span>
            </h3>
            <div className="space-y-2 text-sm">
              <a href="#reclamaciones" className="block hover:text-amber-400 transition-colors">
                📋 Libro de Reclamaciones
              </a>
              <a href="#terminos" className="block hover:text-amber-400 transition-colors">
                📄 Términos y Condiciones
              </a>
              <a href="#privacidad" className="block hover:text-amber-400 transition-colors">
                🔒 Política de Privacidad
              </a>
              <a href="#delivery" className="block hover:text-amber-400 transition-colors">
                🚚 Información de Delivery
              </a>
            </div>
          </div>

          {/* Quiénes somos */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Nosotros</span>
            </h3>
            <div className="space-y-3 text-sm">
              <p className="text-stone-300 leading-relaxed">
                Somos una empresa familiar dedicada a crear las galletas integrales más deliciosas del Perú, 
                cuidando tu salud sin sacrificar el sabor.
              </p>
              <a href="#nosotros" className="inline-block text-amber-400 hover:text-amber-300 transition-colors font-medium">
                Conoce nuestra historia →
              </a>
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-stone-700 my-8"></div>

        {/* Copyright y enlaces legales */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm text-stone-400">
              © {currentYear} Pecaditos Integrales. Todos los derechos reservados.
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Hecho con ❤️ en Lima, Perú
            </p>
          </div>

          {/* Enlaces legales adicionales */}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-stone-400">
            <a 
              href="https://www.indecopi.gob.pe/libro-de-reclamaciones" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition-colors"
            >
              INDECOPI
            </a>
            <span>•</span>
            <a href="#politicas" className="hover:text-amber-400 transition-colors">
              Políticas de la empresa
            </a>
            <span>•</span>
            <a href="#certificaciones" className="hover:text-amber-400 transition-colors">
              Certificaciones
            </a>
          </div>
        </div>

        {/* Mensaje especial */}
        <div className="mt-8 text-center p-4 bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-xl border border-amber-800/30">
          <p className="text-amber-200 text-sm italic">
            "Cada galleta es horneada con amor y los mejores ingredientes naturales"
          </p>
        </div>
      </div>
    </footer>
  );
};
