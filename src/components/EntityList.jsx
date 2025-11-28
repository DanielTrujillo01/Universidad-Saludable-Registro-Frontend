// src/components/EntityList.jsx
import { Trash2 } from "lucide-react";

const entityLabels = {
  sede: "Sedes",
  lineaProyecto: "Líneas De Proyecto",
  facultad: "Facultades",
  escuela: "Escuelas",
  indicador: "Indicadores",
  actividadConsolidada: "Actividades Consolidadas",
  tema: "Temas",
  prioridad: "Prioridades",
  lineaEstrategia: "Líneas de Estrategia",
};

export function EntityList({ entities, onDelete }) {
  const hasAnyEntities = Object.values(entities).some((list) => list.length > 0);

  if (!hasAnyEntities) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-gray-800">Entidades Creadas</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(entities).map((entityType) => {
          const entityList = entities[entityType];

          if (entityList.length === 0) return null;

          return (
            <div key={entityType} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-gray-700 mb-3 pb-2 border-b border-gray-200">
                {entityLabels[entityType]}
              </h3>

              <ul className="space-y-2">
                {entityList.map((entity) => {
                  
                  // Nombre principal usando nombre_original si existe
                  const displayName = entity.nombre_original || entity.nombre;

                  // Para escuelas: mostrar facultad original si existe
                  const facultadEntity =
                    entityType === "escuela" && entity.facultad
                      ? entities.facultad.find((f) => f.id === entity.facultad)
                      : null;

                  const facultadName = facultadEntity
                    ? facultadEntity.nombre_original || facultadEntity.nombre
                    : null;

                  return (
                    <li
                      key={entity.id}
                      className="flex items-start justify-between gap-2 p-2 rounded hover:bg-gray-50 group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 truncate">{displayName}</p>

                        {facultadName && (
                          <p className="text-gray-500 truncate">
                            Facultad: {facultadName}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => onDelete(entityType, entity.id)}
                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-gray-500">Total: {entityList.length}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
