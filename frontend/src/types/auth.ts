export interface RegisterPayload {
  correo: string;
  contrasena: string;
}

export interface LoginPayload {
  correo: string;
  contrasena: string;
}

export interface UsuarioAuth {
  id: number;
  correo: string;
  estado: string;
  debe_cambiar_contrasena?: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  usuario: UsuarioAuth;
  redirect_to?: string;
  usuario_id?: number;
  requiere_cambio_contrasena?: boolean;
}
