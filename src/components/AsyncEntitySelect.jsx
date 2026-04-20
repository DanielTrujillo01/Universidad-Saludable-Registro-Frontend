import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X, Check } from "lucide-react";
import { apiRequest } from "../api/api";

export function AsyncEntitySelect({
  entityType,
  label,
  onSelect,
  placeholder,
  required,
  value,
  parentId, // ID del padre (ej: id de la acción)
  parentField, // Nombre del campo para filtrar (ej: "id_accion")
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Debounce: Esperar 500ms después de escribir para buscar
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      // Solo buscamos si hay 3 letras y no hay un item seleccionado
      if (searchTerm.length >= 3 && !selectedItem) {
        setLoading(true);
        try {
          // CONSTRUCCIÓN DE LA URL CON FILTRO:
          // Ejemplo resultante: /actividades?search=taller&id_accion=5
          let query = `?search=${searchTerm}`;
          if (parentId && parentField) {
            query += `&${parentField}=${parentId}`;
          }

          const data = await apiRequest(entityType, "GET", null, query);
          const results = Array.isArray(data) ? data : data.results || [];
          setOptions(results);
          setIsOpen(true);
        } catch (error) {
          console.error("Error buscando:", error);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, entityType, selectedItem, parentId, parentField]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (item) => {
    const name = item.nombre_original || item.nombre;
    // Identificar el ID correctamente
    const idKey =
      Object.keys(item).find((key) => key.startsWith("id_")) || "id";
    const id = item[idKey];

    setSelectedItem({ ...item, displayName: name, id: id });
    setSearchTerm(name);
    setIsOpen(false);
    onSelect(id); // Enviamos el ID al padre
  };

  const clearSelection = () => {
    setSelectedItem(null);
    setSearchTerm("");
    onSelect(""); // Limpiamos el ID en el padre
    setOptions([]);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            const newValue = e.target.value;
            setSearchTerm(newValue);

            if (selectedItem) setSelectedItem(null);

            // NUEVO: Si el usuario borra todo el texto manualmente,
            // notificamos al padre para que limpie sus hijos.
            if (newValue === "") {
              onSelect("");
            }
          }}
          placeholder={selectedItem ? selectedItem.displayName : placeholder}
          className={`w-full pl-10 pr-10 py-2 border rounded-lg outline-none transition-all ${
            selectedItem
              ? "border-green-500 bg-green-50 text-green-800 font-medium"
              : "border-gray-300 focus:ring-2 focus:ring-blue-500"
          }`}
          required={required && !selectedItem}
        />

        {/* Icono Izquierda (Lupa o Check) */}
        <div className="absolute left-3 top-2.5">
          {selectedItem ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Icono Derecha (Spinner o Borrar) */}
        <div className="absolute right-3 top-2.5">
          {loading ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            searchTerm && (
              <button type="button" onClick={clearSelection}>
                <X className="w-5 h-5 text-gray-400 hover:text-red-500" />
              </button>
            )
          )}
        </div>
      </div>

      {/* DROPDOWN DE RESULTADOS */}
      {isOpen && options.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
          <ul className="py-1">
            {options.map((item, index) => {
              const name = item.nombre_original || item.nombre;
              const idKey =
                Object.keys(item).find((key) => key.startsWith("id_")) || "id";

              return (
                <li
                  key={item[idKey] || index}
                  onClick={() => handleSelect(item)}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 text-sm border-b border-gray-50 last:border-none flex justify-between items-center"
                >
                  <span>{name}</span>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    ID: {item[idKey]}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {isOpen && options.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-center text-sm text-gray-500">
          No se encontraron coincidencias.
        </div>
      )}
    </div>
  );
}
