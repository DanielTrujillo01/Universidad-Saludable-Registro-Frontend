import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { apiRequest } from "../api/api";

export function AsyncEntitySelect({
  endpoint,
  value,
  onChange,
  label = "Buscar",
  minChars = 3,
}) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.length >= minChars) {
        fetchData(query);
      } else {
        setOptions([]);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  const fetchData = async (search) => {
    setLoading(true);
    try {
      const res = await apiRequest(`${endpoint}?search=${search}`);
      setOptions(res.results || res);
      setShowDropdown(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    const id =
      item.id ||
      item.id_accion ||
      item.id_actividad ||
      item.id_seccion;

    onChange(id);
    setQuery(item.nombre_original || item.nombre);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() =>
            query.length >= minChars && setShowDropdown(true)
          }
          placeholder={`Escribe mínimo ${minChars} caracteres...`}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
        />
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
          {loading && (
            <div className="p-2 text-sm text-gray-500">
              Buscando...
            </div>
          )}

          {!loading && options.length === 0 && (
            <div className="p-2 text-sm text-gray-500">
              Sin resultados
            </div>
          )}

          {options.map((item) => {
            const id =
              item.id ||
              item.id_accion ||
              item.id_actividad ||
              item.id_seccion;

            return (
              <div
                key={id}
                onClick={() => handleSelect(item)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {item.nombre_original || item.nombre}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}