
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const FAQSection = () => {
  const faqs = [
    {
      question: '¿Cuál es el tiempo de entrega?',
      answer: 'El tiempo de entrega es de 24 a 48 horas en Lima Metropolitana. Para pedidos realizados antes de las 2 PM, la entrega puede ser el mismo día en distritos cercanos.'
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos tarjetas de débito y crédito Visa/Mastercard, transferencias bancarias, Yape, Plin y pago en efectivo contra entrega (sujeto a disponibilidad).'
    },
    {
      question: '¿Hacen delivery a todos los distritos?',
      answer: 'Hacemos delivery a los principales distritos de Lima. Algunos distritos con zonas peligrosas requieren confirmación previa por WhatsApp para coordinar la entrega.'
    },
    {
      question: '¿Las galletas contienen preservantes?',
      answer: 'No, todas nuestras galletas son libres de preservantes artificiales. Utilizamos ingredientes naturales y métodos de conservación tradicionales para mantener la frescura.'
    },
    {
      question: '¿Tienen descuentos por cantidad?',
      answer: 'Sí! Ofrecemos 5% de descuento por 6 unidades y 10% de descuento por 12 unidades o más. Los descuentos se aplican automáticamente en tu carrito.'
    },
    {
      question: '¿Puedo hacer pedidos personalizados?',
      answer: 'Sí, ofrecemos cotizaciones para pedidos especiales, sabores personalizados o grandes cantidades para eventos. Contáctanos para más información.'
    }
  ];

  return (
    <section className="py-12 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-display font-semibold text-foreground mb-2">
            Preguntas Frecuentes
          </h2>
          <p className="text-muted-foreground">
            Encuentra respuestas a las dudas más comunes
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left hover:text-amber-600">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contacto adicional */}
        <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
          <h3 className="font-semibold text-foreground mb-2">¿No encuentras lo que buscas?</h3>
          <p className="text-muted-foreground mb-4">
            Nuestro equipo está listo para ayudarte
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/51999888777"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              📱 WhatsApp
            </a>
            <a
              href="mailto:info@pecaditos.com"
              className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ✉️ Email
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
