export const validateEmail = (value: string) => {
  if (!value.trim()) return "El correo electrónico es obligatorio.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "El correo no es válido.";
  return "";
};

export const validatePassword = (value: string) => {
  if (!value.trim()) return "La contraseña es obligatoria.";
  if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (!/[A-Z]/.test(value)) return "La contraseña debe incluir una mayúscula.";
  if (!/[a-z]/.test(value)) return "La contraseña debe incluir una minúscula.";
  if (!/[0-9]/.test(value)) return "La contraseña debe incluir un número.";
  if (!/[\W_]/.test(value)) return "La contraseña debe incluir un símbolo.";
  return "";
};

export const validateRequired = (value: string, message: string) => {
  return value.trim() ? "" : message;
};

export const validateBiography = (value: string) => {
  if (!value.trim()) return "La biografía es obligatoria.";
  if (value.trim().length < 10) return "La biografía debe tener al menos 10 caracteres.";
  if (value.length > 500) return "La biografía no puede superar los 500 caracteres.";
  return "";
};

export const validateProfilePhoto = (file?: File | null) => {
  if (!file) return "";
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024;

  if (!validTypes.includes(file.type)) {
    return "Solo se permiten imágenes JPG, PNG o WEBP de hasta 5 MB.";
  }

  if (file.size > maxSize) {
    return "Solo se permiten imágenes JPG, PNG o WEBP de hasta 5 MB.";
  }

  return "";
};

// Remove any character that is not a letter (including tildes/umlauts) or a space.
// Useful to sanitize nombres y apellidos en los formularios.
export const sanitizeLettersAndSpaces = (value: string) => {
  return value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "");
};
