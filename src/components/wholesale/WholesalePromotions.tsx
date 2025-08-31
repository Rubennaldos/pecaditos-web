import { useEffect, useMemo, useState } from "react";
import { ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { db } from "@/config/firebase";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Calendar, Percent, Check } from "lucide-react";

type DbPromo = {
  title?: string;
  description?: string;
  percentOff?: number;
  fixedOff?: number;
  freeShipping?: boolean;
  minSubtotal?: number;
  active?: boolean;
  audience?: "all" | "wholesale" | "client";
  clientId?: string;
  startAt?: number;
  endAt?: number | null;
};

type Promo = {
  id: string;
  title: string;
  description: string;
  percentOff?: number;
  fixedOff?: number;
  freeShipping?: boolean;
  active: boolean;
  audience: "all" | "wholesale" | "client";
  clientId?: string;
  startAt?: number;
  endAt?: number | null;
  used?: boolean;
};

interface WholesalePromotionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WholesalePromotions = ({ isOpen, onClose }: WholesalePromotionsProps) => {
  const [uid, setUid] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [usedMap, setUsedMap] = useState<Record<string, boolean>>({}); // { promoId: true }

  const now = Date.now();

  // 1) UID actual
  useEffect(() => {
    const auth = getAuth();
    setUid(auth.currentUser?.uid ?? null);
  }, []);

  // 2) clientId del usuario (para promos audience=client)
  useEffect(() => {
    if (!uid) return;
    const r = ref(db, `wholesale/users/${uid}`);
    return onValue(r, (snap) => {
      const val = snap.val();
      setClientId(val?.clientId ?? null);
    });
  }, [uid]);

  // 3) Promos desde RTDB
  useEffect(() => {
    const r = ref(db, "wholesale/promotions");
    return onValue(r, (snap) => {
      const val = snap.val() || {};
      const list: Promo[] = Object.entries(val).map(([id, p]: [string, DbPromo]) => ({
        id,
        title: p?.title ?? "",
        description: p?.description ?? "",
        percentOff: typeof p?.percentOff === "number" ? p.percentOff : undefined,
        fixedOff: typeof p?.fixedOff === "number" ? p.fixedOff : undefined,
        freeShipping: !!p?.freeShipping,
        active: p?.active !== false,
        audience: (p?.audience ?? "all") as Promo["audience"],
        clientId: p?.clientId,
        startAt: typeof p?.startAt === "number" ? p.startAt : undefined,
        endAt: typeof p?.endAt === "number" ? p.endAt : null
      }));
      setPromos(list);
    });
  }, []);

  // 4) Opcional: promos usadas por el usuario (si manejas este registro)
  useEffect(() => {
    if (!uid) return;
    const r = ref(db, `wholesale/userPromos/${uid}`);
    return onValue(r, (snap) => {
      const val = snap.val() || {};
      const map: Record<string, boolean> = {};
      Object.entries<any>(val).forEach(([promoId, v]) => {
        if (v?.used) map[promoId] = true;
      });
      setUsedMap(map);
    });
  }, [uid]);

  // Filtros: estado, vigencia y audiencia
  const visiblePromos = useMemo(() => {
    return promos.filter((p) => {
      if (!p.active) return false;

      const begins = typeof p.startAt === "number" ? p.startAt <= now : true;
      const ends = p.endAt == null ? true : now <= p.endAt;
      if (!(begins && ends)) return false;

      // Audiencia
      if (p.audience === "client") {
        if (!clientId || !p.clientId || p.clientId !== clientId) return false;
      }
      // "wholesale" y "all" aplican a todos los clientes mayoristas
      return true;
    });
  }, [promos, clientId, now]);

  // Si no hay promos vigentes, no mostramos el modal en absoluto
  if (!visiblePromos.length) return null;

  const getPromotionIcon = (p: Promo) => {
    if (p.freeShipping) return <Gift className="h-4 w-4" />;
    if (typeof p.percentOff === "number" && p.percentOff > 0) return <Percent className="h-4 w-4" />;
    return <Gift className="h-4 w-4" />;
  };

  const discountLabel = (p: Promo) => {
    if (p.freeShipping) return "Envío gratis";
    if (typeof p.percentOff === "number" && p.percentOff > 0) return `${p.percentOff}% OFF`;
    if (typeof p.fixedOff === "number" && p.fixedOff > 0) return `-S/ ${p.fixedOff.toFixed(2)}`;
    return "";
  };

  const formatDate = (ms?: number | null) => {
    if (!ms) return "—";
    try {
      return new Date(ms).toLocaleDateString("es-PE");
    } catch {
      return "—";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-blue-600" />
            Promociones y Descuentos Disponibles
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {visiblePromos.map((p) => {
            const used = !!usedMap[p.id];
            const label = discountLabel(p);
            return (
              <div key={p.id} className="border border-stone-200 rounded-lg p-4 bg-stone-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {getPromotionIcon(p)}
                    <h3 className="font-semibold text-stone-800">{p.title}</h3>
                    {used && (
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Utilizada
                      </Badge>
                    )}
                  </div>
                  {!used && <Badge className="bg-blue-100 text-blue-800">Activa</Badge>}
                </div>

                {p.description && <p className="text-stone-600 mb-3">{p.description}</p>}

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-sm text-stone-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Válida hasta: {formatDate(p.endAt)}
                    </span>
                    {!!label && <span className="font-bold text-green-600">{label}</span>}
                  </div>

                  {!used && (
                    <Button size="sm" variant="outline">
                      Aplicar Promoción
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
