import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/common/FormInput";
import RichTextEditor from "../../components/common/RichTextEditor";
import AlertMessage from "../../components/common/AlertMessage";
import ProfilePhotoInput from "../../components/profile/ProfilePhotoInput";
import {
  sanitizeDigits,
  sanitizeLettersAndSpaces,
  sanitizeLocationText,
  sanitizeProfessionalText,
  validateBiography,
  validateBoliviaPhone,
  validateProfilePhoto,
  validateRequired,
} from "../../utils/validations";
import { createBasicProfile } from "../../api/profile";
import { limitRichText } from "../../utils/richText";
import "./BasicProfileCreatePage.css";

type FieldName = "nombres" | "apellidos" | "profesion" | "titular_profesional" | "telefono" | "ubicacion" | "biografia";

type ApiErrorData = {
  message?: string;
};

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiErrorData | undefined)?.message || fallback;
  }

  return fallback;
}

export default function BasicProfileCreatePage() {
  const navigate = useNavigate();

  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [profesion, setProfesion] = useState("");
  const [titularProfesional, setTitularProfesional] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [biografia, setBiografia] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<Record<FieldName, string>>({
    nombres: "",
    apellidos: "",
    profesion: "",
    titular_profesional: "",
    telefono: "",
    ubicacion: "",
    biografia: "",
  });
  const [touched, setTouched] = useState<Record<FieldName | "foto", boolean>>({
    foto: false,
    nombres: false,
    apellidos: false,
    profesion: false,
    titular_profesional: false,
    telefono: false,
    ubicacion: false,
    biografia: false,
  });

  const preview = useMemo(() => (foto ? URL.createObjectURL(foto) : null), [foto]);

  const onlyLettersMessage = "Solo se aceptan letras y espacios; no se permiten numeros ni simbolos.";
  const professionalTextMessage = "Solo se aceptan letras, numeros, espacios y signos profesionales comunes.";
  const requiredPhotoMessage = "La foto de perfil es obligatoria.";
  const lettersPattern = "[A-Za-z\\u00C0-\\u024F\\s]+";
  const professionalPattern = "[A-Za-z0-9\\u00C0-\\u024F\\s.,/+#&()\\-]+";

  const validateField = (field: FieldName, value: string, customError = "") => {
    if (customError) return customError;

    switch (field) {
      case "nombres":
        return validateRequired(value, "El nombre es obligatorio.");
      case "apellidos":
        return validateRequired(value, "Los apellidos son obligatorios.");
      case "profesion":
        return validateRequired(value, "La profesion es obligatoria.");
      case "titular_profesional":
        return validateRequired(value, "El rol o especialidad profesional es obligatorio.");
      case "telefono":
        return validateBoliviaPhone(value);
      case "ubicacion":
        return value.trim().length > 180 ? "La ubicacion no puede superar 180 caracteres." : "";
      case "biografia":
        return validateBiography(value);
      default:
        return "";
    }
  };

  const markFieldAsTouched = (field: FieldName | "foto") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const setFieldError = (field: FieldName, value: string, customError = "") => {
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, value, customError),
    }));
  };

  const handlePhotoChange = (file: File | null) => {
    const nextError = !file ? requiredPhotoMessage : validateProfilePhoto(file);
    setPhotoError(nextError);
    setFoto(nextError ? null : file);
  };

  const handleNombresChange = (value: string) => {
    const cleaned = sanitizeLettersAndSpaces(value);
    const customError = value !== cleaned ? onlyLettersMessage : "";
    setNombres(cleaned);

    if (touched.nombres) {
      setFieldError("nombres", cleaned, customError);
      return;
    }

    setErrors((prev) => ({ ...prev, nombres: customError }));
  };

  const handleApellidosChange = (value: string) => {
    const cleaned = sanitizeLettersAndSpaces(value);
    const customError = value !== cleaned ? onlyLettersMessage : "";
    setApellidos(cleaned);

    if (touched.apellidos) {
      setFieldError("apellidos", cleaned, customError);
      return;
    }

    setErrors((prev) => ({ ...prev, apellidos: customError }));
  };

  const handleProfesionChange = (value: string) => {
    const cleaned = sanitizeProfessionalText(value);
    const customError = value !== cleaned ? professionalTextMessage : "";
    setProfesion(cleaned);

    if (touched.profesion) {
      setFieldError("profesion", cleaned, customError);
      return;
    }

    setErrors((prev) => ({ ...prev, profesion: customError }));
  };

  const handleTitularProfesionalChange = (value: string) => {
    const cleaned = sanitizeProfessionalText(value);
    const customError = value !== cleaned ? professionalTextMessage : "";
    setTitularProfesional(cleaned);

    if (touched.titular_profesional) {
      setFieldError("titular_profesional", cleaned, customError);
      return;
    }

    setErrors((prev) => ({ ...prev, titular_profesional: customError }));
  };

  const handleTelefonoChange = (value: string) => {
    const digitsOnly = sanitizeDigits(value);
    setTelefono(digitsOnly);

    if (touched.telefono) {
      setFieldError("telefono", digitsOnly);
    }
  };

  const handleBiografiaChange = (value: string) => {
    const nextValue = limitRichText(value, 1200);
    setBiografia(nextValue);

    if (touched.biografia) {
      setFieldError("biografia", nextValue);
      return;
    }

    setErrors((prev) => ({
      ...prev,
      biografia: validateBiography(nextValue),
    }));
  };

  const handleVolver = () => {
    navigate("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextTouched = {
      foto: true,
      nombres: true,
      apellidos: true,
      profesion: true,
      titular_profesional: true,
      telefono: true,
      ubicacion: true,
      biografia: true,
    };
    const nextErrors = {
      nombres: validateField("nombres", nombres, errors.nombres),
      apellidos: validateField("apellidos", apellidos, errors.apellidos),
      profesion: validateField("profesion", profesion, errors.profesion),
      titular_profesional: validateField("titular_profesional", titularProfesional, errors.titular_profesional),
      telefono: validateField("telefono", telefono),
      ubicacion: validateField("ubicacion", ubicacion),
      biografia: validateField("biografia", biografia),
    };
    const nextPhotoError = foto ? validateProfilePhoto(foto) : requiredPhotoMessage;

    setTouched(nextTouched);
    setErrors(nextErrors);
    setPhotoError(nextPhotoError);
    setServerError("");

    if (Object.values(nextErrors).some(Boolean) || nextPhotoError) return;

    try {
      await createBasicProfile({
        nombres,
        apellidos,
        profesion,
        titular_profesional: titularProfesional,
        telefono,
        ubicacion,
        biografia,
        foto_perfil: foto,
      });

      navigate("/");
    } catch (err: unknown) {
      setServerError(getApiErrorMessage(err, "No se pudo guardar el perfil."));
    }
  };

  return (
    <div className="profile-form-shell app-shell">
      <div className="page-section profile-form-grid">
        <aside className="surface-card profile-form-aside">
          <p className="section-label">Completa tu perfil</p>
          <h1 className="section-title">Empieza con una base mas profesional.</h1>
          <p className="section-copy">
            Agrega tu informacion principal para que tu perfil se vea mas claro, confiable y listo para compartir.
          </p>
          <ul>
            <li>Nombre completo y profesion bien visibles.</li>
            <li>Biografia breve con propuesta de valor.</li>
            <li>Foto para reforzar credibilidad y reconocimiento.</li>
          </ul>
        </aside>

        <section className="profile-form-card">
          <p className="section-label">Informacion basica</p>
          <h1>Configura tu perfil</h1>
          <p className="section-copy">Llena los campos esenciales para habilitar tu perfil publico.</p>

          <AlertMessage message={serverError} />

          <form onSubmit={handleSubmit} className="form-stack">
            <ProfilePhotoInput
              preview={preview}
              error={photoError}
              onFileChange={handlePhotoChange}
              onBlur={() => {
                markFieldAsTouched("foto");
                setPhotoError(foto ? validateProfilePhoto(foto) : requiredPhotoMessage);
              }}
            />

            <FormInput
              label="Nombre(s)"
              value={nombres}
              onChange={handleNombresChange}
              onBlur={() => {
                markFieldAsTouched("nombres");
                setFieldError("nombres", nombres, errors.nombres);
              }}
              error={errors.nombres}
              pattern={lettersPattern}
              title={onlyLettersMessage}
              inputMode="text"
            />

            <FormInput
              label="Apellidos"
              value={apellidos}
              onChange={handleApellidosChange}
              onBlur={() => {
                markFieldAsTouched("apellidos");
                setFieldError("apellidos", apellidos, errors.apellidos);
              }}
              error={errors.apellidos}
              pattern={lettersPattern}
              title={onlyLettersMessage}
              inputMode="text"
            />

            <FormInput
              label="Profesion"
              value={profesion}
              onChange={handleProfesionChange}
              onBlur={() => {
                markFieldAsTouched("profesion");
                setFieldError("profesion", profesion, errors.profesion);
              }}
              error={errors.profesion}
              pattern={professionalPattern}
              title={professionalTextMessage}
              inputMode="text"
            />

            <FormInput
              label="Rol o especialidad profesional"
              value={titularProfesional}
              onChange={handleTitularProfesionalChange}
              onBlur={() => {
                markFieldAsTouched("titular_profesional");
                setFieldError("titular_profesional", titularProfesional, errors.titular_profesional);
              }}
              error={errors.titular_profesional}
              pattern={professionalPattern}
              title={professionalTextMessage}
              inputMode="text"
            />

            <FormInput
              label="Numero telefonico"
              value={telefono}
              onChange={handleTelefonoChange}
              onBlur={() => {
                markFieldAsTouched("telefono");
                setFieldError("telefono", telefono);
              }}
              error={errors.telefono}
              inputMode="numeric"
            />

            <FormInput
              label="Ubicacion"
              value={ubicacion}
              onChange={(value) => setUbicacion(sanitizeLocationText(value))}
              onBlur={() => {
                markFieldAsTouched("ubicacion");
                setFieldError("ubicacion", ubicacion);
              }}
              error={errors.ubicacion}
              inputMode="text"
            />

            <RichTextEditor
              label="Resumen profesional"
              value={biografia}
              onChange={handleBiografiaChange}
              onBlur={() => {
                markFieldAsTouched("biografia");
                setFieldError("biografia", biografia);
              }}
              error={errors.biografia}
              placeholder="Describe en pocas lineas que haces, en que destacas y que tipo de proyectos impulsas."
            />

            <div className="basic-profile-actions">
              <button type="button" onClick={handleVolver} className="basic-profile-actions__back">
                ← Volver
              </button>

              <button type="submit" className="basic-profile-actions__submit">
                Guardar
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
