import { useState, useEffect } from "react";
import { EntitySelector } from "../components/EntitySelector";
import { EntityForm } from "../components/EntityForm";
import { EntityList } from "../components/EntityList";
import { Plus, ArrowLeft } from "lucide-react";
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

  const handleEntitySelect = (entityType) => {
    setSelectedEntity(entityType);
    setShowForm(true);
  };

  const handleFormSubmit = async (data) => {
    if (!selectedEntity) return;
    try {
      const newEntity = await apiRequest(selectedEntity, "POST", data);
      setEntities((prev) => ({
        ...prev,
        [selectedEntity]: [...prev[selectedEntity], newEntity],
      }));
      setShowForm(false);
      setSelectedEntity(null);
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

  const handleCancel = () => {
    setShowForm(false);
    setSelectedEntity(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-blue-900 mb-2 flex items-center gap-3">
            <Plus className="w-8 h-8" />
            Panel de Creación de Entidades
          </h1>
          <p className="text-gray-600">
            Selecciona el tipo de entidad que deseas crear y completa el
            formulario
          </p>
        </header>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-green-600 hover:text-green-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <EntitySelector
              onSelect={handleEntitySelect}
              selectedEntity={selectedEntity}
              disabled={showForm}
            />
          </div>

          <div className="lg:col-span-2">
            {showForm && selectedEntity ? (
              <EntityForm
                entityType={selectedEntity}
                facultades={entities.facultad}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Plus className="w-16 h-16 mx-auto mb-3 opacity-50" />
                </div>
                <p className="text-gray-500">
                  Selecciona una entidad del panel izquierdo para comenzar
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <EntityList entities={entities} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}
