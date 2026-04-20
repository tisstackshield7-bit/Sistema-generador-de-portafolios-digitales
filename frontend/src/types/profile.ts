export interface BasicProfilePayload {
  nombres: string;
  apellidos: string;
  profesion: string;
  correo?: string;
  telefono?: string;
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
  correo?: string | null;
  telefono?: string | null;
  foto_perfil?: string | null;
  slug: string;
}
