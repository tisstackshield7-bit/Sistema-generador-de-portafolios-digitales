export type SkillType = "tecnica" | "blanda";

export type SkillLevel = "Basico" | "Intermedio" | "Avanzado";

export interface Skill {
  id: number;
  perfil_id: number;
  tipo: SkillType;
  nombre: string;
  categoria?: string | null;
  nivel_dominio: SkillLevel;
  visible_publico: boolean;
  creado_en?: string | null;
  actualizado_en?: string | null;
}

export interface SkillPayload {
  tipo: SkillType;
  nombre: string;
  categoria: string;
  nivel_dominio: SkillLevel | "";
  visible_publico: boolean;
}
