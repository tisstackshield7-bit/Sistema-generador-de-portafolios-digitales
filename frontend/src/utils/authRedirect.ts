import type { UsuarioAuth } from "../types/auth";

export function getAuthenticatedHomePath(user?: UsuarioAuth | null) {
  return user?.rol === "admin" ? "/admin/dashboard" : "/dashboard";
}
