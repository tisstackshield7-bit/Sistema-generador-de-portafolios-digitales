import { useEffect, useMemo, useState } from "react";
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
          setNombres(parts.slice(0, -1).join(" ") || parts[0] || "");
          setApellidos(parts.slice(-1).join(" ") || "");
        }

        setProfesion(perfil?.profesion || "");
        setBiografia(perfil?.biografia || "");
        setExistingPhoto(perfil?.foto_perfil || null);
      } catch (err: any) {
        setServerError("No se pudo cargar el perfil.");
      }
    };

    loadProfile();
  }, []);

  const preview = useMemo(() => {
    if (foto) return URL.createObjectURL(foto);
    if (existingPhoto) return `http://127.0.0.1:8000/storage/${existingPhoto}`;
    return null;
  }, [foto, existingPhoto]);

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

      setMessage("Información actualizada correctamente.");
      setTimeout(() => navigate("/perfil"), 900);
    } catch (err: any) {
      setServerError(err?.response?.data?.message || "No se pudo actualizar el perfil.");
    }
  };

  return (
    <div style={pageWrapper}>
      <div style={card}>
        <h1>Editar información básica del perfil</h1>

        <AlertMessage message={message || serverError} />

        <form onSubmit={handleSubmit}>
          <ProfilePhotoInput
            preview={preview}
            error={photoError}
            onFileChange={handlePhotoChange}
          />

          <FormInput
            label="Nombre(s)"
            value={nombres}
            onChange={setNombres}
            error={errors.nombres}
          />

          <FormInput
            label="Apellidos"
            value={apellidos}
            onChange={setApellidos}
            error={errors.apellidos}
          />

          <FormInput
            label="Profesión / Título"
            value={profesion}
            onChange={setProfesion}
            error={errors.profesion}
          />

          <FormTextarea
            label="Biografía"
            value={biografia}
            onChange={(value) => {
              if (value.length <= 500) setBiografia(value);
            }}
            error={errors.biografia}
          />

          <BioCounter value={biografia} />

          <div style={{ display: "flex", gap: "12px" }}>
            <button type="button" style={buttonSecondary} onClick={() => navigate("/perfil")}>
              Cancelar
            </button>

            <button type="submit" style={buttonPrimary}>
              Guardar cambios
            </button>
          </div>
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
  flex: 1,
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const buttonSecondary: React.CSSProperties = {
  flex: 1,
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#0f172a",
  fontWeight: 700,
  cursor: "pointer",
};