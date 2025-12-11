import { useState, useMemo } from 'react';
import { Users, Mail, Phone, Calendar } from 'lucide-react';

const mockParticipants = [
  {
    id: 1,
    name: 'María González',
    email: 'maria.gonzalez@universidad.edu',
    phone: '+34 612 345 678',
    activity: 'Taller de Investigación Científica',
    date: '2024-12-01',
    role: 'Participante',
  },
  {
    id: 2,
    name: 'Juan Pérez',
    email: 'juan.perez@universidad.edu',
    phone: '+34 623 456 789',
    activity: 'Seminario de Innovación Educativa',
    date: '2024-11-28',
    role: 'Ponente',
  },
  {
    id: 3,
    name: 'Ana Martínez',
    email: 'ana.martinez@universidad.edu',
    phone: '+34 634 567 890',
    activity: 'Taller de Investigación Científica',
    date: '2024-12-01',
    role: 'Participante',
  },
  {
    id: 4,
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@universidad.edu',
    phone: '+34 645 678 901',
    activity: 'Conferencia de Sostenibilidad',
    date: '2024-11-25',
    role: 'Organizador',
  },
  {
    id: 5,
    name: 'Laura Sánchez',
    email: 'laura.sanchez@universidad.edu',
    phone: '+34 656 789 012',
    activity: 'Workshop de Desarrollo Web',
    date: '2024-12-03',
    role: 'Participante',
  },
  {
    id: 6,
    name: 'Miguel Torres',
    email: 'miguel.torres@universidad.edu',
    phone: '+34 667 890 123',
    activity: 'Seminario de Innovación Educativa',
    date: '2024-11-28',
    role: 'Participante',
  },
  {
    id: 7,
    name: 'Elena Fernández',
    email: 'elena.fernandez@universidad.edu',
    phone: '+34 678 901 234',
    activity: 'Taller de Inteligencia Artificial',
    date: '2024-12-05',
    role: 'Ponente',
  },
  {
    id: 8,
    name: 'David López',
    email: 'david.lopez@universidad.edu',
    phone: '+34 689 012 345',
    activity: 'Conferencia de Sostenibilidad',
    date: '2024-11-25',
    role: 'Participante',
  },
];

export function ParticipantsList({ searchQuery }) {
  const [selectedActivity, setSelectedActivity] = useState('all');

  const activities = useMemo(() => {
    const activitySet = new Set(mockParticipants.map(p => p.activity));
    return ['all', ...Array.from(activitySet)];
  }, []);

  const filteredParticipants = useMemo(() => {
    return mockParticipants.filter(participant => {
      const matchesSearch = searchQuery === '' || 
        participant.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        participant.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesActivity = selectedActivity === 'all' || participant.activity === selectedActivity;
      
      return matchesSearch && matchesActivity;
    });
  }, [searchQuery, selectedActivity]);

  const stats = useMemo(() => {
    return {
      total: filteredParticipants.length,
      activities: new Set(filteredParticipants.map(p => p.activity)).size,
    };
  }, [filteredParticipants]);

  return (
    <div className="p-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-600">Total Participantes</p>
              <p className="text-blue-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-600">Actividades</p>
              <p className="text-purple-900">{stats.activities}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-600">Contactos Registrados</p>
              <p className="text-green-900">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Filter */}
      <div className="mb-6">
        <label className="block text-slate-700 mb-2">Filtrar por actividad</label>
        <select
          value={selectedActivity}
          onChange={(e) => setSelectedActivity(e.target.value)}
          className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas las actividades</option>
          {activities.slice(1).map((activity) => (
            <option key={activity} value={activity}>
              {activity}
            </option>
          ))}
        </select>
      </div>

      {/* Participants Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-slate-700">Nombre</th>
              <th className="text-left py-3 px-4 text-slate-700">Actividad</th>
              <th className="text-left py-3 px-4 text-slate-700">Rol</th>
              <th className="text-left py-3 px-4 text-slate-700">Fecha</th>
              <th className="text-left py-3 px-4 text-slate-700">Contacto</th>
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.map((participant) => (
              <tr
                key={participant.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white">
                      {participant.name.charAt(0)}
                    </div>
                    <span className="text-slate-900">{participant.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-700">{participant.activity}</td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full ${
                      participant.role === 'Ponente'
                        ? 'bg-purple-100 text-purple-700'
                        : participant.role === 'Organizador'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {participant.role}
                  </span>
                </td>
                <td className="py-4 px-4 text-slate-700">{participant.date}</td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4" />
                      <span>{participant.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4" />
                      <span>{participant.phone}</span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredParticipants.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No se encontraron participantes que coincidan con la búsqueda
          </div>
        )}
      </div>
    </div>
  );
}
