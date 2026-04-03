import api from "./axios";

export const requestPasswordRecovery = async (correo: string) => {
  const { data } = await api.post("/auth/forgot-password", { correo });
  return data;
};

export const validateResetToken = async (token: string) => {
  const { data } = await api.get(`/auth/reset-password/${token}`);
  return data;
};

export const resetPassword = async (
  token: string,
  contrasena: string,
  contrasena_confirmation: string
) => {
  const { data } = await api.post("/auth/reset-password", {
    token,
    contrasena,
    contrasena_confirmation,
  });

  return data;
};