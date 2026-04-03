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

  const handlePhotoChange = (file: File | null) => {
    const error = validateProfilePhoto(file);
    setPhotoError(error);
    if (!error) setFoto(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = {
      nombres: validateRequired(nombres, "El nombre es obligatorio."),
      apellidos: validateRequired(apellidos, "Los apellidos son obligatorios."),
      profesion: validateRequired(profesion, "La profesión es obligatoria."),
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
    <div style={pageWrapper}>
      <div style={card}>
        <h1>Completa tu perfil</h1>
        <p>Ingresa tu información básica para que otros puedan conocerte.</p>

        <AlertMessage message={serverError} />

        <form onSubmit={handleSubmit}>
          <FormInput
            label="Nombre(s)"
            value={nombres}
            onChange={setNombres}
            error={errors.nombres}
            placeholder="Ej. Juan Daniel"
          />

          <FormInput
            label="Apellidos"
            value={apellidos}
            onChange={setApellidos}
            error={errors.apellidos}
            placeholder="Ej. Vásquez Casana"
          />

          <FormInput
            label="Profesión / Título"
            value={profesion}
            onChange={setProfesion}
            error={errors.profesion}
            placeholder="Ej. Ingeniería de Sistemas"
          />

          <FormTextarea
            label="Biografía"
            value={biografia}
            onChange={(value) => {
              if (value.length <= 500) setBiografia(value);
            }}
            error={errors.biografia}
            placeholder="Escribe una breve descripción profesional..."
          />

          <BioCounter value={biografia} />

          <ProfilePhotoInput
            preview={preview}
            error={photoError}
            onFileChange={handlePhotoChange}
          />

          <button type="submit" style={buttonPrimary}>
            Guardar y continuar
          </button>
        </form>
      </div>
    </div>
  );
}

const pageWrapper: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f8fafc",
  padding: "40px",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: "700px",
  background: "#fff",
  borderRadius: "16px",
  padding: "32px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const buttonPrimary: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};