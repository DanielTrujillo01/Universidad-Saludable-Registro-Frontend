// src/api.js
import axios from "axios";

// --- CAMBIO AQUÍ ---
// Buscamos la variable de entorno.
// Si usas VITE (lo más común hoy en día), es import.meta.env.VITE_API_URL
// Si usas Create React App o Next.js, sería process.env.REACT_APP_API_URL
const ENV_URL = import.meta.env.VITE_API_URL; 

// Si existe la variable (Producción), úsala. Si no, usa localhost.
export const API_BASE = ENV_URL || "http://127.0.0.1:8000/api/";
// -------------------

export const API_ENDPOINTS = {
  // ... tus endpoints de siempre ...
  sede: "sedes",
  lineaProyecto: "lineas-proyecto",
  facultad: "facultades",
  escuela: "escuelas",
  persona: "personas",
  indicador: "indicadores",
  actividadConsolidada: "actividades-consolidadas",
  tema: "temas",
  prioridad: "prioridades",
  lineaEstrategia: "lineas-estrategia",
  actividad: "actividades",
  participacion: "participaciones",
  
  login: "token/",          // Login (devuelve access + refresh)
  refresh: "token/refresh", // Endpoint para refrescar
  
  // Dashboard
  dashboard: "dashboard-stats", 
  dashboardResumen: "dashboard-stats/resumen", 
  dashboardIndicador: "dashboard-stats/por_indicador",
  dashboardPrioridad: "dashboard-stats/por_prioridad",
  dashboardEstrategia: "dashboard-stats/por_estrategia",
  dashboardSede: "dashboard-stats/por_sede",
  dashboardEscuela: "dashboard-stats/por_escuela",
  dashboardFacultad: "dashboard-stats/por_facultad",
  dashboardDetalleActividad: "dashboard-stats/detalle_actividad",
  dashboardTiempoStats: "dashboard-stats/por_tiempo_stats",
  dashboardTiempoDetalle: "dashboard-stats/detalle_rango_tiempo",
};

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- INTERCEPTOR INTELIGENTE (REFRESH TOKEN) ---
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y NO es un reintento (para evitar bucles infinitos)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      // Marcamos que ya intentamos refrescar esta petición
      originalRequest._retry = true;

      try {
        console.log("🔄 Access Token vencido. Intentando refrescar...");
        
        // 1. Obtenemos el refresh token guardado
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
            throw new Error("No hay refresh token disponible.");
        }

        // 2. Llamamos al endpoint de refresh (usamos axios puro para evitar interceptores aquí)
        const response = await axios.post(`${API_BASE}${API_ENDPOINTS.refresh}/`, {
            refresh: refreshToken
        });

        // 3. Si éxito: Guardamos el nuevo access token
        const newAccessToken = response.data.access;
        const newRefreshToken = response.data.refresh;

        localStorage.setItem('access_token', newAccessToken);

        // IMPORTANTE: Si el servidor envió un nuevo refresh token (rotación), guárdalo.
        if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
        }
        
        // 4. Actualizamos el header de la petición original fallida
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        // 5. Reintentamos la petición original con el nuevo token
        return apiClient(originalRequest);

      } catch (refreshError) {
        // SI FALLA EL REFRESH (ej: expiró el refresh token o fue revocado)
        console.warn("❌ Sesión caducada irremediablemente. Cerrando sesión...");
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token'); // Limpiamos todo
        localStorage.removeItem('token');

        // Solo redirigimos si estamos en una ruta privada
        const currentPath = window.location.pathname;
        const isPrivateRoute = currentPath.startsWith('/dashboard') || 
                               currentPath.startsWith('/creacion-entidades');

        if (isPrivateRoute) {
           window.location.href = "/login";
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export async function apiRequest(entityType, method = "GET", body = null, queryOrId = null) {
    const endpoint = API_ENDPOINTS[entityType];
    
    if (!endpoint) {
        console.error(`🚨 Error: Endpoint no definido para: ${entityType}`);
        throw new Error(`Endpoint no definido para: ${entityType}`);
    }

    let url = endpoint; 

    if (queryOrId) {
        if (typeof queryOrId === 'string' && queryOrId.startsWith('?')) {
            url = `${url}${queryOrId}`;
        } else {
            url = `${url}/${queryOrId}/`;
        }
    } else {
        if (!url.endsWith('/')) {
            url = `${url}/`;
        }
    }
    
    // Siempre intentamos leer el token más reciente del storage
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    const headers = {}; 

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await apiClient({
            url, 
            method,
            data: body,
            headers: headers, 
        });
        return response.data;
    } catch (error) {
        // El error ya pasó por el interceptor. 
        // Si fue 401 y se refrescó, no llegamos aquí.
        // Si llegamos aquí, es un error real (500, 404, o 401 fatal).
        console.error(`Error en API (${entityType}):`, error);
        throw error;
    }
}