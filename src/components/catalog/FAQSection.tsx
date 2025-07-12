
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FAQSectionProps {
  isMayorista?: boolean;
}

export const FAQSection = ({ isMayorista = false }: FAQSectionProps) => {
  const faqs = isMayorista ? [
    {
      question: "¿Cuál es el pedido mínimo para mayoristas?",
      answer: "El pedido mínimo es de S/ 300. Esto nos permite ofrecerte precios especiales y mantener la calidad del servicio."
    },
    {
      question: "¿Por qué debo comprar en múltiplos de 6?",
      answer: "Nuestros productos se fabrican y empacan en presentaciones de 6 unidades para mantener la frescura y optimizar la logística de entrega."
    },
    {
      question: "¿Cómo funcionan los descuentos por volumen?",
      answer: "Ofrecemos descuentos automáticos: 10% (6-11 unidades), 15% (12-23 unidades), 25% (24+ unidades). Los descuentos se aplican automáticamente en tu carrito."
    },
    {
      question: "¿Ofrecen crédito comercial?",
      answer: "Sí, para mayoristas establecidos ofrecemos facilidades de pago. Contacta a tu asesor comercial para conocer las condiciones."
    },
    {
      question: "¿Hacen entregas a domicilio?",
      answer: "Sí, entregamos directamente a tu negocio. Los pedidos mayores a S/ 500 tienen delivery gratuito en Lima Metropolitana."
    },
    {
      question: "¿Puedo personalizar los productos?",
      answer: "Para pedidos especiales y personalizaciones, usa el botón 'Solicitar Cotización' en tu dashboard o contacta a tu asesor comercial."
    }
  ] : [
    {
      question: "¿Los productos son realmente artesanales?",
      answer: "Sí, todos nuestros productos son elaborados a mano siguiendo recetas tradicionales con ingredientes naturales seleccionados."
    },
    {
      question: "¿Hacen entregas a domicilio?",
      answer: "Sí, realizamos entregas en Lima Metropolitana. El costo de delivery varía según la zona y se calcula automáticamente al finalizar tu pedido."
    },
    {
      question: "¿Cuál es el tiempo de entrega?",
      answer: "Las entregas se realizan dentro de las 24-48 horas hábiles. Para pedidos especiales o grandes cantidades, el tiempo puede extenderse."
    },
    {
      question: "¿Los productos contienen gluten?",
      answer: "Algunos de nuestros productos contienen gluten. Revisa la descripción de cada producto o contáctanos para información específica sobre alérgenos."
    },
    {
      question: "¿Puedo cancelar mi pedido?",
      answer: "Puedes cancelar tu pedido dentro de las 2 horas siguientes a la confirmación. Pasado este tiempo, contacta nuestro servicio al cliente."
    },
    {
      question: "¿Ofrecen descuentos por cantidad?",
      answer: "Sí, ofrecemos promociones especiales para pedidos grandes. También tenemos un programa de clientes frecuentes con beneficios exclusivos."
    }
  ];

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
            {isMayorista ? 'Preguntas Frecuentes - Mayoristas' : 'Preguntas Frecuentes'}
          </h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card rounded-lg border border-border"
              >
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-muted/50 transition-colors">
                  <span className="font-semibold text-card-foreground">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              {isMayorista 
                ? '¿No encuentras la respuesta que buscas? Nuestro equipo comercial está aquí para ayudarte.'
                : '¿No encuentras la respuesta que buscas? Estamos aquí para ayudarte.'
              }
            </p>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Contactar WhatsApp
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
