import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Clock, ExternalLink, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ref, onValue } from "firebase/database";
import { db } from "@/config/firebase";

type Store = {
  id: string;
  name: string;
  address: string;
  district?: string;
  phone?: string;
  hours?: string;
  mapsUrl?: string;
  coordinates?: { lat: number; lng: number };
  logoDataUrl?: string;
  active?: boolean;
};

const DondeNosUbicamos = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("Todos los distritos");
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const r = ref(db, "locations");
    const off = onValue(
      r,
      (snapshot) => {
        const data = snapshot.val() || {};
        const arr: Store[] = Object.entries<any>(data).map(([id, v]) => ({
          id,
          name: v?.nombre || "",
          address: v?.direccion || "",
          district: v?.distrito || v?.provincia || v?.departamento || "",
          phone: v?.telefono || "",
          hours: v?.hours || "",
          mapsUrl: v?.mapsUrl || "",
          coordinates: v?.coordinates || (v?.lat && v?.lng ? { lat: v.lat, lng: v.lng } : undefined),
          logoDataUrl: v?.logoDataUrl || "",
          active: v?.active !== false
        }));
        setStores(arr.filter((s) => s.active !== false));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => off();
  }, []);

  const allDistricts = useMemo(() => {
    const set = new Set(stores.map((s) => s.district).filter(Boolean) as string[]);
    return ["Todos los distritos", ...Array.from(set).sort()];
  }, [stores]);

  const filteredStores = useMemo(() => {
    let filtered = stores;
    if (selectedDistrict !== "Todos los distritos") {
      filtered = filtered.filter((store) => (store.district || "") === selectedDistrict);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (store) =>
          (store.name || "").toLowerCase().includes(q) ||
          (store.address || "").toLowerCase().includes(q) ||
          (store.district || "").toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [stores, searchTerm, selectedDistrict]);

  const openInGoogleMaps = (store: Store) => {
    if (store.mapsUrl) {
      window.open(store.mapsUrl, "_blank");
      return;
    }
    if (store.coordinates) {
      const url = `https://www.google.com/maps/search/?api=1&query=${store.coordinates.lat},${store.coordinates.lng}&query_place_id=${encodeURIComponent(
        `${store.name} ${store.address}`
      )}`;
      window.open(url, "_blank");
      return;
    }
    const q = encodeURIComponent(`${store.address || ""} ${store.district || ""}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-stone-50">
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
              onClick={() => navigate("/")}
              className="text-amber-600 border-amber-300 hover:bg-amber-50"
            >
              ← Volver al inicio
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <Input
                  placeholder="Buscar por nombre, dirección o distrito..."
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
                  {allDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading && <div className="text-center py-12 text-stone-600">Cargando puntos de venta...</div>}

        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <Card
                key={store.id}
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-amber-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-stone-800 mb-1">{store.name}</CardTitle>
                      <CardDescription className="text-stone-600">{store.district}</CardDescription>
                    </div>
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-400 to-purple-500 border">
                      {store.logoDataUrl ? (
                        <img src={store.logoDataUrl} alt={store.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-stone-400 mt-1 flex-shrink-0" />
                    <p className="text-sm text-stone-600">{store.address}</p>
                  </div>
                  {store.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-stone-400 flex-shrink-0" />
                      <a href={`tel:${store.phone}`} className="text-sm text-blue-600 hover:text-blue-700">
                        {store.phone}
                      </a>
                    </div>
                  )}
                  {store.hours && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 text-stone-400 mt-1 flex-shrink-0" />
                      <p className="text-sm text-stone-600">{store.hours}</p>
                    </div>
                  )}
                  <Button onClick={() => openInGoogleMaps(store)} className="w-full bg-green-600 hover:bg-green-700 text-white mt-4">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ir a Google Maps
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredStores.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-medium text-stone-800 mb-2">No se encontraron tiendas</h3>
            <p className="text-stone-600 mb-4">Intenta con otros términos de búsqueda o distrito</p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedDistrict("Todos los distritos");
              }}
              variant="outline"
              className="text-amber-600 border-amber-300 hover:bg-amber-50"
            >
              Limpiar filtros
            </Button>
          </div>
        )}

        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-amber-800 mb-3">¿No encuentras una tienda cerca?</h3>
          <p className="text-amber-700 mb-4">Contáctanos y te ayudamos a encontrar el punto de venta más cercano a tu ubicación.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() =>
                window.open(
                  "https://wa.me/51999888777?text=Hola,%20necesito%20encontrar%20un%20punto%20de%20venta%20cerca%20de%20mi%20ubicación",
                  "_blank"
                )
              }
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Phone className="h-4 w-4 mr-2" />
              WhatsApp: +51 999 888 777
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="text-amber-600 border-amber-300 hover:bg-amber-50">
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DondeNosUbicamos;
