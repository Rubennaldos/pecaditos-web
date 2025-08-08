import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { ref, onValue, set, push, update, remove } from "firebase/database";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  Pencil,
  Trash2,
  ClipboardList,
  Share2,
  FileDown,
  Truck,
  ShoppingBag,
  Download,
  Users2,
  FolderPlus,
  Warehouse,
  Snowflake,
  Plus,
} from "lucide-react";
import clsx from "clsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/* =========================
   Unidades y helpers
   ========================= */
type UnitDef = { code: string; label: string; factor: number }; // factor a unidad base

function toBase(qty: number, unit: UnitDef) {
  return qty * unit.factor;
}
function fromBase(qtyBase: number, unit: UnitDef) {
  return qtyBase / unit.factor;
}
function findUnit(units: UnitDef[], code: string): UnitDef {
  return units.find((u) => u.code === code) || units[0];
}

// Por compatibilidad: si el producto sólo tiene "unidad" (kg/unidad), generamos unidades por defecto
function defaultUnitsFor(unidad: "kg" | "unidad"): { baseUnit: string; units: UnitDef[]; defaultDisplayUnit: string } {
  if (unidad === "kg") {
    return {
      baseUnit: "kg",
      defaultDisplayUnit: "kg",
      units: [
        { code: "kg", label: "kg", factor: 1 },
        { code: "bag1", label: "Bolsa 1 kg", factor: 1 },
        { code: "sack25", label: "Saco 25 kg", factor: 25 },
        { code: "sack50", label: "Saco 50 kg", factor: 50 },
      ],
    };
  }
  // "unidad"
  return {
    baseUnit: "unid",
    defaultDisplayUnit: "unid",
    units: [
      { code: "unid", label: "Unidad", factor: 1 },
      { code: "pack10", label: "Pack x10", factor: 10 },
      { code: "pack20", label: "Pack x20", factor: 20 },
    ],
  };
}

/* =========================
   TIPOS
   ========================= */
type Producto = {
  id: string;
  nombre: string;
  categoria: string;
  almacen: string;
  stock: number; // SIEMPRE guardado en unidad base
  min: number;   // en unidad base
  max: number;   // en unidad base
  refrigeracion: boolean;
  unidad: "unidad" | "kg"; // compatibilidad con tus datos actuales
  proveedores: string[];

  // nuevos (opcionales en DB, calculados si no existen)
  baseUnit?: string;
  units?: UnitDef[];
  defaultDisplayUnit?: string;
};

type Categoria = { id: string; nombre: string };
type Almacen = { id: string; nombre: string };
type Proveedor = { id: string; nombre: string };

type Movimiento = {
  id: string;
  productoId: string;
  producto: string;
  fecha: number;
  cantidad: number; // diferencia aplicada (en base)
  tipo: "entrada" | "salida" | "ajuste";
  user: string;
  stockAntes: number;
  stockDespues: number;
  detalle?: string;

  // nuevos (opcionales)
  unidadOriginal?: string;   // ej. "sack25"
  cantidadBase?: number;     // dif en base (redundante con "cantidad" pero útil para reportes)
  cantidadOriginal?: number; // dif en la unidad original
};

/* =========================
   EXCEL util
   ========================= */
