// src/api.js
import axios from "axios";

export const API_BASE = "http://127.0.0.1:8000/api/";

export const API_ENDPOINTS = {
  sede: "sedes",
  lineaProyecto: "lineas-proyecto",
  facultad: "facultades",
  escuela: "escuelas",
  persona: "personas",
  indicadores: "indicadores",
  actividadConsolidada: "actividades-consolidadas",
  tema: "temas",
  prioridad: "prioridades",
  lineaEstrategia: "lineas-estrategia",
  actividad: "actividades",
  participacion: "participaciones",
  login: "token",

  // URL base del viewset (generalmente no se llama directamente sin acción)
  dashboard: "dashboard-stats", 
  
  dashboardResumen: "dashboard-stats/resumen", 
  
  dashboardIndicador: "dashboard-stats/por_indicador",

  dashboardPrioridad: "dashboard-stats/por_prioridad",

  dashboardEstrategia: "dashboard-stats/por_estrategia",

  dashboardSede: "dashboard-stats/por_sede",

  dashboardEscuela: "dashboard-stats/por_escuela",

  dashboardFacultad: "dashboard-stats/por_facultad",
};

// 1. Crear una instancia de Axios
// Esto nos permite configurar comportamientos globales
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Configurar el Interceptor de Respuesta
// Este "vigilante" revisa todas las respuestas que llegan del backend
apiClient.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa (200-299), la dejamos pasar
    return response;
  },
  (error) => {
    // Si hay un error, revisamos si es un 401 (No autorizado)
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada detectada por Interceptor. Redirigiendo...");
      
      // A. Limpiamos el token (asegúrate que el nombre coincida con el que usas al hacer login)
      // Nota: En tu código anterior usabas 'token', aquí veo 'access_token'.
      // He puesto ambos para asegurar que se limpie todo.
      localStorage.removeItem('access_token'); 
      localStorage.removeItem('token'); 

      // B. Redirigimos forzosamente al Login
      // Usamos window.location.href en lugar de navigate() porque este archivo no es un componente React
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Modificar la función para aceptar 'query' o 'id'. Usaremos 'query'
export async function apiRequest(entityType, method = "GET", body = null, queryOrId = null) {
  
    const endpoint = API_ENDPOINTS[entityType];
    // Nota: Como ahora usamos apiClient con baseURL, solo necesitamos la parte relativa de la URL
    // Pero para mantener tu lógica de construcción de URL intacta, lo manejaremos así:
    
    let url = endpoint; // Ya no necesitamos API_BASE aquí porque está en la instancia

    // Paso 1: Determinar si es un Query String o un ID de ruta
    if (queryOrId) {
        if (typeof queryOrId === 'string' && queryOrId.startsWith('?')) {
            // Caso de BÚSQUEDA/FILTRO
            url = `${url}${queryOrId}`;
        } else {
            // Caso de ID
            url = `${url}/${queryOrId}/`;
        }
    } else {
        // Caso de LISTA
        if (!url.endsWith('/')) {
            url = `${url}/`;
        }
    }
    
    // ---------------------------------------------------------
    // 2. LÓGICA DE TOKEN
    // ---------------------------------------------------------
    // Nota importante: Revisa si tu backend guardó el token como 'token' o 'access_token'
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    
    const headers = {}; // Content-Type ya está en la instancia base

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        // USAMOS apiClient en lugar de axios directo
        const response = await apiClient({
            url, 
            method,
            data: body,
            headers: headers, 
        });
        return response.data;
    } catch (error) {
        // El interceptor ya manejó el 401 arriba, aquí solo logueamos otros errores
        console.error(`Error en API (${entityType}):`, error);
        throw error;
    }
}