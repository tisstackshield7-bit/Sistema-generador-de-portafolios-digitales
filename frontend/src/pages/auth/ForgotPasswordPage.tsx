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
      setServerError(err?.response?.data?.message || "Ocurrio un error.");
    }
  };

  return (
    <AuthLayout title="Recuperar acceso" subtitle="Te enviaremos una contrasena temporal de 8 caracteres a tu correo. La contrasena dura 30 minutos y la usaras para iniciar sesion antes de cambiarla.">
      <AlertMessage message={message || serverError} />

      <form onSubmit={handleSubmit} className="form-stack">
        <FormInput
          label="Correo electronico"
          value={correo}
          onChange={setCorreo}
          error={error}
          placeholder="usuario@ejemplo.com"
        />

        <button type="submit" className="btn btn-primary btn-block">
          Enviar contrasena temporal
        </button>
      </form>

      <div className="auth-links-row">
        <span className="meta-text">Quieres volver?</span>
        <Link to="/login">Ir a inicio de sesion</Link>
      </div>
    </AuthLayout>
  );
}

