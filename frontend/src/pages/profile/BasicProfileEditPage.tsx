import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import FormInput from "../../components/common/FormInput";
import RichTextEditor from "../../components/common/RichTextEditor";
import AlertMessage from "../../components/common/AlertMessage";
import ProfilePhotoInput from "../../components/profile/ProfilePhotoInput";
import PrivateWorkspaceLayout from "../../components/dashboard/PrivateWorkspaceLayout";
import { API_ORIGIN } from "../../api/axios";
import {
  validateBiography,
  validateBoliviaPhone,
  validateProfilePhoto,
  validateRequired,
  sanitizeLettersAndSpaces,
  sanitizeDigits,
  sanitizeLocationText,
  validateDomainUrl,
  validateUrl,
} from "../../utils/validations";
import { getMyProfile, updateBasicProfile } from "../../api/profile";
import type { Perfil } from "../../types/profile";
import { limitRichText } from "../../utils/richText";

const DEFAULT_VISIBILITY = {
  mostrar_correo: true,
  mostrar_telefono: false,
  mostrar_redes: true,
  mostrar_biografia: true,
  mostrar_habilidades: true,
  mostrar_proyectos: true,
  mostrar_experiencia: true,
  mostrar_evidencias: true,
};

type ApiErrorData = {
  message?: string;
};

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiErrorData | undefined)?.message || fallback;
  }

  return fallback;
}

function splitLegacyFullName(fullName: string) {
  const parts = fullName.split(" ").filter(Boolean);

  if (parts.length <= 1) {
    return { nombres: parts[0] || "", apellidos: "" };
  }

  if (parts.length === 2) {
    return { nombres: parts[0], apellidos: parts[1] };
  }

  return {
    nombres: parts.slice(0, -2).join(" "),
    apellidos: parts.slice(-2).join(" "),
  };
}

function SocialFieldIcon({ type }: { type: "linkedin" | "github" | "web" }) {
  if (type === "github") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3.5a8.5 8.5 0 0 0-2.7 16.6c.4.1.6-.2.6-.4v-1.5c-2.3.5-2.8-1-2.8-1-.4-.9-.9-1.2-.9-1.2-.8-.5.1-.5.1-.5.8.1 1.3.9 1.3.9.8 1.3 2 1 2.4.8.1-.6.3-1 .5-1.2-1.8-.2-3.7-.9-3.7-4a3.1 3.1 0 0 1 .8-2.2 2.9 2.9 0 0 1 .1-2.1s.7-.2 2.3.8a8 8 0 0 1 4.2 0c1.6-1 2.3-.8 2.3-.8.4.9.1 1.8.1 2.1.5.6.8 1.3.8 2.2 0 3.1-1.9 3.8-3.7 4 .3.3.6.8.6 1.6v2.3c0 .3.2.5.6.4A8.5 8.5 0 0 0 12 3.5Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (type === "web") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8" />
          <path d="M4 12h16M12 4c2 2.2 3 4.8 3 8s-1 5.8-3 8M12 4c-2 2.2-3 4.8-3 8s1 5.8 3 8" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <g fill="currentColor">
        <path d="M6.7 9.2H3.9v9h2.8v-9Z" />
        <path d="M5.3 5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" />
        <path d="M10.8 9.2H8.1v9h2.7v-4.7c0-1.2.6-2 1.7-2s1.5.8 1.5 2v4.7h2.8V13c0-2.7-1.4-4-3.3-4-1.5 0-2.2.8-2.6 1.4h-.1V9.2Z" />
      </g>
    </svg>
  );
}

function ContactFieldIcon({ type }: { type: "email" | "phone" | "location" }) {
  const path = {
    email: (
      <>
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="m5 8 7 5 7-5" />
      </>
    ),
    phone: <path d="M6.5 5.5 9 4l2.2 4-1.4 1.1c.9 1.8 2.3 3.2 4.1 4.1l1.1-1.4 4 2.2-1.5 2.5c-.5.8-1.5 1.1-2.4.8-4.1-1.4-7.3-4.6-8.7-8.7-.3-.9 0-1.9.8-2.4Z" />,
    location: (
      <>
        <path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
  }[type];

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {path}
      </g>
    </svg>
  );
}

