import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import FormInput from "../../components/common/FormInput";
import AlertMessage from "../../components/common/AlertMessage";
import { validateEmail, validateRequired } from "../../utils/validations";
import { loginUser } from "../../api/auth";
import { authStore } from "../../store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [storedRedirect] = useState(() => authStore.consumeRedirectNotice());

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errors, setErrors] = useState<{ correo?: string; contrasena?: string }>({});
  const [serverError, setServerError] = useState("");
  const redirectMessage = (location.state as any)?.message || storedRedirect.message || "";
  const redirectTo = (location.state as any)?.from || storedRedirect.from || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const correoError = validateEmail(correo);
    const contrasenaError = validateRequired(contrasena, "La contrasena es obligatoria.");

    setErrors({
      correo: correoError,
      contrasena: contrasenaError,
    });

    setServerError("");

    if (correoError || contrasenaError) return;

    try {
      const data = await loginUser({ correo, contrasena });
      authStore.setSession(data.token, data.usuario);
      navigate(data.redirect_to || redirectTo);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Credenciales incorrectas.";
      setServerError(msg);
    }
  };

  return (
    <AuthLayout title="Iniciar sesion" subtitle="Accede a tu perfil, revisa tu portafolio y continua tu progreso profesional.">
      <AlertMessage message={redirectMessage || serverError} />

      <form onSubmit={handleSubmit} className="form-stack">
        <FormInput
          label="Correo electronico"
          value={correo}
          onChange={setCorreo}
          error={errors.correo}
          placeholder="tu-correo@ejemplo.com"
        />

        <FormInput
          label="Contrasena"
          type="password"
          value={contrasena}
          onChange={setContrasena}
          error={errors.contrasena}
          placeholder="Ingresa tu contrasena"
          togglePassword
        />

        <div className="inline-link-row">
          <Link to="/recuperar-contrasena">Olvide mi contrasena</Link>
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Ingresar
        </button>
      </form>

      <div className="auth-links-row">
        <span className="meta-text">Aun no tienes cuenta?</span>
        <Link to="/register">Registrarte</Link>
      </div>
    </AuthLayout>
  );
}
