export type SkillType = "tecnica" | "blanda";

export type SkillLevel = "Basico" | "Intermedio" | "Avanzado";
export type SkillEvidenceType = "certificado" | "proyecto" | "curso" | "video" | "documento" | "experiencia";

export interface SkillEvidence {
  id: number;
  habilidad_id: number;
  tipo: SkillEvidenceType;
  titulo: string;
  descripcion?: string | null;
  archivo?: string | null;
  url?: string | null;
  emisor?: string | null;
  fecha?: string | null;
}

export interface SkillEvidencePayload {
  tipo: SkillEvidenceType;
  titulo: string;
  descripcion?: string;
  url?: string;
  emisor?: string;
  fecha?: string;
  archivo?: File | null;
}

export interface Skill {
  id: number;
  perfil_id: number;
  tipo: SkillType;
  nombre: string;
  categoria?: string | null;
  nivel_dominio: SkillLevel;
  visible_publico: boolean;
  certificado_pdf?: string | null;
  evidencias?: SkillEvidence[];
  estado_respaldo?: "declarado" | "con_respaldo";
  creado_en?: string | null;
  actualizado_en?: string | null;
}

export interface SkillPayload {
  tipo: SkillType;
  nombre: string;
  categoria: string;
  categoria_personalizada?: string;
  nivel_dominio: SkillLevel | "";
  visible_publico: boolean;
  certificado_pdf?: File | null;
  evidencias?: SkillEvidencePayload[];
}