export default function BasicProfileEditPage() {
  const navigate = useNavigate();
  const [perfilData, setPerfilData] = useState<Perfil | null>(null);

  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [profesion, setProfesion] = useState("");
  const [titularProfesional, setTitularProfesional] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [biografia, setBiografia] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [sitioWebUrl, setSitioWebUrl] = useState("");
  const [visibilidad, setVisibilidad] = useState(DEFAULT_VISIBILITY);
  const [foto, setFoto] = useState<File | null>(null);
  const [existingPhoto, setExistingPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [serverError, setServerError] = useState("");
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<{
    nombres?: string;
    apellidos?: string;
    profesion?: string;
    titular_profesional?: string;
    telefono?: string;
    ubicacion?: string;
    biografia?: string;
    linkedin_url?: string;
    github_url?: string;
    sitio_web_url?: string;
  }>({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyProfile();
        const perfil = data.perfil;
        setPerfilData(perfil || null);

        if (perfil?.nombres || perfil?.apellidos) {
          setNombres(sanitizeLettersAndSpaces(perfil.nombres || ""));
          setApellidos(sanitizeLettersAndSpaces(perfil.apellidos || ""));
        } else if (perfil?.nombre_completo) {
          const legacyName = splitLegacyFullName(perfil.nombre_completo);
          setNombres(sanitizeLettersAndSpaces(legacyName.nombres));
          setApellidos(sanitizeLettersAndSpaces(legacyName.apellidos));
        }

        setProfesion(sanitizeLettersAndSpaces(perfil?.profesion || ""));
        setTitularProfesional(sanitizeLettersAndSpaces(perfil?.titular_profesional || ""));
        setTelefono(sanitizeDigits(perfil?.telefono || ""));
        setUbicacion(sanitizeLocationText(perfil?.ubicacion || ""));
        setBiografia(perfil?.biografia || "");
        setLinkedinUrl(perfil?.linkedin_url || "");
        setGithubUrl(perfil?.github_url || "");
        setSitioWebUrl(perfil?.sitio_web_url || "");
        setVisibilidad({ ...DEFAULT_VISIBILITY, ...(perfil?.visibilidad || {}) });
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
  const [titularProfesionalError, setTitularProfesionalError] = useState("");

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

  const handleTitularProfesionalChange = (value: string) => {
    const cleaned = sanitizeLettersAndSpaces(value);
    const fieldError = value !== cleaned ? onlyLettersMessage : "";
    setTitularProfesional(cleaned);
    setTitularProfesionalError(fieldError);
    setErrors((prev) => ({
      ...prev,
      titular_profesional: fieldError,
    }));
  };
  const handleBiografiaChange = (value: string) => {
    const nextValue = limitRichText(value, 1200);
    setBiografia(nextValue);
    setErrors((prev) => ({
      ...prev,
      biografia: validateBiography(nextValue),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = {
      nombres: validateRequired(nombres, "El nombre es obligatorio.") || errors.nombres,
      apellidos: validateRequired(apellidos, "Los apellidos son obligatorios.") || errors.apellidos,
      profesion: validateRequired(profesion, "La profesion es obligatoria.") || profesionError,
      titular_profesional: validateRequired(titularProfesional, "El rol o especialidad profesional es obligatorio.") || titularProfesionalError,
      telefono: validateBoliviaPhone(telefono),
      ubicacion: ubicacion.trim().length > 180 ? "La ubicacion no puede superar 180 caracteres." : "",
      biografia: validateBiography(biografia),
      linkedin_url: validateDomainUrl(linkedinUrl, ["linkedin.com", "www.linkedin.com"], "Ingresa una URL valida de LinkedIn."),
      github_url: validateDomainUrl(githubUrl, ["github.com", "www.github.com"], "Ingresa una URL valida de GitHub."),
      sitio_web_url: validateUrl(sitioWebUrl, "Ingresa una URL valida para tu sitio web."),
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
        titular_profesional: titularProfesional,
        telefono,
        ubicacion,
        biografia,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        sitio_web_url: sitioWebUrl,
        visibilidad,
        foto_perfil: foto,
      });

      setMessage("Informacion actualizada correctamente.");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err: unknown) {
      setServerError(getApiErrorMessage(err, "No se pudo actualizar el perfil."));
    }
  };

  return (
    <PrivateWorkspaceLayout
      active="profile"
      perfil={perfilData}
      title="Perfil"
      subtitle="Actualiza tu informacion publica, datos de contacto y presentacion profesional."
    >
      <section className="surface-card workspace-section-card profile-edit-card">
        <AlertMessage message={message || serverError} />

        <form id="basic-profile-edit-form" onSubmit={handleSubmit} className="form-stack">
          <section className="surface-card profile-personal-panel">
            <div className="professional-links-head">
              <h3>Informacion Personal</h3>
              <p>Datos basicos de tu perfil profesional</p>
            </div>

            <ProfilePhotoInput preview={preview} error={photoError} onFileChange={handlePhotoChange} />

            <div className="workspace-form-grid">
              <FormInput
                label="Nombre(s) *"
                value={nombres}
                onChange={handleNombresChange}
                error={errors.nombres}
                pattern={lettersPattern}
                title={onlyLettersMessage}
                inputMode="text"
              />
              <FormInput
                label="Apellidos *"
                value={apellidos}
                onChange={handleApellidosChange}
                error={errors.apellidos}
                pattern={lettersPattern}
                title={onlyLettersMessage}
                inputMode="text"
              />
            </div>

            <div className="workspace-form-grid">
              <FormInput
                label="Profesion/Titulo *"
                value={profesion}
                onChange={handleProfesionChange}
                error={errors.profesion}
                pattern={lettersPattern}
                title={onlyLettersMessage}
                inputMode="text"
              />

              <FormInput
                label="Rol o especialidad *"
                value={titularProfesional}
                onChange={handleTitularProfesionalChange}
                error={errors.titular_profesional}
                pattern={lettersPattern}
                title={onlyLettersMessage}
                inputMode="text"
              />
            </div>

            <RichTextEditor
              label="Biografia *"
              value={biografia}
              onChange={handleBiografiaChange}
              error={errors.biografia}
              placeholder="Describe en pocas lineas que haces, en que destacas y que tipo de proyectos impulsas."
            />
          </section>

          <section className="surface-card professional-links-panel contact-info-panel">
            <div className="professional-links-head">
              <h3>Informacion de Contacto</h3>
              <p>Como pueden contactarte</p>
            </div>

            <div className="professional-links-list">
              <label className="professional-link-field">
                <span>Correo Electronico *</span>
                <div className="professional-link-input is-readonly">
                  <ContactFieldIcon type="email" />
                  <input value={perfilData?.correo || ""} readOnly aria-readonly="true" />
                </div>
              </label>

              <label className="professional-link-field">
                <span>Telefono</span>
                <div className={`professional-link-input${errors.telefono ? " error" : ""}`}>
                  <ContactFieldIcon type="phone" />
                  <input
                    value={telefono}
                    onChange={(event) => setTelefono(sanitizeDigits(event.target.value))}
                    inputMode="tel"
                  />
                </div>
                {errors.telefono ? <p className="form-error">{errors.telefono}</p> : null}
              </label>

              <label className="professional-link-field">
                <span>Ubicacion</span>
                <div className={`professional-link-input${errors.ubicacion ? " error" : ""}`}>
                  <ContactFieldIcon type="location" />
                  <input
                    value={ubicacion}
                    onChange={(event) => setUbicacion(sanitizeLocationText(event.target.value))}
                    inputMode="text"
                  />
                </div>
                {errors.ubicacion ? <p className="form-error">{errors.ubicacion}</p> : null}
              </label>
            </div>
          </section>

          <section className="surface-card professional-links-panel">
            <div className="professional-links-head">
              <h3>Enlaces Profesionales</h3>
              <p>Tus perfiles en redes profesionales</p>
            </div>

            <div className="professional-links-list">
              <label className="professional-link-field">
                <span>LinkedIn</span>
                <div className="professional-link-input">
                  <SocialFieldIcon type="linkedin" />
                  <input
                    value={linkedinUrl}
                    onChange={(event) => setLinkedinUrl(event.target.value)}
                    inputMode="url"
                    placeholder="https://linkedin.com/in/usuario"
                  />
                </div>
                {errors.linkedin_url ? <p className="form-error">{errors.linkedin_url}</p> : null}
              </label>

              <label className="professional-link-field">
                <span>GitHub</span>
                <div className="professional-link-input">
                  <SocialFieldIcon type="github" />
                  <input
                    value={githubUrl}
                    onChange={(event) => setGithubUrl(event.target.value)}
                    inputMode="url"
                    placeholder="https://github.com/usuario"
                  />
                </div>
                {errors.github_url ? <p className="form-error">{errors.github_url}</p> : null}
              </label>

              <label className="professional-link-field">
                <span>Sitio Web Personal</span>
                <div className="professional-link-input">
                  <SocialFieldIcon type="web" />
                  <input
                    value={sitioWebUrl}
                    onChange={(event) => setSitioWebUrl(event.target.value)}
                    inputMode="url"
                    placeholder="https://miportafolio.com"
                  />
                </div>
                {errors.sitio_web_url ? <p className="form-error">{errors.sitio_web_url}</p> : null}
              </label>
            </div>
          </section>

          <section className="surface-card profile-security-strip">
            <div>
              <h3>Seguridad de la cuenta</h3>
              <p>Actualiza tu contraseña de acceso cuando sea necesario.</p>
            </div>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/perfil/cambiar-contraseña")}>
              Cambiar contraseña
            </button>
          </section>

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
    </PrivateWorkspaceLayout>
  );
}

