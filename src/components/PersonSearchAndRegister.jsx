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
  BookOpen,
} from "lucide-react";
import { apiRequest } from "../api/api";
import { PersonFormFields } from "./PersonFormFields";
import { normalizeText } from "../Funtions/BasicFuntions";

// Recibimos 'secciones' como prop
export function PersonSearchAndRegister({ onSubmit, escuelas, facultades }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personVinculaciones, setPersonVinculaciones] = useState([]);
  const [selectedVinculacion, setSelectedVinculacion] = useState(null);
  const [unidadSearch, setUnidadSearch] = useState("");
  const [showUnidadResults, setShowUnidadResults] = useState(false);

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
  const [unidadesOrganizativas, setUnidadesOrganizativas] = useState([]);
  const [showAddVinculacion, setShowAddVinculacion] = useState(false);
  const [newVincData, setNewVincData] = useState({
    id_unidad_organizativa: "",
    tipo_estamento: "Estudiante",
    semestre: 1,
    estado: true,
  });

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
        const res = await apiRequest(
          "persona",
          "GET",
          null,
          `?search=${cleanedSearchTerm}`,
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

  useEffect(() => {
    async function fetchUnidades() {
      try {
        const res = await apiRequest("unidadOrganizativa", "GET");
        setUnidadesOrganizativas(res);
      } catch (error) {
        console.error("Error cargando unidades:", error);
      }
    }
    fetchUnidades();
  }, []);

  const resetAll = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSelectedPerson(null);
    setFormData(initialState);
    setIsNewPersonMode(false);
    setPersonVinculaciones([]);
    setSelectedVinculacion(null);
    setShowAddVinculacion(false);
    // No reseteamos Sede ni Sección intencionalmente
  };

  const handleUpdateSemestre = async (vincId, nuevoSemestre) => {
    if (!nuevoSemestre || nuevoSemestre < 1) return;

    try {
      // Llamada PATCH para actualización parcial
      const updatedVinc = await apiRequest(
        "vinculacion",
        "PATCH",
        { semestre: parseInt(nuevoSemestre, 10) },
        vincId,
      );

      // Actualizamos el estado local de la lista de vinculaciones
      setPersonVinculaciones((prev) =>
        prev.map((v) => (v.id_vinculacion === vincId ? updatedVinc : v)),
      );

      // Si la vinculación editada es la que está seleccionada, actualizamos la selección también
      if (selectedVinculacion?.id_vinculacion === vincId) {
        setSelectedVinculacion(updatedVinc);
      }

      alert("Semestre actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar semestre:", error);
      alert("No se pudo actualizar el semestre");
    }
  };

  const filteredUnidades = unidadesOrganizativas.filter((u) =>
    u.nombre.toLowerCase().includes(unidadSearch.toLowerCase()),
  );

  const handleSelectPerson = (person) => {
    setSelectedPerson(person);
    setSearchResults([]);

    console.log("Persona seleccionada:", person);
    // Usamos las vinculaciones que vienen dentro del objeto persona (gracias al cambio en el serializer)
    const vinculacionesActivas = person.vinculaciones || [];
    setPersonVinculaciones(vinculacionesActivas);

    // Si solo tiene una, se selecciona automáticamente
    if (vinculacionesActivas.length === 1) {
      setSelectedVinculacion(vinculacionesActivas[0]);
    } else {
      setSelectedVinculacion(null);
    }
  };

  const handleEstamentoChange = (e) => {
    const valor = e.target.value;
    setNewVincData({
      ...newVincData,
      tipo_estamento: valor,
      // Si no es estudiante, reseteamos a null o string vacío para el input
      semestre: valor === "Estudiante" ? 1 : "",
    });
  };

  const handleAddVinculacion = async () => {
    if (!selectedPerson || !newVincData.id_unidad_organizativa) {
      alert("Seleccione una unidad organizativa");
      return;
    }

    // 2. Ajuste en el BODY para evitar el Bad Request
    const body = {
      id_persona: selectedPerson.id_persona,
      id_unidad_organizativa: parseInt(newVincData.id_unidad_organizativa, 10),
      tipo_estamento: newVincData.tipo_estamento,
      // CRÍTICO: Si no es estudiante, mandamos null, de lo contrario parseamos
      semestre:
        newVincData.tipo_estamento === "Estudiante"
          ? parseInt(newVincData.semestre, 10)
          : null,
      estado: true,
    };

    try {
      const nuevaVinc = await apiRequest("vinculacion", "POST", body);
      setPersonVinculaciones((prev) => [...prev, nuevaVinc]);
      setSelectedVinculacion(nuevaVinc);
      setShowAddVinculacion(false);

      // Limpiar formulario de vinculación para el siguiente uso
      setNewVincData({
        id_unidad_organizativa: "",
        tipo_estamento: "Estudiante",
        semestre: 1,
        estado: true,
      });
      setUnidadSearch("");

      alert("Vinculación creada con éxito");
    } catch (error) {
      console.error("Error al crear vinculación:", error);
      alert("Error al crear la vinculación. Verifique los datos.");
    }
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
    const { nombre, tipoDocumento, numeroDocumento, correo } = formData;
    return (
      nombre.trim() && tipoDocumento && numeroDocumento.trim() && correo.trim()
    );
  };

  const handleFinalSubmit = async (e) => {
  e.preventDefault();

  if (selectedPerson) {
    if (!selectedVinculacion) {
      alert("Por favor selecciona una vinculación activa.");
      return;
    }
    
    const idsParaRegistro = {
      persona: selectedPerson.id_persona,
      vinculacion: selectedVinculacion.id_vinculacion,
    };

    try {
      await onSubmit(idsParaRegistro);
      resetAll();
    } catch (error) {
      console.error("Error al registrar participación:", error);
    }
  } else if (isNewPersonMode && isFormValid()) {
    // === CASO 2: PERSONA NUEVA + VINCULACIÓN NUEVA ===
    try {
      // 1. Preparamos y creamos la Persona
      const personData = {
        edad: parseInt(formData.edad, 10),
        numero_documento: parseInt(formData.numeroDocumento, 10),
        correo: formData.correo,
        sexo: formData.sexo,
        nombre: normalizeText(formData.nombre),
        nombre_original: formData.nombre,
        tipo_documento: formData.tipoDocumento,
      };

      console.log("Creando nueva persona con datos:", personData);
      const newPersona = await apiRequest("persona", "POST", personData);

      // 2. Creamos la Vinculación (usando la lógica de handleAddVinculacion)
      // Usamos los campos estamento y escuelaId que vienen del PersonFormFields
      console.log("Creando vinculación para la nueva persona con datos:", {
        id_persona: newPersona.id_persona,
        id_unidad_organizativa: formData.escuelaId,
        tipo_estamento: formData.estamento,
        semestre: formData.estamento === "Estudiante" ? formData.edad_o_semestre_si_aplica : null,
      });
      const vincData = {
        id_persona: newPersona.id_persona,
        id_unidad_organizativa: parseInt(formData.escuelaId, 10),
        tipo_estamento: formData.estamento,
        semestre: formData.estamento === "Estudiante" ? parseInt(formData.edad_o_semestre_si_aplica, 10) || 1 : null,
        estado: true,
      };

      const newVinculacion = await apiRequest("vinculacion", "POST", vincData);

      // 3. Enviamos ambos IDs recién creados al padre
      const idsParaRegistro = {
        persona: newPersona.id_persona,
        vinculacion: newVinculacion.id_vinculacion,
      };

      console.log("Enviando nuevos registros al padre:", idsParaRegistro);
      
      await onSubmit(idsParaRegistro);
      resetAll();
      alert("Persona y vinculación creadas con éxito");

    } catch (error) {
      console.error("Error en el proceso de registro:", error);
      alert("Error al guardar los datos. Verifique la conexión o los campos.");
    }
  }
};

  const canSubmit = selectedPerson || (isNewPersonMode && isFormValid());

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 border-t-4 border-indigo-500">
      <h2 className="text-gray-800 mb-6 flex items-center gap-2 font-bold text-lg">
        <UserPlus className="w-6 h-6 text-indigo-600" />
        {isNewPersonMode
          ? "Nuevo Registro de Persona"
          : "Asignar Participación"}
      </h2>

      <form onSubmit={handleFinalSubmit} className="space-y-6">
        {/* === BÚSQUEDA === */}
        {!isNewPersonMode && (
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-gray-700 mb-2 font-medium">
                Buscar Persona <span className="text-red-500">*</span>
              </label>
              <div className="flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value.replace(/\/+$/, ""))
                  }
                  placeholder="Nombre o Documento (mín. 3 caracteres)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                  disabled={!!selectedPerson}
                />
                {isLoading && (
                  <Loader2 className="animate-spin absolute right-3 top-1/2 w-5 h-5 text-indigo-500" />
                )}
              </div>

              {/* Resultados Dropdown */}
              {searchTerm.length >= 3 &&
                !selectedPerson &&
                searchResults.length > 0 && (
                  <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl">
                    {searchResults.map((person) => (
                      <li
                        key={person.id_persona}
                        onClick={() => handleSelectPerson(person)}
                        className="px-4 py-3 cursor-pointer hover:bg-indigo-50 border-b border-gray-100 transition-colors"
                      >
                        <div className="font-bold text-gray-800">
                          {person.nombre_original || person.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {person.tipo_documento}: {person.numero_documento}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
            </div>

            {/* Persona Seleccionada Card */}
            {selectedPerson && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center justify-between animate-fade-in">
                  <div>
                    <span className="block text-xs text-green-600 font-bold uppercase">
                      Persona Seleccionada
                    </span>
                    <span className="font-medium flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5" />{" "}
                      {selectedPerson.nombre_original || selectedPerson.nombre}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPerson(null)}
                    className="text-green-700 font-medium underline"
                  >
                    Cambiar
                  </button>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Vinculaciones Disponibles
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddVinculacion(!showAddVinculacion)}
                    className="text-xs flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md hover:bg-indigo-200"
                  >
                    <PlusCircle className="w-3 h-3" />
                    {showAddVinculacion ? "Cancelar" : "Nueva Vinculación"}
                  </button>
                </div>

                {/* FORMULARIO PARA NUEVA VINCULACIÓN */}
                {showAddVinculacion && (
                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-indigo-200 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* BUSCADOR INTELIGENTE DE UNIDADES */}
                      <div className="relative">
                        <label className="block text-xs font-bold text-gray-600 mb-1">
                          Unidad Organizativa{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Buscar Facultad o Escuela..."
                          className="w-full text-sm border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={unidadSearch}
                          onChange={(e) => {
                            setUnidadSearch(e.target.value);
                            setShowUnidadResults(true);
                          }}
                          onFocus={() => setShowUnidadResults(true)}
                        />

                        {showUnidadResults && unidadSearch.length > 0 && (
                          <ul className="absolute z-30 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg text-sm">
                            {filteredUnidades.length > 0 ? (
                              filteredUnidades.map((u) => (
                                <li
                                  key={u.id} // CORRECCIÓN: El serializer usa 'id'
                                  onClick={() => {
                                    setNewVincData({
                                      ...newVincData,
                                      id_unidad_organizativa: u.id,
                                    });
                                    setUnidadSearch(u.nombre);
                                    setShowUnidadResults(false);
                                  }}
                                  className="px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b last:border-0"
                                >
                                  <div className="font-medium text-gray-800">
                                    {u.nombre}
                                  </div>
                                  <div className="text-[10px] text-gray-500 uppercase">
                                    {u.tipo}
                                  </div>
                                </li>
                              ))
                            ) : (
                              <li className="px-3 py-2 text-gray-500 italic">
                                No se encontraron resultados
                              </li>
                            )}
                          </ul>
                        )}
                        {/* Indicador de selección */}
                        {newVincData.id_unidad_organizativa &&
                          !showUnidadResults && (
                            <div className="text-[10px] text-indigo-600 font-bold mt-1 flex items-center gap-1">
                              ✓ Seleccionado:{" "}
                              {
                                unidadesOrganizativas.find(
                                  (u) =>
                                    u.id === newVincData.id_unidad_organizativa,
                                )?.nombre
                              }
                            </div>
                          )}
                      </div>

                      {/* Tipo Estamento */}
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">
                          Estamento
                        </label>
                        <select
                          className="w-full text-sm border p-2 rounded"
                          value={newVincData.tipo_estamento}
                          onChange={(e) =>
                            setNewVincData({
                              ...newVincData,
                              tipo_estamento: e.target.value,
                            })
                          }
                        >
                          <option value="Estudiante">Estudiante</option>
                          <option value="Docente">Docente</option>
                          <option value="Funcionario">Funcionario</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>

                      {/* Semestre */}
                      <div
                        className={
                          newVincData.tipo_estamento !== "Estudiante"
                            ? "opacity-50"
                            : ""
                        }
                      >
                        <label className="block text-xs font-bold text-gray-600 mb-1">
                          Semestre{" "}
                          {newVincData.tipo_estamento === "Estudiante" && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        <input
                          type="number"
                          placeholder="Ej: 5"
                          disabled={newVincData.tipo_estamento !== "Estudiante"}
                          className="w-full text-sm border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-200 disabled:cursor-not-allowed"
                          value={newVincData.semestre}
                          onChange={(e) =>
                            setNewVincData({
                              ...newVincData,
                              semestre: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVinculacion}
                      className="w-full bg-indigo-500 text-white text-xs py-2 rounded font-bold hover:bg-indigo-600"
                    >
                      Guardar Vinculación
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* === SELECCIÓN DE VINCULACIÓN === */}
            {selectedPerson && personVinculaciones.length > 0 && (
              <div className="mt-4 p-4 border rounded-lg bg-indigo-50 border-indigo-200 animate-fade-in">
                <label className="block text-indigo-900 font-bold mb-3 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Seleccione la Vinculación para esta participación:
                </label>
                <div className="grid gap-3">
                  {personVinculaciones.map((vinc) => {
                    const isSelected =
                      selectedVinculacion?.id_vinculacion ===
                      vinc.id_vinculacion;
                    const isEstudiante = vinc.tipo_estamento === "Estudiante";

                    return (
                      <label
                        key={vinc.id_vinculacion}
                        className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300"
                            : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:shadow-sm"
                        }`}
                      >
                        <input
                          type="radio"
                          name="vinculacion"
                          className="hidden"
                          checked={isSelected}
                          onChange={() => setSelectedVinculacion(vinc)}
                        />

                        <div className="flex flex-col gap-1 w-full">
                          {/* Estamento y Unidad */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-bold text-base ${isSelected ? "text-white" : "text-indigo-700"}`}
                            >
                              {vinc.tipo_estamento}
                            </span>
                            {/* Badge de Semestre solo si es Estudiante */}
                            {isEstudiante && vinc.semestre && (
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                    isSelected
                                      ? "bg-white text-indigo-600"
                                      : "bg-indigo-100 text-indigo-700"
                                  }`}
                                >
                                  Semestre {vinc.semestre}
                                </span>

                                {/* Botón para incrementar/actualizar el semestre */}
                                <button
                                  type="button"
                                  title="Incrementar semestre"
                                  onClick={(e) => {
                                    e.preventDefault(); // Evita que se seleccione la radio al hacer click
                                    e.stopPropagation(); // Evita que el click llegue al label
                                    const nextSemestre =
                                      parseInt(vinc.semestre) + 1;
                                    if (
                                      confirm(
                                        `¿Actualizar a Semestre ${nextSemestre}?`,
                                      )
                                    ) {
                                      handleUpdateSemestre(
                                        vinc.id_vinculacion,
                                        nextSemestre,
                                      );
                                    }
                                  }}
                                  className={`p-1 rounded-full hover:scale-110 transition-transform ${
                                    isSelected
                                      ? "text-white hover:bg-white/20"
                                      : "text-indigo-400 hover:bg-indigo-100"
                                  }/`}
                                >
                                  <PlusCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Información de la Unidad Organizativa */}
                          <div
                            className={`flex items-center gap-1.5 text-sm ${isSelected ? "text-indigo-100" : "text-gray-500"}`}
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="font-medium">
                              {vinc.nombre_unidad || vinc.unidad_nombre}
                            </span>
                          </div>
                        </div>

                        {/* Icono de Check si está seleccionado */}
                        {isSelected && (
                          <div className="ml-3 bg-white/20 rounded-full p-1">
                            <Save className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mensaje si no tiene vinculaciones */}
            {selectedPerson && personVinculaciones.length === 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                Esta persona no tiene vinculaciones activas registradas.
              </div>
            )}

            {/* No resultados */}
            {searchTerm.length >= 3 &&
              searchResults.length === 0 &&
              !isLoading &&
              !selectedPerson && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex justify-between items-center">
                  <span className="text-amber-800">
                    No hay resultados para "<strong>{searchTerm}</strong>"
                  </span>
                  <button
                    type="button"
                    onClick={handleSwitchToNewPerson}
                    className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1"
                  >
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
              <h3 className="text-lg font-semibold text-gray-700">
                Datos Personales
              </h3>
              <button
                type="button"
                onClick={resetAll}
                className="text-indigo-600 text-sm flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Volver a Búsqueda
              </button>
            </div>
            <PersonFormFields
              formData={formData}
              handleChange={handleFormChange}
              unidadesOrganizativas={unidadesOrganizativas}
            />
          </div>
        )}

        {/* === BOTONES === */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md font-medium flex justify-center gap-2 transition-all"
          >
            <Save className="w-5 h-5" />{" "}
            {selectedPerson ? "Confirmar Participación" : "Guardar y Confirmar"}
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
