import { useState } from "react";
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import { normalizeText } from "../Funtions/BasicFuntions"; 
import { AsyncEntitySelect } from "./AsyncEntitySelect";

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

// Ya no necesitamos recibir listas completas (facultades, actividades) como props
export function EntityForm({ entityType, existingData = [], onSubmit, onCancel }) {
  const [nombre, setNombre] = useState("");
  
  // Guardamos solo los IDs seleccionados
  const [facultadId, setFacultadId] = useState("");
  const [actividadId, setActividadId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const original = nombre;
    const normalized = normalizeText(nombre);

    // Validación básica de duplicados locales (solo para lo que ya cargaste en la lista)
    // Nota: Para validación total, el backend debería responder 400 si ya existe.
    const exists = existingData.some((item) => {
      const itemNombre = item.nombre_original || item.nombre || "";
      return normalizeText(itemNombre) === normalized;
    });

    if (exists) {
      toast.error(`La ${entityLabels[entityType] || 'entidad'}: "${original}" ya fue creada.`);
      return; 
    }

    const data = {
      nombre: normalized,
      nombre_original: original,
    };

    if (entityType === "escuela") {
      data.facultad = parseInt(facultadId, 10);
    }
    
    // Al enviar esto, el backend (TemaViewSet.create) creará la asociación automáticamente
    if (entityType === "tema") {
       data.id_actividad = parseInt(actividadId, 10); 
    }

    console.log("📌 Datos enviados:", data);
    onSubmit(data);
    
    // Limpieza
    setNombre("");
    setFacultadId("");
    setActividadId("");
  };

  const isFormValid = () => {
    if (!nombre.trim()) return false;
    if (entityType === "escuela" && !facultadId) return false;
    if (entityType === "tema" && !actividadId) return false;
    return true;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-gray-800 mb-6">Crear {entityLabels[entityType]}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Nombre Normal */}
        <div>
          <label htmlFor="nombre" className="block text-gray-700 mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={`Ingresa el nombre de la ${entityLabels[entityType]?.toLowerCase() || 'entidad'}`}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        {/* SELECTOR ASÍNCRONO PARA FACULTAD (Solo Escuela) */}
        {entityType === "escuela" && (
            <AsyncEntitySelect 
                entityType="facultad"
                label="Facultad Perteneciente"
                placeholder="Escribe para buscar facultad..."
                onSelect={setFacultadId}
                required={true}
            />
        )}

        {/* SELECTOR ASÍNCRONO PARA ACTIVIDAD (Solo Tema) */}
        {entityType === "tema" && (
          <div>
            <AsyncEntitySelect 
                entityType="actividad"
                label="Actividad Asociada"
                placeholder="Escribe para buscar actividad..."
                onSelect={setActividadId}
                required={true}
            />
             <p className="text-xs text-gray-500 mt-1 bg-blue-50 p-2 rounded border border-blue-100">
               <span className="font-bold">Nota:</span> Al guardar, el sistema creará el tema y lo vinculará automáticamente a esta actividad.
             </p>
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