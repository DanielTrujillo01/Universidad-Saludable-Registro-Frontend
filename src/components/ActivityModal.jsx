import { useState, useEffect } from "react";
import { XCircle, CheckCircle } from "lucide-react";
import { apiRequest } from "../api/api";
import { normalizeText } from "../Funtions/BasicFuntions";
import { AsyncEntitySelect } from "./AsyncEntitySelect"; // <--- IMPORTANTE

export function ActivityModal({ 
  open, 
  onClose, 
  onSubmit, 
  // Ya NO recibimos 'indicadores' ni 'lineasProyecto' porque los buscaremos asíncronamente
  prioridades, 
  estrategias 
}) {
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const [nombre, setNombre] = useState("");
  
  // Estados para IDs seleccionados
  const [indicadorId, setIndicadorId] = useState("");
  const [lineaProyId, setLineaProyId] = useState("");
  
  // Estos siguen siendo selects normales
  const [prioridad, setPrioridad] = useState("");
  const [estrategia, setEstrategia] = useState("");
  
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !indicadorId) return;

    setLoading(true);
    
    const data = {
      nombre: normalizeText(nombre),
      nombre_original: nombre,
      indicador: parseInt(indicadorId, 10),
      // Opcionales
      ...(lineaProyId && { id_linea_proyecto: parseInt(lineaProyId, 10) }),
      ...(prioridad && { id_prioridad: parseInt(prioridad, 10) }),
      ...(estrategia && { id_linea_estrategia: parseInt(estrategia, 10) }),
    };

    try {
      const newActividad = await apiRequest("actividad", "POST", data);
      onSubmit && onSubmit(newActividad);
      setSuccess(true);
      
      // Limpiar formulario
      setNombre("");
      setIndicadorId(""); // Reset ID
      setLineaProyId(""); // Reset ID
      setPrioridad("");
      setEstrategia("");

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (error) {
      alert("❌ Error creando actividad.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-4"
      onClick={onClose} 
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
        >
          <XCircle className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
          Crear Nueva Actividad
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* NOMBRE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Ej: Taller de Robótica"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. INDICADOR (Buscador Asíncrono) */}
            <div className="z-20 relative"> {/* z-index para que el dropdown flote sobre otros */}
              <AsyncEntitySelect
                entityType="indicador"
                label="Indicador"
                placeholder="Buscar indicador..."
                onSelect={setIndicadorId}
                required={true}
              />
            </div>

            {/* 2. LÍNEA DE PROYECTO (Buscador Asíncrono) */}
            <div className="z-10 relative">
              <AsyncEntitySelect
                entityType="lineaProyecto"
                label="Línea de Proyecto"
                placeholder="Buscar línea..."
                onSelect={setLineaProyId}
                required={false}
              />
            </div>

            {/* 3. PRIORIDAD (Select Normal - Pocos datos) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
              >
                <option value="">Ninguna</option>
                {prioridades?.map((p) => (
                  <option key={p.id_prioridad} value={p.id_prioridad}>
                    {p.nombre_original || p.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. LÍNEA DE ESTRATEGIA (Select Normal - Pocos datos) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Línea de Estrategia
              </label>
              <select
                value={estrategia}
                onChange={(e) => setEstrategia(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white"
              >
                <option value="">Ninguna</option>
                {estrategias?.map((e) => (
                  <option key={e.id_linea_estrategia} value={e.id_linea_estrategia}>
                    {e.nombre_original || e.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!nombre || !indicadorId || loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition mt-4"
          >
            {loading ? "Guardando..." : "Guardar Actividad"}
          </button>
        </form>

        {success && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm font-medium animate-pulse">
            <CheckCircle className="w-5 h-5" />
            Actividad creada y vinculada con éxito
          </div>
        )}
      </div>
    </div>
  );
}