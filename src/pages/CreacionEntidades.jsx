import { useState, useEffect, useCallback } from "react";
import { EntitySelector } from "../components/EntitySelector";
import { EntityForm } from "../components/EntityForm";
import { Plus, ArrowLeft, Settings, Users, X } from "lucide-react";
import { apiRequest } from "../api/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // Asegúrate de tener sonner instalado para notificaciones

export function CreacionEntidades() {
  const navigate = useNavigate();
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Función para cerrar/cancelar el formulario
  const handleCancel = useCallback(() => {
    setShowForm(false);
    setSelectedEntity(null);
  }, []);

  // === Escuchar tecla Escape para cerrar ===
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && showForm) {
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showForm, handleCancel]);

  // Manejador de selección del menú lateral
  const handleEntitySelect = (entityType) => {
    if (selectedEntity === entityType) {
      handleCancel(); // Si toca el mismo, cierra (toggle)
    } else {
      setSelectedEntity(entityType);
      setShowForm(true);
    }
  };

  // Manejo del envío del formulario (POST al Backend)
  const handleFormSubmit = async (data) => {
    if (!selectedEntity) return;

    // Promesa para mostrar estado de carga (Opcional pero recomendado)
    const promise = apiRequest(selectedEntity, "POST", data);

    toast.promise(promise, {
      loading: 'Creando registro...',
      success: (newData) => {
        handleCancel(); // Cerramos el formulario solo si tuvo éxito
        return `${selectedEntity} creado exitosamente`;
      },
      error: (err) => {
        console.error(err);
        // Intentamos mostrar el mensaje de error del backend si existe
        return "Error al crear. Verifica los datos o intenta nuevamente.";
      },
    });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* === NAVEGACIÓN SUPERIOR === */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors font-medium group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
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

        {/* === HEADER === */}
        <header className="mb-8">
          <h1 className="text-indigo-900 mb-2 flex items-center gap-3 text-3xl font-bold">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Settings className="w-8 h-8 text-indigo-600" />
            </div>
            Panel de Gestión de Entidades
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Selecciona una categoría del menú izquierdo para crear nuevos elementos en el sistema.
          </p>
        </header>

        {/* === CONTENIDO PRINCIPAL (GRID) === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: SELECTOR DE ENTIDADES */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-1 border border-indigo-50 overflow-hidden sticky top-6">
              <EntitySelector
                onSelect={handleEntitySelect}
                selectedEntity={selectedEntity}
                disabled={false}
              />
            </div>
          </div>

          {/* Columna Derecha: FORMULARIO DINÁMICO */}
          <div className="lg:col-span-2">
            {showForm && selectedEntity ? (
              <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden animate-fade-in-up">
                
                {/* Header del Formulario */}
                <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-indigo-900 capitalize">
                      Crear nueva {selectedEntity.replace(/([A-Z])/g, " $1").trim()}
                    </h3>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="text-xs text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-indigo-100"
                    title="Cerrar (Esc)"
                  >
                    <span>Esc</span>
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Cuerpo del Formulario */}
                <div className="p-6">
                  <EntityForm
                    entityType={selectedEntity}
                    // Ya no pasamos listas gigantes, el form usa AsyncSelect
                    existingData={[]} // Enviamos vacío (validación duplicados será backend)
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancel}
                  />
                </div>
              </div>
            ) : (
              // Estado Vacío (Placeholder)
              <div className="bg-white rounded-xl shadow-md p-12 text-center border border-dashed border-slate-300 h-full flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Settings className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-medium text-slate-800 mb-2">
                  Panel de Trabajo Listo
                </h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Selecciona una opción del menú de la izquierda para desplegar el formulario de creación correspondiente.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* SE ELIMINÓ LA SECCIÓN DE LISTADO INFERIOR */}
        
      </div>
    </div>
  );
}