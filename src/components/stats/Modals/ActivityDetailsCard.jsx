import { Users, Target, Hash, GitBranch, List } from "lucide-react";
import { useState, useEffect } from "react";

export function ActivityDetailCard({ activity, onClose }) {
  if (!activity) return null;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const temas = activity.temas_asociados || [];

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTemas = temas.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(temas.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activity]);

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-300 bg-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
      {/* Elemento Decorativo */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold">{activity.nombre}</h3>
            <p className="text-indigo-300 text-sm mt-1">
              Análisis de participación por taller específico
            </p>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
          >
            CERRAR DETALLE
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda */}
          <div className="space-y-4">
            <div className="bg-white/10 rounded-xl p-4 border border-white/5">
              <p className="text-indigo-200 text-xs uppercase tracking-wider font-bold mb-1 flex items-center gap-2">
                <Users className="w-3 h-3" /> Asistencia Total (Evento)
              </p>
              <p className="text-3xl font-black">
                {activity.total_participantes}
              </p>
              <p className="text-[10px] text-indigo-300 mt-1">
                * Personas únicas en el evento global
              </p>
            </div>

            <div className="space-y-2 bg-white/5 p-4 rounded-xl text-sm">
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-indigo-300" />
                <span>
                  <b className="text-indigo-200">Indicador:</b>{" "}
                  {activity.indicador?.nombre || "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Hash className="w-4 h-4 text-indigo-300" />
                <span>
                  <b className="text-indigo-200">Prioridad:</b>{" "}
                  {activity.prioridad?.nombre || "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <GitBranch className="w-4 h-4 text-indigo-300" />
                <span>
                  <b className="text-indigo-200">Estrategia:</b>{" "}
                  {activity.estrategia?.nombre || "N/A"}
                </span>
              </div>

              {activity.estamento_participantes?.length > 0 && (
                <div className="pt-3 mt-3 border-t border-white/10 space-y-2">
                  <div className="text-indigo-200 font-bold text-xs uppercase tracking-wider">
                    Participación por Estamento
                  </div>

                  {activity.estamento_participantes.map((e, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-indigo-800/40 px-3 py-2 rounded-lg"
                    >
                      <span className="text-xs">{e.estamento}</span>
                      <span className="text-xs font-bold bg-emerald-500/90 px-2 py-1 rounded-md">
                        {e.cantidad} ({e.porcentaje}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Talleres */}
          <div className="lg:col-span-2 bg-white/5 rounded-xl p-5 border border-white/10">
            <h4 className="flex items-center gap-2 font-bold mb-4 text-indigo-100">
              <List className="w-4 h-4" /> Asistencia Específica por Taller
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activity.temas_asociados?.length > 0 ? (
                currentTemas.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col bg-indigo-800/50 border border-white/5 px-4 py-3 rounded-xl hover:bg-indigo-800 transition-colors"
                  >
                    <span className="text-xs text-indigo-300 font-bold uppercase mb-1">
                      Taller
                    </span>

                    <div className="flex justify-between items-center">
                      <span
                        className="text-sm font-medium truncate mr-2"
                        title={t.tema__nombre}
                      >
                        {t.tema__nombre}
                      </span>

                      <span className="bg-emerald-500 text-[11px] text-white px-2 py-1 rounded-md font-black flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {t.total_participantes}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-6">
                  <p className="text-sm text-indigo-300 italic">
                    Esta actividad no tiene talleres registrados aún.
                  </p>
                </div>
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>

                <span className="text-xs text-indigo-200 font-bold">
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
