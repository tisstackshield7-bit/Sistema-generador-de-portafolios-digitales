import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthMiniFooter from "../../components/auth/AuthMiniFooter";
import FormInput from "../../components/common/FormInput";
import AlertMessage from "../../components/common/AlertMessage";
import { validateEmail, validatePassword } from "../../utils/validations";
import { registerUser } from "../../api/auth";
import { authStore } from "../../store/authStore";
import logo from "../../assets/logof.png";

function CheckBadge() {
  return (
    <span className="login-feature-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path
          d="M7 12.5 10.3 16 17 8.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [contraseña, setcontraseña] = useState("");
  const [errors, setErrors] = useState<{ correo?: string; contraseña?: string }>({});
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const correoError = validateEmail(correo);
    const contraseñaError = validatePassword(contraseña);

    setErrors({ correo: correoError, contraseña: contraseñaError });
    setServerError("");

    if (correoError || contraseñaError) return;

    try {
      const data = await registerUser({ correo, contraseña });
      authStore.setSession(data.token, data.usuario);
      navigate(data.redirect_to || "/perfil/crear");
    } catch (error: unknown) {
      const apiError = error as {
        response?: {
          data?: {
            message?: string;
            errors?: Record<string, string[] | string>;
          };
        };
      };
      const correoApiError = apiError?.response?.data?.errors?.correo;
      const correoMessage = Array.isArray(correoApiError) ? correoApiError[0] : correoApiError;
      const msg = correoMessage || apiError?.response?.data?.message || "Ocurrio un error al registrar.";
      if (correoMessage) {
        setErrors((prev) => ({ ...prev, correo: String(correoMessage) }));
      }
      setServerError(msg);
    }
  };

  return (
    <div className="login-shell register-shell app-shell">
      <div className="page-section login-layout">
        <section className="login-showcase register-showcase">
          <div className="login-brand">
            <div className="login-brand-mark login-brand-mark-plain">
              <img src={logo} alt="SpherLink" />
            </div>
            <strong>SpherLink</strong>
          </div>

          <div className="login-showcase-copy">
            <h1>
              <span className="register-title-line">Acelera tu carrera</span>
              <span className="register-title-line">creando tu</span>
              <span className="register-title-line register-title-accent">identidad digital.</span>
            </h1>
            <p>
              <span className="register-copy-line">Configura tu portafolio en menos de 5</span>
              <span className="register-copy-line">minutos y comienza a compartir tu</span>
              <span className="register-copy-line">experiencia con el mundo.</span>
            </p>
          </div>

          <div className="login-feature-list">
            <article className="login-feature-card">
              <CheckBadge />
              <div>
                <strong>Totalmente Gratis</strong>
                <p>Crea tu perfil y accede a las funciones principales sin costo alguno.</p>
              </div>
            </article>

            <article className="login-feature-card">
              <CheckBadge />
              <div>
                <strong>Alta visibilidad</strong>
                <p>Posiciona tus habilidades para que reclutadores te encuentren facilmente.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="login-panel">
          <Link to="/" className="login-back-link">
            <span aria-hidden="true">←</span>
            <span>Volver al inicio</span>
          </Link>

          <div className="login-panel-head">
            <h2>Crear cuenta</h2>
            <p>Comienza tu presencia profesional con un registro rapido y claro.</p>
          </div>

          <AlertMessage message={serverError} />

          <form onSubmit={handleSubmit} className="form-stack login-form">
            <FormInput
              label="Correo electronico"
              value={correo}
              onChange={setCorreo}
              error={errors.correo}
              placeholder="tu-correo@ejemplo.com"
            />

            <FormInput
              label="contraseña"
              type="password"
              value={contraseña}
              onChange={setcontraseña}
              error={errors.contraseña}
              placeholder="Usa mayusculas, numeros y simbolos"
              togglePassword
            />

            <button type="submit" className="btn btn-primary btn-block login-submit-button">
              Continuar
            </button>
          </form>

          <div className="login-register-row">
            <span>Ya tienes una cuenta?</span>
            <Link to="/login">Iniciar sesion</Link>
          </div>
        </section>
      </div>
      <AuthMiniFooter />
    </div>
  );
}
