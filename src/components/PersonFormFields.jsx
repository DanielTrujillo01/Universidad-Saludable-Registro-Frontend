// src/components/PersonFormFields.jsx (Contiene la estructura visual del formulario)
export function PersonFormFields({ formData, handleChange, escuelas, facultades }) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Nombre Completo */}
                <div>
                    <label htmlFor="nombre" className="block text-gray-700 mb-2">Nombre Completo <span className="text-red-500">*</span></label>
                    <input
                        type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange}
                        placeholder="Ingresa el nombre completo" required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* 2. Tipo de Documento */}
                <div>
                    <label htmlFor="tipoDocumento" className="block text-gray-700 mb-2">Tipo de Documento <span className="text-red-500">*</span></label>
                    <select
                        id="tipoDocumento" name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    >
                        <option value="">Selecciona</option>
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="PAS">Pasaporte</option>
                    </select>
                </div>

                {/* 3. Número de Documento */}
                <div>
                    <label htmlFor="numeroDocumento" className="block text-gray-700 mb-2">Número de Documento <span className="text-red-500">*</span></label>
                    <input
                        type="text" id="numeroDocumento" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleChange}
                        placeholder="Ingresa el número" required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* 4. Edad */}
                <div>
                    <label htmlFor="edad" className="block text-gray-700 mb-2">Edad <span className="text-red-500">*</span></label>
                    <input
                        type="number" id="edad" name="edad" value={formData.edad} onChange={handleChange}
                        placeholder="Ingresa la edad" min="1" max="120" required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* 5. Correo Electrónico */}
                <div>
                    <label htmlFor="correo" className="block text-gray-700 mb-2">Correo Electrónico <span className="text-red-500">*</span></label>
                    <input
                        type="email" id="correo" name="correo" value={formData.correo} onChange={handleChange}
                        placeholder="correo@ejemplo.com" required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* 6. Sexo */}
                <div>
                    <label htmlFor="sexo" className="block text-gray-700 mb-2">Sexo <span className="text-red-500">*</span></label>
                    <select
                        id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    >
                        <option value="">Selecciona</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="O">Otro</option>
                    </select>
                </div>

                {/* 7. Teléfono */}
                <div>
                    <label htmlFor="telefono" className="block text-gray-700 mb-2">Teléfono <span className="text-red-500">*</span></label>
                    <input
                        type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange}
                        placeholder="Ingresa el teléfono" required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* 8. Estamento */}
                <div>
                    <label htmlFor="estamento" className="block text-gray-700 mb-2">Estamento <span className="text-red-500">*</span></label>
                    <select
                        id="estamento" name="estamento" value={formData.estamento} onChange={handleChange} required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    >
                        <option value="">Selecciona</option>
                        <option value="Estudiante">Estudiante</option>
                        <option value="Docente">Docente</option>
                        <option value="Administrativo">Administrativo</option>
                        <option value="Egresado">Egresado</option>
                        <option value="Externo">Externo</option>
                    </select>
                </div>

                {/* 9. Escuela (ocupa 2 columnas) */}
                <div className="md:col-span-2">
                    <label htmlFor="escuelaId" className="block text-gray-700 mb-2">Escuela <span className="text-red-500">*</span></label>
                    {escuelas.length === 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800">
                            No hay escuelas disponibles.
                        </div>
                    ) : (
                        <select
                            id="escuelaId" name="escuelaId" value={formData.escuelaId} onChange={handleChange} required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="">Selecciona una escuela</option>
                            {escuelas.map((escuela) => {
                                // Se asume que facultad tiene un campo 'id' y 'nombre'
                                const facultad = facultades.find((f) => f.id === escuela.facultad); 
                                return (
                                    <option key={escuela.id_escuela} value={escuela.id_escuela}>
                                        {escuela.nombre} {facultad ? `(${facultad.nombre})` : ''}
                                    </option>
                                );
                            })}
                        </select>
                    )}
                </div>
            </div>
        </div>
    );
}