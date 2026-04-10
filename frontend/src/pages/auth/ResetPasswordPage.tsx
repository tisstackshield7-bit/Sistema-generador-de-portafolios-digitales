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
        setServerError(err?.response?.data?.message || "El enlace no es valido.");
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
      setServerError("La confirmacion de contrasena no coincide.");
      return;
    }

    try {
      const data = await resetPassword(token, contrasena, confirmacion);
      setMessage(data.message);
      setServerError("");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err: any) {
      setServerError(err?.response?.data?.message || "No se pudo restablecer la contrasena.");
    }
  };

  if (tokenValid === false) {
    return (
      <AuthLayout title="Restablecer contrasena" subtitle="Enlace invalido o expirado">
        <AlertMessage message={serverError} />
      </AuthLayout>
    );
  }

  if (tokenValid === null) {
    return (
      <div className="auth-shell app-shell">
        <div className="page-section surface-card auth-card">
          <p className="section-copy">Validando enlace...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout title="Nueva contrasena" subtitle="Define una contrasena segura para recuperar el acceso.">
      <AlertMessage message={message || serverError} />

      <form onSubmit={handleSubmit} className="form-stack">
        <FormInput label="Nueva contrasena" type="password" value={contrasena} onChange={setContrasena} />

        <FormInput label="Confirmar contrasena" type="password" value={confirmacion} onChange={setConfirmacion} />

        <button type="submit" className="btn btn-primary btn-block">
          Guardar contrasena
        </button>
      </form>
    </AuthLayout>
  );
}

