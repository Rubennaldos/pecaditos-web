import React, { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { ref, get } from "firebase/database";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UbigeoSelectorProps {
  departamento: string;
  provincia: string;
  distrito: string;
  onChange: (data: { departamento: string; provincia: string; distrito: string }) => void;
}

const UbigeoSelector: React.FC<UbigeoSelectorProps> = ({
  departamento,
  provincia,
  distrito,
  onChange,
}) => {
  const [ubigeoData, setUbigeoData] = useState<any>({});
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [provincias, setProvincias] = useState<string[]>([]);
  const [distritos, setDistritos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar todo el ubigeo al inicio
  useEffect(() => {
    setLoading(true);
    get(ref(db, "ubigeo")).then((snap) => {
      const data = snap.val() || {};
      setUbigeoData(data);
      setDepartamentos(Object.keys(data));
      setLoading(false);
    });
  }, []);

  // 2. Provincias cuando cambia departamento
  useEffect(() => {
    if (departamento && ubigeoData[departamento]) {
      setProvincias(Object.keys(ubigeoData[departamento]));
    } else {
      setProvincias([]);
    }
    setDistritos([]);
    // Solo resetear si cambia dep
    if (provincia || distrito) onChange({ departamento, provincia: "", distrito: "" });
    // eslint-disable-next-line
  }, [departamento]);

  // 3. Distritos cuando cambia provincia
  useEffect(() => {
    if (departamento && provincia && ubigeoData[departamento]?.[provincia]) {
      setDistritos(ubigeoData[departamento][provincia]);
    } else {
      setDistritos([]);
    }
    // Solo resetear si cambia prov
    if (distrito) onChange({ departamento, provincia, distrito: "" });
    // eslint-disable-next-line
  }, [provincia]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* DEPARTAMENTO */}
      <div className="space-y-2">
        <Select
          value={departamento}
          onValueChange={(value) =>
            onChange({ departamento: value, provincia: "", distrito: "" })
          }
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            {loading && <SelectItem value="loading" disabled>Cargando...</SelectItem>}
            {departamentos.map(dep => (
              <SelectItem key={dep} value={dep}>
                {dep}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* PROVINCIA */}
      <div className="space-y-2">
        <Select
          value={provincia}
          onValueChange={(value) =>
            onChange({ departamento, provincia: value, distrito: "" })
          }
          disabled={!departamento || loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Provincia" />
          </SelectTrigger>
          <SelectContent>
            {provincias.map(prov => (
              <SelectItem key={prov} value={prov}>
                {prov}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* DISTRITO */}
      <div className="space-y-2">
        <Select
          value={distrito}
          onValueChange={(value) =>
            onChange({ departamento, provincia, distrito: value })
          }
          disabled={!provincia || loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Distrito" />
          </SelectTrigger>
          <SelectContent>
            {distritos.map(dist => (
              <SelectItem key={dist} value={dist}>
                {dist}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default UbigeoSelector;
