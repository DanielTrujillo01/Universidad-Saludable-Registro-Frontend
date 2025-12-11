import { Trash2, User, Mail, Phone, Calendar } from 'lucide-react';

const tipoDocumentoLabels = {
  CC: 'C.C.',
  TI: 'T.I.',
  CE: 'C.E.',
  PAS: 'Pasaporte',
};

const sexoLabels = {
  M: 'Masculino',
  F: 'Femenino',
  O: 'Otro',
};

export function PersonList({ persons, activities, escuelas, facultades, onDelete }) {
  if (persons.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-800">Personas Registradas</h2>
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
          Total: {persons.length}
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {persons.map((person) => {
          const actividad = activities.find((a) => a.id === person.actividadConsolidada);
          const escuela = escuelas.find((e) => e.id === person.escuelaId);
          const facultad = escuela ? facultades.find((f) => f.id === escuela.facultadId) : null;

          return (
            <div key={person.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 p-2 rounded-lg">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-gray-800 mb-1">{person.nombre}</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {tipoDocumentoLabels[person.tipoDocumento]} {person.numeroDocumento}
                        </span>
                        <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {person.edad} años
                        </span>
                        <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {sexoLabels[person.sexo]}
                        </span>
                        <span className="text-gray-600 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {person.estamento}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{person.correo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{person.telefono}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(person.fecha).toLocaleDateString('es-ES')}</span>
                    </div>
                    {escuela && (
                      <div className="text-gray-600">
                        <span className="truncate">
                          {escuela.nombre} {facultad && `- ${facultad.nombre}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {actividad && (
                    <div className="pl-11">
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg border border-green-200">
                        Actividad: {actividad.nombre}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onDelete(person.id)}
                  className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
