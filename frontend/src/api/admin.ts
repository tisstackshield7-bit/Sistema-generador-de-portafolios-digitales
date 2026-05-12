import api from "./axios";
import type { AdminDashboardResponse, AdminReportsResponse, AdminUsersResponse } from "../types/admin";

type ReportFilters = {
  buscar?: string;
  tipo?: string;
  page?: number;
};

function buildQuery(filters?: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const getAdminDashboard = async () => {
  const { data } = await api.get<AdminDashboardResponse>("/admin/dashboard");
  return data;
};

export const getAdminUsers = async (usuarioId?: number) => {
  const query = buildQuery({ usuario_id: usuarioId });
  const { data } = await api.get<AdminUsersResponse>(`/admin/usuarios${query}`);
  return data;
};

export const updateAdminUserStatus = async (usuarioId: number, estado: "activo" | "bloqueado") => {
  const { data } = await api.patch(`/admin/usuarios/${usuarioId}/estado`, { estado });
  return data as {
    message: string;
    usuario: AdminUsersResponse["usuario_destacado"];
    actividad_reciente: AdminUsersResponse["actividad_reciente"];
  };
};

export const getAdminReports = async (filters?: ReportFilters) => {
  const query = buildQuery(filters);
  const { data } = await api.get<AdminReportsResponse>(`/admin/reportes${query}`);
  return data;
};

export const exportAdminReports = async (filters?: ReportFilters) => {
  const query = buildQuery(filters);
  const response = await api.get(`/admin/reportes/exportar${query}`, {
    responseType: "blob",
  });

  return response.data as Blob;
};
