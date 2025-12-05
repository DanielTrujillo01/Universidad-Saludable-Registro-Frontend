import { useState, useEffect, useRef } from "react";
import {
  Save,
  Search,
  UserPlus,
  FileText,
  Loader2,
  RotateCcw,
  PlusCircle,
  ArrowLeft,
  MapPin, 
} from "lucide-react";
import { apiRequest } from "../api/api";
import { PersonFormFields } from "./PersonFormFields";
// 1. IMPORTAR LA FUNCIÓN DE NORMALIZACIÓN
import { normalizeText } from "../Funtions/BasicFuntions"; 

export function PersonSearchAndRegister({ onSubmit, escuelas, facultades, sedes }) {
  
  const [selectedSede, setSelectedSede] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const initialState = {
    nombre: "",
    tipoDocumento: "",
    numeroDocumento: "",
    edad: "",
    correo: "",
    sexo: "",
    telefono: "",
    estamento: "",
    escuelaId: "", 
  };
  const [formData, setFormData] = useState(initialState);
  const [isNewPersonMode, setIsNewPersonMode] = useState(false);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (searchTerm.length < 3 || isNewPersonMode || selectedPerson) {
      setSearchResults([]);
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const cleanedSearchTerm = searchTerm.trim().replace(/\/+$/, "");
        
        if (!cleanedSearchTerm) {
          setSearchResults([]);
          setIsLoading(false);
          return;
        }

        const res = await apiRequest(
          "persona",
          "GET",
          null,
          `?search=${cleanedSearchTerm}`
        );
        setSearchResults(res);
      } catch (error) {
        console.error("Error buscando:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchTerm, isNewPersonMode, selectedPerson]);

  const resetAll = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSelectedPerson(null);
    setFormData(initialState);
    setIsNewPersonMode(false);
  };

  const handleSwitchToNewPerson = () => {
    setIsNewPersonMode(true);
    setSelectedPerson(null);
    setSearchResults([]);
    setSearchTerm("");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    const { nombre, tipoDocumento, numeroDocumento, correo, estamento, escuelaId } = formData;
    return (
      nombre.trim() &&
      tipoDocumento &&
      numeroDocumento.trim() &&
      correo.trim() &&
      estamento &&
      escuelaId
    );
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSede) {
      alert("Por favor seleccione una Sede.");
      return;
    }

    if (selectedPerson) {
      // Caso 1: Persona existente + Sede
      onSubmit(selectedPerson.id_persona, selectedSede);
      resetAll();
    } else if (isNewPersonMode && isFormValid()) {
      // Caso 2: Nueva persona + Sede
      try {
        console.log("📌 Id de la escuela enviada:", formData.escuelaId);
        // === 2. CONSTRUCCIÓN DE DATOS PARA EL MODELO DJANGO ===
        // Mapeamos camelCase (React) a snake_case (Django Model)
        const dataToSave = {
          // Campos directos (mismo nombre o sin cambios lógicos)
          edad: formData.edad,
          correo: formData.correo,
          sexo: formData.sexo,
          telefono: formData.telefono,
          estamento: formData.estamento,

          // Campos normalizados y originales (según tu modelo)
          nombre: normalizeText(formData.nombre),     // models.CharField (normalizado)
          nombre_original: formData.nombre,           // models.CharField (original)
          
          // Campos renombrados a snake_case
          tipo_documento: formData.tipoDocumento,     // React: tipoDocumento -> Django: tipo_documento
          tipo_documento_original: formData.tipoDocumento, // (Opcional) si quieres guardar el original también
          numero_documento: formData.numeroDocumento, // React: numeroDocumento -> Django: numero_documento
          
          // Foreign Key
          escuela: parseInt(formData.escuelaId, 10)   // React: escuelaId -> Django: escuela
        };

        console.log("📌 Datos enviados al backend (formato Django):", dataToSave);
        
        const newPersona = await apiRequest("persona", "POST", dataToSave);
        
        onSubmit(newPersona.id_persona, selectedSede);
        
        resetAll();
      } catch (error) {
        console.error("Error creando persona:", error);
        alert("Error al guardar la persona. Verifica la consola.");
      }
    }
  };

  const canSubmit = selectedSede && (selectedPerson || (isNewPersonMode && isFormValid()));

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 border-t-4 border-indigo-500">
      <h2 className="text-gray-800 mb-6 flex items-center gap-2 font-bold text-lg">
        <UserPlus className="w-6 h-6 text-indigo-600" />
        {isNewPersonMode ? "Nuevo Registro de Persona" : "Asignar Participación"}
      </h2>

      <form onSubmit={handleFinalSubmit} className="space-y-6">
        
        {/* === SELECTOR DE SEDE === */}
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <label className="block text-indigo-900 font-semibold mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Seleccione la Sede de Participación <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedSede}
            onChange={(e) => setSelectedSede(e.target.value)}
            className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">-- Seleccionar Sede --</option>
            {sedes && sedes.map((sede) => (
              <option key={sede.id_sede} value={sede.id_sede}>
                {sede.nombre_original || sede.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* === LÓGICA DE BÚSQUEDA === */}
        {!isNewPersonMode && (
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="search" className="block text-gray-700 mb-2 font-medium">
                Buscar Persona <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value.endsWith("/")) value = value.slice(0, -1);
                    setSearchTerm(value);
                  }}
                  placeholder="Nombre o Documento (mín. 3 caracteres)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                  disabled={!!selectedPerson}
                />
                {isLoading && (
                  <Loader2 className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                )}
              </div>

              {searchTerm.length >= 3 && !selectedPerson && searchResults.length > 0 && (
                <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl">
                  {searchResults.map((person) => (
                    <li
                      key={person.id_persona}
                      onClick={() => {
                        setSelectedPerson(person);
                        setSearchResults([]);
                      }}
                      className="px-4 py-3 cursor-pointer hover:bg-indigo-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-bold text-gray-800">{person.nombre_original || person.nombre}</div>
                      <div className="text-sm text-gray-500">
                        {person.tipo_documento}: {person.numero_documento}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selectedPerson && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center justify-between animate-fade-in">
                <div>
                  <span className="block text-xs text-green-600 font-bold uppercase tracking-wider">Persona Seleccionada</span>
                  <span className="font-medium flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5" /> 
                    {selectedPerson.nombre_original || selectedPerson.nombre}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPerson(null)}
                  className="text-green-700 hover:text-green-900 text-sm font-medium underline"
                >
                  Cambiar
                </button>
              </div>
            )}

            {searchTerm.length >= 3 && searchResults.length === 0 && !isLoading && !selectedPerson && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-amber-800">
                  No se encontraron resultados para "<strong>{searchTerm}</strong>"
                </span>
                <button
                  type="button"
                  onClick={handleSwitchToNewPerson}
                  className="whitespace-nowrap bg-amber-100 text-amber-800 hover:bg-amber-200 px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" /> Registrar Nuevo
                </button>
              </div>
            )}
          </div>
        )}

        {/* === FORMULARIO NUEVA PERSONA === */}
        {isNewPersonMode && (
          <div className="border border-gray-200 p-5 rounded-lg bg-gray-50/50">
            <div className="flex justify-between items-center mb-5 border-b border-gray-200 pb-3">
              <h3 className="text-lg font-semibold text-gray-700">Datos Personales</h3>
              <button
                type="button"
                onClick={resetAll}
                className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Volver a Búsqueda
              </button>
            </div>

            <PersonFormFields
              formData={formData}
              handleChange={handleFormChange}
              escuelas={escuelas}
              facultades={facultades}
            />
          </div>
        )}

        {/* === BOTONES DE ACCIÓN === */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-none font-medium"
          >
            <Save className="w-5 h-5" />
            {selectedPerson ? "Confirmar Participación" : "Guardar y Confirmar"}
          </button>
          
          <button
            type="button"
            onClick={resetAll}
            className="px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium"
            title="Limpiar formulario"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}