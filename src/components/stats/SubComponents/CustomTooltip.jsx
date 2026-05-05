export function CustomTooltip({ active, payload, label }){
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl min-w-[200px]">
        <p className="text-indigo-400 font-black text-sm mb-2 uppercase tracking-tighter border-b border-white/10 pb-1">
          {label} - Resumen
        </p>
        <div className="space-y-1 mb-3">
          <p className="text-white text-xs flex justify-between">
            <span className="text-slate-400">Acciones:</span> <b>{data.total_acciones}</b>
          </p>
          <p className="text-white text-xs flex justify-between">
            <span className="text-slate-400">Actividades:</span> <b>{data.total_actividades}</b>
          </p>
          <p className="text-white text-xs flex justify-between">
            <span className="text-slate-400">Participantes:</span> <b>{data.total_participaciones}</b>
          </p>
        </div>
        
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Desglose por Acción</p>
        <div className="space-y-2">
          {data.desglose_acciones?.map((acc, i) => (
            <div key={i} className="bg-white/5 p-2 rounded-lg border border-white/5">
              <p className="text-[11px] font-bold text-indigo-300 truncate w-full">{acc.accion}</p>
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>{acc.actividades} Actividades</span>
                <span className="text-emerald-400 font-bold">{acc.participaciones} Pers.</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};