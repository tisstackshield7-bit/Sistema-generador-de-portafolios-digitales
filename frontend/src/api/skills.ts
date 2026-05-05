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
  formData.append("categoria_personalizada", payload.categoria_personalizada || "");
  formData.append("nivel_dominio", payload.nivel_dominio);
  formData.append("visible_publico", payload.visible_publico ? "1" : "0");

  if (payload.certificado_pdf) {
    formData.append("certificado_pdf", payload.certificado_pdf);
  }

  const evidencias = payload.evidencias || [];
  formData.append(
    "evidencias_json",
    JSON.stringify(
      evidencias.map((evidencia) => ({
        id: evidencia.id,
        tipo: evidencia.tipo,
        titulo: evidencia.titulo,
        descripcion: evidencia.descripcion || "",
        url: evidencia.url || "",
        emisor: evidencia.emisor || "",
        fecha: evidencia.fecha || "",
        archivo_actual: evidencia.archivo_actual || "",
      })),
    ),
  );

  evidencias.forEach((evidencia, index) => {
    if (evidencia.archivo) {
      formData.append(`evidencia_archivos[${index}]`, evidencia.archivo);
    }
  });

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
