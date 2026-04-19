export interface Skill {
  id: number;
  perfil_id: number;
  habilidad_id: number;
  nombre: string;
  tipo: "tecnica" | "blanda";
  categoria: string | null;
  nivel: "basico" | "intermedio" | "avanzado";
  es_visible: boolean;
  anios_experiencia?: number | null;
}

export interface CreateSkillPayload {
  nombre: string;
  tipo: "tecnica" | "blanda";
  categoria?: string | null;
  nivel: "basico" | "intermedio" | "avanzado";
  es_visible?: boolean;
  anios_experiencia?: number | null;
}

export interface UpdateSkillPayload {
  nivel?: "basico" | "intermedio" | "avanzado";
  es_visible?: boolean;
  anios_experiencia?: number | null;
}