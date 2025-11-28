import { useState } from "react";
import { XCircle, CheckCircle } from "lucide-react";
import { apiRequest } from "../api/api";
import { normalizeText } from "../Funtions/BasicFuntions";

export function ActivityModal({ open, onClose, onSubmit, indicadores }) {
  if (!open) return null;

  const [nombre, setNombre] = useState("");
  const [indicador, setIndicador] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !indicador) return;

    setLoading(true);
    
    const data = {
      nombre: normalizeText(nombre),
      nombre_original: nombre,
      indicador: parseInt(indicador, 10),
    }
    console.log("Datos a enviar:", data);
    try {
      const newActividad = await apiRequest("actividad", "POST", data);

      // Callback hacia el padre
      onSubmit && onSubmit(newActividad);

      setSuccess(true);
      setNombre("");
      setIndicador("");

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (error) {
      alert("❌ Error creando actividad. Revise consola.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 space-y-5 relative animate-fade-in">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
        >
          <XCircle className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold text-gray-800">
          Crear Nueva Actividad
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Ej: Taller de Robótica"
            />
          </div>

          {/* Indicador */}
          <div>
            <label className="block text-gray-700 mb-1">
              Indicador <span className="text-red-500">*</span>
            </label>

            {indicadores && indicadores.length > 0 ? (
              <select
                value={indicador}
                onChange={(e) => setIndicador(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="">Seleccione un indicador</option>
                {indicadores.map((i) => (
                  <option key={i.id_indicador} value={i.id_indicador}>
                    {i.nombre_original || i.nombre}
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 px-3 py-2 rounded-lg">
                ⚠ No hay indicadores registrados.
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!nombre || !indicador || loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar Actividad"}
          </button>
        </form>

        {/* Success */}
        {success && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-2">
            <CheckCircle className="w-5 h-5" />
            Actividad creada con éxito
          </div>
        )}
      </div>
    </div>
  );
}
