import { XCircle, PlusCircle } from "lucide-react";

export function CreateEntityModal({ open, onClose, onSelect }) {
  if (!open) return null;

  const options = [
    { key: "accion", label: "Acción" },
    { key: "actividad", label: "Actividad" },
    { key: "seccion", label: "Sección" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5 space-y-4 animate-in zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Crear elemento
          </h2>
          <button onClick={onClose}>
            <XCircle className="w-5 h-5 text-gray-400 hover:text-red-500" />
          </button>
        </div>

        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onSelect(opt.key)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border hover:bg-gray-50 transition"
            >
              <PlusCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-700">
                Crear {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}