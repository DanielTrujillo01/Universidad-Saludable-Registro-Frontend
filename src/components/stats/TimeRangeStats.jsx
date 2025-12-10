import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Users, Filter, X, List } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { apiRequest } from "../../api/api";

const MONTHS = [
  { val: 1, name: 'Enero' }, { val: 2, name: 'Febrero' }, { val: 3, name: 'Marzo' },
  { val: 4, name: 'Abril' }, { val: 5, name: 'Mayo' }, { val: 6, name: 'Junio' },
  { val: 7, name: 'Julio' }, { val: 8, name: 'Agosto' }, { val: 9, name: 'Septiembre' },
  { val: 10, name: 'Octubre' }, { val: 11, name: 'Noviembre' }, { val: 12, name: 'Diciembre' }
];

export function TimeRangeStats() {
  const currentYear = new Date().getFullYear();
  const baseYear = 2018; 
  const years = Array.from({ length: currentYear - baseYear + 1 }, (_, i) => baseYear + i);

  // --- ESTADOS DE LA VISTA PRINCIPAL ---
  const [mainViewMode, setMainViewMode] = useState('monthly');
  const [mainYear, setMainYear] = useState(currentYear);
  const [chartData, setChartData] = useState([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  // --- ESTADOS DEL MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [filterMode, setFilterMode] = useState('monthly');
  const [filterYear, setFilterYear] = useState(currentYear);
  const [range, setRange] = useState({ start: 1, end: 12 });
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 1. Cargar Gráficos Principales
  useEffect(() => {
    const fetchCharts = async () => {
      setLoadingCharts(true);
      try {
        const resp = await apiRequest("dashboardTiempoStats", "GET", null, `?mode=${mainViewMode}&anio=${mainYear}`);
        setChartData(resp);
      } catch (error) {
        console.error("Error cargando gráficas:", error);
      } finally {
        setLoadingCharts(false);
      }
    };
    fetchCharts();
  }, [mainViewMode, mainYear]);

  // 2. Manejo de cambio de pestaña en el MODAL
  const handleModalModeChange = (mode) => {
    setFilterMode(mode);
    setDetailData(null);
    if (mode === 'monthly') {
      setRange({ start: 1, end: 12 });
    } else {
      setRange({ start: baseYear, end: currentYear });
    }
  };

  // 3. Buscar Detalles
  const fetchDetail = async () => {
    setLoadingDetail(true);
    let inicio, fin;
    const startVal = String(range.start).padStart(2, '0');
    const endVal = String(range.end).padStart(2, '0');

    if (filterMode === 'monthly') {
      inicio = `${filterYear}-${startVal}-01`;
      const ultimoDia = new Date(filterYear, range.end, 0).getDate();
      fin = `${filterYear}-${endVal}-${ultimoDia}`;
    } else {
      inicio = `${range.start}-01-01`;
      fin = `${range.end}-12-31`;
    }

    try {
      const resp = await apiRequest("dashboardTiempoDetalle", "GET", null, `?inicio=${inicio}&fin=${fin}`);
      setDetailData(resp);
    } catch (error) {
      console.error("Error cargando detalle:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const totalActivities = chartData.reduce((sum, item) => sum + item.actividades, 0);
  const totalParticipants = chartData.reduce((sum, item) => sum + item.participantes, 0);

  return (
    <div className="p-6 space-y-6 relative">
      {/* ---------------- HEADER & KPI PRINCIPALES ---------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-slate-900 flex items-center gap-2 font-bold text-xl">
            <Calendar className="w-6 h-6 text-blue-600" />
            Análisis Temporal
          </h2>
          <p className="text-slate-500 text-sm">Panorama general del impacto histórico</p>
        </div>
        
        <div className="flex gap-3">
          <select 
            value={mainYear} 
            onChange={(e) => setMainYear(e.target.value)}
            className="bg-white border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-blue-100 outline-none"
          >
            {years.map(y => <option key={y} value={y}>Año {y}</option>)}
          </select>

          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <Filter className="w-4 h-4" />
            Explorar Detalles
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">Actividades ({mainYear})</p>
            <p className="text-3xl font-black text-slate-800">{totalActivities}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">Participantes ({mainYear})</p>
            <p className="text-3xl font-black text-slate-800">{totalParticipants}</p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-xl">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* ---------------- GRÁFICAS DE FONDO ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[350px]">
          <h3 className="text-slate-700 font-bold mb-4 text-sm uppercase tracking-wide">Frecuencia Mensual</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              {/* Eliminado barSize para que use el ancho natural máximo */}
              <Bar dataKey="actividades" fill="#3b82f6" radius={[6, 6, 0, 0]} /> 
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[350px]">
          <h3 className="text-slate-700 font-bold mb-4 text-sm uppercase tracking-wide">Asistencia Mensual</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="participantes" stroke="#6366f1" strokeWidth={4} dot={{r: 4, strokeWidth:0}} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---------------- MODAL DE DETALLES ---------------- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModal(false)}
          />

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col relative z-10 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-800">Explorador de Detalles</h3>
                <p className="text-slate-500 text-sm">Filtra por fechas para ver el impacto granular</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Modal Body Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar">
              
              {/* Controles de Filtro */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-8 sticky top-0 z-10">
                <div className="flex gap-2 mb-4">
                   <button 
                    onClick={() => handleModalModeChange('monthly')} 
                    className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${filterMode === 'monthly' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    Rango Mensual
                  </button>
                  <button 
                    onClick={() => handleModalModeChange('yearly')} 
                    className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${filterMode === 'yearly' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    Rango Anual
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-end">
                  {filterMode === 'monthly' && (
                    <div className="w-full md:w-1/3">
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Año</label>
                      <select 
                        value={filterYear} 
                        onChange={(e) => setFilterYear(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  )}
                  
                  <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Desde - Hasta</label>
                    <div className="flex items-center gap-2">
                      <select 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-slate-700 outline-none"
                        value={range.start} 
                        onChange={e => setRange({ ...range, start: Number(e.target.value) })}
                      >
                        {filterMode === 'monthly' ? MONTHS.map(m => <option key={m.val} value={m.val}>{m.name}</option>) : years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <span className="text-slate-300">-</span>
                      <select 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-slate-700 outline-none"
                        value={range.end} 
                        onChange={e => setRange({ ...range, end: Number(e.target.value) })}
                      >
                        {filterMode === 'monthly' ? MONTHS.map(m => <option key={m.val} value={m.val}>{m.name}</option>) : years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={fetchDetail} 
                    disabled={loadingDetail}
                    className="w-full md:w-auto bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20"
                  >
                    {loadingDetail ? '...' : 'Ver Resultados'}
                  </button>
                </div>
              </div>

              {/* ---------------- RESULTADOS (DISEÑO ORIGINAL RESTAURADO) ---------------- */}
              {detailData && (
                <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl animate-in slide-in-from-bottom-4 duration-500">
                  {/* Cabecera de la tarjeta oscura */}
                  <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 border-b border-white/10 pb-6">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-white">Resultados Encontrados</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        {filterMode === 'monthly' ? `Filtrado por meses del año ${filterYear}` : 'Filtrado multi-anual'}
                      </p>
                    </div>
                    <div className="flex gap-4 text-right w-full md:w-auto">
                      <div className="bg-white/10 p-3 rounded-xl flex-1 md:flex-none">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Actividades</p>
                        <p className="text-2xl font-black text-blue-400">{detailData.total_actividades}</p>
                      </div>
                      <div className="bg-white/10 p-3 rounded-xl flex-1 md:flex-none">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Participantes</p>
                        <p className="text-2xl font-black text-emerald-400">{detailData.total_participantes}</p>
                      </div>
                    </div>
                  </div>

                  {/* Lista en GRID (Restaurada) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {detailData.listado.length > 0 ? (
                      detailData.listado.map((act, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group">
                          <div className="flex justify-between items-start mb-4 gap-2">
                            <h4 className="font-bold text-lg leading-tight group-hover:text-blue-400 transition-colors text-white">
                              {act.nombre}
                            </h4>
                            <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-1 rounded-full font-black uppercase shrink-0">
                              Actividad
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <p className="text-xs text-slate-400 font-bold flex items-center gap-2">
                              <List className="w-3 h-3" /> TEMAS / TALLERES:
                            </p>
                            
                            <div className="grid gap-2">
                              {Object.entries(act.temas).map(([tema, count], idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm bg-black/20 p-2 rounded-lg">
                                  <span className="text-slate-300 truncate pr-2">{tema}</span>
                                  <span className="font-bold text-white shrink-0">
                                    {count} <span className="text-[10px] text-slate-500 font-normal">asistentes</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="pt-3 mt-2 border-t border-white/5 flex justify-between items-center">
                              <span className="text-xs text-slate-500">Participación total:</span>
                              <span className="text-sm font-black text-emerald-400">{act.participantes_actividad}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12 text-slate-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        No se encontraron actividades en este rango de fechas.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!detailData && !loadingDetail && (
                <div className="text-center py-20 text-slate-400 opacity-60">
                  <Filter className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <p className="font-medium text-lg">Selecciona un rango de fechas y presiona "Ver Resultados"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}