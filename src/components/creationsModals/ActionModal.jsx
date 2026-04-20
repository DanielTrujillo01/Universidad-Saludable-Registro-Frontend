import { useState, useEffect } from "react";
import { XCircle, CheckCircle } from "lucide-react";
import { apiRequest } from "../../api/api";
import { normalizeText } from "../../Funtions/BasicFuntions";

export function ActionModal({
  open,
  onClose,
  onSubmit,
  prioridades,
  lineasEstrategias,
  estrategias,
}) {
  // --- ESTADOS ---
  const [nombre, setNombre] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [lineaEstrategia, setLineaEstrategia] = useState("");
  const [estrategia, setEstrategia] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- LÓGICA DE LIMPIEZA ---
  const clearForm = () => {
    setNombre("");
    setPrioridad("");
    setLineaEstrategia("");
    setEstrategia("");
    setSuccess(false);
    setLoading(false);
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose(); // Limpia al cerrar con Esc
    };
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  // --- MANEJO DE ENVÍO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Verificación de seguridad extra en JS
    if (!nombre || !lineaEstrategia || !estrategia) return;

    setLoading(true);

    const data = {
      nombre: normalizeText(nombre),
      nombre_original: nombre,
      ...(prioridad && { id_prioridad: parseInt(prioridad, 10) }),
      id_linea_estrategia: parseInt(lineaEstrategia, 10),
      estrategia: parseInt(estrategia, 10),
    };

    try {
      const res = await apiRequest("accion", "POST", data);
      onSubmit && onSubmit(res);
      setSuccess(true);
      
      setTimeout(() => {
        handleClose(); // Limpia y cierra tras el éxito
      }, 1200);
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
      setLoading(false);
    }
  };

  // Validación para habilitar el botón
  const isFormValid = nombre.trim() !== "" && lineaEstrategia !== "" && estrategia !== "" && prioridad !== "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-4"
      onClick={handleClose} // Limpia al cerrar haciendo clic fuera
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose} // Limpia al cerrar con la X
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
        >
          <XCircle className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
          Crear Nueva Acción
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NOMBRE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Ej: Festival de habilidades para la vida"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PRIORIDAD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad <span className="text-red-500">*</span>
              </label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
              >
                <option value="">Seleccione una prioridad</option>
                {prioridades?.map((p) => (
                  <option key={p.id_prioridad} value={p.id_prioridad}>
                    {p.nombre_original || p.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* LÍNEA DE ESTRATEGIA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Línea de Estrategia <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={lineaEstrategia}
                onChange={(e) => setLineaEstrategia(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white"
              >
                <option value="">Seleccione una línea</option>
                {lineasEstrategias?.map((e) => (
                  <option key={e.id_linea_estrategia} value={e.id_linea_estrategia}>
                    {e.nombre_original || e.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* ESTRATEGIA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estrategia <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={estrategia}
                onChange={(e) => setEstrategia(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white"
              >
                <option value="">Seleccione una estrategia</option>
                {estrategias?.map((e) => (
                  <option key={e.id_estrategia} value={e.id_estrategia}>
                    {e.nombre_original || e.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition mt-4"
          >
            {loading ? "Guardando..." : "Guardar Acción"}
          </button>
        </form>

        {success && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm font-medium animate-pulse">
            <CheckCircle className="w-5 h-5" />
            Acción creada y vinculada con éxito
          </div>
        )}
      </div>
    </div>
  );
}