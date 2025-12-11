import { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';

export function PersonForm({ onSubmit, escuelas, facultades }) {
  const [formData, setFormData] = useState({
    nombre: '',
    tipoDocumento: '',
    numeroDocumento: '',
    edad: '',
    correo: '',
    sexo: '',
    telefono: '',
    estamento: '',
    escuelaId: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      tipoDocumento: '',
      numeroDocumento: '',
      edad: '',
      correo: '',
      sexo: '',
      telefono: '',
      estamento: '',
      escuelaId: '',
    });
  };

  const isFormValid = () => {
    return (
      formData.nombre.trim() &&
      formData.tipoDocumento &&
      formData.numeroDocumento.trim() &&
      formData.edad &&
      formData.correo.trim() &&
      formData.sexo &&
      formData.telefono.trim() &&
      formData.estamento &&
      formData.escuelaId
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-gray-800 mb-6">Registrar Persona</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombre" className="block text-gray-700 mb-2">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ingresa el nombre completo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="tipoDocumento" className="block text-gray-700 mb-2">
              Tipo de Documento <span className="text-red-500">*</span>
            </label>
            <select
              id="tipoDocumento"
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            >
              <option value="">Selecciona</option>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="PAS">Pasaporte</option>
            </select>
          </div>

          <div>
            <label htmlFor="numeroDocumento" className="block text-gray-700 mb-2">
              Número de Documento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="numeroDocumento"
              name="numeroDocumento"
              value={formData.numeroDocumento}
              onChange={handleChange}
              placeholder="Ingresa el número"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="edad" className="block text-gray-700 mb-2">
              Edad <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="edad"
              name="edad"
              value={formData.edad}
              onChange={handleChange}
              placeholder="Ingresa la edad"
              min="1"
              max="120"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="correo" className="block text-gray-700 mb-2">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="sexo" className="block text-gray-700 mb-2">
              Sexo <span className="text-red-500">*</span>
            </label>
            <select
              id="sexo"
              name="sexo"
              value={formData.sexo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            >
              <option value="">Selecciona</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="telefono" className="block text-gray-700 mb-2">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Ingresa el teléfono"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="estamento" className="block text-gray-700 mb-2">
              Estamento <span className="text-red-500">*</span>
            </label>
            <select
              id="estamento"
              name="estamento"
              value={formData.estamento}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            >
              <option value="">Selecciona</option>
              <option value="Estudiante">Estudiante</option>
              <option value="Docente">Docente</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Egresado">Egresado</option>
              <option value="Externo">Externo</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="escuelaId" className="block text-gray-700 mb-2">
              Escuela <span className="text-red-500">*</span>
            </label>
            {escuelas.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800">
                No hay escuelas disponibles. Por favor, crea una escuela primero en el Panel de Creación.
              </div>
            ) : (
              <select
                id="escuelaId"
                name="escuelaId"
                value={formData.escuelaId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                required
              >
                <option value="">Selecciona una escuela</option>
                {escuelas.map((escuela) => {
                  const facultad = facultades.find((f) => f.id === escuela.facultadId);
                  return (
                    <option key={escuela.id} value={escuela.id}>
                      {escuela.nombre} {facultad ? `(${facultad.nombre})` : ''}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={!isFormValid()}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            Registrar Persona
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Limpiar Formulario
          </button>
        </div>
      </form>
    </div>
  );
}
