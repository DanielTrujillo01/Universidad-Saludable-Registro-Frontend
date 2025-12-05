// src/components/EntityForm.jsx
import { useState } from "react";
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import { normalizeText } from "../Funtions/BasicFuntions"; 

const entityLabels = {
  sede: "Sede",
  lineaProyecto: "Línea De Proyecto",
  facultad: "Facultad",
  escuela: "Escuela",
  indicador: "Indicador",
  actividadConsolidada: "Actividad Consolidada",
  tema: "Tema",
  prioridad: "Prioridad",
  lineaEstrategia: "Línea de Estrategia",
};

export function EntityForm({ entityType, facultades, existingData = [], onSubmit, onCancel }) {
  const [nombre, setNombre] = useState("");
  const [facultadId, setFacultadId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const original = nombre;
    const normalized = normalizeText(nombre);

    // Validación de duplicados
    const exists = existingData.some((item) => {
      const itemNombre = item.nombre_original || item.nombre || "";
      return normalizeText(itemNombre) === normalized;
    });

    if (exists) {
      toast.error(`La ${entityLabels[entityType] || 'entidad'}: "${original}" ya fue creada.`);
      return; 
    }

    // Construcción del objeto
    const data = {
      nombre: normalized,
      nombre_original: original,
    };

    if (entityType === "escuela" && facultadId) {
      data.facultad = parseInt(facultadId, 10);
    }

    console.log("📌 Datos enviados:", data);

    // 1. Enviamos los datos al padre
    onSubmit(data);

    // 2. ✅ Mostramos el Toast de Éxito
    toast.success(`${entityLabels[entityType]} creada exitosamente.`);

    // 3. Limpiamos el formulario
    setNombre("");
    setFacultadId("");
  };

  const isFormValid = () => {
    if (!nombre.trim()) return false;
    if (entityType === "escuela" && !facultadId) return false;
    return true;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-gray-800 mb-6">Crear {entityLabels[entityType]}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-gray-700 mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={`Ingresa el nombre de la ${entityLabels[
              entityType
            ].toLowerCase()}`}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        {entityType === "escuela" && (
          <div>
            <label htmlFor="facultad" className="block text-gray-700 mb-2">
              Facultad <span className="text-red-500">*</span>
            </label>

            {facultades.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800">
                No hay facultades disponibles. Por favor, crea una facultad primero.
              </div>
            ) : (
              <select
                id="facultad"
                value={facultadId}
                onChange={(e) => setFacultadId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              >
                <option value="">Selecciona una facultad</option>
                {facultades.map((facultad) => (
                  <option key={facultad.id_facultad} value={facultad.id_facultad}>
                    {facultad.nombre_original || facultad.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={!isFormValid()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            Guardar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}