function exportTableToExcel(tableId: string, filename = "Export.xlsx") {
  const table = document.getElementById(tableId);
  if (!table) return;
  const html = table.outerHTML.replace(/ /g, "%20");
  const url = "data:application/vnd.ms-excel," + encodeURIComponent(html);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* =========================
   WhatsApp DEMO
   ========================= */
async function sendWhatsAppAlert(producto: Producto) {
  toast({
    title: "¡Alerta WhatsApp!",
    description: `Se enviaría alerta de stock bajo para: ${producto.nombre}`,
  });
}

/* =========================
   TABS
   ========================= */
const TABS = [
  { id: "vista", label: "Vista General" },
  { id: "ordenes", label: "Orden de Compra" },
  { id: "historial", label: "Historial" },
  { id: "config", label: "Configuración" },
];

const userName = "admin";

/* =========================
   MÓDULO
   ========================= */
export default function LogisticsModule() {
  // --- STATES ---
  const [tab, setTab] = useState("vista");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);

  // Edición de stock (valor mostrado en la UNIDAD SELECCIONADA)
  const [editStock, setEditStock] = useState<{ [id: string]: number }>({});
  const [stockEditMode, setStockEditMode] = useState<{ [id: string]: boolean }>({});
  const [unitByProduct, setUnitByProduct] = useState<{ [id: string]: string }>({}); // unidad seleccionada por producto

  // Modal nuevo producto
  const [showAddModal, setShowAddModal] = useState(false);

  // Forms
  const [newProduct, setNewProduct] = useState({
    nombre: "",
    categoria: "",
    almacen: "",
    min: 0,
    max: 0,
    refrigeracion: false,
    unidad: "unidad" as "unidad" | "kg",
    proveedores: [] as string[],
    stock: 0,
  });
  const [editProduct, setEditProduct] = useState<Producto | null>(null);
  const [newCategoria, setNewCategoria] = useState("");
  const [editCategoria, setEditCategoria] = useState<Categoria | null>(null);
  const [newAlmacen, setNewAlmacen] = useState("");
  const [editAlmacen, setEditAlmacen] = useState<Almacen | null>(null);
  const [newProveedor, setNewProveedor] = useState("");
  const [editProveedor, setEditProveedor] = useState<Proveedor | null>(null);

  // --- LOADERS ---
  useEffect(() => {
    onValue(ref(db, "productos"), (snap) => {
      const data = snap.val() || {};
      const arr: Producto[] = Object.entries(data).map(([id, d]: any) => {
        // compatibilidad: si no tiene units/baseUnit, generarlos desde "unidad"
        const hasUnits = Array.isArray(d.units) && d.units.length > 0;
        const cfg = hasUnits
          ? {
              baseUnit: d.baseUnit || (d.unidad === "kg" ? "kg" : "unid"),
              units: d.units as UnitDef[],
              defaultDisplayUnit: d.defaultDisplayUnit || (d.unidad === "kg" ? "kg" : "unid"),
            }
          : defaultUnitsFor(d.unidad || "unidad");

        return {
          ...d,
          id,
          proveedores: d.proveedores || [],
          baseUnit: cfg.baseUnit,
          units: cfg.units,
          defaultDisplayUnit: cfg.defaultDisplayUnit,
        } as Producto;
      });

      setProductos(arr);

      // Inicializar unidad seleccionada/ediciones para cada producto
      setUnitByProduct((prev) => {
        const next = { ...prev };
        arr.forEach((p) => {
          if (!next[p.id]) next[p.id] = p.defaultDisplayUnit || (p.units?.[0]?.code ?? "unid");
        });
        return next;
      });

      setEditStock((prev) => {
        const next = { ...prev };
        arr.forEach((p) => {
          const unit = findUnit(p.units || defaultUnitsFor(p.unidad).units, unitByProduct[p.id] || (p.defaultDisplayUnit || p.units?.[0]?.code));
          const displayed = fromBase(p.stock, unit);
          if (prev[p.id] === undefined) next[p.id] = Number(displayed.toFixed(3));
        });
        return next;
      });
    });

    onValue(ref(db, "categorias"), (snap) => {
      const data = snap.val() || {};
      setCategorias(Object.entries(data).map(([id, d]: any) => ({ id, ...d })));
    });
    onValue(ref(db, "almacenes"), (snap) => {
      const data = snap.val() || {};
      setAlmacenes(Object.entries(data).map(([id, d]: any) => ({ id, ...d })));
    });
    onValue(ref(db, "proveedores"), (snap) => {
      const data = snap.val() || {};
      setProveedores(Object.entries(data).map(([id, d]: any) => ({ id, ...d })));
    });
    onValue(ref(db, "movimientos"), (snap) => {
      const data = snap.val() || {};
      setMovimientos(
        Object.entries(data)
          .map(([id, d]: any) => ({ ...d, id }))
          .sort((a, b) => b.fecha - a.fecha)
      );
    });
  }, []);

  /* =========================
     HANDLERS CRUD
     ========================= */
  // Categorías
  const handleCreateCategoria = async () => {
    if (!newCategoria.trim()) return;
    const refCat = push(ref(db, "categorias"));
    await set(refCat, { nombre: newCategoria.trim() });
    setNewCategoria("");
    toast({ title: "Categoría agregada" });
  };
  const handleUpdateCategoria = async () => {
    if (!editCategoria?.nombre.trim()) return;
    await update(ref(db, `categorias/${editCategoria.id}`), { nombre: editCategoria.nombre });
    setEditCategoria(null);
    toast({ title: "Categoría editada" });
  };
  const handleDeleteCategoria = async (cat: Categoria) => {
    if (!window.confirm(`¿Seguro que quieres eliminar la categoría "${cat.nombre}"?`)) return;
    await remove(ref(db, `categorias/${cat.id}`));
    toast({ title: "Categoría eliminada" });
  };

  // Almacenes
  const handleCreateAlmacen = async () => {
    if (!newAlmacen.trim()) return;
    const refAlm = push(ref(db, "almacenes"));
    await set(refAlm, { nombre: newAlmacen.trim() });
    setNewAlmacen("");
    toast({ title: "Almacén agregado" });
  };
  const handleUpdateAlmacen = async () => {
    if (!editAlmacen?.nombre.trim()) return;
    await update(ref(db, `almacenes/${editAlmacen.id}`), { nombre: editAlmacen.nombre });
    setEditAlmacen(null);
    toast({ title: "Almacén editado" });
  };
  const handleDeleteAlmacen = async (alm: Almacen) => {
    if (!window.confirm(`¿Seguro que quieres eliminar el almacén "${alm.nombre}"?`)) return;
    await remove(ref(db, `almacenes/${alm.id}`));
    toast({ title: "Almacén eliminado" });
  };

  // Proveedores
  const handleCreateProveedor = async () => {
    if (!newProveedor.trim()) return;
    const refProv = push(ref(db, "proveedores"));
    await set(refProv, { nombre: newProveedor.trim() });
    setNewProveedor("");
    toast({ title: "Proveedor agregado" });
  };
  const handleUpdateProveedor = async () => {
    if (!editProveedor?.nombre.trim()) return;
    await update(ref(db, `proveedores/${editProveedor.id}`), { nombre: editProveedor.nombre });
    setEditProveedor(null);
    toast({ title: "Proveedor editado" });
  };
  const handleDeleteProveedor = async (prov: Proveedor) => {
    if (!window.confirm(`¿Seguro que quieres eliminar el proveedor "${prov.nombre}"?`)) return;
    await remove(ref(db, `proveedores/${prov.id}`));
    toast({ title: "Proveedor eliminado" });
  };

  // Productos
  const handleCreateProduct = async (e: any) => {
    e.preventDefault();
    if (!newProduct.nombre.trim()) return;

    const cfg = defaultUnitsFor(newProduct.unidad);

    const refProd = push(ref(db, "productos"));
    await set(refProd, {
      ...newProduct,
      // persistimos esquema nuevo también
      baseUnit: cfg.baseUnit,
      units: cfg.units,
      defaultDisplayUnit: cfg.defaultDisplayUnit,
      stock: 0, // en base
    });

    setNewProduct({
      nombre: "",
      categoria: "",
      almacen: "",
      min: 0,
      max: 0,
      refrigeracion: false,
      unidad: "unidad",
      proveedores: [],
      stock: 0,
    });
    setShowAddModal(false);
    toast({ title: "Producto creado" });
  };

  const handleUpdateProduct = async (e: any) => {
    e.preventDefault();
    if (!editProduct) return;
    await update(ref(db, `productos/${editProduct.id}`), editProduct);
    setEditProduct(null);
    toast({ title: "Producto editado" });
  };

  const handleDeleteProduct = async (prod: Producto) => {
    if (!window.confirm(`¿Seguro que quieres eliminar el producto "${prod.nombre}"?`)) return;
    await remove(ref(db, `productos/${prod.id}`));
    toast({ title: "Producto eliminado" });
  };

  /* =========================
     STOCK (+/- y edición directa) con CONVERSIÓN
     ========================= */
  async function handleStockChange(
    prod: Producto,
    diffBase: number,                 // diferencia en base
    tipo: "entrada" | "salida" | "ajuste",
    detalle?: string,
    meta?: { unidadOriginal?: string; cantidadOriginal?: number }
  ) {
    const prev = prod.stock;
    const nuevo = Math.max(0, prev + diffBase);
    await update(ref(db, `productos/${prod.id}`), { stock: nuevo });

    const refMov = push(ref(db, "movimientos"));
    await set(refMov, {
      productoId: prod.id,
      producto: prod.nombre,
      fecha: Date.now(),
      cantidad: diffBase,
      tipo,
      user: userName,
      stockAntes: prev,
      stockDespues: nuevo,
      detalle: detalle || "",
      unidadOriginal: meta?.unidadOriginal,
      cantidadOriginal: meta?.cantidadOriginal,
      cantidadBase: diffBase,
    } as Omit<Movimiento, "id">);

    if (nuevo <= prod.min) sendWhatsAppAlert(prod);
  }

  // --- ORDEN DE COMPRA ---
  const productosOrden = productos.filter((p) => p.stock <= p.min);

  // Copiar/Compartir orden
  const copyOrder = () => {
    const txt = productosOrden
      .map((p) => {
        const cfg = p.units && p.units.length ? { units: p.units, baseUnit: p.baseUnit || "unid" } : defaultUnitsFor(p.unidad);
        const u = findUnit(cfg.units, cfg.units[0].code);
        const sugeridaBase = Math.max(p.max - p.stock, 0);
        const sugeridaEnU = fromBase(sugeridaBase, u);
        return [
          `Producto: ${p.nombre}`,
          `Cantidad sugerida: ${Number(sugeridaEnU.toFixed(2))} ${u.label} (${sugeridaBase} ${cfg.baseUnit})`,
          `Proveedores: ${p.proveedores.map((id) => proveedores.find((pv) => pv.id === id)?.nombre || "-").join(", ")}`,
        ].join("\n");
      })
      .join("\n\n");
    navigator.clipboard.writeText(txt);
    toast({ title: "Orden copiada al portapapeles" });
  };

  const exportOrderExcel = () => {
    exportTableToExcel("tabla-orden", "OrdenCompra.xlsx");
  };

  /* =========================
     RENDER
     ========================= */
  return (
    <div className="container mx-auto py-8 px-2">
      <h1 className="text-3xl font-bold mb-6">Panel de Logística</h1>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              "px-4 py-2 font-medium rounded-t-lg transition",
              tab === t.id ? "bg-white border border-b-0 border-stone-200 text-amber-600" : "bg-stone-100 text-stone-500"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* --- VISTA GENERAL --- */}
      {tab === "vista" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Inventario de Productos</CardTitle>
            <Button onClick={() => setShowAddModal(true)} variant="outline" className="flex items-center gap-1">
              <Plus className="w-4 h-4" /> Agregar Producto
            </Button>
          </CardHeader>

          <CardContent>
            {productos.length === 0 ? (
              <div className="text-stone-400">No hay productos registrados.</div>
            ) : (
              productos.map((prod) => {
                const cfg = prod.units && prod.units.length ? { baseUnit: prod.baseUnit || "unid", units: prod.units } : defaultUnitsFor(prod.unidad);
                const selectedUnitCode = unitByProduct[prod.id] || prod.defaultDisplayUnit || cfg.units[0].code;
                const selectedUnit = findUnit(cfg.units, selectedUnitCode);

                const displayedStock = Number(fromBase(prod.stock, selectedUnit).toFixed(3));
                const valueInInput = editStock[prod.id] !== undefined ? editStock[prod.id] : displayedStock;

                return (
                  <div key={prod.id} className="border p-4 my-2 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="font-bold text-lg">{prod.nombre}</div>
                      <div className="text-xs text-stone-500 mb-1">
                        {categorias.find((c) => c.id === prod.categoria)?.nombre || "Sin categoría"}
                        {" • "}
                        {almacenes.find((a) => a.id === prod.almacen)?.nombre || "Sin almacén"}
                        {" • "}
                        <Truck className="inline h-4 w-4 text-amber-400" /> Proveedores:{" "}
                        {prod.proveedores.map((id) => proveedores.find((p) => p.id === id)?.nombre).filter(Boolean).join(", ") || "Sin proveedores"}
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className={clsx("text-4xl font-black", prod.stock <= prod.min && "text-amber-700 animate-pulse")}>
                          {displayedStock}
                        </span>
                        <span className="text-lg">{selectedUnit.label}</span>

                        {prod.refrigeracion && (
                          <span className="ml-2 text-blue-500 flex items-center gap-1">
                            <Snowflake className="h-4 w-4" /> Refrigeración
                          </span>
                        )}

                        {/* Selector de Unidad */}
                        <div className="ml-4 w-40">
                          <Select
                            value={selectedUnitCode}
                            onValueChange={(code) => {
                              setUnitByProduct((prev) => ({ ...prev, [prod.id]: code }));
                              // recalcular el valor editado al cambiar unidad
                              const newUnit = findUnit(cfg.units, code);
                              const newDisplayed = Number(fromBase(prod.stock, newUnit).toFixed(3));
                              setEditStock((prev) => ({ ...prev, [prod.id]: newDisplayed }));
                              setStockEditMode((prev) => ({ ...prev, [prod.id]: false }));
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Unidad" />
                            </SelectTrigger>
                            <SelectContent>
                              {cfg.units.map((u) => (
                                <SelectItem key={u.code} value={u.code}>
                                  {u.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Controles de edición (en la unidad seleccionada) */}
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="lg"
                            variant="outline"
                            className="text-2xl"
                            onClick={() => {
                              const next = Math.max(0, (editStock[prod.id] ?? displayedStock) - 1);
                              setEditStock({ ...editStock, [prod.id]: next });
                              setStockEditMode({ ...stockEditMode, [prod.id]: true });
                            }}
                          >
                            -
                          </Button>

                          <Input
                            type="number"
                            value={valueInInput}
                            min={0}
                            step="0.001"
                            onFocus={() => setStockEditMode({ ...stockEditMode, [prod.id]: true })}
                            onChange={(e) => {
                              const n = Number(e.target.value);
                              setEditStock({ ...editStock, [prod.id]: isNaN(n) ? 0 : n });
                              setStockEditMode({ ...stockEditMode, [prod.id]: true });
                            }}
                            className="w-28 text-xl text-center mx-2"
                          />

                          <Button
                            size="lg"
                            variant="outline"
                            className="text-2xl"
                            onClick={() => {
                              const next = (editStock[prod.id] ?? displayedStock) + 1;
                              setEditStock({ ...editStock, [prod.id]: next });
                              setStockEditMode({ ...stockEditMode, [prod.id]: true });
                            }}
                          >
                            +
                          </Button>

                          {/* Guardar ajuste sólo si cambió */}
                          {stockEditMode[prod.id] && Math.abs(valueInInput - displayedStock) > 1e-6 && (
                            <Button
                              size="sm"
                              className="ml-2"
                              onClick={async () => {
                                // convertir nuevo total a base y sacar diferencia
                                const newTotalBase = toBase(valueInInput, selectedUnit);
                                const diffBase = Number((newTotalBase - prod.stock).toFixed(6));
                                await handleStockChange(
                                  prod,
                                  diffBase,
                                  "ajuste",
                                  `Edición manual (${selectedUnit.label})`,
                                  { unidadOriginal: selectedUnit.code, cantidadOriginal: Number((valueInInput - displayedStock).toFixed(6)) }
                                );
                                setStockEditMode({ ...stockEditMode, [prod.id]: false });
                              }}
                            >
                              Guardar
                            </Button>
                          )}

                          {/* Cancelar edición */}
                          {stockEditMode[prod.id] && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditStock({ ...editStock, [prod.id]: displayedStock });
                                setStockEditMode({ ...stockEditMode, [prod.id]: false });
                              }}
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditProduct(prod)}>
                        <Pencil className="w-4 h-4 mr-2" /> Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(prod)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                      </Button>
                    </div>
                  </div>
                );
              })
            )}

            {/* MODAL NUEVO PRODUCTO */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 w-full max-w-lg relative">
                  <button className="absolute top-3 right-3 text-stone-400 hover:text-stone-800 text-xl" onClick={() => setShowAddModal(false)}>
                    ×
                  </button>
                  <h2 className="text-xl font-bold mb-4">Agregar Producto</h2>
                  <form className="grid gap-3" onSubmit={handleCreateProduct}>
                    <label className="block mb-1 text-sm">Nombre del producto</label>
                    <Input
                      placeholder="Nombre del producto"
                      value={newProduct.nombre}
                      onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })}
                      required
                    />

                    <label className="block mb-1 text-sm">Categoría</label>
                    <select
                      className="p-2 border rounded"
                      value={newProduct.categoria}
                      onChange={(e) => setNewProduct({ ...newProduct, categoria: e.target.value })}
                      required
                    >
                      <option value="">Selecciona categoría</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>

                    <label className="block mb-1 text-sm">Almacén</label>
                    <select
                      className="p-2 border rounded"
                      value={newProduct.almacen}
                      onChange={(e) => setNewProduct({ ...newProduct, almacen: e.target.value })}
                      required
                    >
                      <option value="">Selecciona almacén</option>
                      {almacenes.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nombre}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block mb-1 text-sm">Stock mínimo (en base)</label>
                        <Input
                          placeholder="Stock mínimo"
                          type="number"
                          min={0}
                          value={newProduct.min}
                          onChange={(e) => setNewProduct({ ...newProduct, min: Number(e.target.value) })}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block mb-1 text-sm">Stock máximo (en base)</label>
                        <Input
                          placeholder="Stock máximo"
                          type="number"
                          min={0}
                          value={newProduct.max}
                          onChange={(e) => setNewProduct({ ...newProduct, max: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 items-center">
                      <Switch checked={newProduct.refrigeracion} onCheckedChange={(b) => setNewProduct({ ...newProduct, refrigeracion: b })} />
                      <span>¿Refrigeración?</span>
                      <select
                        className="ml-4 p-1 border rounded"
                        value={newProduct.unidad}
                        onChange={(e) => setNewProduct({ ...newProduct, unidad: e.target.value as "unidad" | "kg" })}
                      >
                        <option value="unidad">Unidad</option>
                        <option value="kg">Kilo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm">Proveedores</label>
                      <select
                        multiple
                        className="w-full p-2 border rounded"
                        value={newProduct.proveedores}
                        onChange={(e) => {
                          const options = Array.from(e.target.selectedOptions).map((o: any) => o.value);
                          setNewProduct({ ...newProduct, proveedores: options });
                        }}
                      >
                        {proveedores.map((pv) => (
                          <option key={pv.id} value={pv.id}>
                            {pv.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button type="submit" className="w-full mt-2">
                      Crear Producto
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL EDITAR PRODUCTO */}
            {editProduct && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 w-full max-w-lg relative">
                  <button className="absolute top-3 right-3 text-stone-400 hover:text-stone-800 text-xl" onClick={() => setEditProduct(null)}>
                    ×
                  </button>
                  <h2 className="text-xl font-bold mb-4">Editar Producto</h2>
                  <form className="grid gap-3" onSubmit={handleUpdateProduct}>
                    <label className="block mb-1 text-sm">Nombre del producto</label>
                    <Input value={editProduct.nombre} onChange={(e) => setEditProduct({ ...editProduct, nombre: e.target.value })} required />

                    <label className="block mb-1 text-sm">Categoría</label>
                    <select
                      className="p-2 border rounded"
                      value={editProduct.categoria}
                      onChange={(e) => setEditProduct({ ...editProduct, categoria: e.target.value })}
                      required
                    >
                      <option value="">Selecciona categoría</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>

                    <label className="block mb-1 text-sm">Almacén</label>
                    <select
                      className="p-2 border rounded"
                      value={editProduct.almacen}
                      onChange={(e) => setEditProduct({ ...editProduct, almacen: e.target.value })}
                      required
                    >
                      <option value="">Selecciona almacén</option>
                      {almacenes.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nombre}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block mb-1 text-sm">Stock mínimo (base)</label>
                        <Input
                          type="number"
                          min={0}
                          value={editProduct.min}
                          onChange={(e) => setEditProduct({ ...editProduct, min: Number(e.target.value) })}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block mb-1 text-sm">Stock máximo (base)</label>
                        <Input
                          type="number"
                          min={0}
                          value={editProduct.max}
                          onChange={(e) => setEditProduct({ ...editProduct, max: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 items-center">
                      <Switch
                        checked={editProduct.refrigeracion}
                        onCheckedChange={(b) => setEditProduct({ ...editProduct, refrigeracion: b })}
                      />
                      <span>¿Refrigeración?</span>
                      <select
                        className="ml-4 p-1 border rounded"
                        value={editProduct.unidad}
                        onChange={(e) => setEditProduct({ ...editProduct, unidad: e.target.value as "unidad" | "kg" })}
                      >
                        <option value="unidad">Unidad</option>
                        <option value="kg">Kilo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm">Proveedores</label>
                      <select
                        multiple
                        className="w-full p-2 border rounded"
                        value={editProduct.proveedores}
                        onChange={(e) => {
                          const options = Array.from(e.target.selectedOptions).map((o: any) => o.value);
                          setEditProduct({ ...editProduct, proveedores: options });
                        }}
                      >
                        {proveedores.map((pv) => (
                          <option key={pv.id} value={pv.id}>
                            {pv.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <Button type="submit" className="flex-1">
                        Guardar Cambios
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => setEditProduct(null)} className="flex-1">
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* --- ORDEN DE COMPRA --- */}
      {tab === "ordenes" && (
        <Card>
          <CardHeader>
            <CardTitle>
              <ShoppingBag className="inline mr-2" />
              Orden de Compra{" "}
              {productosOrden.length > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                  {productosOrden.length} productos
                </span>
              )}
            </CardTitle>
            <div className="flex gap-2 mt-4">
              <Button onClick={copyOrder} variant="outline">
                <Share2 className="mr-2" />
                Copiar Orden
              </Button>
              <Button onClick={exportOrderExcel} variant="outline">
                <Download className="mr-2" />
                Exportar a Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {productosOrden.length === 0 ? (
              <div className="text-stone-500">No hay productos en bajo stock.</div>
            ) : (
              <div className="overflow-x-auto">
                <table id="tabla-orden" className="min-w-full text-sm bg-white border">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700">
                      <th className="px-2 py-1">Producto</th>
                      <th className="px-2 py-1">Cantidad Sugerida</th>
                      <th className="px-2 py-1">Proveedores</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosOrden.map((p) => {
                      const cfg = p.units && p.units.length ? { baseUnit: p.baseUnit || "unid", units: p.units } : defaultUnitsFor(p.unidad);
                      const u = cfg.units[0];
                      const sugeridaBase = Math.max(p.max - p.stock, 0);
                      const sugeridaEnU = fromBase(sugeridaBase, u);
                      return (
                        <tr key={p.id}>
                          <td className="border px-2 py-1">{p.nombre}</td>
                          <td className="border px-2 py-1">
                            {Number(sugeridaEnU.toFixed(2))} {u.label} ({sugeridaBase} {cfg.baseUnit})
                          </td>
                          <td className="border px-2 py-1">
                            {p.proveedores.map((id) => proveedores.find((pv) => pv.id === id)?.nombre).filter(Boolean).join(", ") || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* --- HISTORIAL --- */}
      {tab === "historial" && (
        <Card>
          <CardHeader>
            <CardTitle>
              <ClipboardList className="inline mr-2" />
              Historial de Movimientos
            </CardTitle>
            <Button className="ml-3" variant="outline" onClick={() => exportTableToExcel("tabla-historial", "HistorialMovimientos.xlsx")}>
              <FileDown className="mr-2" /> Exportar Excel
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table id="tabla-historial" className="min-w-full text-sm">
                <thead>
                  <tr className="bg-stone-100 text-stone-700">
                    <th className="px-2 py-1">Fecha</th>
                    <th className="px-2 py-1">Producto</th>
                    <th className="px-2 py-1">Tipo</th>
                    <th className="px-2 py-1">Cantidad</th>
                    <th className="px-2 py-1">Stock Antes</th>
                    <th className="px-2 py-1">Stock Después</th>
                    <th className="px-2 py-1">Usuario</th>
                    <th className="px-2 py-1">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((m) => (
                    <tr key={m.id}>
                      <td className="border px-2 py-1">{new Date(m.fecha).toLocaleString()}</td>
                      <td className="border px-2 py-1">{m.producto}</td>
                      <td className="border px-2 py-1">{m.tipo}</td>
                      <td className="border px-2 py-1">
                        {m.cantidad > 0 ? "+" : ""}
                        {m.cantidad}
                        {m.unidadOriginal ? ` (${m.cantidadOriginal ?? ""} ${m.unidadOriginal})` : ""}
                      </td>
                      <td className="border px-2 py-1">{m.stockAntes}</td>
                      <td className="border px-2 py-1">{m.stockDespues}</td>
                      <td className="border px-2 py-1">{m.user}</td>
                      <td className="border px-2 py-1">{m.detalle || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* --- CONFIGURACIÓN --- */}
      {tab === "config" && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Proveedores */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Users2 className="text-blue-500" />
                <span className="font-medium">Proveedores</span>
              </div>
              <div className="flex gap-2 items-center">
                <Input placeholder="Nuevo proveedor" value={newProveedor} onChange={(e) => setNewProveedor(e.target.value)} />
                <Button onClick={handleCreateProveedor}>Agregar</Button>
                <Button variant="ghost" onClick={() => setEditProveedor(null)} style={{ visibility: editProveedor ? "visible" : "hidden" }}>
                  Cancelar
                </Button>
              </div>
              <div className="mt-2 space-y-1">
                {proveedores.map((prov) =>
                  editProveedor?.id === prov.id ? (
                    <div key={prov.id} className="flex gap-2 items-center">
                      <Input
                        value={editProveedor.nombre}
                        onChange={(e) => setEditProveedor((p) => (p ? { ...p, nombre: e.target.value } : null))}
                      />
                      <Button size="sm" onClick={handleUpdateProveedor}>
                        Guardar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditProveedor(null)}>
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div key={prov.id} className="flex gap-2 items-center">
                      <span>{prov.nombre}</span>
                      <Button size="icon" variant="outline" onClick={() => setEditProveedor(prov)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDeleteProveedor(prov)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Categorías */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <FolderPlus className="text-orange-500" />
                <span className="font-medium">Categorías</span>
              </div>
              <div className="flex gap-2 items-center">
                <Input placeholder="Nueva categoría" value={newCategoria} onChange={(e) => setNewCategoria(e.target.value)} />
                <Button onClick={handleCreateCategoria}>Agregar</Button>
                <Button variant="ghost" onClick={() => setEditCategoria(null)} style={{ visibility: editCategoria ? "visible" : "hidden" }}>
                  Cancelar
                </Button>
              </div>
              <div className="mt-2 space-y-1">
                {categorias.map((cat) =>
                  editCategoria?.id === cat.id ? (
                    <div key={cat.id} className="flex gap-2 items-center">
                      <Input
                        value={editCategoria.nombre}
                        onChange={(e) => setEditCategoria((c) => (c ? { ...c, nombre: e.target.value } : null))}
                      />
                      <Button size="sm" onClick={handleUpdateCategoria}>
                        Guardar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditCategoria(null)}>
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div key={cat.id} className="flex gap-2 items-center">
                      <span>{cat.nombre}</span>
                      <Button size="icon" variant="outline" onClick={() => setEditCategoria(cat)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDeleteCategoria(cat)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Almacenes */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Warehouse className="text-green-500" />
                <span className="font-medium">Almacenes</span>
              </div>
              <div className="flex gap-2 items-center">
                <Input placeholder="Nuevo almacén" value={newAlmacen} onChange={(e) => setNewAlmacen(e.target.value)} />
                <Button onClick={handleCreateAlmacen}>Agregar</Button>
                <Button variant="ghost" onClick={() => setEditAlmacen(null)} style={{ visibility: editAlmacen ? "visible" : "hidden" }}>
                  Cancelar
                </Button>
              </div>
              <div className="mt-2 space-y-1">
                {almacenes.map((alm) =>
                  editAlmacen?.id === alm.id ? (
                    <div key={alm.id} className="flex gap-2 items-center">
                      <Input
                        value={editAlmacen.nombre}
                        onChange={(e) => setEditAlmacen((a) => (a ? { ...a, nombre: e.target.value } : null))}
                      />
                      <Button size="sm" onClick={handleUpdateAlmacen}>
                        Guardar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditAlmacen(null)}>
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div key={alm.id} className="flex gap-2 items-center">
                      <span>{alm.nombre}</span>
                      <Button size="icon" variant="outline" onClick={() => setEditAlmacen(alm)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDeleteAlmacen(alm)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
