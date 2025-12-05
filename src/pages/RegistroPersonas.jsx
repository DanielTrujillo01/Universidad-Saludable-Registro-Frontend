import { useState, useEffect } from "react";
import { PersonForm } from "../components/PersonForm";
import { PersonList } from "../components/PersonList";
// 1. Agregamos 'Settings' a los imports
import { UserPlus, ArrowLeft, PlusCircle, Settings } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { ActivityModal } from "../components/ActivityModal";
import { apiRequest, API_ENDPOINTS } from "../api/api";
import { PersonSearchAndRegister } from "../components/PersonSearchAndRegister";

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

const handlePersonSubmit = async (personaId, sedeId) => {
    
    // Validaciones de seguridad
    if (!personaId || !sedeId || !selectedActivity || !selectedDate) {
      alert("Faltan datos para registrar la participación");
      return;
    }

    const body = {
      persona: personaId,
      actividad: selectedActivity,
      sede: sedeId, // 👈 AGREGADO: Se envía la sede
      fecha: selectedDate,
      anio: new Date(selectedDate).getFullYear(),
    };

    try {
      const nueva = await apiRequest("participacion", "POST", body);
      setRegisteredPersons((prev) => [...prev, nueva]);
    } catch (error) {
      console.error("Error registrando participación:", error);
      alert("Error al registrar la participación");
    }
  };

  const handleDelete = (id) => {
    setRegisteredPersons((prev) => prev.filter((person) => person.id !== id));
  };

  const handleAddActivity = (actividad) => {
    setEntities((prev) => ({
      ...prev,
      actividad: [...prev.actividad, actividad],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* === ZONA DE NAVEGACIÓN SUPERIOR === */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          
          {/* Botón Volver */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </button>

          {/* NUEVO BOTÓN: Ir a Creación de Entidades */}
          <button
            onClick={() => navigate("/creacion-entidades")}
            className="flex items-center gap-2 bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-50 hover:border-indigo-300 transition-all"
          >
            <Settings className="w-5 h-5" />
            Gestionar Entidades
          </button>
        </div>

        <header className="mb-8">
          <h1 className="text-indigo-900 mb-2 flex items-center gap-3 text-2xl font-bold">
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
            <h2 className="text-gray-800 mb-4 font-semibold">Datos de la Actividad</h2>

            {/* Activity Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="actividad" className="text-gray-700 font-medium">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Selecciona una actividad</option>
                {entities.actividad.map((actividad) => (
                  <option
                    key={actividad.id_actividad}
                    value={actividad.id_actividad}
                  >
                    {actividad.nombre_original || actividad.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
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
              <PersonSearchAndRegister 
                    onSubmit={handlePersonSubmit} 
                    escuelas={entities.escuela} 
                    facultades={entities.facultad} 
                    sedes={entities.sede} 
                />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <UserPlus className="w-16 h-16 mb-4 text-indigo-200" />
                <p className="text-lg font-medium">Comienza el registro</p>
                <p className="text-sm">Selecciona una actividad y fecha para habilitar el buscador.</p>
              </div>
            )}
          </div>
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