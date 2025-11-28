import { useState, useEffect } from "react";
import { PersonForm } from "../components/PersonForm";
import { PersonList } from "../components/PersonList";
import {
  UserPlus,
  ArrowLeft,
  PlusCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActivityModal } from "../components/ActivityModal";
import { apiRequest, API_ENDPOINTS } from "../api/api";

export function RegistroPersonas() {
  const navigate = useNavigate();

  const [entities, setEntities] = useState({
    sede: [],
    lineaProyecto: [],
    facultad: [],
    escuela: [],
    indicador: [],
    actividadConsolidada: [],
    tema: [],
    prioridad: [],
    lineaEstrategia: [],
    actividad: [],
  });

  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [registeredPersons, setRegisteredPersons] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const canRegister = selectedActivity && selectedDate;

  /** === FETCH ENTITIES EXACTLY LIKE EntityForm.jsx === **/
  useEffect(() => {
    async function fetchData() {
      for (const type of Object.keys(API_ENDPOINTS)) {
        try {
          const res = await apiRequest(type, "GET");
          setEntities((prev) => ({ ...prev, [type]: res }));
        } catch (error) {
          console.error(`❌ Error cargando ${type}:`, error);
        }
      }
    }
    fetchData();
  }, []);

  const handlePersonSubmit = (data) => {
    const newPerson = {
      id: crypto.randomUUID(),
      actividadConsolidada: selectedActivity,
      fecha: selectedDate,
      ...data,
    };

    setRegisteredPersons((prev) => [...prev, newPerson]);
  };

  const handleDelete = (id) => {
    setRegisteredPersons((prev) => prev.filter((person) => person.id !== id));
  };

  /** === ADD NEW ACTIVITY TO LIST === **/
  const handleAddActivity = (actividad) => {
    setEntities((prev) => ({
      ...prev,
      actividadConsolidada: [...prev.actividadConsolidada, actividad],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al inicio
        </button>

        <header className="mb-8">
          <h1 className="text-indigo-900 mb-2 flex items-center gap-3">
            <UserPlus className="w-8 h-8" />
            Registro de Personas
          </h1>
          <p className="text-gray-600">
            Selecciona la actividad y fecha, luego registra los participantes.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-gray-800 mb-4">Datos de la Actividad</h2>

            {/* Activity Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="actividad" className="text-gray-700">
                  Actividad <span className="text-red-500">*</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  <PlusCircle className="w-4 h-4" />
                  Añadir Actividad
                </button>
              </div>

              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecciona una actividad</option>
                {entities.actividadConsolidada.map((actividad) => (
                  <option key={actividad.id_actividad} value={actividad.id_actividad}>
                    {actividad.nombre_original || actividad.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-gray-700 mb-2">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {canRegister ? (
              <PersonForm
                onSubmit={handlePersonSubmit}
                escuelas={entities.escuela}
                facultades={entities.facultad}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                <UserPlus className="w-16 h-16 mx-auto mb-3 opacity-50" />
                Selecciona una actividad y fecha para empezar
              </div>
            )}
          </div>
        </div>

        {/* List */}
        <div className="mt-12">
          <PersonList
            persons={registeredPersons}
            activities={entities.actividadConsolidada}
            escuelas={entities.escuela}
            facultades={entities.facultad}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Modal */}
      <ActivityModal
        open={showModal}
        onClose={() => setShowModal(false)}
        indicadores={entities.indicador}
        onSubmit={handleAddActivity}
      />
    </div>
  );
}
