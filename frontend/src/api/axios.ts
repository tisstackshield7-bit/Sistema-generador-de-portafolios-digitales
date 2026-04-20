import axios from "axios";
import { authStore } from "../store/authStore";

export const API_BASE_URL = "http://127.0.0.1:8000/api";
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || "");
    const hasToken = authStore.isAuthenticated();

    if (status === 401 && hasToken && !requestUrl.includes("/auth/logout")) {
      authStore.clearSession();
      authStore.setRedirectNotice(
        "Debe iniciar sesion para acceder a esta seccion.",
        window.location.pathname,
      );

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  },
);

export default api;
