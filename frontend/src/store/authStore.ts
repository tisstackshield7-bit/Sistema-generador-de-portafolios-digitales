import type { UsuarioAuth } from "../types/auth";

const REDIRECT_MESSAGE_KEY = "auth_redirect_message";
const REDIRECT_FROM_KEY = "auth_redirect_from";

export const authStore = {
  setSession(token: string, usuario: UsuarioAuth) {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
  },

  updateUser(usuario: UsuarioAuth) {
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

  setRedirectNotice(message: string, from: string) {
    sessionStorage.setItem(REDIRECT_MESSAGE_KEY, message);
    sessionStorage.setItem(REDIRECT_FROM_KEY, from);
  },

  consumeRedirectNotice() {
    const message = sessionStorage.getItem(REDIRECT_MESSAGE_KEY) || "";
    const from = sessionStorage.getItem(REDIRECT_FROM_KEY) || "/";

    sessionStorage.removeItem(REDIRECT_MESSAGE_KEY);
    sessionStorage.removeItem(REDIRECT_FROM_KEY);

    return { message, from };
  },
};
