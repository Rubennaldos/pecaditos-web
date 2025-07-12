
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * SECCIÓN DE PREGUNTAS FRECUENTES
 * 
 * Accordion con información sobre:
 * - Condiciones de envío
 * - Métodos de pago
 * - Soporte al cliente
 * - Políticas de devolución
 * 
 * PARA PERSONALIZAR:
 * - Modificar preguntas y respuestas
 * - Agregar más categorías de FAQ
 * - Conectar con sistema de soporte
 */

export const FAQSection = () => {
  return (
    <section className="py-12 border-t border-stone-200 mt-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display font-bold text-stone-800 mb-2">
            Preguntas Frecuentes
          </h2>
          <p className="text-stone-600">
            Todo lo que necesitas saber sobre nuestros productos y servicios
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {/* Envíos */}
          <AccordionItem value="shipping" className="border border-stone-200 rounded-lg px-4">
            <AccordionTrigger className="text-left font-semibold text-stone-800">
              🚚 ¿Cuáles son las condiciones de envío?
            </AccordionTrigger>
            <AccordionContent className="text-stone-600 pt-2">
              <div className="space-y-3">
                <p>
                  <strong>Zonas de delivery:</strong> San Borja, Miraflores, San Isidro, Surco, 
                  La Molina, Barranco, Chorrillos, Magdalena, Pueblo Libre.
                </p>
                <p>
                  <strong>Tiempo de entrega:</strong> 24-48 horas en días laborables.
                </p>
                <p>
                  <strong>Costo de envío:</strong> Varía según la distancia. No hay delivery gratuito.
                </p>
                <p>
                  <strong>Zonas especiales:</strong> Algunas zonas de ciertos distritos requieren 
                  confirmación previa por WhatsApp debido a restricciones de acceso.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Pagos */}
          <AccordionItem value="payment" className="border border-stone-200 rounded-lg px-4">
            <AccordionTrigger className="text-left font-semibold text-stone-800">
              💳 ¿Qué métodos de pago aceptan?
            </AccordionTrigger>
            <AccordionContent className="text-stone-600 pt-2">
              <div className="space-y-3">
                <p>
                  <strong>Pago online:</strong> Tarjetas de crédito/débito a través de Culqi 
                  (Visa, Mastercard, American Express).
                </p>
                <p>
                  <strong>Transferencias:</strong> BCP, Interbank, BBVA, Scotiabank.
                </p>
                <p>
                  <strong>Pago contra entrega:</strong> Efectivo exacto o tarjeta con POS móvil.
                </p>
                <p>
                  <strong>Comprobantes:</strong> Emitimos boletas y facturas electrónicas.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Productos */}
          <AccordionItem value="products" className="border border-stone-200 rounded-lg px-4">
            <AccordionTrigger className="text-left font-semibold text-stone-800">
              🍪 ¿Qué ingredientes usan en sus galletas?
            </AccordionTrigger>
            <AccordionContent className="text-stone-600 pt-2">
              <div className="space-y-3">
                <p>
                  <strong>100% naturales:</strong> Sin preservantes artificiales, colorantes 
                  ni saborizantes químicos.
                </p>
                <p>
                  <strong>Ingredientes principales:</strong> Harina integral, miel de abeja, 
                  aceite de coco, ingredientes peruanos como quinua y frutos nativos.
                </p>
                <p>
                  <strong>Vida útil:</strong> 15-20 días desde la fecha de elaboración.
                </p>
                <p>
                  <strong>Conservación:</strong> Lugar fresco y seco, en recipiente hermético.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Descuentos */}
          <AccordionItem value="discounts" className="border border-stone-200 rounded-lg px-4">
            <AccordionTrigger className="text-left font-semibold text-stone-800">
              🏷️ ¿Cómo funcionan los descuentos por cantidad?
            </AccordionTrigger>
            <AccordionContent className="text-stone-600 pt-2">
              <div className="space-y-3">
                <p>
                  <strong>6+ unidades:</strong> 5% de descuento automático sobre el total.
                </p>
                <p>
                  <strong>12+ unidades:</strong> 10% de descuento automático sobre el total.
                </p>
                <p>
                  <strong>Pedido mínimo:</strong> S/ 70 para procesar la compra.
                </p>
                <p>
                  <strong>Códigos promocionales:</strong> Ocasionalmente enviamos códigos 
                  especiales por redes sociales.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Soporte */}
          <AccordionItem value="support" className="border border-stone-200 rounded-lg px-4">
            <AccordionTrigger className="text-left font-semibold text-stone-800">
              🙋‍♀️ ¿Cómo puedo contactar al soporte?
            </AccordionTrigger>
            <AccordionContent className="text-stone-600 pt-2">
              <div className="space-y-3">
                <p>
                  <strong>WhatsApp:</strong> +51 999 123 456 (Lun-Sáb 8am-8pm)
                </p>
                <p>
                  <strong>Email:</strong> contacto@pecaditosintegrales.com.pe
                </p>
                <p>
                  <strong>Instagram:</strong> @pecaditosintegrales (respuesta rápida)
                </p>
                <p>
                  <strong>Tiempo de respuesta:</strong> Máximo 2 horas en horario laboral.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Devoluciones */}
          <AccordionItem value="returns" className="border border-stone-200 rounded-lg px-4">
            <AccordionTrigger className="text-left font-semibold text-stone-800">
              🔄 ¿Cuál es su política de devoluciones?
            </AccordionTrigger>
            <AccordionContent className="text-stone-600 pt-2">
              <div className="space-y-3">
                <p>
                  <strong>Productos defectuosos:</strong> Reemplazo inmediato sin costo adicional.
                </p>
                <p>
                  <strong>Error en el pedido:</strong> Corrección sin cargo si es responsabilidad nuestra.
                </p>
                <p>
                  <strong>Cambio de opinión:</strong> No aceptamos devoluciones por productos alimenticios.
                </p>
                <p>
                  <strong>Reclamos:</strong> Contactar dentro de las 24 horas posteriores a la entrega.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Contacto adicional */}
        <div className="text-center mt-8 p-6 bg-stone-50 rounded-lg">
          <h3 className="font-semibold text-stone-800 mb-2">
            ¿No encontraste respuesta a tu pregunta?
          </h3>
          <p className="text-stone-600 text-sm mb-4">
            Nuestro equipo está listo para ayudarte
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm">
              WhatsApp: +51 999 123 456
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm">
              Email: contacto@pecaditosintegrales.com.pe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
