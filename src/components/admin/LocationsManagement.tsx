// src/components/admin/LocationsManagement.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/config/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Edit, Trash2, Plus, Star, StarHalf, StarOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UbigeoSelector from "../UbigeoSelector";

// ---------- Helpers de compresión a DataURL ----------
function dataUrlKB(dataUrl: string) {
  const head = "base64,";
  const i = dataUrl.indexOf(head);
  const base64 = i >= 0 ? dataUrl.slice(i + head.length) : dataUrl;
  const bytes = Math.ceil((base64.length * 3) / 4);
  return bytes / 1024;
}

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await new Promise((res, rej) => {
      img.onload = () => res(null);
      img.onerror = rej;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Comprime a DataURL. Limita el lado mayor y va bajando calidad
 * hasta quedar por debajo de maxKB (o hasta un mínimo razonable).
 */
async function compressToDataUrl(
  file: File,
  {
    maxSizePx = 360, // lado mayor
    quality = 0.8,   // calidad inicial
    maxKB = 200,     // tamaño objetivo aprox
  }: { maxSizePx?: number; quality?: number; maxKB?: number } = {}
): Promise<string> {
  const img = await loadImageFromFile(file);
  let q = quality;
  let target = maxSizePx;

  // Si el navegador soporta WebP lo usamos; si no, JPEG
  const supportsWebP = (() => {
    try {
      const c = document.createElement("canvas");
      return c.toDataURL("image/webp").startsWith("data:image/webp");
    } catch {
      return false;
    }
  })();
  const mime = supportsWebP ? "image/webp" : "image/jpeg";

  while (true) {
    const scale = Math.min(target / Math.max(img.width, img.height), 1);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);

    const dataUrl = canvas.toDataURL(mime, q);
    const kb = dataUrlKB(dataUrl);

    if (kb <= maxKB || (q <= 0.55 && target <= 280)) {
      return dataUrl;
    }
    if (q > 0.55) q -= 0.1; else target -= 40;
  }
}
// ------------------------------------------------------

interface Location {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  mapsUrl: string;
  latitud?: string;
  longitud?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  comentarios?: LocationComment[];
  logoDataUrl?: string; // <-- NUEVO
}

interface LocationComment {
  id: string;
  usuario: string;
  rating: number;
  comentario: string;
  fecha: number;
}

const pageSize = 5;

export const LocationsManagement = () => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [filtered, setFiltered] = useState<Location[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editLocation, setEditLocation] = useState<Location | null>(null);

  const [form, setForm] = useState<Omit<Location, "id" | "comentarios">>({
    nombre: "",
    direccion: "",
    telefono: "",
    mapsUrl: "",
    latitud: "",
    longitud: "",
    departamento: "",
    provincia: "",
    distrito: "",
    logoDataUrl: "", // <-- NUEVO
  });

  const [commentsModal, setCommentsModal] = useState<Location | null>(null);
  const [newComment, setNewComment] = useState({ usuario: "", rating: 5, comentario: "" });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase
        .from('ubicaciones')
        .select('*');
      
      if (error) {
        console.error(error);
        return;
      }

      const arr: Location[] = (data || []).map((loc: any) => ({
        id: loc.id,
        nombre: loc.nombre,
        direccion: loc.direccion,
        telefono: loc.telefono,
        mapsUrl: loc.maps_url || "",
        latitud: loc.latitud?.toString() || "",
        longitud: loc.longitud?.toString() || "",
        departamento: loc.departamento || "",
        provincia: loc.provincia || "",
        distrito: loc.distrito || "",
        logoDataUrl: loc.logo_url || "",
        comentarios: loc.comentarios || [],
      }));
      setLocations(arr);
      setFiltered(arr);
    };

    fetchLocations();

    // Suscripción a cambios
    const subscription = supabase
      .channel('public:ubicaciones')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ubicaciones' }, fetchLocations)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setFiltered(
      locations.filter(
        (l) =>
          l.nombre.toLowerCase().includes(search.toLowerCase()) ||
          l.direccion.toLowerCase().includes(search.toLowerCase()) ||
          l.telefono.includes(search) ||
          (l.departamento && l.departamento.toLowerCase().includes(search.toLowerCase())) ||
          (l.provincia && l.provincia.toLowerCase().includes(search.toLowerCase())) ||
          (l.distrito && l.distrito.toLowerCase().includes(search.toLowerCase()))
      )
    );
    setCurrentPage(1);
  }, [search, locations]);

  const handleOpenModal = (location?: Location) => {
    setEditLocation(location || null);
    setForm(
      location
        ? {
            nombre: location.nombre,
            direccion: location.direccion,
            telefono: location.telefono,
            mapsUrl: location.mapsUrl,
            latitud: location.latitud || "",
            longitud: location.longitud || "",
            departamento: location.departamento || "",
            provincia: location.provincia || "",
            distrito: location.distrito || "",
            logoDataUrl: location.logoDataUrl || "",
          }
        : {
            nombre: "",
            direccion: "",
            telefono: "",
            mapsUrl: "",
            departamento: "",
            provincia: "",
            distrito: "",
            logoDataUrl: "",
          }
    );
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditLocation(null);
    setForm({
      nombre: "",
      direccion: "",
      telefono: "",
      mapsUrl: "",
      latitud: "",
      longitud: "",
      departamento: "",
      provincia: "",
      distrito: "",
      logoDataUrl: "",
    });
  };

  const handleSave = async () => {
    if (
      !form.nombre.trim() ||
      !form.direccion.trim() ||
      !form.telefono.trim() ||
      !form.departamento ||
      !form.provincia ||
      !form.distrito
    ) {
      toast({ title: "Completa todos los campos, incluyendo ubigeo", variant: "destructive" });
      return;
    }
    try {
      const payload = {
        nombre: form.nombre,
        direccion: form.direccion,
        telefono: form.telefono,
        maps_url: form.mapsUrl,
        latitud: form.latitud ? parseFloat(form.latitud) : null,
        longitud: form.longitud ? parseFloat(form.longitud) : null,
        departamento: form.departamento,
        provincia: form.provincia,
        distrito: form.distrito,
        logo_url: form.logoDataUrl,
        tipo: 'sede', // default
        codigo: `LOC-${Date.now()}`, // default
      };

      if (editLocation) {
        const { error } = await supabase
          .from('ubicaciones')
          .update(payload)
          .eq('id', editLocation.id);
        if (error) throw error;
        toast({ title: "Ubicación actualizada" });
      } else {
        const { error } = await supabase
          .from('ubicaciones')
          .insert([payload]);
        if (error) throw error;
        toast({ title: "Ubicación agregada" });
      }
      handleCloseModal();
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error al guardar", description: e.message || "Intenta nuevamente.", variant: "destructive" });
    }
  };

  const handleDelete = async (loc: Location) => {
    if (window.confirm(`¿Seguro de eliminar ${loc.nombre}?`)) {
      const { error } = await supabase
        .from('ubicaciones')
        .delete()
        .eq('id', loc.id);
      if (error) {
        toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Ubicación eliminada", variant: "destructive" });
      }
    }
  };

  const handleUbigeoChange = (data: { departamento: string; provincia: string; distrito: string }) => {
    setForm((f) => ({
      ...f,
      departamento: data.departamento,
      provincia: data.provincia,
      distrito: data.distrito,
    }));
  };

  function paginatedComments(comments: LocationComment[]) {
    const ordered = [...comments].sort((a, b) => b.fecha - a.fecha);
    const start = (currentPage - 1) * pageSize;
    return ordered.slice(start, start + pageSize);
  }
  function pagesCount(comments: LocationComment[]) {
    return Math.ceil((comments?.length || 0) / pageSize);
  }
  function averageRating(comments: LocationComment[] = []) {
    if (!comments.length) return 0;
    return comments.reduce((acc, c) => acc + c.rating, 0) / comments.length;
  }
  function renderStars(stars: number) {
    const full = Math.floor(stars);
    const half = stars % 1 >= 0.5;
    return (
      <span className="flex items-center gap-0.5 text-yellow-500">
        {[...Array(full)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400" />
        ))}
        {half && <StarHalf className="w-4 h-4 fill-yellow-400" />}
        {[...Array(5 - full - (half ? 1 : 0))].map((_, i) => (
          <StarOff key={i} className="w-4 h-4 text-yellow-300" />
        ))}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Gestión de Ubicaciones</h1>
        <p className="text-stone-600 mt-1">Administra clientes y puntos de venta</p>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-2">
        <Input
          placeholder="Buscar ubicación, dirección, teléfono o ubigeo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button className="w-full md:w-auto" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-1" /> Agregar Cliente/Ubicación
        </Button>
      </div>

      {/* LISTADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((loc) => {
          const avg = averageRating(loc.comentarios || []);
          return (
            <Card key={loc.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {loc.logoDataUrl ? (
                    <img src={loc.logoDataUrl} alt={loc.nombre} className="h-6 w-6 rounded object-cover" />
                  ) : (
                    <MapPin className="h-5 w-5" />
                  )}
                  <CardTitle>{loc.nombre}</CardTitle>
                  <Badge variant="outline" className="ml-auto">
                    {loc.telefono}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs mt-2 text-stone-500">{loc.direccion}</div>
                {/* UBIGEO */}
                <div className="flex gap-1 mt-1 text-xs text-stone-400">
                  {loc.departamento && <span>{loc.departamento}</span>}
                  {loc.provincia && <span>› {loc.provincia}</span>}
                  {loc.distrito && <span>› {loc.distrito}</span>}
                </div>
                {(loc.latitud || loc.longitud) && (
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    Coordenadas: {loc.latitud || '0'}, {loc.longitud || '0'}
                  </div>
                )}
                {loc.mapsUrl && (
                  <a
                    href={loc.mapsUrl}
                    className="text-blue-600 text-xs underline mt-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver en Google Maps
                  </a>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(avg)}
                  <span className="text-xs text-stone-500">
                    {avg > 0 ? avg.toFixed(1) : "Sin calificación"} ({loc.comentarios?.length || 0})
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleOpenModal(loc)}>
                    <Edit className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(loc)}
                    className="text-destructive border-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setCommentsModal(loc);
                      setCurrentPage(1);
                    }}
                  >
                    Ver Comentarios
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-stone-400 py-8">No se encontraron ubicaciones</div>
        )}
      </div>

      {/* MODAL AGREGAR/EDITAR */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editLocation ? "Editar Ubicación/Cliente" : "Agregar Ubicación/Cliente"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nombre del cliente/sede"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            />
            <Input
              placeholder="Dirección (ej: Av. Lima 123, piso 2)"
              value={form.direccion}
              onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
            />
            <Input
              placeholder="Teléfono"
              value={form.telefono}
              onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
            />
            <Input
              placeholder="URL Google Maps"
              value={form.mapsUrl}
              onChange={(e) => setForm((f) => ({ ...f, mapsUrl: e.target.value }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Latitud</Label>
                <Input
                  placeholder="-12.046374"
                  value={form.latitud}
                  onChange={(e) => setForm((f) => ({ ...f, latitud: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Longitud</Label>
                <Input
                  placeholder="-77.042793"
                  value={form.longitud}
                  onChange={(e) => setForm((f) => ({ ...f, longitud: e.target.value }))}
                />
              </div>
            </div>

            {/* LOGO / FOTO */}
            <div className="space-y-2">
              <Label>Logo / foto (opcional)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const dataUrl = await compressToDataUrl(f, { maxSizePx: 360, quality: 0.8, maxKB: 200 });
                  setForm((prev) => ({ ...prev, logoDataUrl: dataUrl }));
                }}
              />
              {form.logoDataUrl ? (
                <div className="flex items-center gap-3">
                  <img src={form.logoDataUrl} alt="Logo" className="h-16 w-16 object-cover rounded-md border" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm((prev) => ({ ...prev, logoDataUrl: "" }))}
                  >
                    Quitar logo
                  </Button>
                </div>
              ) : null}
            </div>

            {/* UBIGEO SELECTOR */}
            <UbigeoSelector
              departamento={form.departamento || ""}
              provincia={form.provincia || ""}
              distrito={form.distrito || ""}
              onChange={handleUbigeoChange}
            />

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={handleCloseModal} type="button">
                Cancelar
              </Button>
              <Button onClick={handleSave} type="button">
                {editLocation ? "Actualizar" : "Agregar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* (Comentarios: puedes conservar tu implementación actual aquí) */}
    </div>
  );
};

export default LocationsManagement;
