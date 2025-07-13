
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Navigation, 
  Search,
  Star,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * PÁGINA: DONDE NOS UBICAMOS
 * 
 * Muestra puntos de venta donde se encuentran productos Pecaditos
 * Filtrable por distrito, con información completa de cada tienda
 * 
 * MOCK DATA EDITABLE:
 * - Para agregar/quitar tiendas: editar mockStores línea 50-120
 * - Para cambiar distritos: editar districts línea 45
 * - Para conectar con Firebase: reemplazar mockStores con consulta real
 * 
 * FUNCIONALIDADES:
 * - Filtro por distrito
 * - Búsqueda por nombre de tienda
 * - Enlace directo a Google Maps
 * - Información completa (horarios, contacto, etc.)
 */

const WhereToFindUs = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('todos');

  // DISTRITOS DISPONIBLES - EDITAR AQUÍ para agregar/quitar distritos
  const districts = [
    'todos', 'San Borja', 'Miraflores', 'San Isidro', 'Surco', 'La Molina', 
    'Barranco', 'Chorrillos', 'San Miguel', 'Pueblo Libre', 'Jesús María',
    'Lince', 'Magdalena', 'Breña', 'Lima Cercado'
  ];

  // MOCK DATA - TIENDAS DONDE SE VENDEN PRODUCTOS PECADITOS
  // EDITAR AQUÍ para agregar/modificar tiendas
  // CONECTAR CON FIREBASE: Reemplazar con consulta a Realtime Database
  const mockStores = [
    {
      id: 'ST001',
      name: 'SuperMarket San Borja',
      address: 'Av. Javier Prado Este 1234',
      district: 'San Borja',
      phone: '+51 1 234-5678',
      hours: 'L-D: 8:00 AM - 10:00 PM',
      rating: 4.5,
      description: 'Supermercado con amplia variedad de productos saludables',
      hasParking: true,
      hasDelivery: true,
      mapUrl: 'https://goo.gl/maps/ejemplo1',
      coordinates: { lat: -12.0887, lng: -77.0026 }
    },
    {
      id: 'ST002', 
      name: 'Minimarket Los Olivos',
      address: 'Jr. Los Comerciantes 456',
      district: 'Miraflores',
      phone: '+51 1 345-6789',
      hours: 'L-S: 9:00 AM - 9:00 PM, D: 10:00 AM - 8:00 PM',
      rating: 4.2,
      description: 'Minimarket familiar con productos selectos',
      hasParking: false,
      hasDelivery: false,
      mapUrl: 'https://goo.gl/maps/ejemplo2',
      coordinates: { lat: -12.1197, lng: -77.0289 }
    },
    {
      id: 'ST003',
      name: 'Bodega Doña María',
      address: 'Calle Las Flores 789',
      district: 'San Isidro',
      phone: '+51 1 456-7890',
      hours: 'L-D: 7:00 AM - 11:00 PM',
      rating: 4.8,
      description: 'Bodega tradicional con productos de calidad',
      hasParking: true,
      hasDelivery: true,
      mapUrl: 'https://goo.gl/maps/ejemplo3',
      coordinates: { lat: -12.0969, lng: -77.0370 }
    },
    {
      id: 'ST004',
      name: 'Mercado Orgánico Surco',
      address: 'Av. Benavides 1011',
      district: 'Surco',
      phone: '+51 1 567-8901',
      hours: 'L-S: 8:00 AM - 8:00 PM',
      rating: 4.6,
      description: 'Especializado en productos orgánicos y saludables',
      hasParking: true,
      hasDelivery: false,
      mapUrl: 'https://goo.gl/maps/ejemplo4',
      coordinates: { lat: -12.1395, lng: -77.0041 }
    },
    {
      id: 'ST005',
      name: 'Tienda Saludable La Molina',
      address: 'Av. La Universidad 2020',
      district: 'La Molina',
      phone: '+51 1 678-9012',
      hours: 'L-V: 9:00 AM - 7:00 PM, S: 10:00 AM - 6:00 PM',
      rating: 4.4,
      description: 'Productos naturales y snacks saludables',
      hasParking: true,
      hasDelivery: true,
      mapUrl: 'https://goo.gl/maps/ejemplo5',
      coordinates: { lat: -12.0683, lng: -76.9420 }
    },
    {
      id: 'ST006',
      name: 'Minimarket Express Barranco',
      address: 'Jr. Unión 303',
      district: 'Barranco',
      phone: '+51 1 789-0123',
      hours: 'L-D: 8:00 AM - 10:00 PM',
      rating: 4.1,
      description: 'Minimarket moderno en el corazón de Barranco',
      hasParking: false,
      hasDelivery: true,
      mapUrl: 'https://goo.gl/maps/ejemplo6',
      coordinates: { lat: -12.1408, lng: -77.0205 }
    }
  ];

  // Filtrar tiendas según búsqueda y distrito
  const filteredStores = mockStores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = selectedDistrict === 'todos' || store.district === selectedDistrict;
    return matchesSearch && matchesDistrict;
  });

  const handleGoToMaps = (mapUrl: string, storeName: string) => {
    // En producción, usar coordenadas reales para generar URL de Google Maps
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeName)}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
              <div className="h-6 w-px bg-stone-300" />
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <h1 className="text-xl font-bold text-stone-800">Puntos de Venta</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Título y descripción */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
            ¿Dónde nos ubicamos?
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto">
            Encuentra los puntos de venta más cercanos donde puedes adquirir 
            nuestros productos Pecaditos Integrales
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar tiendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    placeholder="Buscar por nombre de tienda o dirección..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {districts.map(district => (
                  <Button 
                    key={district}
                    variant={selectedDistrict === district ? 'default' : 'outline'}
                    onClick={() => setSelectedDistrict(district)}
                    size="sm"
                    className="capitalize"
                  >
                    {district}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <Card key={store.id} className="hover:shadow-lg transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-stone-800 mb-2">
                      {store.name}
                    </CardTitle>
                    <Badge variant="outline" className="mb-2">{store.district}</Badge>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-stone-600">
                        {store.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-stone-600">
                  {store.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-stone-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-stone-600">{store.address}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-stone-400 flex-shrink-0" />
                    <p className="text-sm text-stone-600">{store.phone}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-stone-400 flex-shrink-0" />
                    <p className="text-sm text-stone-600">{store.hours}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {store.hasParking && (
                    <Badge variant="secondary" className="text-xs">🚗 Estacionamiento</Badge>
                  )}
                  {store.hasDelivery && (
                    <Badge variant="secondary" className="text-xs">🚚 Delivery</Badge>
                  )}
                </div>
                
                <Button 
                  onClick={() => handleGoToMaps(store.mapUrl, store.name)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Ver en Google Maps
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-stone-400" />
            </div>
            <h3 className="text-xl font-semibold text-stone-800 mb-2">
              No se encontraron tiendas
            </h3>
            <p className="text-stone-600 mb-4">
              Intenta con otros términos de búsqueda o selecciona un distrito diferente
            </p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setSelectedDistrict('todos');
              }}
              variant="outline"
            >
              Limpiar filtros
            </Button>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-12 text-center">
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                ¿No encuentras una tienda cerca?
              </h3>
              <p className="text-amber-700 mb-4">
                Contáctanos y te ayudaremos a encontrar el punto de venta más cercano a tu ubicación
              </p>
              <a 
                href="https://wa.me/51999888777?text=Hola, necesito información sobre puntos de venta cercanos"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                📱 WhatsApp: +51 999 888 777
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WhereToFindUs;

/*
INSTRUCCIONES PARA EDITAR:

1. AGREGAR/MODIFICAR TIENDAS:
   - Editar mockStores línea 50-120
   - Incluir: id, name, address, district, phone, hours, rating, description, hasParking, hasDelivery, mapUrl, coordinates

2. CAMBIAR DISTRITOS:
   - Modificar array districts línea 45
   - Agregar/quitar distritos según cobertura

3. CONECTAR CON FIREBASE:
   - Reemplazar mockStores con consulta a Realtime Database
   - Estructura sugerida: /stores/{storeId}
   - Campos: name, address, district, phone, hours, etc.

4. PERSONALIZAR MAPAS:
   - Cambiar función handleGoToMaps línea 130
   - Usar coordinates reales para mejor precisión
   - Integrar Google Maps API si es necesario

5. MODIFICAR DISEÑO:
   - Cambiar colores en líneas de className
   - Personalizar cards y botones
   - Ajustar animaciones y efectos hover

FUNCIONALIDADES IMPLEMENTADAS:
✅ Filtro por distrito
✅ Búsqueda por nombre/dirección  
✅ Enlace a Google Maps
✅ Información completa de tiendas
✅ Badges para servicios (parking, delivery)
✅ Rating con estrellas
✅ Diseño responsive y elegante

LISTO PARA FIREBASE:
- Mock data estructurado
- Consultas preparadas
- Sistema escalable
*/
