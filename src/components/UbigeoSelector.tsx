import React, { useEffect, useState } from "react";
import { db } from "@/config/firebase"; // Ajusta esta ruta según tu proyecto
import { ref, get } from "firebase/database";

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
    <div className="flex flex-col gap-2">
      {/* DEPARTAMENTO */}
      <select
        value={departamento}
        onChange={e =>
          onChange({ departamento: e.target.value, provincia: "", distrito: "" })
        }
        className="border rounded px-2 py-1"
        disabled={loading}
      >
        <option value="">Departamento</option>
        {loading && <option>Cargando...</option>}
        {departamentos.map(dep => (
          <option key={dep} value={dep}>
            {dep}
          </option>
        ))}
      </select>

      {/* PROVINCIA */}
      <select
        value={provincia}
        onChange={e =>
          onChange({ departamento, provincia: e.target.value, distrito: "" })
        }
        className="border rounded px-2 py-1"
        disabled={!departamento || loading}
      >
        <option value="">Provincia</option>
        {provincias.map(prov => (
          <option key={prov} value={prov}>
            {prov}
          </option>
        ))}
      </select>

      {/* DISTRITO */}
      <select
        value={distrito}
        onChange={e =>
          onChange({ departamento, provincia, distrito: e.target.value })
        }
        className="border rounded px-2 py-1"
        disabled={!provincia || loading}
      >
        <option value="">Distrito</option>
        {distritos.map(dist => (
          <option key={dist} value={dist}>
            {dist}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UbigeoSelector;
