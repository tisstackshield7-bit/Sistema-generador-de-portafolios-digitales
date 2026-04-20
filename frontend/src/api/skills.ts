import api from "./axios";
import type { SkillPayload } from "../types/skill";

export const getMySkills = async () => {
  const { data } = await api.get("/habilidades");
  return data;
};

export const createSkill = async (payload: SkillPayload) => {
  const { data } = await api.post("/habilidades", payload);
  return data;
};

export const updateSkill = async (id: number, payload: SkillPayload) => {
  const { data } = await api.put(`/habilidades/${id}`, payload);
  return data;
};

export const updateSkillVisibility = async (id: number, visible_publico: boolean) => {
  const { data } = await api.patch(`/habilidades/${id}/visibilidad`, { visible_publico });
  return data;
};

export const deleteSkill = async (id: number) => {
  const { data } = await api.delete(`/habilidades/${id}`);
  return data;
};
