import api from "./axios";

export const requestPasswordRecovery = async (correo: string) => {
  const { data } = await api.post("/auth/forgot-password", { correo });
  return data;
};

export const changePassword = async (
  contraseña_actual: string,
  contraseña_nueva: string,
  contraseña_nueva_confirmation: string,
) => {
  const { data } = await api.put("/auth/change-password", {
    contraseña_actual,
    contraseña_nueva,
    contraseña_nueva_confirmation,
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
  contraseña: string,
  contraseña_confirmation: string
) => {
  const { data } = await api.post("/auth/reset-password", {
    correo,
    token,
    contraseña,
    contraseña_confirmation,
  });

  return data;
};
