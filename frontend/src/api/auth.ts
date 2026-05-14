import api from "./axios";
import type { AuthResponse, LoginPayload, RegisterPayload } from "../types/auth";
import { API_ORIGIN } from "./axios";

export const registerUser = async (payload: RegisterPayload) => {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
};

export const loginUser = async (payload: LoginPayload) => {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const logoutUser = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

export const buildGoogleAuthUrl = (intent: "login" | "register" = "login") =>
  `${API_ORIGIN}/api/auth/google/redirect?intent=${intent}`;

export const buildGithubAuthUrl = (intent: "login" | "register" = "login") =>
  `${API_ORIGIN}/api/auth/github/redirect?intent=${intent}`;
