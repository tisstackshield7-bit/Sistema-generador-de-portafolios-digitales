import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/common/FormInput";
import FormTextarea from "../../components/common/FormTextarea";
import AlertMessage from "../../components/common/AlertMessage";
import BioCounter from "../../components/profile/BioCounter";
import ProfilePhotoInput from "../../components/profile/ProfilePhotoInput";
import {
  validateBiography,
  validateProfilePhoto,
  validateRequired,
  sanitizeLettersAndSpaces,
} from "../../utils/validations";
import { createBasicProfile } from "../../api/profile";

export default function BasicProfileCreatePage() {
  const navigate = useNavigate();

  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [profesion, setProfesion] = useState("");
  const [biografia, setBiografia] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [serverError, setServerError] = useState("");

  const [errors, setErrors] = useState<{
    nombres?: string;
    apellidos?: string;
    profesion?: string;
    biografia?: string;
  }>({});

  const preview = useMemo(() => (foto ? URL.createObjectURL(foto) : null), [foto]);

  const onlyLettersMessage = "Solo se aceptan letras y espacios; no se permiten números ni símbolos.";
  const lettersPattern = "[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\\s]+";
  const [profesionError, setProfesionError] = useState("");
  const handleBiografiaChange = (value: string) => {
    const nextValue = value.slice(0, 500);
    setBiografia(nextValue);
    setErrors((prev) => ({
      ...prev,
      biografia: nextValue.length === 500 ? "La biografia no puede superar los 500 caracteres." : "",
    }));
  };

  const handlePhotoChange = (file: File | null) => {
    const error = validateProfilePhoto(file);
    setPhotoError(error);
    if (!error) setFoto(file);
  };

  const handleNombresChange = (value: string) => {
    const cleaned = sanitizeLettersAndSpaces(value);
    setErrors((prev) => ({
      ...prev,
      nombres: value !== cleaned ? onlyLettersMessage : "",
    }));
    setNombres(cleaned);
  };

  const handleApellidosChange = (value: string) => {
    const cleaned = sanitizeLettersAndSpaces(value);
    setErrors((prev) => ({
      ...prev,
      apellidos: value !== cleaned ? onlyLettersMessage : "",
    }));
    setApellidos(cleaned);
  };

  const handleProfesionChange = (value: string) => {
    const cleaned = sanitizeLettersAndSpaces(value);
    const fieldError = value !== cleaned ? onlyLettersMessage : "";
    setProfesion(cleaned);
    setProfesionError(fieldError);
    setErrors((prev) => ({
      ...prev,
      profesion: fieldError,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = {
      nombres: validateRequired(nombres, "El nombre es obligatorio.") || errors.nombres,
      apellidos: validateRequired(apellidos, "Los apellidos son obligatorios.") || errors.apellidos,
      profesion: validateRequired(profesion, "La profesion es obligatoria.") || profesionError,
      biografia: validateBiography(biografia),
    };

    setErrors(nextErrors);
    setServerError("");

    if (Object.values(nextErrors).some(Boolean) || photoError) return;

    try {
      await createBasicProfile({
        nombres,
        apellidos,
        profesion,
        biografia,
        foto_perfil: foto,
      });

      navigate("/perfil");
    } catch (err: any) {
      setServerError(err?.response?.data?.message || "No se pudo guardar el perfil.");
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
            <ProfilePhotoInput preview={preview} error={photoError} onFileChange={handlePhotoChange} />

            <FormInput
              label="Nombre(s)"
              value={nombres}
              onChange={handleNombresChange}
              error={errors.nombres}
              pattern={lettersPattern}
              title={onlyLettersMessage}
              inputMode="text"
              placeholder="Ej. Juan Daniel"
            />

            <FormInput
              label="Apellidos"
              value={apellidos}
              onChange={handleApellidosChange}
              error={errors.apellidos}
              pattern={lettersPattern}
              title={onlyLettersMessage}
              inputMode="text"
              placeholder="Ej. Vasquez Casana"
            />

            <FormInput
              label="Profesion o titulo"
              value={profesion}
              onChange={handleProfesionChange}
              error={errors.profesion}
              pattern={lettersPattern}
              title={onlyLettersMessage}
              inputMode="text"
              placeholder="Ej. Ingeniero de sistemas"
            />

            <FormTextarea
              label="Resumen profesional"
              value={biografia}
              onChange={handleBiografiaChange}
              error={errors.biografia}
              placeholder="Describe en pocas lineas que haces, en que destacas y que tipo de proyectos impulsas."
            />

            <BioCounter value={biografia} />

            <button type="submit" className="btn btn-primary btn-block">
              Guardar y continuar
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

