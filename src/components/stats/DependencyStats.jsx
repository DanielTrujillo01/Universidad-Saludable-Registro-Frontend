import { useState, useEffect } from "react";
import {
  Building2,
  BookOpen,
  Users,
  Search,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { apiRequest } from "../../api/api";
import { CustomChartTooltip } from "./SubComponents/CustomTooltip";
import DataCardGrid from "./SubComponents/DataCardGrid";
import { ActionDetailCard } from "./SubComponents/ActionDetailCard";

const COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
];

export function DependencyStats() {
  const [searchTerm, setSearchTerm] = useState("");
  const [estamentoData, setEstamentoData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedDependency, setSelectedDependency] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [pendingStart, setPendingStart] = useState("");
  const [pendingEnd, setPendingEnd] = useState("");

  const [appliedRange, setAppliedRange] = useState({
    start: "",
    end: "",
  });

  const [dependencyDetail, setDependencyDetail] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        setLoading(true);

        let query = "";

        if (appliedRange.start && appliedRange.end) {
          query = `?start_date=${appliedRange.start}&end_date=${appliedRange.end}&tipo=dependencia`;
        } else {
          query = `?tipo=dependencia`;
        }

        const data = await apiRequest(
          "dashboardUnidadOrganizativa",
          "GET",
          null,
          query
        );

        setStats(data);

        if (selectedDependency) {
          fetchDependencyDetail(selectedDependency);
        } else {
          setEstamentoData(data.estamento_global);
        }
      } catch (error) {
        console.error("Error cargando dependencias:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDependencies();
  }, [appliedRange, selectedDependency]);

  const fetchDependencyDetail = async (dependency) => {
    try {
      let query = `?id=${dependency.id}`;

      if (appliedRange.start && appliedRange.end) {
        query += `&fecha_inicio=${appliedRange.start}&fecha_fin=${appliedRange.end}&tipo=dependencia`;
      } else {
        query += `&tipo=dependencia`;
      }

      const data = await apiRequest(
        "dashboardUnidadOrganizativaDetalle",
        "GET",
        null,
        query
      );

      setEstamentoData(data.estamento_participantes);
      setDependencyDetail(data);
    } catch (error) {
      console.error(error);
    }
  };

  const suggestions =
    stats?.data
      ?.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 8) || [];

  const applyFilter = () => {
    if (!pendingStart || !pendingEnd) return;

    setAppliedRange({
      start: pendingStart,
      end: pendingEnd,
    });
  };

  const cancelFilter = () => {
    setPendingStart("");
    setPendingEnd("");
    setAppliedRange({ start: "", end: "" });
  };

  const getRangeDates = () => {
    const start = appliedRange.start || pendingStart;
    const end = appliedRange.end || pendingEnd;

    return {
      inicio: start,
      fin: end,
    };
  };

  const handleOpenDetailModal = async (item) => {
    const { inicio, fin } = getRangeDates();

    const params = new URLSearchParams({
      id: item.action_id,
      inicio: inicio || "",
      fin: fin || "",
      tipo_filtro: "DEPENDENCIA",
      filtro_id: selectedDependency.id,
    });

    try {
      const resp = await apiRequest(
        "dashboardAccionDetalleRange",
        "GET",
        null,
        `?${params.toString()}`
      );

      setSelectedAction(resp);
    } catch (error) {
      console.error("Error obteniendo detalle:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-slate-500">
        Cargando dependencias...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-red-500">
        No hay datos disponibles.
      </div>
    );
  }

  let allFilteredData = stats.data;

  if (selectedDependency) {
    allFilteredData = stats.data.filter(
      (item) => item.id === selectedDependency.id
    );
  } else if (searchTerm) {
    allFilteredData = stats.data.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  let chartData = [];

  if (selectedDependency || searchTerm) {
    chartData = allFilteredData;
  } else {
    chartData = [...stats.data]
      .sort((a, b) => b.participantes - a.participantes)
      .slice(0, 10);
  }

  const totalActivities = allFilteredData.reduce(
    (sum, item) => sum + item.actividades,
    0
  );

  const totalActions = allFilteredData.reduce(
    (sum, item) => sum + item.acciones,
    0
  );

  const totalParticipants = allFilteredData.reduce(
    (sum, item) => sum + item.participantes,
    0
  );

  const totalParticipations = allFilteredData.reduce(
    (sum, item) => sum + item.participaciones,
    0
  );

  const grandTotalParticipants = stats.data.reduce(
    (sum, item) => sum + item.participantes,
    0
  );

  const selectedDependencyData = selectedDependency
    ? stats.data.find((d) => d.id === selectedDependency.id)
    : null;

  const porcentajeParticipacion = selectedDependencyData
    ? (
        (selectedDependencyData.participantes /
          grandTotalParticipants) *
        100
      ).toFixed(1)
    : 0;

  const tooltipConfig = [
    { label: "Acciones", dataKey: "acciones", color: "text-indigo-700" },
    { label: "Actividades", dataKey: "actividades", color: "text-blue-700" },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-slate-900 flex items-center gap-2 text-xl font-bold">
          <Building2 className="w-6 h-6 text-indigo-600" />
          Actividades por Dependencia
        </h2>

        <p className="text-slate-600 mt-1">
          Panorama de actividades agrupadas por dependencias
        </p>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder="Buscar dependencia..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {showSuggestions && searchTerm && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.length > 0 ? (
              suggestions.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedDependency(item);
                    setSearchTerm("");
                    setShowSuggestions(false);
                    fetchDependencyDetail(item);
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

        {selectedDependency && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-slate-500">
              Dependencia seleccionada:
            </span>

            <div className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
              {selectedDependency.name}

              <button
                onClick={() => {
                  setSelectedDependency(null);
                  setDependencyDetail(null);
                }}
                className="text-indigo-600 hover:text-indigo-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Fechas */}
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="flex flex-col w-full">
            <label className="text-xs text-slate-500 mb-1">
              Desde
            </label>

            <input
              type="date"
              value={pendingStart}
              onChange={(e) => setPendingStart(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col w-full">
            <label className="text-xs text-slate-500 mb-1">
              Hasta
            </label>

            <input
              type="date"
              value={pendingEnd}
              onChange={(e) => setPendingEnd(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={applyFilter}
            disabled={!pendingStart || !pendingEnd}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
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

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg shadow-sm">
              <Building2 className="w-6 h-6 text-white" />
            </div>

            <div>
              <p className="text-slate-600 font-medium">
                Dependencias
              </p>

              <p className="text-2xl font-bold text-indigo-900">
                {stats.total_dependencias}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-4 rounded-lg border border-violet-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500 rounded-lg shadow-sm">
              <Target className="w-6 h-6 text-white" />
            </div>

            <div>
              <p className="text-slate-600 font-medium">
                Acciones
              </p>

              <p className="text-2xl font-bold text-violet-900">
                {totalActions}
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
                Actividades
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
                Participantes
              </p>

              <p className="text-2xl font-bold text-green-900">
                {totalParticipants}
              </p>

              <div className="mt-1 inline-flex items-center gap-2 bg-green-100 text-green-700 px-2 py-1 rounded-md">
                <span className="text-[11px] uppercase tracking-wide font-semibold">
                  Participaciones
                </span>

                <span className="text-sm font-bold">
                  {totalParticipations}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estamentos */}
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
                      backgroundColor:
                        COLORS[index % COLORS.length],
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

      {/* Acciones */}
      {!selectedAction && (
        <DataCardGrid
          title="Acciones Vinculadas"
          totalCount={dependencyDetail?.total_acciones}
          data={dependencyDetail?.acciones_vinculadas?.map(
            (accion) => ({
              id: accion.id_accion,
              title: accion.nombre,
              subtitle: `Acción #${accion.id_accion}`,
              stats: [
                {
                  label: "Asistencias",
                  value: accion.asistencias,
                },
                {
                  label: "Participantes",
                  value: accion.participantes_unicos,
                },
              ],
              action_id: accion.id_accion,
            })
          )}
          onItemClick={handleOpenDetailModal}
        />
      )}

      {/* Charts */}
      {!selectedDependency && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Barras */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              Actividades por Dependencia
            </h3>

            <div className="h-[350px] w-full">
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
                    stroke="#64748b"
                    width={150}
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />

                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    content={
                      <CustomChartTooltip config={tooltipConfig} />
                    }
                  />

                  <Bar
                    dataKey="actividades"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-slate-400" />
              Participantes por Dependencia
            </h3>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="participantes"
                    nameKey="name"
                    labelLine={false}
                    label={({ percent }) =>
                      percent > 0.05
                        ? `${(percent * 100).toFixed(0)}%`
                        : ""
                    }
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{
                      fontSize: "11px",
                      maxWidth: "40%",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      {!selectedDependency && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-slate-900 font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600" />
              Listado Completo
            </h3>
          </div>

          <div className="overflow-auto flex-1">
            <table className="w-full relative">
              <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                    Dependencia
                  </th>

                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                    Acciones
                  </th>

                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                    Actividades
                  </th>

                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                    Participantes
                  </th>

                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 w-1/3">
                    % Participación
                  </th>
                </tr>
              </thead>

              <tbody>
                {allFilteredData.map((dependency, index) => {
                  const color = COLORS[index % COLORS.length];

                  const participacionGlobal =
                    grandTotalParticipants > 0
                      ? (
                          (dependency.participantes /
                            grandTotalParticipants) *
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
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor: color,
                            }}
                          />

                          <span className="text-sm font-medium text-slate-900">
                            {dependency.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold">
                          {dependency.acciones}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center text-sm font-medium text-slate-700">
                        {dependency.actividades}
                      </td>

                      <td className="py-4 px-4 text-center text-sm font-medium text-slate-700">
                        {dependency.participantes}
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
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedAction(null)}
          />

          <div className="relative z-10 w-full max-w-4xl max-h-[90vh]">
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