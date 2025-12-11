// src/components/EntitySelector.jsx
import {
  Building2,
  GitBranch,
  GraduationCap,
  School,
  Target,
  FileCheck,
  BookOpen,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const entities = [
  { type: "sede", label: "Sede", icon: Building2, color: "bg-blue-500" },
  { type: "lineaProyecto", label: "Línea De Proyecto", icon: GitBranch, color: "bg-purple-500" },
  { type: "facultad", label: "Facultad", icon: GraduationCap, color: "bg-green-500" },
  { type: "escuela", label: "Escuela", icon: School, color: "bg-yellow-500" },
  { type: "indicador", label: "Indicador", icon: Target, color: "bg-red-500" },
  { type: "actividadConsolidada", label: "Actividad Consolidada", icon: FileCheck, color: "bg-indigo-500" },
  { type: "tema", label: "Tema", icon: BookOpen, color: "bg-pink-500" },
  { type: "prioridad", label: "Prioridad", icon: AlertCircle, color: "bg-orange-500" },
  { type: "lineaEstrategia", label: "Línea de Estrategia", icon: TrendingUp, color: "bg-teal-500" },
];

export function EntitySelector({ onSelect, selectedEntity, disabled }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-gray-800 mb-4">Selecciona una Entidad</h2>
      <div className="space-y-2">
        {entities.map((entity) => {
          const Icon = entity.icon;
          const isSelected = selectedEntity === entity.type;

          return (
            <button
              key={entity.type}
              onClick={() => onSelect(entity.type)}
              disabled={disabled}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                isSelected
                  ? "bg-blue-100 border-2 border-blue-500"
                  : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
              } ${disabled && !isSelected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className={`${entity.color} text-white p-2 rounded-lg`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-gray-700">{entity.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
