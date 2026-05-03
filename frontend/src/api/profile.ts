import api from "./axios";
import type { BasicProfilePayload } from "../types/profile";
import type { SkillLevel } from "../types/skill";

export interface PublicProfileFilters {
  buscar?: string;
  categoria?: string;
  nivel?: SkillLevel | "";
  rol?: string;
  experiencia_min?: string;
  experiencia_max?: string;
  tecnologias?: string[];
  nivel_tecnologia?: SkillLevel | "";
}

export const createBasicProfile = async (payload: BasicProfilePayload) => {
  const formData = new FormData();
  formData.append("nombres", payload.nombres);
  formData.append("apellidos", payload.apellidos);
  formData.append("profesion", payload.profesion);
  formData.append("titular_profesional", payload.titular_profesional);
  formData.append("telefono", payload.telefono || "");
  formData.append("biografia", payload.biografia);

  if (payload.foto_perfil) {
    formData.append("foto_perfil", payload.foto_perfil);
  }

  const { data } = await api.post("/perfil", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const getMyProfile = async () => {
  const { data } = await api.get("/perfil");
  return data;
};

export const getPublicProfiles = async (filters: PublicProfileFilters = {}, signal?: AbortSignal) => {
  const { data } = await api.get("/perfiles-publicos", {
    signal,
    params: {
      buscar: filters.buscar || undefined,
      categoria: filters.categoria || undefined,
      nivel: filters.nivel || undefined,
      rol: filters.rol || undefined,
      experiencia_min: filters.experiencia_min || undefined,
      experiencia_max: filters.experiencia_max || undefined,
      tecnologias: filters.tecnologias?.length ? filters.tecnologias : undefined,
      nivel_tecnologia: filters.nivel_tecnologia || undefined,
    },
  });
  return data;
};

export const getPublicProfileBySlug = async (slug: string) => {
  const { data } = await api.get(`/perfiles-publicos/${slug}`);
  return data;
};

export const updateBasicProfile = async (payload: BasicProfilePayload) => {
  const formData = new FormData();
  formData.append("_method", "PUT");
  formData.append("nombres", payload.nombres);
  formData.append("apellidos", payload.apellidos);
  formData.append("profesion", payload.profesion);
  formData.append("titular_profesional", payload.titular_profesional);
  formData.append("telefono", payload.telefono || "");
  formData.append("biografia", payload.biografia);

  if (payload.foto_perfil) {
    formData.append("foto_perfil", payload.foto_perfil);
  }

  const { data } = await api.post("/perfil", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
