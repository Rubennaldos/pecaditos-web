import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/config/firebase"; // Cambia el path si tu config es otra
import * as lucide from "lucide-react"; // import all icons
import { Button } from "@/components/ui/button";

export const Footer = () => {
  const [footerSections, setFooterSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const footerRef = ref(db, "footer/sections");
    return onValue(footerRef, (snap) => {
      setFooterSections(snap.val() || []);
      setLoading(false);
    });
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white pt-12">
      <div className="container mx-auto px-4 pb-8">
        {/* Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading && (
            <div className="text-stone-300 col-span-4 text-center py-8">
              Cargando footer...
            </div>
          )}
          {!loading &&
            footerSections.map((section, idx) => (
              <div className="space-y-4" key={idx}>
                {section.title && (
                  <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                    {section.icon && lucide[section.icon] && (
                      <span>
                        {lucide[section.icon]({
                          size: 20,
                          className: "inline-block",
                        })}
                      </span>
                    )}
                    <span>{section.title}</span>
                  </h3>
                )}

                <div className="space-y-2 text-sm">
                  {section.items &&
                    section.items.map((item: any, j: number) => (
                      <FooterItem item={item} key={j} />
                    ))}
                  {(!section.items || section.items.length === 0) && (
                    <span className="text-stone-500">Sin contenido</span>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Divider */}
        <div className="border-t border-stone-700 my-8"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm text-stone-400">
              © {currentYear} Pecaditos Integrales®. Todos los derechos reservados.
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Hecho con ❤️ en Lima, Perú
            </p>
          </div>
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
        <div className="mt-8 text-center p-4 bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-xl border border-amber-800/30">
          <p className="text-amber-200 text-sm italic">
            "Un sueño hecho galleta"
          </p>
        </div>
      </div>
    </footer>
  );
};

// --- ITEM DEL FOOTER DINÁMICO ---
function FooterItem({ item }: { item: any }) {
  const Icon = item.icon && lucide[item.icon] ? lucide[item.icon] : null;

  // Selecciona el render según el tipo
  switch (item.type) {
    case "link":
      return (
        <a
          href={item.value}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-amber-400 transition-colors"
        >
          {Icon && <Icon size={16} className="text-amber-400" />}
          <span>{item.label || item.value}</span>
        </a>
      );
    case "email":
      return (
        <a
          href={`mailto:${item.value}`}
          className="flex items-center gap-2 hover:text-amber-400 transition-colors"
        >
          {Icon && <Icon size={16} className="text-amber-400" />}
          <span>{item.label || item.value}</span>
        </a>
      );
    case "phone":
      return (
        <a
          href={`tel:${item.value}`}
          className="flex items-center gap-2 hover:text-amber-400 transition-colors"
        >
          {Icon && <Icon size={16} className="text-amber-400" />}
          <span>{item.label || item.value}</span>
        </a>
      );
    default:
      return (
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-amber-400" />}
          <span>{item.label || item.value}</span>
        </div>
      );
  }
}
