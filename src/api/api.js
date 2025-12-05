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
  dashboard: "dashboard-stats",
  login: "token", 
};

// Modificar la función para aceptar 'query' o 'id'. Usaremos 'query'
export async function apiRequest(entityType, method = "GET", body = null, queryOrId = null) {
  
    const endpoint = API_ENDPOINTS[entityType];
    let url = `${API_BASE}${endpoint}`;

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
    // 2. LÓGICA DE TOKEN (INTEGRACIÓN NUEVA)
    // ---------------------------------------------------------
    const token = localStorage.getItem('access_token');
    
    // Preparamos los headers base
    const headers = { 
        "Content-Type": "application/json" 
    };

    // Si existe el token, lo agregamos al header Authorization
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await axios({
            url, 
            method,
            data: body,
            headers: headers, // Usamos los headers dinámicos
        });
        return response.data;
    } catch (error) {
        // Opcional: Si el token venció (Error 401), podrías limpiar el localStorage aquí
        if (error.response && error.response.status === 401) {
            console.warn("Sesión expirada o no autorizada");
            // localStorage.removeItem('access_token'); // Opcional: cerrar sesión automática
        }
        console.error("Error en API:", error);
        throw error;
    }
}