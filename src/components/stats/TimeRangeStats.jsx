import { useState } from 'react';
import { Calendar, TrendingUp, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const monthlyData = [
  { month: 'Ene', actividades: 12, participantes: 145 },
  { month: 'Feb', actividades: 15, participantes: 189 },
  { month: 'Mar', actividades: 18, participantes: 234 },
  { month: 'Abr', actividades: 14, participantes: 167 },
  { month: 'May', actividades: 20, participantes: 278 },
  { month: 'Jun', actividades: 22, participantes: 312 },
  { month: 'Jul', actividades: 10, participantes: 98 },
  { month: 'Ago', actividades: 8, participantes: 76 },
  { month: 'Sep', actividades: 25, participantes: 345 },
  { month: 'Oct', actividades: 28, participantes: 389 },
  { month: 'Nov', actividades: 24, participantes: 298 },
  { month: 'Dic', actividades: 19, participantes: 234 },
];

const yearlyData = [
  { year: '2020', actividades: 125, participantes: 1567 },
  { year: '2021', actividades: 156, participantes: 1923 },
  { year: '2022', actividades: 189, participantes: 2456 },
  { year: '2023', actividades: 203, participantes: 2789 },
  { year: '2024', actividades: 215, participantes: 2965 },
];

export function TimeRangeStats() {
  const [viewMode, setViewMode] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [searchTerm, setSearchTerm] = useState('');

  const data = viewMode === 'monthly' ? monthlyData : yearlyData;

  // Filtrar datos según el término de búsqueda
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    
    if (viewMode === 'monthly') {
      return item.month.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      return item.year.includes(searchTerm);
    }
  });

  const totalActivities = filteredData.reduce((sum, item) => sum + item.actividades, 0);
  const totalParticipants = filteredData.reduce((sum, item) => sum + item.participantes, 0);
  const avgActivities = filteredData.length > 0 ? Math.round(totalActivities / filteredData.length) : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-slate-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Actividades por Rango de Tiempo
        </h2>
        <p className="text-slate-600 mt-1">
          Visualiza las actividades organizadas por períodos de tiempo
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'monthly'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Vista Mensual
          </button>
          <button
            onClick={() => setViewMode('yearly')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'yearly'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Vista Anual
          </button>
        </div>

        {viewMode === 'monthly' && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        )}

        {/* Campo de búsqueda */}
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={viewMode === 'monthly' ? 'Buscar mes (Ene, Feb, Mar...)' : 'Buscar año (2020, 2021...)'}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <p className="text-slate-600">Total Actividades</p>
          <p className="text-blue-900 flex items-center gap-2">
            {totalActivities}
            <TrendingUp className="w-5 h-5 text-green-600" />
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <p className="text-slate-600">Total Participantes</p>
          <p className="text-purple-900">{totalParticipants}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <p className="text-slate-600">Promedio {viewMode === 'monthly' ? 'Mensual' : 'Anual'}</p>
          <p className="text-green-900">{avgActivities} actividades</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-50 rounded-lg p-6 mb-6">
        <h3 className="text-slate-900 mb-4">Gráfico de Actividades</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey={viewMode === 'monthly' ? 'month' : 'year'} 
              stroke="#64748b"
            />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="actividades" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="text-slate-900 mb-4">Tendencia de Participantes</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey={viewMode === 'monthly' ? 'month' : 'year'} 
              stroke="#64748b"
            />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="participantes" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
