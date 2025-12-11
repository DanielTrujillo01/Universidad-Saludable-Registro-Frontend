// src/components/EntityList.jsx
import { Trash2, Database } from "lucide-react";

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
    return (
      <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
        <p>No hay registros creados aún.</p>
      </div>
    );
  }

  // Helper para encontrar el ID correcto según tus modelos de Django (id_sede, id_facultad, etc.)
  const getItemId = (item, type) => {
    const specificIdKey = `id_${type.replace(/([A-Z])/g, "_$1").toLowerCase()}`;
    return item[specificIdKey] || item.id;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.keys(entities).map((entityType) => {
          const entityList = entities[entityType];

          // Ocultamos la tarjeta si no tiene elementos
          if (!entityList || entityList.length === 0) return null;

          return (
            <div 
              key={entityType} 
              className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* HEADER DE LA TARJETA */}
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-500" />
                    <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
                    {entityLabels[entityType] || entityType}
                    </h3>
                </div>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {entityList.length}
                </span>
              </div>

              {/* LISTA SCROLEABLE */}
              {/* Aquí está la magia: max-h-[300px] limita la altura y overflow-y-auto permite scroll */}
              <div className="p-2 overflow-y-auto max-h-[300px] custom-scrollbar bg-slate-50/30">
                <ul className="space-y-1">
                  {entityList.map((entity) => {
                    const currentId = getItemId(entity, entityType);
                    
                    // Nombre principal
                    const displayName = entity.nombre_original || entity.nombre;

                    // Lógica para escuelas
                    let facultadName = null;
                    if (entityType === "escuela" && entity.facultad) {
                      // Buscamos la facultad usando el ID correcto
                      const facultadEntity = entities.facultad.find((f) => {
                         const fId = getItemId(f, 'facultad');
                         return fId === entity.facultad;
                      });
                      
                      if (facultadEntity) {
                        facultadName = facultadEntity.nombre_original || facultadEntity.nombre;
                      }
                    }

                    return (
                      <li
                        key={currentId}
                        className="group flex items-start justify-between gap-3 p-3 rounded-lg bg-white border border-transparent hover:border-indigo-100 hover:shadow-sm transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate" title={displayName}>
                            {displayName}
                          </p>

                          {facultadName && (
                            <p className="text-xs text-slate-400 mt-0.5 truncate flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 inline-block"/>
                              {facultadName}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            if(window.confirm("¿Seguro que deseas eliminar este elemento?")) {
                                onDelete(entityType, currentId);
                            }
                          }}
                          className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              
              {/* Indicador visual de que hay más contenido (Sombra inferior sutil) */}
              {entityList.length > 6 && (
                 <div className="h-4 bg-gradient-to-t from-black/5 to-transparent pointer-events-none -mt-4 relative z-10" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}