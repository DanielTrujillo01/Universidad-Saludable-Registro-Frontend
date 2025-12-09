import { useState, useEffect } from "react";
import { Target, TrendingUp, Activity, Search } from "lucide-react";
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
import { apiRequest } from "../../api/api"; // Asegúrate de importar tu función de API

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#ec4899",
];

export function IndicatorStats() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Cargar datos del Backend
  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        const data = await apiRequest("dashboardIndicador", "GET");
        setStats(data);
      } catch (error) {
        console.error("Error cargando indicadores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndicators();
  }, []);

  if (loading) {
    return <div className="p-6 text-slate-500">Cargando indicadores...</div>;
  }

  if (!stats) {
    return (
      <div className="p-6 text-red-500">No se pudieron cargar los datos.</div>
    );
  }

  // 2. Filtrar datos según el término de búsqueda (sobre la lista que trajo el API)
  const filteredData = stats.data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Si filtramos, recalculamos el total visualizado (opcional, o mantenemos el global)
  // Para las tarjetas, usaremos los datos globales que envió el backend
  const { total_actividades, total_indicadores, top_indicator } = stats;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-slate-900 flex items-center gap-2 text-xl font-bold">
          <Target className="w-6 h-6 text-blue-600" />
          Actividades por Indicador
        </h2>
        <p className="text-slate-600 mt-1">
          Distribución de actividades según indicadores estratégicos
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar indicador por nombre..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-600 font-medium">Total Actividades</p>
              <p className="text-2xl font-bold text-blue-900">
                {total_actividades}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-600 font-medium">Total Indicadores</p>
              <p className="text-2xl font-bold text-purple-900">
                {total_indicadores}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-600 font-medium">Mayor Porcentaje</p>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-green-900">
                  {top_indicator.porcentaje}%
                </span>
                <span
                  className="text-xs text-green-700 truncate max-w-[150px]"
                  title={top_indicator.name}
                >
                  {top_indicator.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-slate-800 font-semibold mb-4">
            Actividades por Indicador
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  horizontal={false}
                />
                <XAxis type="number" stroke="#64748b" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748b"
                  width={140}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="actividades"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                >
                  {filteredData.map((entry, index) => (
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

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-slate-800 font-semibold mb-4">
            Distribución Porcentual
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="porcentaje"
                >
                  {filteredData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value) => [`${value}%`, "Porcentaje"]}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-slate-800 font-semibold mb-4">
          Detalle por Indicador
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                  Indicador
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                  Actividades
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                  Porcentaje
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 w-1/3">
                  Visualización
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((indicator, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="text-sm text-slate-900 font-medium">
                          {indicator.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {indicator.actividades}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {indicator.porcentaje}%
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${indicator.porcentaje}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">
                    No se encontraron indicadores
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
