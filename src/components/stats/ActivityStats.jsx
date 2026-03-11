import { useState, useEffect } from "react";
import {
  Activity,
  Users,
  Target,
  BarChart2,
  PieChart as PieChartIcon,
  Search,
  Info,
  Tag,
  GitBranch,
  List,
  Hash,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { apiRequest } from "../../api/api";
import { fetchActivityDetail } from "../../Funtions/FetchFuntions";
import { ActivityDetailCard } from "./Modals/ActivityDetailsCard";

const COLORS = [
  "#6366f1",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#3b82f6",
  "#ef4444",
];

export function ActivityStats({ data }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // 1. Buscador de Actividades (Query al servidor)
  useEffect(() => {
    if (searchTerm.length < 3) {
      setSearchResults([]);
      return;
    }

    const searchAct = async () => {
      setIsSearching(true);
      try {
        const resp = await apiRequest(
          "actividad",
          "GET",
          null,
          `?search=${searchTerm}`,
        );
        setSearchResults(resp.results || resp);
      } catch (error) {
        console.error("Error buscando actividades", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchAct, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Selección de Actividad (Carga de detalle granular)
  const handleSelectActivity = async (id) => {
    setDetailLoading(true);
    try {
      const data = await fetchActivityDetail(id);
      setSelectedActivity(data);
      setSearchTerm("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error obteniendo detalle:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  if (!data || !data.kpis || !data.graficas) {
    return <div className="p-6 text-slate-500">Cargando datos maestros...</div>;
  }

  const { kpis, graficas } = data;

  return (
    <div className="p-6 space-y-8">
      {/* Header & KPIs Globales */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-slate-900 flex items-center gap-2 text-xl font-bold">
            <BarChart2 className="w-6 h-6 text-indigo-600" />
            Panorama General
          </h2>
          <p className="text-slate-500 text-sm">
            Resumen de impacto institucional.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 min-w-[200px]">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium">
                Total Actividades
              </p>
              <p className="text-xl font-bold text-slate-900">
                {kpis.total_actividades}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 min-w-[200px]">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium">
                Participantes Únicos
              </p>
              <p className="text-xl font-bold text-slate-900">
                {kpis.total_participantes}
              </p>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* --- SECCIÓN DE BÚSQUEDA --- */}
      <section className="space-y-4">
        <div className="max-w-2xl">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Explorador de Actividades
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              placeholder="Busca un evento para ver la asistencia por taller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Resultados */}
            {searchResults.length > 0 && (
              <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-auto">
                {searchResults.map((act) => (
                  <button
                    key={act.id_actividad}
                    onClick={() => handleSelectActivity(act.id_actividad)}
                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-slate-50 last:border-0 flex items-center justify-between transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {act.nombre}
                    </span>
                    <Info className="w-4 h-4 text-slate-300" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- DETALLE DE ACTIVIDAD SELECCIONADA --- */}
        {selectedActivity && (
          <ActivityDetailCard
            activity={selectedActivity}
            onClose={() => setSelectedActivity(null)}
          />
        )}
      </section>

      {/* --- GRÁFICAS GLOBALES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2 uppercase tracking-wide">
            <PieChartIcon className="w-4 h-4 text-slate-400" /> Distribución por
            Indicador (Global)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={graficas.indicadores}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {graficas.indicadores.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2 uppercase tracking-wide">
            <Target className="w-4 h-4 text-slate-400" /> Volumen por Prioridad
            (Global)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graficas.prioridades}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {graficas.prioridades.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
