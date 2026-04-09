import { useState, useEffect } from "react";
import { XCircle, CheckCircle } from "lucide-react";
import { apiRequest } from "../../api/api";
import { normalizeText } from "../../Funtions/BasicFuntions";
import { AsyncEntitySelect } from "../AsyncEntitySelect"; // <--- IMPORTANTE

export function ActivityModal({ open, onClose, onSubmit }) {
  const [nombre, setNombre] = useState("");
  const [accion, setAccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !accion) return;

    setLoading(true);

    const data = {
      nombre: normalizeText(nombre),
      nombre_original: nombre,
      id_accion: parseInt(accion, 10),
    };

    try {
      const res = await apiRequest("actividad", "POST", data);
      onSubmit && onSubmit(res);

      setSuccess(true);
      setNombre("");
      setAccion("");

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      alert("❌ Error creando actividad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
        >
          <XCircle className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold border-b pb-2">Crear Actividad</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Nombre de la actividad"
          />

          <AsyncEntitySelect
            entityType="accion" 
            label="Buscar Acción"
            onSelect={setAccion} 
            placeholder="Escribe para buscar una acción..."
            required={true}
          />

          <button
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg"
          >
            {loading ? "Guardando..." : "Guardar Actividad"}
          </button>
        </form>

        {success && (
          <div className="text-green-700 bg-green-50 p-2 rounded text-sm flex gap-2">
            <CheckCircle className="w-5 h-5" />
            Actividad creada correctamente
          </div>
        )}
      </div>
    </div>
  );
}
