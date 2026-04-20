import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/common/FormInput";
import FormTextarea from "../../components/common/FormTextarea";
import AlertMessage from "../../components/common/AlertMessage";
import BioCounter from "../../components/profile/BioCounter";
import ProfilePhotoInput from "../../components/profile/ProfilePhotoInput";
import DashboardSidebar from "../../components/common/DashboardSidebar";
import { API_ORIGIN } from "../../api/axios";
import {
  validateBiography,
  validateOptionalEmail,
  validatePhone,
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
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
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
    correo?: string;
    telefono?: string;
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
        setCorreo(perfil?.correo || "");
        setTelefono(perfil?.telefono || "");
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

  const handleCorreoChange = (value: string) => {
    setCorreo(value);
    setErrors((prev) => ({
      ...prev,
      correo: validateOptionalEmail(value),
    }));
  };

  const handleTelefonoChange = (value: string) => {
    setTelefono(value);
    setErrors((prev) => ({
      ...prev,
      telefono: validatePhone(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = {
      nombres: validateRequired(nombres, "El nombre es obligatorio.") || errors.nombres,
      apellidos: validateRequired(apellidos, "Los apellidos son obligatorios.") || errors.apellidos,
      profesion: validateRequired(profesion, "La profesion es obligatoria.") || profesionError,
      correo: validateOptionalEmail(correo),
      telefono: validatePhone(telefono),
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
        correo,
        telefono,
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
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh", background: "#f4f2ef" }}>
      <DashboardSidebar activePage="perfil" />
      
      <div style={{ padding: "32px" }}>
        <section className="surface-card profile-form-aside" style={{ marginBottom: "24px" }}>
          <p className="section-label">Perfil</p>
          <h1 className="section-title">Gestiona tu información personal y profesional</h1>
        </section>

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

            <FormInput
              label="Correo electronico"
              type="email"
              value={correo}
              onChange={handleCorreoChange}
              error={errors.correo}
              inputMode="email"
              placeholder="tu-correo@ejemplo.com"
            />

            <FormInput
              label="Numero de celular"
              type="tel"
              value={telefono}
              onChange={handleTelefonoChange}
              error={errors.telefono}
              inputMode="tel"
              placeholder="Ej. +591 70000000"
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

