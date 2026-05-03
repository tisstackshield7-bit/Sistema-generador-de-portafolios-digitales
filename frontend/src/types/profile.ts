import type { Skill } from "./skill";
import type { Project } from "./project";

export interface BasicProfilePayload {
  nombres: string;
  apellidos: string;
  profesion: string;
  titular_profesional: string;
  telefono?: string;
  biografia: string;
  foto_perfil?: File | null;
}

export interface Perfil {
  id: number;
  usuario_id: number;
  nombres?: string | null;
  apellidos?: string | null;
  nombre_completo: string;
  profesion: string;
  titular_profesional?: string | null;
  correo?: string | null;
  biografia: string;
  telefono?: string | null;
  foto_perfil?: string | null;
  slug: string;
  habilidades?: Skill[];
  proyectos?: Project[];
}

export interface PublicProfileCard {
  id: number;
  nombre_completo: string;
  profesion: string;
  titular_profesional?: string | null;
  correo?: string | null;
  biografia: string;
  telefono?: string | null;
  foto_perfil?: string | null;
  slug: string;
  habilidades?: Skill[];
  proyectos?: Project[];
}
