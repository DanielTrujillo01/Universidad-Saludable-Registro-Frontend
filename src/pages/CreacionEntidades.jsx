import { useState, useEffect, useCallback } from "react"; // 1. Importamos useCallback
import { EntitySelector } from "../components/EntitySelector";
import { EntityForm } from "../components/EntityForm";
import { EntityList } from "../components/EntityList";
import { Plus, ArrowLeft, Settings, Users, X } from "lucide-react";
import { apiRequest, API_ENDPOINTS } from "../api/api";
import { useNavigate } from "react-router-dom";

export function CreacionEntidades() {
  const navigate = useNavigate();
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showForm, setShowForm] = useState(false);

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
  });

  const ALLOWED_ENTITIES = [
    "sede",
    "facultad",
    "escuela",
    "lineaProyecto",
    "lineaEstrategia",
    "tema",
    "prioridad",
    "indicador",
    "actividadConsolidada",
  ];

  useEffect(() => {
    async function fetchEntities() {
      for (const type of Object.keys(API_ENDPOINTS)) {
        try {
          const data = await apiRequest(type, "GET");
          setEntities((prev) => ({ ...prev, [type]: data }));
        } catch (error) {
          console.error(`Error cargando ${type}:`, error);
        }
      }
    }
    fetchEntities();
  }, []);

  // Función para cerrar/cancelar
  const handleCancel = useCallback(() => {
    setShowForm(false);
    setSelectedEntity(null);
  }, []);

  // === NUEVO: Escuchar tecla Escape ===
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Si presiona Escape y el formulario está visible
      if (event.key === "Escape" && showForm) {
        handleCancel();
      }
    };

    // Agregamos el listener
    window.addEventListener("keydown", handleKeyDown);

    // Limpiamos el listener al desmontar o cambiar showForm
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showForm, handleCancel]);

  const handleEntitySelect = (entityType) => {
    // Si ya está seleccionada la misma, la deseleccionamos (toggle)
    if (selectedEntity === entityType) {
      handleCancel();
    } else {
      setSelectedEntity(entityType);
      setShowForm(true);
    }
  };

  const handleFormSubmit = async (data) => {
    if (!selectedEntity) return;
    try {
      const newEntity = await apiRequest(selectedEntity, "POST", data);
      setEntities((prev) => ({
        ...prev,
        [selectedEntity]: [...prev[selectedEntity], newEntity],
      }));
      handleCancel(); // Cerramos al guardar
    } catch (error) {
      console.error("Error creando entidad:", error);
    }
  };

  const handleDelete = async (entityType, id) => {
    try {
      await apiRequest(entityType, "DELETE", null, id);
      setEntities((prev) => ({
        ...prev,
        [entityType]: prev[entityType].filter((item) => item.id !== id),
      }));
    } catch (error) {
      console.error("Error eliminando entidad:", error);
    }
  };

  const filteredEntitiesForList = Object.keys(entities)
    .filter((key) => ALLOWED_ENTITIES.includes(key))
    .reduce((obj, key) => {
      obj[key] = entities[key];
      return obj;
    }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* NAVEGACIÓN */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </button>

          <button
            onClick={() => navigate("/registro-personas")}
            className="flex items-center gap-2 bg-white text-green-700 border border-green-200 px-4 py-2 rounded-lg shadow-sm hover:bg-green-50 hover:border-green-300 transition-all font-medium"
          >
            <Users className="w-5 h-5" />
            Ir a Registro de Personas
          </button>
        </div>

        {/* HEADER */}
        <header className="mb-8">
          <h1 className="text-indigo-900 mb-2 flex items-center gap-3 text-3xl font-bold">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Settings className="w-8 h-8 text-indigo-600" />
            </div>
            Panel de Gestión de Entidades
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Selecciona una categoría del menú izquierdo para crear o eliminar
            elementos.
          </p>
        </header>

        {/* CONTENIDO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-1 border border-indigo-50 overflow-hidden sticky top-6">
              <EntitySelector
                onSelect={handleEntitySelect}
                selectedEntity={selectedEntity}
                disabled={false} // Quitamos disabled para permitir cambiar de entidad al vuelo
              />
            </div>
          </div>

          {/* Columna Derecha: Formulario */}
          <div className="lg:col-span-2">
            {showForm && selectedEntity ? (
              <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden animate-fade-in-up">
                {/* Header del Formulario */}
                <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-indigo-900 capitalize">
                      Crear nueva{" "}
                      {selectedEntity.replace(/([A-Z])/g, " $1").trim()}
                    </h3>
                  </div>
                  {/* Botón cerrar visual */}
                  <button
                    onClick={handleCancel}
                    className="text-xs text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                    title="Cerrar (Esc)"
                  >
                    <span>Esc</span>
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6">
                  <EntityForm
                    entityType={selectedEntity}
                    facultades={entities.facultad}
                    // 👇 AGREGAR ESTA LÍNEA: Pasamos la lista de la entidad actual (ej. sedes)
                    existingData={entities[selectedEntity] || []}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancel}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center border border-dashed border-slate-300 h-full flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Settings className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 mb-2">
                  Panel de Trabajo
                </h3>
                <p className="text-slate-500 max-w-sm">
                  Selecciona una entidad del menú izquierdo para abrir el
                  formulario.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* LISTADO */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
            <h2 className="text-2xl font-bold text-slate-800">
              Registros del Sistema
            </h2>
          </div>

          <EntityList
            entities={filteredEntitiesForList}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
