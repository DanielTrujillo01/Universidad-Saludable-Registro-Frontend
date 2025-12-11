import { useState, useEffect, useRef } from "react";
import {
  Save, Search, UserPlus, FileText, Loader2, RotateCcw,
  PlusCircle, ArrowLeft, MapPin, BookOpen 
} from "lucide-react";
import { apiRequest } from "../api/api";
import { PersonFormFields } from "./PersonFormFields";
import { normalizeText } from "../Funtions/BasicFuntions"; 

// Recibimos 'temas' como prop
export function PersonSearchAndRegister({ onSubmit, escuelas, facultades, sedes, temas }) {
  
  const [selectedSede, setSelectedSede] = useState("");
  const [selectedTema, setSelectedTema] = useState(""); // Nuevo estado
  
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

  // Búsqueda con debounce
  useEffect(() => {
    if (searchTerm.length < 3 || isNewPersonMode || selectedPerson) {
      setSearchResults([]);
      return;
    }
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const cleanedSearchTerm = searchTerm.trim().replace(/\/+$/, "");
        if (!cleanedSearchTerm) {
          setSearchResults([]);
          return;
        }
        const res = await apiRequest("persona", "GET", null, `?search=${cleanedSearchTerm}`);
        setSearchResults(res);
      } catch (error) {
        console.error("Error buscando:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => { if (debounceTimeout.current) clearTimeout(debounceTimeout.current); };
  }, [searchTerm, isNewPersonMode, selectedPerson]);

  const resetAll = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSelectedPerson(null);
    setFormData(initialState);
    setIsNewPersonMode(false);
    // No reseteamos Sede ni Tema intencionalmente
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
    return nombre.trim() && tipoDocumento && numeroDocumento.trim() && correo.trim() && estamento && escuelaId;
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    // Validación de selectores superiores
    if (!selectedSede || !selectedTema) {
      alert("Por favor seleccione la Sede y el Tema/Taller de participación.");
      return;
    }

    if (selectedPerson) {
      // Caso 1: Persona existente. Enviamos ID persona + ID sede + ID tema
      onSubmit(selectedPerson.id_persona, selectedSede, selectedTema);
      resetAll();
    } else if (isNewPersonMode && isFormValid()) {
      // Caso 2: Persona nueva
      try {
        const dataToSave = {
          edad: formData.edad,
          correo: formData.correo,
          sexo: formData.sexo,
          telefono: formData.telefono,
          estamento: formData.estamento,
          nombre: normalizeText(formData.nombre),
          nombre_original: formData.nombre,
          tipo_documento: formData.tipoDocumento,
          tipo_documento_original: formData.tipoDocumento,
          numero_documento: formData.numeroDocumento,
          escuela: parseInt(formData.escuelaId, 10)
        };

        const newPersona = await apiRequest("persona", "POST", dataToSave);
        onSubmit(newPersona.id_persona, selectedSede, selectedTema);
        resetAll();
      } catch (error) {
        console.error("Error creando persona:", error);
        alert("Error al guardar la persona.");
      }
    }
  };

  const canSubmit = selectedSede && selectedTema && (selectedPerson || (isNewPersonMode && isFormValid()));

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 border-t-4 border-indigo-500">
      <h2 className="text-gray-800 mb-6 flex items-center gap-2 font-bold text-lg">
        <UserPlus className="w-6 h-6 text-indigo-600" />
        {isNewPersonMode ? "Nuevo Registro de Persona" : "Asignar Participación"}
      </h2>

      <form onSubmit={handleFinalSubmit} className="space-y-6">
        
        {/* === SELECTORES DE CONTEXTO (SEDE Y TEMA) === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* SELECTOR SEDE */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <label className="block text-indigo-900 font-semibold mb-2 flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    Sede <span className="text-red-500">*</span>
                </label>
                <select
                    value={selectedSede}
                    onChange={(e) => setSelectedSede(e.target.value)}
                    className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                >
                    <option value="">-- Seleccionar --</option>
                    {sedes && sedes.map((sede) => (
                    <option key={sede.id_sede} value={sede.id_sede}>
                        {sede.nombre_original || sede.nombre}
                    </option>
                    ))}
                </select>
            </div>

            {/* SELECTOR TEMA (DINÁMICO SEGÚN ACTIVIDAD) */}
            <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
                <label className="block text-pink-900 font-semibold mb-2 flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4" />
                    Tema / Taller <span className="text-red-500">*</span>
                </label>
                {temas && temas.length > 0 ? (
                    <select
                        value={selectedTema}
                        onChange={(e) => setSelectedTema(e.target.value)}
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white text-sm"
                    >
                        <option value="">-- Seleccionar Tema --</option>
                        {temas.map((item) => (
                            <option key={item.id_tema} value={item.id_tema}>
                                {item.nombre_original || item.nombre}
                            </option>
                        ))}
                    </select>
                ) : (
                    <div className="text-sm text-pink-600 italic bg-white/50 p-2 rounded">
                        No hay temas asociados. Se guardará sin tema específico si el sistema lo permite.
                    </div>
                )}
            </div>
        </div>

        {/* === BÚSQUEDA === */}
        {!isNewPersonMode && (
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-gray-700 mb-2 font-medium">
                Buscar Persona <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.replace(/\/+$/, ""))}
                  placeholder="Nombre o Documento (mín. 3 caracteres)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                  disabled={!!selectedPerson}
                />
                {isLoading && <Loader2 className="animate-spin absolute right-3 top-1/2 w-5 h-5 text-indigo-500" />}
              </div>

              {/* Resultados Dropdown */}
              {searchTerm.length >= 3 && !selectedPerson && searchResults.length > 0 && (
                <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl">
                  {searchResults.map((person) => (
                    <li
                      key={person.id_persona}
                      onClick={() => {
                        setSelectedPerson(person);
                        setSearchResults([]);
                      }}
                      className="px-4 py-3 cursor-pointer hover:bg-indigo-50 border-b border-gray-100 transition-colors"
                    >
                      <div className="font-bold text-gray-800">{person.nombre_original || person.nombre}</div>
                      <div className="text-sm text-gray-500">{person.tipo_documento}: {person.numero_documento}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Persona Seleccionada Card */}
            {selectedPerson && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center justify-between animate-fade-in">
                <div>
                  <span className="block text-xs text-green-600 font-bold uppercase">Persona Seleccionada</span>
                  <span className="font-medium flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5" /> {selectedPerson.nombre_original || selectedPerson.nombre}
                  </span>
                </div>
                <button type="button" onClick={() => setSelectedPerson(null)} className="text-green-700 font-medium underline">
                  Cambiar
                </button>
              </div>
            )}

            {/* No resultados */}
            {searchTerm.length >= 3 && searchResults.length === 0 && !isLoading && !selectedPerson && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex justify-between items-center">
                <span className="text-amber-800">No hay resultados para "<strong>{searchTerm}</strong>"</span>
                <button type="button" onClick={handleSwitchToNewPerson} className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1">
                  <PlusCircle className="w-4 h-4" /> Registrar Nuevo
                </button>
              </div>
            )}
          </div>
        )}

        {/* === MODO NUEVA PERSONA === */}
        {isNewPersonMode && (
          <div className="border border-gray-200 p-5 rounded-lg bg-gray-50/50">
            <div className="flex justify-between items-center mb-5 border-b pb-3">
              <h3 className="text-lg font-semibold text-gray-700">Datos Personales</h3>
              <button type="button" onClick={resetAll} className="text-indigo-600 text-sm flex items-center gap-1 font-medium">
                <ArrowLeft className="w-4 h-4" /> Volver a Búsqueda
              </button>
            </div>
            <PersonFormFields formData={formData} handleChange={handleFormChange} escuelas={escuelas} facultades={facultades} />
          </div>
        )}

        {/* === BOTONES === */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button type="submit" disabled={!canSubmit} className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md font-medium flex justify-center gap-2 transition-all">
            <Save className="w-5 h-5" /> {selectedPerson ? "Confirmar Participación" : "Guardar y Confirmar"}
          </button>
          <button type="button" onClick={resetAll} className="px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}