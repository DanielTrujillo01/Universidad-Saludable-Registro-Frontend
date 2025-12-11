import { Plus, UserPlus, LayoutDashboard, ChevronRight, BarChart3 } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export function Home() {
  const navigate = useNavigate();

  const sections = [
    {
      id: '/creacion-entidades',
      title: 'Panel de Creación',
      description: 'Crea y gestiona entidades como sedes, facultades, escuelas y más.',
      icon: Plus,
      bgGradient: 'from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-200',
      ringColor: 'group-hover:ring-blue-100',
    },
    {
      id: '/registro-personas',
      title: 'Registro de Personas',
      description: 'Registra nuevos usuarios para actividades, eventos y proyectos.',
      icon: UserPlus,
      bgGradient: 'from-emerald-500 to-emerald-600',
      shadowColor: 'shadow-emerald-200',
      ringColor: 'group-hover:ring-emerald-100',
    },
    // --- TARJETA DE ESTADÍSTICAS / PRIVADA ---
    {
      id: '/stats', // Ruta protegida
      title: 'Tablero de Control',
      description: 'Visualiza indicadores de desempeño, métricas en tiempo real.',
      icon: BarChart3, // Icono de Gráfico de Barras
      // Gradiente Violeta/Fucsia: Moderno para analítica y datos
      bgGradient: 'from-violet-600 to-fuchsia-600',
      shadowColor: 'shadow-violet-200',
      ringColor: 'group-hover:ring-violet-100',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
    
      <div className="relative max-w-6xl mx-auto w-full px-4">
        
        {/* Header */}
        <header className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-4 shadow-sm">
            <LayoutDashboard className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Sistema de Gestión
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Bienvenido al panel principal. Selecciona una opción para comenzar a administrar tu organización.
          </p>
        </header>

        {/* Grid de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => navigate(section.id)}
                className={`
                  group relative bg-white rounded-3xl p-8 text-left 
                  border border-slate-100 shadow-lg shadow-slate-200/50
                  transition-all duration-300 ease-in-out
                  hover:-translate-y-1 hover:shadow-xl hover:border-indigo-100
                  focus:outline-none focus:ring-4 focus:ring-indigo-50
                  h-full flex flex-col
                `}
              >
                <div className="flex items-start justify-between mb-6">
                  {/* Contenedor del Icono */}
                  <div className={`
                    w-16 h-16 rounded-2xl bg-gradient-to-br ${section.bgGradient}
                    text-white shadow-lg ${section.shadowColor}
                    grid place-items-center shrink-0
                    transition-transform duration-300 group-hover:scale-110
                  `}>
                    <Icon className="w-8 h-8" strokeWidth={2.5} />
                  </div>

                  {/* Icono de flecha decorativo */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <ChevronRight className="w-6 h-6 text-slate-300" />
                  </div>
                </div>

                <div className="mt-auto">
                  <h2 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                    {section.title}
                  </h2>
                  <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                    {section.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}