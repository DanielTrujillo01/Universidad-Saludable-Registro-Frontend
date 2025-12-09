import { Activity, Users, Target, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

// Paleta de colores para asignar dinámicamente a los gráficos
const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#ef4444'];

export function ActivityStats({ data }) {
  // 1. Si los datos no han llegado (es null o undefined), mostramos carga o nada
  if (!data || !data.kpis || !data.graficas) {
    return <div className="p-6 text-slate-500">Cargando datos del servidor...</div>;
  }

  const { kpis, graficas } = data;

  // KPIs Cards Config
  const statsCards = [
    {
      title: 'Total Actividades',
      value: kpis.total_actividades,
      icon: Activity,
      color: 'indigo', // Clases de Tailwind: text-indigo-900, bg-indigo-500
    },
    {
      title: 'Total Participantes',
      value: kpis.total_participantes,
      icon: Users,
      color: 'purple',
    },
    {
      title: 'Promedio Participantes',
      value: kpis.promedio_participantes,
      icon: Users, // Reusamos icono o buscamos uno de "Promedio"
      color: 'blue',
    },
    // Eliminamos la tarjeta de "Completadas" porque no hay estados
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-slate-900 flex items-center gap-2 text-xl font-bold">
          <BarChart2 className="w-6 h-6 text-indigo-600" />
          Panorama General
        </h2>
        <p className="text-slate-600 mt-1">
          Métricas consolidadas en tiempo real desde la base de datos.
        </p>
      </div>

      {/* 1. KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4`}>
              <div className={`p-3 rounded-lg bg-${card.color}-100 text-${card.color}-600`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Gráficas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Gráfica A: INDICADORES (Pie Chart) - Reemplaza a Estado */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-slate-400" />
            Distribución por Indicador
          </h3>
          <div className="h-[300px] w-full">
            {graficas.indicadores.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={graficas.indicadores}
                    cx="50%"
                    cy="50%"
                    innerRadius={60} // Donut chart style
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {graficas.indicadores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No hay datos de indicadores
              </div>
            )}
          </div>
        </div>

        {/* Gráfica B: PRIORIDADES (Bar Chart) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-slate-400" />
            Actividades por Prioridad
          </h3>
          <div className="h-[300px] w-full">
            {graficas.prioridades.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graficas.prioridades} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {graficas.prioridades.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No hay datos de prioridades
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}