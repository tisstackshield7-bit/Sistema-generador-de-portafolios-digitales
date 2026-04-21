export const validateEmail = (value: string) => {
  if (!value.trim()) return "El correo electronico es obligatorio.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "El correo no es valido.";
  return "";
};

export const validatePassword = (value: string) => {
  if (!value.trim()) return "La contrasena es obligatoria.";
  if (value.length < 8) return "La contrasena debe tener al menos 8 caracteres.";
  if (!/[A-Z]/.test(value)) return "La contrasena debe incluir una mayuscula.";
  if (!/[a-z]/.test(value)) return "La contrasena debe incluir una minuscula.";
  if (!/[0-9]/.test(value)) return "La contrasena debe incluir un numero.";
  if (!/[\W_]/.test(value)) return "La contrasena debe incluir un simbolo.";
  return "";
};

export const validateRequired = (value: string, message: string) => {
  return value.trim() ? "" : message;
};

export const validateBiography = (value: string) => {
  if (!value.trim()) return "La biografia es obligatoria.";
  if (value.trim().length < 10) return "La biografia debe tener al menos 10 caracteres.";
  if (value.length > 500) return "La biografia no puede superar los 500 caracteres.";
  return "";
};

export const validateBoliviaPhone = (value: string) => {
  const normalized = value.replace(/\D/g, "");

  if (!normalized) return "El numero telefonico es obligatorio.";

  const boliviaPhoneRegex = /^(?:591)?[67]\d{7}$/;

  if (!boliviaPhoneRegex.test(normalized)) {
    return "Ingresa un numero de Bolivia valido. Ej: 71234567 o 59171234567.";
  }

  return "";
};

export const validateProfilePhoto = (file?: File | null) => {
  if (!file) return "";
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024;

  if (!validTypes.includes(file.type)) {
    return "Solo se permiten imagenes JPG, PNG o WEBP de hasta 5 MB.";
  }

  if (file.size > maxSize) {
    return "Solo se permiten imagenes JPG, PNG o WEBP de hasta 5 MB.";
  }

  return "";
};

export const sanitizeLettersAndSpaces = (value: string) => {
  return value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "");
};

export const sanitizeDigits = (value: string) => {
  return value.replace(/\D/g, "");
};
