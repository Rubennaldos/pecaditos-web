import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Phone, Clock, ExternalLink, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * PÁGINA "DÓNDE NOS UBICAMOS" - PUNTOS DE VENTA
 * 
 * Muestra tiendas donde hay productos Pecaditos disponibles.
 * Filtrable por distrito y con opción de búsqueda.
 * 
 * *** MOCK DATA - CAMBIAR POR INTEGRACIÓN CON FIREBASE ***
 * Para conectar con Realtime Database:
 * 1. Reemplazar mockStores con firebase query
 * 2. Cambiar handleSearch por función que consulte Firebase
 * 3. Actualizar filtro de distritos dinámicamente
 * 4. Agregar geolocalización real
 */

// *** MOCK DATA - REEMPLAZAR CON FIREBASE REALTIME DATABASE ***
const mockStores = [
  {
    id: 1,
    name: "Minimarket El Amanecer",
    address: "Av. Los Olivos 123, Urb. El Pinar",
    district: "San Isidro",
    phone: "+51 999 111 222",
    hours: "Lun-Dom: 7:00 AM - 11:00 PM",
    coordinates: { lat: -12.0464, lng: -77.0428 },
    category: "Minimarket"
  },
  {
    id: 2,
    name: "Distribuidora La Esquina",
    address: "Jr. Las Flores 456, 2do piso",
    district: "Miraflores",
    phone: "+51 999 333 444",
    hours: "Lun-Sab: 8:00 AM - 6:00 PM",
    coordinates: { lat: -12.1196, lng: -77.0282 },
    category: "Distribuidora"
  },
  {
    id: 3,
    name: "Bodega Don Carlos",
    address: "Calle Santa Rosa 789",
    district: "San Borja",
    phone: "+51 999 555 666",
    hours: "Lun-Dom: 6:00 AM - 12:00 AM",
    coordinates: { lat: -12.1004, lng: -76.9967 },
    category: "Bodega"
  },
  {
    id: 4,
    name: "Supermercado Fresh Market",
    address: "Av. El Sol 321, Mall Plaza Norte",
    district: "Independencia",
    phone: "+51 999 777 888",
    hours: "Lun-Dom: 9:00 AM - 10:00 PM",
    coordinates: { lat: -11.9892, lng: -77.0561 },
    category: "Supermercado"
  },
  {
    id: 5,
    name: "Tienda Orgánica Vida Sana",
    address: "Av. Conquistadores 654",
    district: "San Isidro",
    phone: "+51 999 999 000",
    hours: "Lun-Vie: 9:00 AM - 7:00 PM, Sab: 9:00 AM - 5:00 PM",
    coordinates: { lat: -12.0608, lng: -77.0349 },
    category: "Tienda Especializada"
  },
  {
    id: 6,
    name: "Mayorista Los Andes",
    address: "Av. Industrial 987, Zona Industrial",
    district: "Ate",
    phone: "+51 999 111 333",
    hours: "Lun-Vie: 7:00 AM - 5:00 PM",
    coordinates: { lat: -12.0432, lng: -76.9478 },
    category: "Mayorista"
  }
];

// *** LISTA DE DISTRITOS - CAMBIAR SEGÚN COBERTURA REAL ***
const limeDistricts = [
  "Todos los distritos",
  "San Isidro", "Miraflores", "San Borja", "Surco", "La Molina",
  "Independencia", "Los Olivos", "San Martín de Porres", "Ate",
  "Santa Anita", "El Agustino", "Breña", "Jesús María",
  "Magdalena", "Pueblo Libre", "Lince", "Cercado de Lima"
];

