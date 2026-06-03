export type ExperienceType = "laboral" | "academica";
export type AcademicExperienceSubtype =
  | "Carrera universitaria"
  | "Tecnico superior"
  | "Diplomado"
  | "Curso"
  | "Bootcamp"
  | "Certificacion"
  | "Taller"
  | "Seminario"
  | "Posgrado / Maestria"
  | "Investigacion"
  | "Ponencia / Publicacion"
  | "Otro";
export type AcademicExperienceStatus = "En curso" | "Finalizado" | "Vigente" | "Vencido";
export type AcademicAccreditationType = "Horas" | "Modulos" | "Creditos" | "Sin acreditacion";

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
  subtipo_academico?: AcademicExperienceSubtype | null;
  estado_academico?: AcademicExperienceStatus | null;
  area_especializacion?: string | null;
  tipo_acreditacion?: AcademicAccreditationType | null;
  cantidad_acreditacion?: number | null;
  url_credencial?: string | null;
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
  subtipo_academico?: AcademicExperienceSubtype | "";
  estado_academico?: AcademicExperienceStatus | "";
  area_especializacion?: string;
  tipo_acreditacion?: AcademicAccreditationType | "";
  cantidad_acreditacion?: string;
  url_credencial?: string;
  logros?: string;
  visible_publico: boolean;
}
