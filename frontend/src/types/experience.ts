export type ExperienceType = "laboral" | "academica";

export interface Experience {
  id: number;
  perfil_id: number;
  tipo: ExperienceType;
  titulo: string;
  institucion: string;
  ubicacion?: string | null;
  descripcion?: string | null;
  fecha_inicio: string;
  fecha_fin?: string | null;
  actualidad: boolean;
  logros?: string[] | null;
  visible_publico: boolean;
  creado_en?: string | null;
  actualizado_en?: string | null;
}

export interface ExperiencePayload {
  tipo: ExperienceType;
  titulo: string;
  institucion: string;
  ubicacion?: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  actualidad: boolean;
  logros?: string;
  visible_publico: boolean;
}
