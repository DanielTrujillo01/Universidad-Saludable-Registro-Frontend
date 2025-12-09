import { useEffect, useState } from "react";
import { Search, Calendar, Target, AlertCircle, GitBranch, Building, GraduationCap, School, Activity, LogOut } from 'lucide-react';
import { useNavigate } from "react-router-dom"; 
import { apiRequest } from "../api/api"; 
import { SearchBar } from '../components/SearchBar';
import { ParticipantsList } from '../components/ParticipantsList';
// Importa tus componentes...
import { TimeRangeStats } from '../components/stats/TimeRangeStats';
import { IndicatorStats } from '../components/stats/IndicatorStats';
import { PriorityStats } from '../components/stats/PriorityStats';
import { StrategyLineStats } from '../components/stats/StrategyLineStats';
import { CampusStats } from '../components/stats/CampusStats';
import { SchoolStats } from '../components/stats/SchoolStats';
import { FacultyStats } from '../components/stats/FacultyStats';
import { ActivityStats } from '../components/stats/ActivityStats';

export function StatsPage() {
  const [activeView, setActiveView] = useState('participants'); // Vista inicial
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null); // Aquí guardaremos el "Resumen General"
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  const navItems = [
    { id: 'participants', label: 'Participantes', icon: Search },
    { id: 'activities', label: 'Actividades', icon: Activity }, // Muestra KPIs generales
    { id: 'time', label: 'Rango de Tiempo', icon: Calendar },
    { id: 'indicator', label: 'Indicador', icon: Target },
    { id: 'priority', label: 'Prioridad', icon: AlertCircle },
    { id: 'strategy', label: 'Línea Estratégica', icon: GitBranch },
    { id: 'campus', label: 'Sede', icon: Building },
    { id: 'school', label: 'Escuela', icon: School },
    { id: 'faculty', label: 'Facultad', icon: GraduationCap },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  useEffect(() => {
    // Esta función carga SOLAMENTE los datos generales (KPIs y gráficas simples)
    // para que la vista de 'Actividades' funcione rápido.
    const cargarDatosGenerales = async () => {
      try {
        // CORRECCIÓN 1: Usamos 'dashboardResumen' en lugar de 'dashboard'
        // Esto llama a /api/dashboard-stats/resumen/
        const data = await apiRequest("dashboardResumen", "GET");
        setStats(data);
      } catch (error) {
        console.error("Error cargando dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosGenerales();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse">Cargando panel...</div>
    </div>
  );

  const renderContent = () => {
    // Manejo de errores visuales si falla la carga del resumen
    const showGeneralError = !stats && activeView === 'activities';
    if (showGeneralError) return <div className="p-6 text-red-500">Error cargando datos generales.</div>;

    switch (activeView) {
      case 'participants':
        // Componente AUTÓNOMO (busca sus propios datos)
        return <ParticipantsList searchQuery={searchQuery} />;
      
      case 'activities':
        // Componente DEPENDIENTE (usa el resumen cargado arriba)
        return <ActivityStats data={stats} />;
      
      case 'indicator':
        // CORRECCIÓN 2: Componente AUTÓNOMO
        // Ya no pasamos 'data={stats}' porque IndicatorStats hace su propio fetch a /por_indicador/
        return <IndicatorStats />;
      
      case 'priority':
        // Este todavía usa los datos del resumen (porque el endpoint /resumen devuelve prioridades)
        return <PriorityStats data={stats} />;
      
      case 'school':
        // Este debería ser AUTÓNOMO en el futuro, pero por ahora recibe stats si no lo has migrado
        return <SchoolStats data={stats} />;

      // El resto siguen recibiendo stats por ahora
      case 'time': return <TimeRangeStats data={stats} />;
      case 'strategy': return <StrategyLineStats data={stats} />;
      case 'campus': return <CampusStats data={stats} />;
      case 'faculty': return <FacultyStats data={stats} />;
      
      default:
        return <ActivityStats data={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Panel de Estadísticas</h1>
            <p className="text-slate-600 mt-1">
              Visualiza y analiza las actividades desde múltiples perspectivas
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </header>

      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-2 py-4 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium ${
                    activeView === item.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de búsqueda SOLO para participantes */}
        {activeView === 'participants' && (
          <div className="mb-6">
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden min-h-[400px]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}