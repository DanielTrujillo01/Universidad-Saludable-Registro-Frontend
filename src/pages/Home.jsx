import { Plus, UserPlus, LayoutDashboard } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export function Home() {
  const navigate = useNavigate(); // 👈 Hook para navegar

  const sections = [
    {
      id: '/creacion-entidades',
      title: 'Panel de Creación',
      description: 'Crea y gestiona entidades como sedes, facultades, escuelas y más',
      icon: Plus,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      id: '/registro-personas',
      title: 'Registro de Personas',
      description: 'Registra personas para actividades, eventos y proyectos',
      icon: UserPlus,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <LayoutDashboard className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-indigo-900 mb-3">Sistema de Gestión</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Selecciona la sección a la que deseas acceder
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => navigate(section.id)} // 👈 Navegación
                className="bg-white rounded-xl shadow-lg p-8 text-left transition-all hover:shadow-xl hover:scale-105 group"
              >
                <div className={`${section.color} ${section.hoverColor} text-white w-16 h-16 rounded-lg flex items-center justify-center mb-4 transition-colors`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h2 className="text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                  {section.title}
                </h2>
                <p className="text-gray-600">
                  {section.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
