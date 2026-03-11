import { useState, useEffect } from "react";
import {
  Building,
  Users,
  Search,
  BarChart3,
  PieChart as PieChartIcon,
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
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
];

export function CampusStats() {
  const [searchTerm, setSearchTerm] = useState("");
  const [useDateRange, setUseDateRange] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [pendingStart, setPendingStart] = useState("");
  const [pendingEnd, setPendingEnd] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [appliedRange, setAppliedRange] = useState({
    start: "",
    end: "",
  });
  const [stats, setStats] = useState(null);
  const [estamentoData, setEstamentoData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampus = async () => {
      try {
        setLoading(true);

        let query = "";

        if (appliedRange.start && appliedRange.end) {
          query = `?start_date=${appliedRange.start}&end_date=${appliedRange.end}`;
        }

        const data = await apiRequest("dashboardSede", "GET", null, query);

        setStats(data);

        // 🔥 si hay sede seleccionada recalculamos su distribución
        if (selectedCampus) {
          const campusObj = data.data.find((c) => c.name === selectedCampus);
          if (campusObj) {
            fetchCampusDetail(campusObj);
          }
        } else {
          setEstamentoData(data.estamento_global);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampus();
  }, [appliedRange]);

  useEffect(() => {
    if (!pendingStart || !pendingEnd) {
      if (appliedRange.start || appliedRange.end) {
        setAppliedRange({ start: "", end: "" });
      }
    }
  }, [pendingStart, pendingEnd]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);

    if (value.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const matches = stats.data.filter((item) =>
      item.name.toLowerCase().includes(value.toLowerCase()),
    );

    setSuggestions(matches);
    setShowSuggestions(true);
  };
  
  const fetchCampusDetail = async (campus) => {
    try {
      let query = `?id=${campus.id}`;

      if (appliedRange.start && appliedRange.end) {
        query += `&fecha_inicio=${appliedRange.start}&fecha_fin=${appliedRange.end}`;
      }

      const data = await apiRequest("dashboardSedeDetalle", "GET", null, query);

      setEstamentoData(data.estamento_participantes);
    } catch (error) {
      console.error(error);
    }
  };

  const selectCampus = (campus) => {
    setSelectedCampus(campus.name);
    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);

    fetchCampusDetail(campus); // 🔥
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
      setAppliedRange({
        start: "",
        end: "",
      });
    }
  };

  if (loading)
    return <div className="p-6 text-slate-500">Cargando sedes...</div>;
  if (!stats)
    return <div className="p-6 text-red-500">No hay datos disponibles.</div>;

  const totalGlobalParticipants = stats.data.reduce(
    (sum, item) => sum + item.participantes,
    0,
  );

  const selectedCampusData = stats.data.find(
    (item) => item.name === selectedCampus,
  );

  const campusParticipationPercent =
    selectedCampusData && totalGlobalParticipants > 0
      ? (
          (selectedCampusData.participantes / totalGlobalParticipants) *
          100
        ).toFixed(1)
      : 0;

  let filteredData = stats.data;

  if (selectedCampus) {
    filteredData = stats.data.filter((item) => item.name === selectedCampus);
  } else if (searchTerm) {
    filteredData = stats.data.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  const totalActivities = filteredData.reduce(
    (sum, item) => sum + item.actividades,
    0,
  );
  const totalParticipants = filteredData.reduce(
    (sum, item) => sum + item.participantes,
    0,
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-slate-900 flex items-center gap-2 text-xl font-bold">
          <Building className="w-6 h-6 text-blue-600" />
          Actividades por Sede
        </h2>
        <p className="text-slate-600 mt-1">
          Distribución de actividades y participantes en las diferentes sedes
          universitarias
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar sede..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
              {suggestions.map((campus, index) => (
                <div
                  key={index}
                  onClick={() => selectCampus(campus)}
                  className="px-4 py-2 cursor-pointer hover:bg-slate-100 text-sm"
                >
                  {campus.name}
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedCampus && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-slate-500">Sede seleccionada:</span>

            <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              {selectedCampus}

              <button
                onClick={() => {
                  setSelectedCampus(null);
                  setEstamentoData(stats.estamento_global);
                }}
                className="text-blue-600 hover:text-blue-900"
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
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col w-full">
            <label className="text-xs text-slate-500 mb-1">Hasta</label>
            <input
              type="date"
              value={pendingEnd}
              onChange={(e) => setPendingEnd(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={applyFilter}
            disabled={!pendingStart || !pendingEnd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* KPI detalle sede */}
      {selectedCampus && selectedCampusData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg shadow-sm">
                <Users className="w-6 h-6 text-white" />
              </div>

              <div>
                <p className="text-slate-600 font-medium">
                  Participación Global
                </p>

                <p className="text-2xl font-bold text-indigo-900">
                  {campusParticipationPercent}%
                </p>

                <p className="text-xs text-slate-500">
                  del total de participantes
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg shadow-sm">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>

              <div>
                <p className="text-slate-600 font-medium">Actividades</p>
                <p className="text-2xl font-bold text-purple-900">
                  {selectedCampusData.actividades}
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
                  {selectedCampusData.participantes}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* KPI Cards (Ahora son 3 columnas en lugar de 4) */}
      {!selectedCampus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-600 font-medium">Total Sedes</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.total_sedes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg shadow-sm">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-600 font-medium">Total Actividades</p>
                <p className="text-2xl font-bold text-purple-900">
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
                  Total Participantes
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {totalParticipants}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distribución por Estamento */}
      {estamentoData?.length > 0 && (
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

                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-blue-100 text-blue-700">
                    {e.porcentaje}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      {!selectedCampus && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Activities Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-400" /> Actividades por
              Sede
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
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
                    radius={[6, 6, 0, 0]}
                    name="Actividades"
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

          {/* Participants Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-slate-400" /> Distribución
              de Participantes
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ participantes, percent }) =>
                      percent > 0.05 ? participantes : ""
                    }
                    outerRadius={80}
                    dataKey="participantes"
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
                    }}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Campus Cards List */}
      {!selectedCampus && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredData.map((campus, index) => {
            const color = COLORS[index % COLORS.length];

            // CAMBIO CLAVE AQUÍ:
            // Calculamos el porcentaje basado en PARTICIPANTES, no en actividades
            const porcentajeParticipacion =
              totalGlobalParticipants > 0
                ? (
                    (campus.participantes / totalGlobalParticipants) *
                    100
                  ).toFixed(1)
                : 0;

            return (
              <div
                key={campus.name}
                className="bg-white border rounded-xl p-5 hover:shadow-lg transition-all"
                style={{ borderColor: `${color}40`, borderWidth: "1px" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-semibold text-sm">
                        {campus.name}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Actividades</span>
                    <span
                      className="px-2 py-0.5 rounded-md font-medium"
                      style={{
                        backgroundColor: `${color}15`,
                        color: color,
                      }}
                    >
                      {campus.actividades}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Participantes</span>
                    <span
                      className="px-2 py-0.5 rounded-md font-medium"
                      style={{
                        backgroundColor: `${color}15`,
                        color: color,
                      }}
                    >
                      {campus.participantes}
                    </span>
                  </div>

                  {/* Barra de Participación Global (Basada en Participantes) */}
                  <div className="pt-2">
                    <div className="flex justify-between text-slate-500 mb-1 text-xs">
                      <span>Participación Global</span>
                      <span>{porcentajeParticipacion}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${porcentajeParticipacion}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
