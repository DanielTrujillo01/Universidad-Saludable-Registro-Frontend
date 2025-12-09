import { useState, useEffect } from 'react';
import { GitBranch, TrendingUp, Target, Search, BarChart3, Radar as RadarIcon } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell 
} from 'recharts';
import { apiRequest } from "../../api/api"; 

// Paleta de colores consistente
const COLORS = [
  '#8b5cf6', // Violet (Color principal para Estrategia)
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
];

export function StrategyLineStats() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const data = await apiRequest("dashboardEstrategia", "GET");
        setStats(data);
      } catch (error) {
        console.error("Error cargando estrategias:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategies();
  }, []);

  if (loading) return <div className="p-6 text-slate-500">Cargando líneas estratégicas...</div>;
  if (!stats) return <div className="p-6 text-red-500">No hay datos disponibles.</div>;

  // Filtrado local
  const filteredData = stats.data.filter((item) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { total_actividades, top_strategy } = stats;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-slate-900 flex items-center gap-2 text-xl font-bold">
          <GitBranch className="w-6 h-6 text-purple-600" />
          Actividades por Línea Estratégica
        </h2>
        <p className="text-slate-600 mt-1">
          Volumen de participación alineado a los objetivos estratégicos institucionales
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
            placeholder="Buscar línea estratégica..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        
        {/* Total */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg shadow-sm">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-600 font-medium">Total Actividades</p>
              <p className="text-2xl font-bold text-purple-900">{total_actividades}</p>
            </div>
          </div>
        </div>

        {/* Top Strategy */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-600 font-medium">Línea Predominante</p>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-blue-900 truncate max-w-[250px]" title={top_strategy.name}>
                    {top_strategy.name}
                </span>
                <span className="text-xs text-blue-700 font-semibold">
                    {top_strategy.porcentaje}% del total
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
             <BarChart3 className="w-4 h-4 text-slate-400"/> Volumen por Línea
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={150} 
                  tick={{ fontSize: 11, fill: '#475569' }} 
                  interval={0}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
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

        {/* Radar Chart (Comparativa) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
            <RadarIcon className="w-4 h-4 text-slate-400"/> Comparativa de Volumen
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={filteredData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                    dataKey="name" 
                    tick={{ fill: '#64748b', fontSize: 10 }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#94a3b8" />
                <Radar
                  name="Actividades"
                  dataKey="actividades"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.5}
                />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-slate-900 font-semibold mb-4">Detalle de Estrategias</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Línea Estratégica</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Total Actividades</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Impacto Global (%)</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 w-1/3">Visualización</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((strategy, index) => {
                 const color = COLORS[index % COLORS.length];
                 return (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-4 h-4 flex-shrink-0" style={{ color: color }} />
                          <span className="text-sm font-medium text-slate-900">{strategy.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-700">{strategy.actividades}</td>
                      <td className="py-3 px-4 text-sm text-slate-700">{strategy.porcentaje}%</td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${strategy.porcentaje}%`,
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
                        No se encontraron líneas estratégicas
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