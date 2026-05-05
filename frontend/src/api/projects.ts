import api from "./axios";
import type { ProjectPayload } from "../types/project";

function buildProjectFormData(payload: ProjectPayload, method?: "PUT") {
  const formData = new FormData();

  if (method) {
    formData.append("_method", method);
  }

  formData.append("titulo", payload.titulo);
  formData.append("rol", payload.rol);
  formData.append("descripcion", payload.descripcion);
  formData.append("fecha_inicio", payload.fecha_inicio);
  formData.append("fecha_fin", payload.fecha_fin || "");
  formData.append("tecnologias", payload.tecnologias);
  formData.append("logros", payload.logros || "");
  formData.append("enlace_proyecto", payload.enlace_proyecto || "");
  formData.append("visible_publico", payload.visible_publico ? "1" : "0");

  if (payload.url_imagen !== undefined) {
    formData.append("url_imagen", payload.url_imagen || "");
  }

  if (payload.imagen_archivo) {
    formData.append("imagen_archivo", payload.imagen_archivo);
  }

  return formData;
}

export const getMyProjects = async () => {
  const { data } = await api.get("/proyectos");
  return data;
};

export const createProject = async (payload: ProjectPayload) => {
  const { data } = await api.post("/proyectos", buildProjectFormData(payload), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const updateProject = async (id: number, payload: ProjectPayload) => {
  const { data } = await api.post(`/proyectos/${id}`, buildProjectFormData(payload, "PUT"), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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
