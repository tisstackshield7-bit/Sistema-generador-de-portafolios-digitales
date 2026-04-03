export interface BasicProfilePayload {
  nombres: string;
  apellidos: string;
  profesion: string;
  biografia: string;
  foto_perfil?: File | null;
}

export interface Perfil {
  id: number;
  usuario_id: number;
  nombre_completo: string;
  profesion: string;
  titular_profesional?: string | null;
  biografia: string;
  foto_perfil?: string | null;
  slug: string;
}