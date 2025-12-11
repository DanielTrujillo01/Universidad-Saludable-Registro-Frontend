import { useEffect, useState } from "react";
import { Calendar, Target, AlertCircle, GitBranch, Building, GraduationCap, School, Activity, LogOut } from 'lucide-react';
import { useNavigate } from "react-router-dom"; 
import { apiRequest } from "../api/api";

// Importa componentes de estadísticas
import { TimeRangeStats } from '../components/stats/TimeRangeStats';
import { IndicatorStats } from '../components/stats/IndicatorStats';
import { PriorityStats } from '../components/stats/PriorityStats';
import { StrategyLineStats } from '../components/stats/StrategyLineStats';
import { CampusStats } from '../components/stats/CampusStats';
import { SchoolStats } from '../components/stats/SchoolStats';
import { FacultyStats } from '../components/stats/FacultyStats';
import { ActivityStats } from '../components/stats/ActivityStats';

export function StatsPage() {
  const [activeView, setActiveView] = useState('activities'); // Vista inicial ahora es "actividades"
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  // Menú sin "Participantes"
  const navItems = [
    { id: 'activities', label: 'Actividades', icon: Activity },
    { id: 'time', label: 'Rango de Tiempo', icon: Calendar },
    { id: 'indicator', label: 'Indicador', icon: Target },
    { id: 'priority', label: 'Prioridad', icon: AlertCircle },
    { id: 'strategy', label: 'Línea Estratégica', icon: GitBranch },
    { id: 'campus', label: 'Sede', icon: Building },
    { id: 'school', label: 'Escuela', icon: School },
    { id: 'faculty', label: 'Facultad', icon: GraduationCap },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token'); 
    localStorage.removeItem('token'); 
    navigate('/login');
  };

  useEffect(() => {
    const cargarDatosGenerales = async () => {
      try {
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
    const showGeneralError = !stats && activeView === 'activities';
    if (showGeneralError) return <div className="p-6 text-red-500">Error cargando datos generales.</div>;

    switch (activeView) {
      case 'activities':
        return <ActivityStats data={stats} />;
      case 'indicator':
        return <IndicatorStats />;
      case 'priority':
        return <PriorityStats data={stats} />;
      case 'school':
        return <SchoolStats data={stats} />;
      case 'time':
        return <TimeRangeStats data={stats} />;
      case 'strategy':
        return <StrategyLineStats data={stats} />;
      case 'campus':
        return <CampusStats data={stats} />;
      case 'faculty':
        return <FacultyStats data={stats} />;
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
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden min-h-[400px]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
