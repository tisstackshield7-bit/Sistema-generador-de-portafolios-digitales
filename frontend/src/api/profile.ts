import api from "./axios";
import type { BasicProfilePayload } from "../types/profile";

export const createBasicProfile = async (payload: BasicProfilePayload) => {
  const formData = new FormData();
  formData.append("nombres", payload.nombres);
  formData.append("apellidos", payload.apellidos);
  formData.append("profesion", payload.profesion);
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

export const getPublicProfiles = async () => {
  const { data } = await api.get("/perfiles-publicos");
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
