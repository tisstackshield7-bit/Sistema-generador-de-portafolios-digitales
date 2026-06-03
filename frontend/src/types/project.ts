export interface Project {
  id: number;
  perfil_id: number;
  titulo: string;
  rol: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin?: string | null;
  actualidad: boolean;
  tecnologias: string[];
  logros?: string[] | null;
  enlace_proyecto?: string | null;
  url_imagen?: string | null;
  visible_publico: boolean;
  creado_en?: string | null;
  actualizado_en?: string | null;
}

export interface ProjectPayload {
  titulo: string;
  rol: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin?: string;
  actualidad: boolean;
  tecnologias: string;
  logros?: string;
  enlace_proyecto?: string;
  url_imagen?: string;
  imagen_archivo?: File | null;
  visible_publico: boolean;
}
