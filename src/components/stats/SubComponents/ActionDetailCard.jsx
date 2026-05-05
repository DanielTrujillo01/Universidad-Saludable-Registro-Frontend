import { Users, Target, CalendarCheck2, Hash, GitBranch, List, ChevronRight, LayoutGrid } from "lucide-react";
import { useState, useEffect } from "react";

// Renombramos a ActionDetailCard para reflejar la nueva jerarquía
export function ActionDetailCard({ action, onClose }) {
  if (!action) return null;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Ajustado para dar espacio a las sub-secciones

  // Ahora iteramos sobre actividades_asociadas
  const actividades = action.actividades_asociadas || [];
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentActividades = actividades.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(actividades.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [action]);

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-300 bg-slate-900 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden border border-slate-700">
      {/* Fondo Decorativo */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-indigo-500 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Acción Estratégica</span>
            </div>
            <h3 className="text-2xl font-bold text-white">{action.nombre}</h3>
            <p className="text-slate-400 text-sm mt-1">
              Desglose operativo de objetivos y recursos utilizados
            </p>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 rounded-xl text-xs font-bold transition-all border border-white/10"
          >
            CERRAR PANEL
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda: KPIs de la Acción */}
          <div className="space-y-4">
            <div className="bg-indigo-600 rounded-xl p-4 shadow-lg shadow-indigo-900/20">
              <p className="text-indigo-100 text-xs uppercase tracking-wider font-bold mb-1 flex items-center gap-2">
                <Users className="w-3 h-3" /> Cobertura
              </p>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-3xl font-black">Personas</span>
                <p className="text-3xl font-black">{"Personas únicas: ", action.total_participantes}</p>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-3xl font-black">Asistencias</span>
                <p className="text-3xl font-black">{"Asistencias totales: ", action.total_asistencias}</p>
              </div>
              <p className="text-[10px] text-indigo-200 mt-1 opacity-80">
                Distribucción de participantes y asistencias en actividades vinculadas
              </p>
            </div>

            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
              <DetailItem icon={Target} label="Estrategia" value={action.estrategia_nombre} />
              <DetailItem icon={Hash} label="Prioridad" value={action.prioridad_nombre} />
              <DetailItem icon={GitBranch} label="Línea" value={action.linea_nombre} />
              
              {/* Estamentos */}
              <div className="pt-3 mt-3 border-t border-white/10">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-3">Distribución de Audiencia</p>
                <div className="space-y-2">
                  {action .estamento_participantes?.map((e, i) => (
                    <div key={i} className="flex justify-between items-center text-xs bg-slate-800/50 p-2 rounded-lg">
                      <span className="text-slate-300">{e.estamento}</span>
                      <span className="font-bold text-indigo-400">{e.cantidad}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: Listado de Actividades y sus Secciones */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="flex items-center gap-2 font-bold text-slate-200 text-sm uppercase tracking-widest">
              <LayoutGrid className="w-4 h-4 text-indigo-400" /> Actividades Vinculadas
            </h4>

            <div className="grid grid-cols-1 gap-4">
              {actividades.length > 0 ? (
                currentActividades.map((act, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-bold text-indigo-300 flex items-center gap-2">
                          {act.nombre}
                        </h5>
                        <p className="text-[10px] text-slate-500 uppercase">Recurso Operativo</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="bg-emerald-500/10 text-emerald-400 text-[11px] px-2 py-1 rounded-md font-bold flex items-center gap-1 border border-emerald-500/20">
                          <span>Total Personas </span>
                          <Users className="w-3 h-3" /> {act.participantes_en_esta_accion}
                        </div>
                        <div className="bg-emerald-500/10 text-emerald-400 text-[11px] px-2 py-1 rounded-md font-bold flex items-center gap-1 border border-emerald-500/20">
                          <span>Total asistencias </span>
                          <CalendarCheck2 className="w-3 h-3" /> {act.asistencias_en_esta_accion}
                        </div>
                      </div>
                    </div>

                    {/* Sub-secciones de la actividad */}
                    {act.secciones?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {act.secciones.map((sec, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-1.5 bg-slate-800 text-slate-400 px-2 py-1 rounded-md text-[10px] border border-slate-700">
                            <ChevronRight className="w-3 h-3 text-indigo-500" />
                            <span className="font-medium text-slate-300">{sec.nombre}</span>
                            <span className="text-slate-500 ml-1">({sec.total_participantes})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic text-center py-10">No hay actividades registradas.</p>
              )}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-4 items-center mt-6">
                <PaginationButton 
                  label="Anterior" 
                  onClick={() => setCurrentPage(p => p - 1)} 
                  disabled={currentPage === 1} 
                />
                <span className="text-[10px] font-bold text-slate-500">
                  {currentPage} / {totalPages}
                </span>
                <PaginationButton 
                  label="Siguiente" 
                  onClick={() => setCurrentPage(p => p + 1)} 
                  disabled={currentPage === totalPages} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Auxiliares para limpieza de código
function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
      <span className="truncate">
        <b className="text-slate-500">{label}:</b> <span className="text-slate-200">{value || "N/A"}</span>
      </span>
    </div>
  );
}

function PaginationButton({ label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1 text-[10px] bg-white/5 hover:bg-white/10 rounded-lg font-black uppercase tracking-tighter disabled:opacity-20 transition-all border border-white/5"
    >
      {label}
    </button>
  );
}