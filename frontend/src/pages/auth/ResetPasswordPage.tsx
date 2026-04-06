import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import FormInput from "../../components/common/FormInput";
import AlertMessage from "../../components/common/AlertMessage";
import { validatePassword } from "../../utils/validations";
import { resetPassword, validateResetToken } from "../../api/password";

export default function ResetPasswordPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();

  const [contrasena, setContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        await validateResetToken(token);
        setTokenValid(true);
      } catch (err: any) {
        setTokenValid(false);
        setServerError(err?.response?.data?.message || "El enlace no es válido.");
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(contrasena);
    if (passwordError) {
      setServerError(passwordError);
      return;
    }

    if (contrasena !== confirmacion) {
      setServerError("La confirmación de contraseña no coincide.");
      return;
    }

    try {
      const data = await resetPassword(token, contrasena, confirmacion);
      setMessage(data.message);
      setServerError("");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err: any) {
      setServerError(err?.response?.data?.message || "No se pudo restablecer la contraseña.");
    }
  };

  if (tokenValid === false) {
    return (
      <AuthLayout title="Restablecer contraseña" subtitle="Enlace inválido o expirado">
        <AlertMessage message={serverError} />
      </AuthLayout>
    );
  }

  if (tokenValid === null) {
    return <p style={{ padding: "40px" }}>Validando enlace...</p>;
  }

  return (
    <AuthLayout title="Restablecer contraseña" subtitle="Ingresa tu nueva contraseña">
      <AlertMessage message={message || serverError} />

      <form onSubmit={handleSubmit}>
        <FormInput
          label="Nueva contraseña"
          type="password"
          value={contrasena}
          onChange={setContrasena}
        />

        <FormInput
          label="Confirmar nueva contraseña"
          type="password"
          value={confirmacion}
          onChange={setConfirmacion}
        />

        <button type="submit" style={buttonPrimary}>
          Guardar contraseña
        </button>
      </form>
    </AuthLayout>
  );
}

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