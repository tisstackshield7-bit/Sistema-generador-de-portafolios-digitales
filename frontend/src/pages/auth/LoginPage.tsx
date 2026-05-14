import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthMiniFooter from "../../components/auth/AuthMiniFooter";
import FormInput from "../../components/common/FormInput";
import AlertMessage from "../../components/common/AlertMessage";
import { validateEmail, validateRequired } from "../../utils/validations";
import { buildGithubAuthUrl, buildGoogleAuthUrl, loginUser } from "../../api/auth";
import { authStore } from "../../store/authStore";

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

function GithubMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="login-social-svg">
      <path
        d="M12 3.5a8.5 8.5 0 0 0-2.7 16.6c.4.1.6-.2.6-.4v-1.5c-2.3.5-2.8-1-2.8-1-.4-.9-.9-1.2-.9-1.2-.8-.5.1-.5.1-.5.8.1 1.3.9 1.3.9.8 1.3 2 1 2.4.8.1-.6.3-1 .5-1.2-1.8-.2-3.7-.9-3.7-4a3.1 3.1 0 0 1 .8-2.2 2.9 2.9 0 0 1 .1-2.1s.7-.2 2.3.8a8 8 0 0 1 4.2 0c1.6-1 2.3-.8 2.3-.8.4.9.1 1.8.1 2.1.5.6.8 1.3.8 2.2 0 3.1-1.9 3.8-3.7 4 .3.3.6.8.6 1.6v2.3c0 .3.2.5.6.4A8.5 8.5 0 0 0 12 3.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="login-social-svg">
      <path
        d="M21.8 12.2c0-.7-.1-1.2-.2-1.8H12v3.4h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.3 3-7.3Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.9-.9 6.5-2.5l-3.3-2.6c-.9.6-2 .9-3.2.9-2.5 0-4.7-1.7-5.5-4H3.1v2.7A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.5 13.8a6 6 0 0 1 0-3.7V7.4H3.1a10 10 0 0 0 0 9l3.4-2.6Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.2c1.4 0 2.6.5 3.6 1.4l2.7-2.7A10 10 0 0 0 3.1 7.4L6.5 10c.8-2.4 3-3.8 5.5-3.8Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [storedRedirect] = useState(() => authStore.consumeRedirectNotice());

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errors, setErrors] = useState<{ correo?: string; contrasena?: string }>({});
  const [serverError, setServerError] = useState("");
  const githubError = new URLSearchParams(location.search).get("github_error") || "";
  const googleError = new URLSearchParams(location.search).get("google_error") || "";
  const redirectMessage = (location.state as { message?: string; from?: string } | null)?.message || storedRedirect.message || "";
  const redirectTo = (location.state as { message?: string; from?: string } | null)?.from || storedRedirect.from || "/";

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
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Credenciales incorrectas.";
      setServerError(msg);
    }
  };

  const handleGoogleLogin = () => {
    window.location.assign(buildGoogleAuthUrl("login"));
  };

  const handleGithubLogin = () => {
    window.location.assign(buildGithubAuthUrl("login"));
  };

  return (
    <div className="login-shell app-shell">
      <div className="page-section login-layout">
        <section className="login-showcase">
          <div className="login-brand">
            <div className="login-brand-mark login-brand-mark-plain">
              <span>P</span>
            </div>
            <strong>PortaFolio<span>Pro</span></strong>
          </div>

          <div className="login-showcase-copy">
            <h1 className="login-title-structured">
              <span className="login-title-line">Destaca tu talento</span>
              <span className="login-title-line">con <span className="login-title-accent">evidencias</span></span>
              <span className="login-title-line login-title-accent">reales.</span>
            </h1>
            <p>
              <span className="login-copy-line">Unete a miles de profesionales que ya estan</span>
              <span className="login-copy-line">conectando con las mejores empresas</span>
              <span className="login-copy-line">gracias a un portafolio estructurado y</span>
              <span className="login-copy-line">verificable.</span>
            </p>
          </div>

          <div className="login-feature-list">
            <article className="login-feature-card">
              <CheckBadge />
              <div>
                <strong>Perfil centralizado</strong>
                <p>Toda tu experiencia, proyectos y habilidades en un enlace unico y elegante.</p>
              </div>
            </article>

            <article className="login-feature-card">
              <CheckBadge />
              <div>
                <strong>Portafolios verificables</strong>
                <p>Adjunta certificados y enlaces que demuestren que realmente sabes lo que haces.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="login-panel">
          <Link to="/" className="login-back-link">
            <span aria-hidden="true">{"\u2190"}</span>
            <span>Volver al inicio</span>
          </Link>

          <div className="login-panel-head">
            <h2>Bienvenido de nuevo</h2>
            <p>Ingresa tus credenciales para acceder a tu panel de control.</p>
          </div>

          <AlertMessage message={githubError || googleError || redirectMessage || serverError} />

          <div className="login-social-row">
            <button type="button" className="login-social-button" onClick={handleGithubLogin}>
              <GithubMark />
              <span>GitHub</span>
            </button>
            <button type="button" className="login-social-button" onClick={handleGoogleLogin}>
              <GoogleMark />
              <span>Google</span>
            </button>
          </div>

          <div className="login-divider">
            <span>O INICIA SESION CON CORREO</span>
          </div>

          <form onSubmit={handleSubmit} className="form-stack login-form">
            <FormInput
              label="Correo electronico"
              value={correo}
              onChange={setCorreo}
              error={errors.correo}
              placeholder="tu-correo@ejemplo.com"
            />

            <div className="login-password-head">
              <label className="form-label">Contrasena</label>
              <Link to="/recuperar-contrasena">Olvidaste tu contrasena?</Link>
            </div>

            <FormInput
              label=""
              type="password"
              value={contrasena}
              onChange={setContrasena}
              error={errors.contrasena}
              placeholder="Ingresa tu contrasena"
              togglePassword
            />

            <button type="submit" className="btn btn-primary btn-block login-submit-button">
              Ingresar a mi cuenta
            </button>
          </form>

          <div className="login-register-row">
            <span>Aun no tienes una cuenta?</span>
            <Link to="/register">Registrate gratis</Link>
          </div>
        </section>
      </div>
      <AuthMiniFooter />
    </div>
  );
}
