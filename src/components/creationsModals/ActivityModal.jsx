import { useState, useEffect } from "react";
import { XCircle, CheckCircle } from "lucide-react";
import { apiRequest } from "../../api/api";
import { normalizeText } from "../../Funtions/BasicFuntions";
import { AsyncEntitySelect } from "../AsyncEntitySelect";

export function ActivityModal({ open, onClose, onSubmit }) {
  const [nombre, setNombre] = useState("");
  const [accion, setAccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- LÓGICA DE LIMPIEZA ---
  const clearForm = () => {
    setNombre("");
    setAccion("");
    setSuccess(false);
    setLoading(false);
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  // --- VALIDACIÓN ---
  // El formulario es válido solo si tiene nombre (sin espacios vacíos) y una acción seleccionada
  const isFormValid = nombre.trim() !== "" 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);

    const data = {
      nombre: normalizeText(nombre),
      nombre_original: nombre,
    };

    try {
      const res = await apiRequest("actividad", "POST", data);
      onSubmit && onSubmit(res);

      setSuccess(true);

      setTimeout(() => {
        handleClose(); // Limpia y cierra tras el éxito
      }, 1200);
    } catch (err) {
      console.error(err);
      alert("❌ Error creando actividad");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleClose} // Limpia al cerrar haciendo clic fuera
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose} // Limpia al cerrar con la X
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
        >
          <XCircle className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold border-b pb-2 text-gray-800">
          Crear Nueva Actividad
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NOMBRE DE ACTIVIDAD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la actividad <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Ej: Taller de reforzamiento"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition mt-2"
          >
            {loading ? "Guardando..." : "Guardar Actividad"}
          </button>
        </form>

        {success && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm font-medium animate-pulse">
            <CheckCircle className="w-5 h-5" />
            Actividad creada correctamente
          </div>
        )}
      </div>
    </div>
  );
}