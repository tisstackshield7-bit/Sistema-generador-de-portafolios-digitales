export interface RegisterPayload {
  correo: string;
  contraseña: string;
}

export interface LoginPayload {
  correo: string;
  contraseña: string;
}

export interface UsuarioAuth {
  id: number;
  nombre?: string | null;
  correo: string;
  rol: string;
  estado: string;
  debe_cambiar_contraseña?: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  usuario: UsuarioAuth;
  redirect_to?: string;
  usuario_id?: number;
  requiere_cambio_contraseña?: boolean;
}
