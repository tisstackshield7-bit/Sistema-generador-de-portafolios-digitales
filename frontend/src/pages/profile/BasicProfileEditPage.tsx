import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/common/FormInput";
import FormTextarea from "../../components/common/FormTextarea";
import AlertMessage from "../../components/common/AlertMessage";
import BioCounter from "../../components/profile/BioCounter";
import ProfilePhotoInput from "../../components/profile/ProfilePhotoInput";
import { API_ORIGIN } from "../../api/axios";
import {
  validateBiography,
  validateProfilePhoto,
  validateRequired,
  sanitizeLettersAndSpaces,
} from "../../utils/validations";
import { getMyProfile, updateBasicProfile } from "../../api/profile";

export default function BasicProfileEditPage() {
  const navigate = useNavigate();

  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [profesion, setProfesion] = useState("");
  const [biografia, setBiografia] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [existingPhoto, setExistingPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [serverError, setServerError] = useState("");
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<{
    nombres?: string;
    apellidos?: string;
    profesion?: string;
    biografia?: string;
  }>({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyProfile();
        const perfil = data.perfil;

        if (perfil?.nombre_completo) {
          const parts = perfil.nombre_completo.split(" ");
          const rawNombres = parts.slice(0, -1).join(" ") || parts[0] || "";
          const rawApellidos = parts.slice(-1).join(" ") || "";

          setNombres(sanitizeLettersAndSpaces(rawNombres));
          setApellidos(sanitizeLettersAndSpaces(rawApellidos));
        }

        setProfesion(perfil?.profesion || "");
        setBiografia(perfil?.biografia || "");
        setExistingPhoto(perfil?.foto_perfil || null);
      } catch {
        setServerError("No se pudo cargar el perfil.");
      }
    };

    loadProfile();
  }, []);

const preview = useMemo(() => {
  if (foto) return URL.createObjectURL(foto);
  if (existingPhoto) return `${API_ORIGIN}/storage/${existingPhoto}`;
  return null;
}, [foto, existingPhoto]);

  const onlyLettersMessage = "Solo se aceptan letras y espacios; no se permiten números ni símbolos.";
  const lettersPattern = "[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\\s]+";
  const [profesionError, setProfesionError] = useState("");

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
  const handleBiografiaChange = (value: string) => {
    const nextValue = value.slice(0, 500);
    setBiografia(nextValue);
    setErrors((prev) => ({
      ...prev,
      biografia: nextValue.length === 500 ? "La biografia no puede superar los 500 caracteres." : "",
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
    setMessage("");

    if (Object.values(nextErrors).some(Boolean) || photoError) return;

    try {
      await updateBasicProfile({
        nombres,
        apellidos,
        profesion,
        biografia,
        foto_perfil: foto,
      });

      setMessage("Informacion actualizada correctamente.");
      setTimeout(() => navigate("/perfil"), 900);
    } catch (err: any) {
      setServerError(err?.response?.data?.message || "No se pudo actualizar el perfil.");
    }
  };

  return (
    <div className="profile-form-shell app-shell">
      <div className="page-section profile-form-grid">
        <aside className="surface-card profile-form-aside">
          <p className="section-label">Editar perfil</p>
          <h1 className="section-title">Mantén tu presencia profesional al dia.</h1>
          <p className="section-copy">
            Ajusta tu informacion principal para que la vista publica se vea mas solida y coherente.
          </p>
          <ul>
            <li>Refuerza tu titular profesional.</li>
            <li>Haz tu resumen mas claro y concreto.</li>
            <li>Usa una foto actual para mejorar reconocimiento.</li>
          </ul>
        </aside>

        <section className="profile-form-card">
          <p className="section-label">Ajustes principales</p>
          <h1>Actualizar perfil</h1>
          <p className="section-copy">Mantener tus datos claros ayuda a que el perfil se perciba mas confiable.</p>

          <AlertMessage message={message || serverError} />

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
            />
            <FormInput
              label="Apellidos"
              value={apellidos}
              onChange={handleApellidosChange}
              error={errors.apellidos}
              pattern={lettersPattern}
              title={onlyLettersMessage}
              inputMode="text"
            />
            <FormInput
              label="Profesion o titulo"
              value={profesion}
              onChange={handleProfesionChange}
              error={errors.profesion}
              pattern={lettersPattern}
              title={onlyLettersMessage}
              inputMode="text"
            />

            <FormTextarea
              label="Resumen profesional"
              value={biografia}
              onChange={handleBiografiaChange}
              error={errors.biografia}
              maxLength={500}
              placeholder="Describe en pocas lineas que haces, en que destacas y que tipo de proyectos impulsas."
            />

            <BioCounter count={biografia.length} />

            <div className="form-actions-row">
              <button type="button" className="btn btn-secondary" onClick={() => navigate("/")}>
                Cancelar
              </button>

              <button type="submit" className="btn btn-primary">
                Guardar cambios
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

