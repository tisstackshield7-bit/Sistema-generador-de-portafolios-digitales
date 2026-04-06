import api from "./axios";
import type { AuthResponse, LoginPayload, RegisterPayload } from "../types/auth";

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
