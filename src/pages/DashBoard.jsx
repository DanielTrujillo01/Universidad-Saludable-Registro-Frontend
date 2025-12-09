import { useEffect, useState } from "react";
import { apiRequest } from "../api/api"; // Importas tu función mejorada

export function DashBoard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Llamas al endpoint 'dashboard' que definimos arriba
        const data = await apiRequest("dashboard", "GET");
        setStats(data);
      } catch (error) {
        console.error("Error cargando dashboard", error);
        // Si falla (ej. token vencido), podrías redirigir al login manualmente si quieres
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  if (loading) return <div>Cargando estadísticas...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Panel de Control</h1>
      
      {/* Ejemplo de uso de los datos */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500">Total Personas</h3>
          <p className="text-3xl font-bold">{stats?.resumen_general?.total_personas}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500">Actividades</h3>
          <p className="text-3xl font-bold">{stats?.resumen_general?.total_actividades}</p>
        </div>
      </div>
    </div>
  );
}