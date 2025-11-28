// src/api.js
import axios from "axios";

export const API_BASE = "http://127.0.0.1:8000/api/";

export const API_ENDPOINTS = {
  sede: "sedes",
  lineaProyecto: "lineas-proyecto",
  facultad: "facultades",
  escuela: "escuelas",
  indicador: "indicadores",
  actividadConsolidada: "actividades-consolidadas",
  tema: "temas",
  prioridad: "prioridades",
  lineaEstrategia: "lineas-estrategia",
  actividad: "actividades",
};

export async function apiRequest(entityType, method = "GET", body = null, id = null) {
  const url = `${API_BASE}${API_ENDPOINTS[entityType]}/${id ? id + "/" : ""}`;

  try {
    const response = await axios({
      url,
      method,
      data: body,
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
}
