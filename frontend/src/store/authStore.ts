import type { UsuarioAuth } from "../types/auth";

export const authStore = {
  setSession(token: string, usuario: UsuarioAuth) {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
  },

  clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  },

  getToken() {
    return localStorage.getItem("token");
  },

  getUser(): UsuarioAuth | null {
    const raw = localStorage.getItem("usuario");
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem("token");
  },
};