const WhereToFindUs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('Todos los distritos');
  const [filteredStores, setFilteredStores] = useState(mockStores);

  // *** FUNCIÓN DE FILTRADO - INTEGRAR CON FIREBASE ***
  const handleSearch = () => {
    let filtered = mockStores;

    // Filtrar por distrito
    if (selectedDistrict !== 'Todos los distritos') {
      filtered = filtered.filter(store => store.district === selectedDistrict);
    }

    // Filtrar por búsqueda de texto
    if (searchTerm.trim()) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStores(filtered);
  };

  // Buscar automáticamente cuando cambian los filtros
  useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedDistrict]);

  // *** FUNCIÓN PARA ABRIR GOOGLE MAPS ***
  const openInGoogleMaps = (store: any) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${store.coordinates.lat},${store.coordinates.lng}&query_place_id=${encodeURIComponent(store.name + ' ' + store.address)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-stone-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-800">Dónde nos ubicamos</h1>
                <p className="text-stone-600">Encuentra nuestros productos cerca de ti</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="text-amber-600 border-amber-300 hover:bg-amber-50"
            >
              ← Volver al inicio
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <Input
                  placeholder="Buscar por nombre, dirección o tipo de tienda..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-stone-50 border-stone-200 focus:border-amber-300"
                />
              </div>
            </div>
            <div className="md:w-64">
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="h-12 bg-stone-50 border-stone-200 focus:border-amber-300">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por distrito" />
                </SelectTrigger>
                <SelectContent>
                  {limeDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <Card key={store.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-amber-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-stone-800 mb-1">
                      {store.name}
                    </CardTitle>
                    <CardDescription className="text-stone-600">
                      {store.category} • {store.district}
                    </CardDescription>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Dirección */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-stone-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-stone-600">{store.address}</p>
                </div>

                {/* Teléfono */}
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-stone-400 flex-shrink-0" />
                  <a href={`tel:${store.phone}`} className="text-sm text-blue-600 hover:text-blue-700">
                    {store.phone}
                  </a>
                </div>

                {/* Horarios */}
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-stone-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-stone-600">{store.hours}</p>
                </div>

                {/* Botón de Google Maps */}
                <Button
                  onClick={() => openInGoogleMaps(store)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ir a Google Maps
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sin resultados */}
        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-medium text-stone-800 mb-2">
              No se encontraron tiendas
            </h3>
            <p className="text-stone-600 mb-4">
              Intenta con otros términos de búsqueda o distrito
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedDistrict('Todos los distritos');
              }}
              variant="outline"
              className="text-amber-600 border-amber-300 hover:bg-amber-50"
            >
              Limpiar filtros
            </Button>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-amber-800 mb-3">
            ¿No encuentras una tienda cerca?
          </h3>
          <p className="text-amber-700 mb-4">
            Contáctanos y te ayudamos a encontrar el punto de venta más cercano a tu ubicación.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => window.open('https://wa.me/51999888777?text=Hola,%20necesito%20encontrar%20un%20punto%20de%20venta%20cerca%20de%20mi%20ubicación', '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Phone className="h-4 w-4 mr-2" />
              WhatsApp: +51 999 888 777
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="text-amber-600 border-amber-300 hover:bg-amber-50"
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhereToFindUs;

/*
INSTRUCCIONES PARA INTEGRACIÓN CON FIREBASE:

1. ESTRUCTURA DE DATOS EN FIREBASE REALTIME DATABASE:
   /stores/{storeId}: {
     name: string,
     address: string,
     district: string,
     phone: string,
     hours: string,
     coordinates: { lat: number, lng: number },
     category: string,
     active: boolean
   }

2. PARA CONECTAR CON FIREBASE:
   - Reemplazar mockStores con useQuery de @tanstack/react-query
   - Crear función fetchStores() que consulte Firebase
   - Actualizar handleSearch() para usar datos reales
   - Agregar loading states y error handling

3. FUNCIONALIDADES A AGREGAR:
   - Geolocalización del usuario
   - Cálculo de distancias
   - Mapa interactivo con Google Maps API
   - Favoritos de tiendas
   - Reviews y calificaciones

4. PERSONALIZACIÓN:
   - Cambiar limeDistricts según cobertura real
   - Actualizar estilos y colores según brand
   - Agregar más filtros (categoría, horarios, etc.)
   - Integrar con WhatsApp Business API

5. ADMIN PANEL:
   - Permitir al admin agregar/editar/eliminar tiendas
   - Panel de gestión de puntos de venta
   - Estadísticas de consultas por zona
   - Exportar datos para análisis

DATOS MOCK INCLUIDOS:
- 6 tiendas de ejemplo en diferentes distritos
- Diferentes categorías (minimarket, distribuidora, bodega, etc.)
- Coordenadas reales de Lima para Google Maps
- Horarios de atención variados
*/
