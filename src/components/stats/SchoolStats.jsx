import { useState, useEffect } from "react";
import {
  School,
  BookOpen,
  Users,
  Search,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
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

const COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#ef4444",
  "#6366f1",
  "#14b8a6",
  "#84cc16",
];

export function SchoolStats() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingStart, setPendingStart] = useState("");
  const [pendingEnd, setPendingEnd] = useState("");
  const [appliedRange, setAppliedRange] = useState({
    start: "",
    end: "",
  });
  const [estamentoData, setEstamentoData] = useState([]);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);

        let query = "";

        if (appliedRange.start && appliedRange.end) {
          query = `?start_date=${appliedRange.start}&end_date=${appliedRange.end}`;
        }

        const data = await apiRequest("dashboardEscuela", "GET", null, query);

        setStats(data);
        setEstamentoData(data.estamento_global);
      } catch (error) {
        console.error("Error cargando escuelas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, [appliedRange]);

  useEffect(() => {
    if (selectedSchool && stats?.data) {
      const school = stats.data.find((s) => s.id === selectedSchool.id);

      if (school) {
        fetchSchoolDetail(school);
      }
    }
  }, [stats]);

  const fetchSchoolDetail = async (school) => {
    try {
      let query = `?id=${school.id}`;

      if (appliedRange.start && appliedRange.end) {
        query += `&fecha_inicio=${appliedRange.start}&fecha_fin=${appliedRange.end}`;
      }

      const data = await apiRequest(
        "dashboardEscuelaDetalle",
        "GET",
        null,
        query,
      );

      setEstamentoData(data.estamento_participantes);
    } catch (error) {
      console.error(error);
    }
  };

  const applyFilter = () => {
    if (!pendingStart || !pendingEnd) return;

    if (
      pendingStart !== appliedRange.start ||
      pendingEnd !== appliedRange.end
    ) {
      setAppliedRange({
        start: pendingStart,
        end: pendingEnd,
      });
    }
  };

  const cancelFilter = () => {
    setPendingStart("");
    setPendingEnd("");

    if (appliedRange.start || appliedRange.end) {
      setAppliedRange({ start: "", end: "" });
    }
  };

  const suggestions =
    stats?.data
      ?.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .slice(0, 8) || [];

  if (loading)
    return <div className="p-6 text-slate-500">Cargando escuelas...</div>;
  if (!stats)
    return <div className="p-6 text-red-500">No hay datos disponibles.</div>;

  // ---------------------------------------------------------
  // LÓGICA DE FILTRADO Y TOP 10
  // ---------------------------------------------------------

  // 1. Datos completos filtrados por búsqueda (para la TABLA y )
  let allFilteredData = stats.data;

  if (selectedSchool) {
    allFilteredData = stats.data.filter(
      (item) => item.id === selectedSchool?.id,
    );
  }

  let chartData = [];

  if (searchTerm || selectedSchool) {
    chartData = [...allFilteredData]
      .sort((a, b) => b.participantes - a.participantes)
      .slice(0, 15);
  } else {
    chartData = [...stats.data]
      .sort((a, b) => b.participantes - a.participantes)
      .slice(0, 10);
  }

  const pieData = chartData.slice(0, 10);

  // KPIs (Siempre calculados sobre lo que el usuario está "viendo/filtrando")
  const totalActivities = allFilteredData.reduce(
    (sum, item) => sum + item.actividades,
    0,
  );
  const totalParticipants = allFilteredData.reduce(
    (sum, item) => sum + item.participantes,
    0,
  );

  // Total global para calcular porcentajes relativos
  const grandTotalParticipants = stats.data.reduce(
    (sum, item) => sum + item.participantes,
    0,
  );

  const selectedSchoolData = selectedSchool
    ? stats.data.find((s) => s.id === selectedSchool.id)
    : null;

  const porcentajeParticipacion = selectedSchoolData
    ? (
        (selectedSchoolData.participantes / grandTotalParticipants) *
        100
      ).toFixed(1)
    : 0;
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-slate-900 flex items-center gap-2 text-xl font-bold">
          <School className="w-6 h-6 text-indigo-600" />
          Actividades por Escuela
        </h2>
        <p className="text-slate-600 mt-1">
          Análisis de participación académica.
          {!searchTerm && (
            <span className="text-indigo-600 font-medium ml-1">
              Mostrando Top 10 escuelas por defecto.
            </span>
          )}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="mb-6 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Buscar escuela..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Suggestions */}
          {showSuggestions && searchTerm && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.length > 0 ? (
                suggestions.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedSchool(item);
                      setSearchTerm("");
                      setShowSuggestions(false);

                      fetchSchoolDetail(item); // 👈 esto faltaba
                    }}
                    className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm"
                  >
                    {item.name}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-slate-500">
                  No se encontraron coincidencias
                </div>
              )}
            </div>
          )}
        </div>

        {selectedSchool?.name && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-slate-500">
              Escuela seleccionada:
            </span>

            <div className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
              {selectedSchool?.name}

              <button
                onClick={() => {
                  setSelectedSchool(null);
                  setEstamentoData(stats.estamento_global);
                }}
                className="text-indigo-600 hover:text-indigo-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Rango de fechas */}
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="flex flex-col w-full">
            <label className="text-xs text-slate-500 mb-1">Desde</label>
            <input
              type="date"
              value={pendingStart}
              onChange={(e) => setPendingStart(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col w-full">
            <label className="text-xs text-slate-500 mb-1">Hasta</label>
            <input
              type="date"
              value={pendingEnd}
              onChange={(e) => setPendingEnd(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        {/* Botones */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={applyFilter}
            disabled={!pendingStart || !pendingEnd}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Aplicar Filtro
          </button>

          {(appliedRange.start || appliedRange.end) && (
            <button
              onClick={cancelFilter}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
            >
              Cancelar Filtro
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {!selectedSchool && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg shadow-sm">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-600 font-medium">Escuelas Listadas</p>
                <p className="text-2xl font-bold text-indigo-900">
                  {allFilteredData.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-600 font-medium">
                  Actividades (Selección)
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {totalActivities}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg shadow-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-600 font-medium">
                  Participantes (Selección)
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {totalParticipants}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedSchool?.name && selectedSchoolData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg shadow-sm">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-600 font-medium">Escuela</p>
                <p className="text-lg font-bold text-indigo-900">
                  {selectedSchool?.name}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-600 font-medium">Actividades</p>
                <p className="text-2xl font-bold text-blue-900">
                  {selectedSchoolData.actividades}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg shadow-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-600 font-medium">Participantes</p>
                <p className="text-2xl font-bold text-green-900">
                  {selectedSchoolData.participantes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg shadow-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-600 font-medium">
                  % del Total Universitario
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {porcentajeParticipacion}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {estamentoData?.length > 0 && selectedSchool?.name && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            Distribución por Estamento
          </h3>

          <div className="space-y-2">
            {estamentoData.map((e, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition px-4 py-3 rounded-lg border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />

                  <span className="text-sm font-medium text-slate-700">
                    {e.estamento}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">
                    {e.cantidad} participantes
                  </span>

                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-indigo-100 text-indigo-700">
                    {e.porcentaje}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      {!selectedSchool && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfica 1: Barras (Actividades) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-slate-800 font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                {selectedSchool
                  ? `Actividades - ${selectedSchool?.name}`
                  : searchTerm
                    ? "Actividades (Búsqueda)"
                    : "Actividades (Top 10)"}
              </h3>
            </div>

            <div
              style={{
                height: Math.max(350, chartData.length * 35),
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ left: 10, right: 30 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={220}
                    interval={0}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) =>
                      value.length > 28 ? value.substring(0, 28) + "..." : value
                    }
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="actividades"
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                    name="Actividades"
                  >
                    {pieData.map((entry, index) => (
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

          {/* Gráfica 2: Pastel (Participantes) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-slate-400" />
              {selectedSchool
                ? `Participantes - ${selectedSchool?.name}`
                : searchTerm
                  ? "Participantes (Búsqueda)"
                  : "Participantes (Top 10)"}
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) =>
                      percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
                    }
                    outerRadius={100}
                    dataKey="participantes"
                    nameKey="name"
                  >
                    {chartData.map((entry, index) => (
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
                    }}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ fontSize: "11px", maxWidth: "40%" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tabla Detallada con Scroll */}
      {!selectedSchool && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-slate-900 font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600" />
              Listado Completo {searchTerm && "(Filtrado)"}
            </h3>
          </div>

          {/* Contenedor con Scroll */}
          <div className="overflow-auto flex-1">
            <table className="w-full relative">
              <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                    Escuela
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                    Actividades
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                    Participantes
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 w-1/3">
                    % Del Total Universitario
                  </th>
                </tr>
              </thead>
              <tbody>
                {allFilteredData.length > 0 ? (
                  allFilteredData.map((school, index) => {
                    const color = COLORS[index % COLORS.length];
                    const participacionGlobal =
                      grandTotalParticipants > 0
                        ? (
                            (school.participantes / grandTotalParticipants) *
                            100
                          ).toFixed(1)
                        : 0;

                    return (
                      <tr
                        key={index}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-sm font-medium text-slate-900">
                              {school.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center text-sm text-slate-700 font-medium">
                          {school.actividades}
                        </td>
                        <td className="py-4 px-4 text-center text-sm text-slate-700 font-medium">
                          {school.participantes}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium w-10 text-right text-slate-500">
                              {participacionGlobal}%
                            </span>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${participacionGlobal}%`,
                                  backgroundColor: color,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-12 text-center text-slate-500"
                    >
                      No se encontraron escuelas con ese nombre.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
