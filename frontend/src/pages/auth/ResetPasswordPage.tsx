import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import FormInput from "../../components/common/FormInput";
import AlertMessage from "../../components/common/AlertMessage";
import { validatePassword } from "../../utils/validations";
import { resetPassword, validateResetToken } from "../../api/password";

type ApiErrorData = {
  message?: string;
};

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorData | undefined;
    return data?.message || fallback;
  }

  return fallback;
}

export default function ResetPasswordPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const correo = searchParams.get("correo") || "";

  const [contrasena, setContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      if (!correo) {
        setTokenValid(false);
        setServerError("El enlace de recuperacion es incompleto.");
        return;
      }

      try {
        await validateResetToken(token, correo);
        setTokenValid(true);
      } catch (err: unknown) {
        setTokenValid(false);
        setServerError(getApiErrorMessage(err, "El enlace no es valido."));
      }
    };

    checkToken();
  }, [correo, token]);

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
      const data = await resetPassword(correo, token, contrasena, confirmacion);
      setMessage(data.message);
      setServerError("");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err: unknown) {
      setServerError(getApiErrorMessage(err, "No se pudo restablecer la contrasena."));
    }
  };

  if (tokenValid === false) {
    return (
      <AuthLayout title="Restablecer contrasena" subtitle="El enlace de recuperacion no es valido o ya expiro.">
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
    <AuthLayout title="Nueva contrasena" subtitle="Define una contrasena segura. Recuerda que el enlace de recuperacion solo dura 30 minutos.">
      <AlertMessage message={message || serverError} />

      <form onSubmit={handleSubmit} className="form-stack">
        <FormInput label="Nueva contrasena" type="password" value={contrasena} onChange={setContrasena} togglePassword />

        <FormInput label="Confirmar contrasena" type="password" value={confirmacion} onChange={setConfirmacion} togglePassword />

        <button type="submit" className="btn btn-primary btn-block">
          Guardar contrasena
        </button>
      </form>
    </AuthLayout>
  );
}
