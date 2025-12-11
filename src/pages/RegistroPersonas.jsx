import { useState, useEffect } from "react";
import { UserPlus, ArrowLeft, Settings, PlusCircle } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner"; 

import { PersonSearchAndRegister } from "../components/PersonSearchAndRegister";
import { ActivityModal } from "../components/ActivityModal";
import { AsyncEntitySelect } from "../components/AsyncEntitySelect"; 
import { apiRequest, API_ENDPOINTS } from "../api/api";

export function RegistroPersonas() {
  const navigate = useNavigate();

  // 1. ESTADO: Listas maestras pequeñas
  const [entities, setEntities] = useState({
    sede: [],
    facultad: [],
    escuela: [],
    prioridad: [],       
    lineaEstrategia: [], 
  });

  // Estados de la sesión
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableTemas, setAvailableTemas] = useState([]); // Nuevo estado para temas filtrados
  const [registeredPersons, setRegisteredPersons] = useState([]); 
  const [showModal, setShowModal] = useState(false);

  const canRegister = selectedActivityId && selectedDate;

  // 2. WHITELIST: Carga inicial solo de datos pequeños y públicos
  const REQUIRED_ENTITIES = [
    "sede", 
    "facultad", 
    "escuela", 
    "prioridad", 
    "lineaEstrategia"
  ];

  useEffect(() => {
    async function fetchData() {
      for (const type of REQUIRED_ENTITIES) {
        try {
          if (API_ENDPOINTS[type]) {
             const res = await apiRequest(type, "GET");
             setEntities((prev) => ({ ...prev, [type]: res }));
          }
        } catch (error) {
          console.error(`❌ Error cargando ${type}:`, error);
        }
      }
    }
    fetchData();
  }, []);

  // 3. EFECTO NUEVO: Cargar temas cuando se selecciona una actividad
  useEffect(() => {
    async function fetchActivityThemes() {
      if (!selectedActivityId) {
        setAvailableTemas([]);
        return;
      }

      try {
        // Llamada al endpoint público configurado en el backend: 
        // GET /api/actividades/{id}/temas/
        // Esto evita usar el dashboard privado
        const temas = await apiRequest(
            "actividad", 
            "GET", 
            null, 
            `${selectedActivityId}/temas` 
        );
        setAvailableTemas(temas);
      } catch (error) {
        console.error("Error cargando temas:", error);
        setAvailableTemas([]);
        toast.error("No se pudieron cargar los temas de esta actividad.");
      }
    }

    fetchActivityThemes();
  }, [selectedActivityId]);


  // 4. REGISTRAR ASISTENCIA (Recibe Tema ID)
  const handlePersonSubmit = async (personaId, sedeId, temaId) => {
    if (!personaId || !sedeId || !temaId || !selectedActivityId || !selectedDate) {
      toast.warning("Faltan datos (Sede o Tema) para registrar la participación");
      return;
    }

    const body = {
      persona: personaId,
      actividad: selectedActivityId,
      sede: sedeId,
      tema: temaId, // <-- Enviamos el tema seleccionado
      fecha: selectedDate,
      anio: new Date(selectedDate).getFullYear(),
    };

    const promise = apiRequest("participacion", "POST", body);

    toast.promise(promise, {
      loading: 'Registrando asistencia...',
      success: (nueva) => {
        setRegisteredPersons((prev) => [...prev, nueva]);
        return "Participación registrada correctamente";
      },
      error: "Error al registrar. Verifica si la persona ya existe en esta actividad."
    });
  };

  const handleAddActivity = (nuevaActividad) => {
    setShowModal(false);
    toast.success(`Actividad "${nuevaActividad.nombre}" creada. Ya puedes buscarla.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Toaster richColors position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* NAVEGACIÓN */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors font-medium group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </button>
          <button onClick={() => navigate("/creacion-entidades")} className="flex items-center gap-2 bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-50 hover:border-indigo-300 transition-all">
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
            Configura la sesión y registra la asistencia seleccionando sede y tema.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PANEL IZQUIERDO: CONFIGURACIÓN */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6 h-fit sticky top-6 border border-indigo-50">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
               <h2 className="text-gray-800 font-semibold">Datos de la Sesión</h2>
               <button type="button" onClick={() => setShowModal(true)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded transition-colors font-medium">
                  <PlusCircle className="w-3 h-3" /> Nueva Actividad
                </button>
            </div>

            <div>
              <AsyncEntitySelect
                entityType="actividad"
                label="Seleccionar Actividad"
                placeholder="Escribe para buscar..."
                onSelect={setSelectedActivityId}
                required={true}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium text-sm">
                Fecha del Evento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            
            <div className={`rounded-lg p-4 text-sm border ${canRegister ? 'bg-green-50 border-green-200 text-green-800' : 'bg-orange-50 border-orange-200 text-orange-800'}`}>
                <p className="font-bold mb-1">Estado:</p>
                {canRegister ? (
                    <span className="flex items-center gap-2 font-semibold">● Listo para registrar</span>
                ) : (
                    <span className="flex items-center gap-2">● Faltan datos para habilidar el registro</span>
                )}
            </div>
          </div>

          {/* PANEL DERECHO: BUSCADOR */}
          <div className="lg:col-span-2">
            {canRegister ? (
              <div className="animate-fade-in-up">
                  <PersonSearchAndRegister 
                    onSubmit={handlePersonSubmit} 
                    escuelas={entities.escuela} 
                    facultades={entities.facultad} 
                    sedes={entities.sede} 
                    temas={availableTemas} // <--- Pasamos los temas cargados
                  />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500 flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <UserPlus className="w-10 h-10 text-indigo-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Esperando configuración</h3>
                <p className="text-sm max-w-xs mx-auto">Selecciona Actividad y Fecha para continuar.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ActivityModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddActivity}
        prioridades={entities.prioridad}
        estrategias={entities.lineaEstrategia}
      />
    </div>
  );
}