import { useState } from "react";
import { Search, BookOpen } from "lucide-react";

export function PersonFormFields({
  formData,
  handleChange,
  unidadesOrganizativas,
}) {
  const [unidadSearch, setUnidadSearch] = useState("");
  const [showResults, setShowResults] = useState(false);

  const filteredUnidades = unidadesOrganizativas.filter((u) =>
    u.nombre.toLowerCase().includes(unidadSearch.toLowerCase()),
  );

  const handleSelectUnidad = (unidad) => {
    setUnidadSearch(unidad.nombre);
    setShowResults(false);

    // Actualizamos el escuelaId en el formData del padre
    handleChange({
      target: {
        name: "escuelaId",
        value: unidad.id,
      },
    });
  };

  const labelStyle = "block text-gray-700 mb-2 font-medium";

  return (
    <div className="space-y-6">
      {/* SECCIÓN 1: DATOS PERSONALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre Completo */}
        <div className="md:col-span-2">
          <label htmlFor="nombre" className={labelStyle}>
            Nombre Completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ingresa el nombre completo"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Tipo de Documento */}
        <div>
          <label htmlFor="tipoDocumento" className={labelStyle}>
            Tipo de Documento <span className="text-red-500">*</span>
          </label>
          <select
            id="tipoDocumento"
            name="tipoDocumento"
            value={formData.tipoDocumento}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="">Selecciona</option>
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="TI">Tarjeta de Identidad</option>
            <option value="CE">Cédula de Extranjería</option>
            <option value="PAS">Pasaporte</option>
            <option value="PEPT">Permiso Especial (PEPT)</option>
          </select>
        </div>

        {/* Número de Documento */}
        <div>
          <label htmlFor="numeroDocumento" className={labelStyle}>
            Número de Documento <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="numeroDocumento"
            name="numeroDocumento"
            value={formData.numeroDocumento}
            onChange={handleChange}
            placeholder="Ingresa el número"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Edad */}
        <div>
          <label htmlFor="edad" className={labelStyle}>
            Edad
          </label>
          <input
            type="number"
            id="edad"
            name="edad"
            value={formData.edad}
            onChange={handleChange}
            placeholder="Ej: 25"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Sexo */}
        <div>
          <label htmlFor="sexo" className={labelStyle}>
            Sexo
          </label>
          <select
            id="sexo"
            name="sexo"
            value={formData.sexo}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="">Selecciona</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="I">Intersexual</option>
            <option value="O">Otro</option>
          </select>
        </div>

        {/* Correo */}
        <div>
          <label htmlFor="correo" className={labelStyle}>
            Correo Electrónico <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="correo"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="telefono" className={labelStyle}>
            Teléfono
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Ingresa el teléfono"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
      </div>

      {/* SECCIÓN 2: VINCULACIÓN INICIAL (Diferenciada) */}
      <div className="mt-8 p-5 bg-green-50/50 border-2 border-dashed border-green-200 rounded-xl space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-bold text-green-800 uppercase tracking-wider">
            Vinculación Institucional Inicial
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Buscador de Unidad */}
          <div className="relative md:col-span-2">
            <label className={labelStyle}>
              Unidad Organizativa <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar Facultad o Escuela..."
                value={unidadSearch}
                onChange={(e) => {
                  setUnidadSearch(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 bg-white outline-none transition-all"
              />
            </div>

            {showResults && unidadSearch.length > 0 && (
              <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-2xl border-t-4 border-green-600">
                {filteredUnidades.length > 0 ? (
                  filteredUnidades.map((u) => (
                    <li
                      key={u.id}
                      onClick={() => handleSelectUnidad(u)}
                      className="px-4 py-2 hover:bg-green-50 cursor-pointer border-b last:border-0 transition-colors"
                    >
                      <div className="font-bold text-gray-800 text-sm">
                        {u.nombre}
                      </div>
                      <div className="text-[10px] text-green-600 uppercase font-semibold">
                        {u.tipo}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-gray-500 text-sm italic">
                    No hay resultados
                  </li>
                )}
              </ul>
            )}
            {formData.escuelaId && !showResults && (
              <p className="text-[11px] text-green-700 font-bold mt-1 flex items-center gap-1 uppercase">
                ✓ Seleccionado:{" "}
                {
                  unidadesOrganizativas.find((u) => u.id === formData.escuelaId)
                    ?.nombre
                }
              </p>
            )}
          </div>

          {/* Estamento */}
          <div>
            <label htmlFor="estamento" className={labelStyle}>
              Estamento
            </label>
            <select
              id="estamento"
              name="estamento"
              // Si formData.estamento es falsy (vago o ""), usamos "Estudiante" por defecto
              value={formData.estamento || "Estudiante"}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 bg-white outline-none"
            >
              {/* Es buena práctica tener una opción neutra o asegurar el valor inicial */}
              <option value="Estudiante">Estudiante</option>
              <option value="Docente">Docente</option>
              <option value="Funcionario">Funcionario</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Semestre */}
          <div
            className={
              formData.estamento !== "Estudiante" && formData.estamento !== ""
                ? "opacity-50"
                : ""
            }
          >
            <label htmlFor="semestre" className={labelStyle}>
              Semestre{" "}
              {(formData.estamento === "Estudiante" || !formData.estamento) && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              type="number"
              id="semestre"
              name="semestre"
              // Desbloqueado si es Estudiante O si aún no se ha seleccionado nada (asumiendo defecto)
              disabled={
                formData.estamento !== "Estudiante" && formData.estamento !== ""
              }
              value={formData.semestre}
              onChange={handleChange}
              placeholder="Ej: 1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
