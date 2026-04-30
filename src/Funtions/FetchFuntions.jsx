// FetchFunctions.js
import { apiRequest } from "../api/api";

export const fetchActionDetail = async (id) => {
  return await apiRequest(
    "dashboardDetalleAccion",
    "GET",
    null,
    `?id=${id}`
  );
};