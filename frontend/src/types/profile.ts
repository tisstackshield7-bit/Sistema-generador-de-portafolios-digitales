import type { Skill } from "./skill";
import type { Project } from "./project";
import type { Experience } from "./experience";

export interface BasicProfilePayload {
  nombres: string;
  apellidos: string;
  profesion: string;
  titular_profesional: string;
  telefono?: string;
  ubicacion?: string;
  biografia: string;
  linkedin_url?: string;
  github_url?: string;
  sitio_web_url?: string;
  visibilidad?: ProfileVisibility;
  foto_perfil?: File | null;
}

export interface ProfileVisibility {
  mostrar_correo: boolean;
  mostrar_telefono: boolean;
  mostrar_redes: boolean;
  mostrar_biografia: boolean;
  mostrar_habilidades: boolean;
  mostrar_proyectos: boolean;
  mostrar_experiencia: boolean;
  mostrar_evidencias: boolean;
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
  ubicacion?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  sitio_web_url?: string | null;
  visibilidad?: ProfileVisibility | null;
  foto_perfil?: string | null;
  slug: string;
  habilidades?: Skill[];
  proyectos?: Project[];
  experiencias?: Experience[];
}

export interface PublicProfileCard {
  id: number;
  nombre_completo: string;
  profesion: string;
  titular_profesional?: string | null;
  correo?: string | null;
  biografia: string;
  telefono?: string | null;
  ubicacion?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  sitio_web_url?: string | null;
  visibilidad?: ProfileVisibility | null;
  foto_perfil?: string | null;
  slug: string;
  habilidades?: Skill[];
  proyectos?: Project[];
  experiencias?: Experience[];
}
