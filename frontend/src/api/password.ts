import api from "./axios";

export const requestPasswordRecovery = async (correo: string) => {
  const { data } = await api.post("/auth/forgot-password", { correo });
  return data;
};

export const changePassword = async (
  contrasena_actual: string,
  contrasena_nueva: string,
  contrasena_nueva_confirmation: string,
) => {
  const { data } = await api.put("/auth/change-password", {
    contrasena_actual,
    contrasena_nueva,
    contrasena_nueva_confirmation,
  });

  return data;
};

export const validateResetToken = async (token: string, correo: string) => {
  const { data } = await api.get(`/auth/reset-password/${token}`, {
    params: { correo },
  });
  return data;
};

export const resetPassword = async (
  correo: string,
  token: string,
  contrasena: string,
  contrasena_confirmation: string
) => {
  const { data } = await api.post("/auth/reset-password", {
    correo,
    token,
    contrasena,
    contrasena_confirmation,
  });

  return data;
};
