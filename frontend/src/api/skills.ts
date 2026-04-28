import api from "./axios";
import type { SkillPayload } from "../types/skill";

function buildSkillFormData(payload: SkillPayload, method?: "PUT") {
  const formData = new FormData();

  if (method) {
    formData.append("_method", method);
  }

  formData.append("tipo", payload.tipo);
  formData.append("nombre", payload.nombre);
  formData.append("categoria", payload.categoria);
  formData.append("nivel_dominio", payload.nivel_dominio);
  formData.append("visible_publico", payload.visible_publico ? "1" : "0");

  if (payload.certificado_pdf) {
    formData.append("certificado_pdf", payload.certificado_pdf);
  }

  return formData;
}

export const getMySkills = async () => {
  const { data } = await api.get("/habilidades");
  return data;
};

export const createSkill = async (payload: SkillPayload) => {
  const { data } = await api.post("/habilidades", buildSkillFormData(payload), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const updateSkill = async (id: number, payload: SkillPayload) => {
  const { data } = await api.post(`/habilidades/${id}`, buildSkillFormData(payload, "PUT"), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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
