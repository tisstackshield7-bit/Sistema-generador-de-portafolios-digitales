import api from "./axios";
import type { ExperiencePayload } from "../types/experience";

export const getMyExperiences = async () => {
  const { data } = await api.get("/experiencias");
  return data;
};

export const createExperience = async (payload: ExperiencePayload) => {
  const { data } = await api.post("/experiencias", payload);
  return data;
};

export const updateExperience = async (id: number, payload: ExperiencePayload) => {
  const { data } = await api.put(`/experiencias/${id}`, payload);
  return data;
};

export const updateExperienceVisibility = async (id: number, visible_publico: boolean) => {
  const { data } = await api.patch(`/experiencias/${id}/visibilidad`, { visible_publico });
  return data;
};

export const deleteExperience = async (id: number) => {
  const { data } = await api.delete(`/experiencias/${id}`);
  return data;
};
