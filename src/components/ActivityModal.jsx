import { useState, useEffect } from "react";
import { XCircle, CheckCircle } from "lucide-react";
import { apiRequest } from "../api/api";
import { normalizeText } from "../Funtions/BasicFuntions";

export function ActivityModal({ open, onClose, onSubmit, indicadores }) {
  // 1. Hook para detectar la tecla ESCAPE
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }

    // Limpieza del evento al cerrar
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const [nombre, setNombre] = useState("");
  const [indicador, setIndicador] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Si no está abierto, no renderizamos nada
  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !indicador) return;

    setLoading(true);
    
    const data = {
      nombre: normalizeText(nombre),
      nombre_original: nombre,
      indicador: parseInt(indicador, 10),
    };

    try {
      const newActividad = await apiRequest("actividad", "POST", data);
      onSubmit && onSubmit(newActividad);
      setSuccess(true);
      setNombre("");
      setIndicador("");

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
    /* 2. FONDO SEMITRANSPARENTE 
       - fixed inset-0: Cubre toda la pantalla.
       - z-50: Encima de todo.
       - bg-black/60: Fondo negro al 60% de opacidad (semitransparente).
       - backdrop-blur-sm: Efecto borroso elegante en el fondo.
       - onClick={onClose}: Cierra el modal si das clic afuera.
    */
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-4"
      onClick={onClose} 
    >
      {/* CONTENIDO DEL MODAL 
         - onClick={(e) => e.stopPropagation()}: Evita que el clic DENTRO del modal lo cierre.
      */}
      <div 
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
        >
          <XCircle className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold text-gray-800">
          Crear Nueva Actividad
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoFocus // Enfoca el input automáticamente al abrir
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Indicador <span className="text-red-500">*</span>
            </label>
            {indicadores && indicadores.length > 0 ? (
              <select
                value={indicador}
                onChange={(e) => setIndicador(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
              >
                <option value="">Seleccione un indicador</option>
                {indicadores.map((i) => (
                  <option key={i.id_indicador} value={i.id_indicador}>
                    {i.nombre_original || i.nombre}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-yellow-50 text-yellow-700 rounded border border-yellow-200 text-sm">
                ⚠ No hay indicadores disponibles.
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!nombre || !indicador || loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition"
          >
            {loading ? "Guardando..." : "Guardar Actividad"}
          </button>
        </form>

        {success && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm font-medium animate-pulse">
            <CheckCircle className="w-5 h-5" />
            Creado con éxito
          </div>
        )}
      </div>
    </div>
  );
}