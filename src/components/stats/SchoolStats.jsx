import { useState, useEffect } from 'react';
import { School, BookOpen, Users, Search, BarChart3, PieChart as PieChartIcon, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { apiRequest } from "../../api/api"; 

const COLORS = [
  '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', 
  '#6366f1', '#14b8a6', '#84cc16'
];

export function SchoolStats() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const data = await apiRequest("dashboardEscuela", "GET");
        setStats(data);
      } catch (error) {
        console.error("Error cargando escuelas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  if (loading) return <div className="p-6 text-slate-500">Cargando escuelas...</div>;
  if (!stats) return <div className="p-6 text-red-500">No hay datos disponibles.</div>;

  // ---------------------------------------------------------
  // LÓGICA DE FILTRADO Y TOP 10
  // ---------------------------------------------------------
  
  // 1. Datos completos filtrados por búsqueda (para la TABLA y KPIs)
  const allFilteredData = stats.data.filter((item) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Datos para GRÁFICAS (Lógica Top 10)
  let chartData = [];
  
  if (searchTerm) {
    // Si el usuario busca, mostramos SOLO lo que busca
    chartData = allFilteredData;
  } else {
    // Si NO busca, mostramos el TOP 10 ordenado por participantes
    chartData = [...stats.data]
      .sort((a, b) => b.participantes - a.participantes)
      .slice(0, 10);
  }

  // KPIs (Siempre calculados sobre lo que el usuario está "viendo/filtrando")
  const totalActivities = allFilteredData.reduce((sum, item) => sum + item.actividades, 0);
  const totalParticipants = allFilteredData.reduce((sum, item) => sum + item.participantes, 0);
  
  // Total global para calcular porcentajes relativos
  const grandTotalParticipants = stats.data.reduce((sum, item) => sum + item.participantes, 0);

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
          {!searchTerm && <span className="text-indigo-600 font-medium ml-1">Mostrando Top 10 escuelas por defecto.</span>}
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
            placeholder="Buscar escuela específica..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchTerm && (
             <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded-full">
               Filtrando resultados
             </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg shadow-sm">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-600 font-medium">Escuelas Listadas</p>
              <p className="text-2xl font-bold text-indigo-900">{allFilteredData.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-600 font-medium">Actividades (Selección)</p>
              <p className="text-2xl font-bold text-blue-900">{totalActivities}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg shadow-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-600 font-medium">Participantes (Selección)</p>
              <p className="text-2xl font-bold text-green-900">{totalParticipants}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Gráfica 1: Barras (Actividades) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-800 font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-400"/> 
              {searchTerm ? 'Actividades (Búsqueda)' : 'Actividades (Top 10)'}
            </h3>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                layout="vertical" 
                margin={{ left: 10, right: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#64748b" 
                  width={140} 
                  tick={{ fontSize: 11 }}
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
                <Bar dataKey="actividades" radius={[0, 4, 4, 0]} barSize={20} name="Actividades">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 2: Pastel (Participantes) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-slate-400"/> 
            {searchTerm ? 'Participantes (Búsqueda)' : 'Participantes (Top 10)'}
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={100}
                  dataKey="participantes"
                  nameKey="name"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right" 
                  wrapperStyle={{fontSize: '11px', maxWidth: '40%'}} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla Detallada con Scroll */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-slate-900 font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600"/>
            Listado Completo {searchTerm && "(Filtrado)"}
          </h3>
        </div>
        
        {/* Contenedor con Scroll */}
        <div className="overflow-auto flex-1">
          <table className="w-full relative">
            <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Escuela</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Actividades</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Participantes</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 w-1/3">% Del Total Universitario</th>
              </tr>
            </thead>
            <tbody>
              {allFilteredData.length > 0 ? allFilteredData.map((school, index) => {
                const color = COLORS[index % COLORS.length];
                const participacionGlobal = grandTotalParticipants > 0 
                    ? ((school.participantes / grandTotalParticipants) * 100).toFixed(1) 
                    : 0;

                return (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div 
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: color }} 
                        />
                        <span className="text-sm font-medium text-slate-900">{school.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-slate-700 font-medium">{school.actividades}</td>
                    <td className="py-4 px-4 text-center text-sm text-slate-700 font-medium">{school.participantes}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium w-10 text-right text-slate-500">{participacionGlobal}%</span>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ 
                                width: `${participacionGlobal}%`,
                                backgroundColor: color
                            }}
                            />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500">
                    No se encontraron escuelas con ese nombre.
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