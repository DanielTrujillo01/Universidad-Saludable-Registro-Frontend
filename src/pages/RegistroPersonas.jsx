import { useState, useEffect } from "react";
import { UserPlus, ArrowLeft, Settings, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { normalizeText } from "../Funtions/BasicFuntions";
import { PersonSearchAndRegister } from "../components/PersonSearchAndRegister";
import { ActionModal } from "../components/creationsModals/ActionModal";
import { AsyncEntitySelect } from "../components/AsyncEntitySelect";
import { apiRequest, API_ENDPOINTS } from "../api/api";
import { CreateEntityModal } from "../components/creationsModals/CreateEntityModal";
import { ActivityModal } from "../components/creationsModals/ActivityModal";
import { SectionModal } from "../components/creationsModals/SectionModal";
import { set } from "react-hook-form";

export function RegistroPersonas() {
  const navigate = useNavigate();

  // 1. ESTADO: Listas maestras pequeñas
  const [entities, setEntities] = useState({
    sede: [],
    facultad: [],
    escuela: [],
    prioridad: [],
    lineaEstrategia: [],
    estrategia: [],
  });

  // Estados de la sesión
  const [selectedAccionId, setSelectedAccionId] = useState("");
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [selectedSeccionId, setSelectedSeccionId] = useState("");
  const [selectedSedeId, setSelectedSedeId] = useState("");

  //estados de carga dinámica
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingSecciones, setLoadingSecciones] = useState(false);

  const [selectedDate, setSelectedDate] = useState("");
  const [availableSecciones, setAvailableSecciones] = useState([]);
  const [registeredPersons, setRegisteredPersons] = useState([]);
  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // "accion", "actividad", "seccion"

  const canRegister =
    selectedAccionId &&
    selectedActivityId &&
    selectedSedeId &&
    selectedDate &&
    (availableSecciones.length === 0 || selectedSeccionId);

  const shouldShowSede =
    !loadingSecciones &&
    (selectedSeccionId ||
      (selectedActivityId && availableSecciones.length === 0));

  // 2. WHITELIST: Carga inicial solo de datos pequeños y públicos
  const REQUIRED_ENTITIES = [
    "sede",
    "facultad",
    "escuela",
    "prioridad",
    "lineaEstrategia",
    "estrategia",
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
    console.log("Estrategias:", entities.estrategia);
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchThemes() {
      if (!selectedActivityId) {
        setAvailableSecciones([]);
        setSelectedSeccionId("");
        return;
      }

      setLoadingSecciones(true);

      try {
        const secciones = await apiRequest(
          "actividad",
          "GET",
          null,
          `${selectedActivityId}/secciones`,
        );

        setAvailableSecciones(secciones);
      } catch (error) {
        console.error("Error cargando secciones:", error);
        setAvailableSecciones([]);
        toast.error("No se pudieron cargar las secciones.");
      } finally {
        setLoadingSecciones(false);
      }
    }

    fetchThemes();
  }, [selectedActivityId]);

  // 4. REGISTRAR ASISTENCIA
  // En RegistroPersonas.jsx

  const handlePersonSubmit = async (dataDesdeHijo) => {
    console.log(
      "Datos de la participacion:",
      dataDesdeHijo.persona,
      selectedSedeId,
      selectedActivityId,
      selectedDate,
    );

    if (
      !dataDesdeHijo.persona ||
      !selectedSedeId ||
      !selectedActivityId ||
      !selectedDate
    ) {
      toast.warning(
        "Faltan datos de la sesión para registrar la participación",
      );
      return;
    }

    //Armamos el body final de la Participación
    const body = {
      persona: dataDesdeHijo.persona,
      vinculacion: dataDesdeHijo.vinculacion,
      accion: parseInt(selectedAccionId, 10),
      actividad: parseInt(selectedActivityId, 10),
      fecha: selectedDate,
      anio: new Date(selectedDate).getFullYear(),
      sede: parseInt(selectedSedeId, 10),
    };

    if (selectedSeccionId) {
      body.seccion = parseInt(selectedSeccionId, 10);
    }

    const promise = apiRequest("participacion", "POST", body);

    toast.promise(promise, {
      loading: "Registrando asistencia...",
      success: (nueva) => {
        setRegisteredPersons((prev) => [...prev, nueva]);
        return "Participación registrada correctamente";
      },
      error: "Error al registrar. Revisa los datos de la persona.",
    });
  };

  const handleAddActivity = (nuevaActividad) => {
    setActiveModal(false);
    toast.success(
      `Actividad "${nuevaActividad.nombre}" creada. Ya puedes buscarla.`,
    );
  };

  const handleSelectEntity = (type) => {
    setShowSelectorModal(false);
    setActiveModal(type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Toaster richColors position="top-right" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* NAVEGACIÓN */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors font-medium group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </button>
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
            Configura la sesión y registra la asistencia.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PANEL IZQUIERDO: CONFIGURACIÓN */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6 h-fit border border-indigo-50 lg:sticky lg:top-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-gray-800 font-semibold">
                Datos de la Sesión
              </h2>
              <button
                type="button"
                onClick={() => setShowSelectorModal(true)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded transition-colors font-medium"
              >
                <PlusCircle className="w-3 h-3" /> Crear Nuevo
              </button>
            </div>

            <div>
              <AsyncEntitySelect
                entityType="accion"
                label="Seleccionar Acción"
                // PASAMOS EL VALOR ACTUAL para que el componente sepa si debe resetearse
                value={selectedAccionId}
                onSelect={(id) => {
                  setSelectedAccionId(id);
                  setSelectedActivityId("");
                  setSelectedSeccionId("");
                  setSelectedSedeId("");
                  setSelectedDate("");
                  setAvailableSecciones([]);
                }}
                required
              />

              {selectedAccionId && (
                <>
                  {loadingActivities ? (
                    <p className="text-sm text-gray-500">
                      Cargando actividades...
                    </p>
                  ) : (
                    <AsyncEntitySelect
                      entityType="actividad"
                      label="Seleccionar Actividad"
                      value={selectedActivityId}
                      onSelect={(id) => {
                        setSelectedActivityId(id);
                        setSelectedSeccionId("");
                      }}
                      required
                    />
                  )}
                </>
              )}

              {selectedActivityId && (
                <>
                  {loadingSecciones ? (
                    <p className="text-sm text-gray-500">
                      Cargando secciones...
                    </p>
                  ) : availableSecciones.length === 0 ? (
                    <p className="text-sm text-blue-600">
                      Esta actividad no tiene secciones asociados (puedes
                      continuar).
                    </p>
                  ) : (
                    <AsyncEntitySelect
                      entityType="seccion"
                      label="Seleccionar Sección"
                      value={selectedSeccionId}
                      parentId={selectedActivityId} // <--- Pasamos el ID de la actividad
                      parentField="seccionasociada__actividad_id" // <--- El nombre del campo para secciones
                      onSelect={setSelectedSeccionId}
                      required
                    />
                  )}
                </>
              )}

              {shouldShowSede && (
                <div>
                  <label className="block text-gray-700 mb-2 font-medium text-sm">
                    Sede <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSedeId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedSedeId(val ? parseInt(val, 10) : "");
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Seleccionar Sede --</option>
                    {entities.sede.map((sede) => (
                      <option key={sede.id_sede} value={sede.id_sede}>
                        {sede.nombre_original || sede.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {shouldShowSede && (
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
            )}

            <div
              className={`rounded-lg p-4 text-sm border ${
                canRegister
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-orange-50 border-orange-200 text-orange-800"
              }`}
            >
              <p className="font-bold mb-1">Estado:</p>

              {!selectedAccionId && "● Selecciona una acción"}
              {selectedAccionId &&
                !selectedActivityId &&
                "● Selecciona una actividad"}
              {selectedActivityId &&
                availableSecciones.length > 0 &&
                !selectedSeccionId &&
                "● Selecciona una sección"}
              {selectedAccionId &&
                selectedActivityId &&
                selectedSedeId &&
                (availableSecciones.length === 0 || selectedSeccionId) &&
                selectedDate && (
                  <span className="font-semibold">● Listo para registrar</span>
                )}

              {shouldShowSede && !selectedSedeId && (
                <p>● Selecciona la sede de la participación</p>
              )}

              {shouldShowSede && !selectedDate && (
                <p>● Selecciona la fecha de la participación</p>
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
                  secciones={availableSecciones} // <--- Pasamos las secciones cargadas
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500 flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <UserPlus className="w-10 h-10 text-indigo-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  Esperando configuración
                </h3>
                <p className="text-sm max-w-xs mx-auto">
                  Selecciona Actividad y Fecha para continuar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔹 Selector de entidad */}
      <CreateEntityModal
        open={showSelectorModal}
        onClose={() => setShowSelectorModal(false)}
        onSelect={handleSelectEntity}
      />

      {/* 🔹 Acción */}
      <ActionModal
        open={activeModal === "accion"}
        onClose={() => setActiveModal(null)}
        onSubmit={handleAddActivity}
        prioridades={entities.prioridad}
        lineasEstrategias={entities.lineaEstrategia}
        estrategias={entities.estrategia}
      />

      {/* 🔹 Actividad */}
      <ActivityModal
        open={activeModal === "actividad"}
        onClose={() => setActiveModal(null)}
        onSubmit={(nueva) => {
          toast.success(`Actividad "${nueva.nombre}" creada`);
          setActiveModal(null);
        }}
      />

      {/* 🔹 Sección */}
      <SectionModal
        open={activeModal === "seccion"}
        onClose={() => setActiveModal(null)}
        onSubmit={(nueva) => {
          toast.success(`Sección "${nueva.nombre}" creada`);
          setActiveModal(null);
        }}
      />
    </div>
  );
}
