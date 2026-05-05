import { useState, useEffect } from "react";
// Agregado 'Target' a las importaciones
import {
  Calendar,
  TrendingUp,
  Users,
  Filter,
  X,
  List,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { apiRequest } from "../../api/api";
import { ActionDetailCard } from "./SubComponents/ActionDetailCard";
import { CustomTooltip } from "./SubComponents/CustomTooltip";

const MONTHS = [
  { val: 1, name: "Enero" },
  { val: 2, name: "Febrero" },
  { val: 3, name: "Marzo" },
  { val: 4, name: "Abril" },
  { val: 5, name: "Mayo" },
  { val: 6, name: "Junio" },
  { val: 7, name: "Julio" },
  { val: 8, name: "Agosto" },
  { val: 9, name: "Septiembre" },
  { val: 10, name: "Octubre" },
  { val: 11, name: "Noviembre" },
  { val: 12, name: "Diciembre" },
];

export function TimeRangeStats() {
  const currentYear = new Date().getFullYear();
  const baseYear = 2018;
  const years = Array.from(
    { length: currentYear - baseYear + 1 },
    (_, i) => baseYear + i,
  );

  const [selectedAction, setSelectedAction] = useState(null);
  const [mainViewMode, setMainViewMode] = useState("monthly");
  const [mainYear, setMainYear] = useState(currentYear);
  const [chartData, setChartData] = useState([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [filterMode, setFilterMode] = useState("monthly");
  const [filterYear, setFilterYear] = useState(currentYear);
  const [range, setRange] = useState({ start: 1, end: 12 });
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 1. Cargar Gráficos Principales
  useEffect(() => {
    const fetchCharts = async () => {
      setLoadingCharts(true);
      try {
        const resp = await apiRequest(
          "dashboardTiempoStats",
          "GET",
          null,
          `?mode=${mainViewMode}&anio=${mainYear}`,
        );
        setChartData(resp || []);
      } catch (error) {
        console.error("Error cargando gráficas:", error);
      } finally {
        setLoadingCharts(false);
      }
    };
    fetchCharts();
  }, [mainViewMode, mainYear]);

  // 2. Cálculos de KPIs (Corregidos nombres de propiedades según tus reducers)
  const totalActivities = chartData.reduce(
    (sum, item) => sum + (item.total_actividades || 0),
    0,
  );
  const totalParticipants = chartData.reduce(
    (sum, item) => sum + (item.total_participaciones || 0),
    0,
  );
  const totalActions = chartData.reduce(
    (sum, item) => sum + (item.total_acciones || 0),
    0,
  );

  // 3. Buscar Detalles (Refactorizado para evitar repetición)
  const getRangeDates = () => {
    let inicio, fin;
    const startVal = String(range.start).padStart(2, "0");
    const endVal = String(range.end).padStart(2, "0");

    if (filterMode === "monthly") {
      inicio = `${filterYear}-${startVal}-01`;
      const ultimoDia = new Date(filterYear, range.end, 0).getDate();
      fin = `${filterYear}-${endVal}-${ultimoDia}`;
    } else {
      inicio = `${range.start}-01-01`;
      fin = `${range.end}-12-31`;
    }
    return { inicio, fin };
  };

  const fetchDetail = async () => {
    setLoadingDetail(true);
    const { inicio, fin } = getRangeDates();
    try {
      const resp = await apiRequest(
        "dashboardTiempoDetalle",
        "GET",
        null,
        `?inicio=${inicio}&fin=${fin}`,
      );
      setDetailData(resp);
    } catch (error) {
      console.error("Error cargando detalle:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOpenDetailModal = async (id) => {
    setLoadingDetail(true);
    const { inicio, fin } = getRangeDates();
    try {
      const resp = await apiRequest(
        "dashboardAccionDetalleRange",
        "GET",
        null,
        `?id=${id}&inicio=${inicio}&fin=${fin}`,
      );
      setSelectedAction(resp);
    } catch (error) {
      console.error("Error obteniendo detalle:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="p-6 space-y-6 relative">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-slate-900 flex items-center gap-2 font-black text-2xl tracking-tight">
            <Calendar className="w-7 h-7 text-indigo-600" />
            Análisis Temporal
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Distribución estratégica de impacto por periodos
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={mainYear}
            onChange={(e) => setMainYear(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                Periodo {y}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Filter className="w-4 h-4" /> Explorar Detalles
          </button>
        </div>
      </div>

      {/* KPIs PRINCIPALES (Corregido: ya no usa objeto kpis inexistente) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Total Acciones"
          value={totalActions}
          icon={Target}
          color="text-red-600"
          bg="bg-indigo-50"
        />
        <KPICard
          title="Total Actividades"
          value={totalActivities}
          icon={TrendingUp}
          color="text-purple-600"
          bg="bg-blue-50"
        />
        <KPICard
          title="Participantes"
          value={totalParticipants}
          icon={Users}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
      </div>

      {/* GRÁFICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Volumen Operativo (Actividades)">
          {loadingCharts ? (
            <Loader />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="total_actividades"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  barSize={35}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        <ChartContainer title="Curva de Asistencia">
          {loadingCharts ? (
            <Loader />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="total_participaciones"
                  stroke="#10b981"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </div>

      {/* --- MODAL DE DETALLES (Mantenido tu diseño pero corregido el scroll y cierres) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-xl font-black text-slate-800">
                Explorador de Detalles
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {/* Filtros */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-8">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setFilterMode("monthly")}
                    className={`flex-1 py-2 rounded-lg font-bold ${filterMode === "monthly" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-50 text-slate-500"}`}
                  >
                    Mensual
                  </button>
                  <button
                    onClick={() => setFilterMode("yearly")}
                    className={`flex-1 py-2 rounded-lg font-bold ${filterMode === "yearly" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-50 text-slate-500"}`}
                  >
                    Anual
                  </button>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  {filterMode === "monthly" && (
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-lg flex-1"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="flex gap-2 flex-[2]">
                    <select
                      value={range.start}
                      onChange={(e) =>
                        setRange({ ...range, start: Number(e.target.value) })
                      }
                      className="p-2.5 bg-slate-50 border rounded-lg flex-1"
                    >
                      {filterMode === "monthly"
                        ? MONTHS.map((m) => (
                            <option key={m.val} value={m.val}>
                              {m.name}
                            </option>
                          ))
                        : years.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                    </select>
                    <select
                      value={range.end}
                      onChange={(e) =>
                        setRange({ ...range, end: Number(e.target.value) })
                      }
                      className="p-2.5 bg-slate-50 border rounded-lg flex-1"
                    >
                      {filterMode === "monthly"
                        ? MONTHS.map((m) => (
                            <option key={m.val} value={m.val}>
                              {m.name}
                            </option>
                          ))
                        : years.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                    </select>
                  </div>
                  <button
                    onClick={fetchDetail}
                    className="bg-slate-900 text-white px-8 py-2.5 rounded-lg font-bold"
                  >
                    {loadingDetail ? "Cargando..." : "Ver Resultados"}
                  </button>
                </div>
              </div>

              {/* Resultados */}
              {detailData && (
                <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl animate-in slide-in-from-bottom-4 duration-500">
                  {/* CABECERA */}
                  <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 border-b border-white/10 pb-6">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-white">
                        Resultados Encontrados
                      </h3>

                      <p className="text-slate-400 text-sm mt-1">
                        {filterMode === "monthly"
                          ? `Filtrado por meses del año ${filterYear}`
                          : "Filtrado multi-anual"}
                      </p>
                    </div>

                    <div className="flex gap-4 text-right w-full md:w-auto">
                      <div className="bg-white/10 p-3 rounded-xl flex-1 md:flex-none">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Acciones
                        </p>

                        <p className="text-2xl font-black text-indigo-400">
                          {detailData.total_acciones}
                        </p>
                      </div>

                      <div className="bg-white/10 p-3 rounded-xl flex-1 md:flex-none">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Actividades
                        </p>

                        <p className="text-2xl font-black text-blue-400">
                          {detailData.total_actividades}
                        </p>
                      </div>

                      <div className="bg-white/10 p-3 rounded-xl flex-1 md:flex-none">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Participantes
                        </p>

                        <p className="text-2xl font-black text-emerald-400">
                          {detailData.total_participaciones}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ESTAMENTOS */}
                  {detailData.estamentos?.length > 0 && (
                    <div className="pt-3 mt-3 space-y-2">
                      <div className="text-indigo-200 font-bold text-xs uppercase tracking-wider">
                        Participación por Estamento
                      </div>

                      {detailData.estamentos.map((e, index) => (
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

                  {/* GRID DE ACCIONES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {detailData.acciones?.length > 0 ? (
                      detailData.acciones.map((accion, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            handleOpenDetailModal(accion.id_accion)
                          }
                          className="text-left bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-indigo-400/30 transition-all group flex flex-col"
                        >
                          {/* HEADER ACCION */}
                          <div className="flex justify-between items-start gap-3 mb-5">
                            <div className="min-w-0">
                              <h4 className="font-black text-lg text-white break-words leading-tight group-hover:text-indigo-300 transition-colors">
                                {accion.nombre_accion}
                              </h4>

                              <p className="text-[10px] text-slate-500 uppercase mt-1 tracking-wider">
                                Acción Estratégica
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <div className="bg-indigo-500/20 text-indigo-300 text-[10px] px-3 py-1 rounded-full font-black uppercase">
                                {accion.actividades?.length || 0} actividades
                              </div>

                              <div className="bg-green-500/20 text-green-400 text-[10px] px-3 py-1 rounded-full font-black uppercase group-hover:bg-green-500/30 transition-colors">
                                Ver Detalle
                              </div>
                            </div>
                          </div>

                          {/* ACTIVIDADES */}
                          <div className="space-y-4 flex-1">
                            {accion.actividades?.map((actividad, idx) => (
                              <div
                                key={idx}
                                className="bg-black/20 border border-white/5 rounded-xl p-4"
                              >
                                {/* HEADER ACTIVIDAD */}
                                <div className="mb-3">
                                  <h5 className="font-bold text-sm text-slate-200 break-words">
                                    {actividad.nombre_actividad}
                                  </h5>

                                  <p className="text-[10px] text-slate-500 uppercase mt-1">
                                    Actividad Operativa
                                  </p>
                                </div>

                                {/* SECCIONES */}
                                <div className="space-y-2">
                                  {actividad.secciones?.map((sec, secIdx) => (
                                    <div
                                      key={secIdx}
                                      className="flex justify-between items-center text-xs bg-white/5 p-2 rounded-lg"
                                    >
                                      <span className="text-slate-300 break-words pr-2">
                                        {sec.nombre}
                                      </span>

                                      <span className="font-bold text-white shrink-0">
                                        {sec.cantidad}

                                        <span className="text-[10px] text-slate-500 font-normal ml-1">
                                          asistentes
                                        </span>
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {/* FOOTER ACTIVIDAD */}
                                <div className="pt-3 mt-3 border-t border-white/10 flex justify-between items-center">
                                  <span className="text-xs text-slate-500">
                                    Participación total:
                                  </span>

                                  <span className="text-sm font-black text-emerald-400">
                                    {actividad.participantes_actividad}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* FOOTER ACCION */}
                          <div className="pt-4 mt-5 border-t border-white/10 flex justify-between items-center">
                            <span className="text-xs text-slate-500">
                              Participación total de la acción:
                            </span>

                            <span className="text-lg font-black text-indigo-300">
                              {accion.total_participantes_accion}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12 text-slate-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        No se encontraron actividades en este rango de fechas.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Estado vacío */}
              {!detailData && !loadingDetail && (
                <div className="text-center py-20 text-slate-400 opacity-60">
                  <Filter className="w-16 h-16 mx-auto text-slate-300 mb-4" />

                  <p className="font-medium text-lg">
                    Selecciona un rango de fechas y presiona "Ver Resultados"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLE DE ACTIVIDAD */}
      {selectedAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedAction(null)}
          />
          <div className="relative z-10 w-full max-w-4xl">
            <ActionDetailCard
              action={selectedAction}
              onClose={() => setSelectedAction(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-componentes auxiliares
function KPICard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
      <div>
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">
          {title}
        </p>
        <p className="text-3xl font-black text-slate-800">
          {value.toLocaleString()}
        </p>
      </div>
      <div className={`${bg} p-4 rounded-2xl`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  );
}

function ChartContainer({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
      <h3 className="text-slate-700 font-black mb-6 text-xs uppercase tracking-widest flex items-center gap-2">
        <div className="w-1.5 h-4 bg-indigo-500 rounded-full" /> {title}
      </h3>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Loader() {
  return (
    <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm font-bold">
      Cargando datos...
    </div>
  );
}
