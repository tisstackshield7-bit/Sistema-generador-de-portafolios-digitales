import api from "./axios";
import type { ProjectPayload } from "../types/project";

export const getMyProjects = async () => {
  const { data } = await api.get("/proyectos");
  return data;
};

export const createProject = async (payload: ProjectPayload) => {
  const { data } = await api.post("/proyectos", payload);
  return data;
};

export const updateProject = async (id: number, payload: ProjectPayload) => {
  const { data } = await api.put(`/proyectos/${id}`, payload);
  return data;
};

export const updateProjectVisibility = async (id: number, visible_publico: boolean) => {
  const { data } = await api.patch(`/proyectos/${id}/visibilidad`, { visible_publico });
  return data;
};

export const deleteProject = async (id: number) => {
  const { data } = await api.delete(`/proyectos/${id}`);
  return data;
};
