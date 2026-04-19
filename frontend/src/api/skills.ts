import api from "./axios";
import type { CreateSkillPayload, UpdateSkillPayload } from "../types/skill";

export const getSkills = async () => {
  const { data } = await api.get("/habilidades");
  return data;
};

export const createSkill = async (payload: CreateSkillPayload) => {
  const { data } = await api.post("/habilidades", payload);
  return data;
};

export const updateSkill = async (id: number, payload: UpdateSkillPayload) => {
  const { data } = await api.put(`/habilidades/${id}`, payload);
  return data;
};

export const deleteSkill = async (id: number) => {
  const { data } = await api.delete(`/habilidades/${id}`);
  return data;
};

export const toggleSkillVisibility = async (id: number) => {
  const { data } = await api.patch(`/habilidades/${id}/visibilidad`);
  return data;
};