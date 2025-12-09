import { useState, useEffect } from 'react';
import { Tag, Search, BarChart3, PieChart as PieChartIcon, Layers, Hash, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { apiRequest } from "../../api/api"; 

// 1. Paleta de colores
const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#84cc16', // Lime
  '#d946ef', // Fuchsia
];

export function PriorityStats() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPriorities = async () => {
      try {
        const data = await apiRequest("dashboardPrioridad", "GET");
        setStats(data);
      } catch (error) {
        console.error("Error cargando prioridades:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPriorities();
  }, []);

  if (loading) return <div className="p-6 text-slate-500">Cargando prioridades...</div>;
  if (!stats) return <div className="p-6 text-red-500">No hay datos disponibles.</div>;

  const filteredData = stats.data.filter((item) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { total_actividades, top_priority } = stats;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-slate-900 flex items-center gap-2 text-xl font-bold">
          <Layers className="w-6 h-6 text-indigo-600" />
          Actividades por Prioridad
        </h2>
        <p className="text-slate-600 mt-1">
          Distribución de actividades según los lineamientos estratégicos asignados
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
            placeholder="Buscar por nombre de lineamiento..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* KPI Cards (Estilo Actualizado con Color) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        
        {/* Card 1: Total Actividades (Estilo Azul) */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-600 font-medium">Total Actividades</p>
              <p className="text-2xl font-bold text-blue-900">{total_actividades}</p>
            </div>
          </div>
        </div>

        {/* Card 2: Lineamiento Principal (Estilo Púrpura) */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg shadow-sm">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-600 font-medium">Prioridad más frecuente</p>
              <div className="flex flex-col">
                  {/* Truncamos si es muy largo para que no rompa el diseño */}
                  <span className="text-xl font-bold text-purple-900 truncate max-w-[250px]" title={top_priority.name}>
                      {top_priority.name}
                  </span>
                  <span className="text-xs text-purple-700 font-semibold mt-0.5">
                    {top_priority.porcentaje}% del total
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
          <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
             <BarChart3 className="w-4 h-4 text-slate-400"/> Total por Prioridad
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {/* layout="vertical" es clave para nombres largos */}
              <BarChart data={filteredData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{fontSize: 12}} />
                
                {/* CAMBIO AQUÍ: Mostramos el eje Y con un ancho fijo para que quepan los textos */}
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={150} // Espacio reservado para el texto
                  tick={{ fontSize: 11, fill: '#475569' }} // Texto más pequeño
                  interval={0} // Mostrar todas las etiquetas
                />

                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="actividades" radius={[0, 4, 4, 0]} barSize={20}>
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-slate-400"/> Distribución Porcentual
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Porcentaje']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '11px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-slate-900 font-semibold mb-4">Detalle de Prioridades</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Nombre de la Prioridad</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Actividades</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Porcentaje</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Visualización</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((priority, index) => {
                const color = COLORS[index % COLORS.length];
                
                return (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Tag className="w-4 h-4 flex-shrink-0" style={{ color: color }} />
                        <span className="text-sm font-medium text-slate-900">{priority.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700">{priority.actividades}</td>
                    <td className="py-4 px-4 text-sm text-slate-700 font-medium">{priority.porcentaje}%</td>
                    <td className="py-4 px-4 align-middle">
                      <div className="w-full max-w-[200px] bg-slate-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${priority.porcentaje}%`,
                            backgroundColor: color
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                 <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500">
                        No se encontraron resultados
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