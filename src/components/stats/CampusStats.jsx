import { useState, useEffect } from 'react';
import { Building, Users, Search, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { apiRequest } from "../../api/api"; 

const COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'
];

export function CampusStats() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampus = async () => {
      try {
        const data = await apiRequest("dashboardSede", "GET");
        setStats(data);
      } catch (error) {
        console.error("Error cargando sedes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampus();
  }, []);

  if (loading) return <div className="p-6 text-slate-500">Cargando sedes...</div>;
  if (!stats) return <div className="p-6 text-red-500">No hay datos disponibles.</div>;

  const filteredData = stats.data.filter((item) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalActivities = filteredData.reduce((sum, item) => sum + item.actividades, 0);
  const totalParticipants = filteredData.reduce((sum, item) => sum + item.participantes, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-slate-900 flex items-center gap-2 text-xl font-bold">
          <Building className="w-6 h-6 text-blue-600" />
          Actividades por Sede
        </h2>
        <p className="text-slate-600 mt-1">
          Distribución de actividades y participantes en las diferentes sedes universitarias
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
            placeholder="Buscar sede por nombre..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* KPI Cards (Ahora son 3 columnas en lugar de 4) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-600 font-medium">Total Sedes</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total_sedes}</p>
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
              <p className="text-2xl font-bold text-purple-900">{totalActivities}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg shadow-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-600 font-medium">Total Participantes</p>
              <p className="text-2xl font-bold text-green-900">{totalParticipants}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Activities Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
             <BarChart3 className="w-4 h-4 text-slate-400"/> Actividades por Sede
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11 }}
                  interval={0}
                />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="actividades" radius={[6, 6, 0, 0]} name="Actividades">
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Participants Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-slate-400"/> Distribución de Participantes
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ participantes, percent }) => percent > 0.05 ? participantes : ''}
                  outerRadius={80}
                  dataKey="participantes"
                >
                  {filteredData.map((entry, index) => (
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
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '11px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Campus Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredData.map((campus, index) => {
          const color = COLORS[index % COLORS.length];
          
          // CAMBIO CLAVE AQUÍ:
          // Calculamos el porcentaje basado en PARTICIPANTES, no en actividades
          const porcentajeParticipacion = totalParticipants > 0 
            ? ((campus.participantes / totalParticipants) * 100).toFixed(1) 
            : 0;

          return (
            <div
              key={campus.name}
              className="bg-white border rounded-xl p-5 hover:shadow-lg transition-all"
              style={{ borderColor: `${color}40`, borderWidth: '1px' }}
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
                    <h3 className="text-slate-900 font-semibold text-sm">{campus.name}</h3>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Actividades</span>
                  <span className="px-2 py-0.5 rounded-md font-medium" style={{ 
                    backgroundColor: `${color}15`,
                    color: color
                  }}>
                    {campus.actividades}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Participantes</span>
                  <span className="px-2 py-0.5 rounded-md font-medium" style={{ 
                    backgroundColor: `${color}15`,
                    color: color
                  }}>
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
                        backgroundColor: color
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}