// FetchFunctions.js
import { apiRequest } from "../api/api";

export const fetchActivityDetail = async (id) => {
  return await apiRequest(
    "dashboardDetalleActividad",
    "GET",
    null,
    `?id=${id}`
  );
};