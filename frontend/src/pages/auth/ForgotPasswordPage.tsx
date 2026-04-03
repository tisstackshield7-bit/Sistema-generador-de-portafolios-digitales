import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import FormInput from "../../components/common/FormInput";
import AlertMessage from "../../components/common/AlertMessage";
import { validateEmail } from "../../utils/validations";
import { requestPasswordRecovery } from "../../api/password";

export default function ForgotPasswordPage() {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(correo);
    setError(emailError);
    setMessage("");
    setServerError("");

    if (emailError) return;

    try {
      const data = await requestPasswordRecovery(correo);
      setMessage(data.message);
    } catch (err: any) {
      setServerError(err?.response?.data?.message || "Ocurrió un error.");
    }
  };

  return (
    <AuthLayout
      title="¿Olvidaste tu contraseña?"
      subtitle="Ingresa tu correo electrónico registrado"
    >
      <AlertMessage message={message || serverError} />

      <form onSubmit={handleSubmit}>
        <FormInput
          label="Correo electrónico"
          value={correo}
          onChange={setCorreo}
          error={error}
          placeholder="usuario@ejemplo.com"
        />

        <button type="submit" style={buttonPrimary}>Enviar</button>
      </form>

      <p style={{ marginTop: "16px" }}>
        <Link to="/login">Volver</Link>
      </p>
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