import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthMiniFooter from "../../components/auth/AuthMiniFooter";
import FormInput from "../../components/common/FormInput";
import AlertMessage from "../../components/common/AlertMessage";
import { validateEmail, validateRequired } from "../../utils/validations";
import { loginUser } from "../../api/auth";
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

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [storedRedirect] = useState(() => authStore.consumeRedirectNotice());

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errors, setErrors] = useState<{ correo?: string; contrasena?: string }>({});
  const [serverError, setServerError] = useState("");
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

  return (
    <div className="login-shell app-shell">
      <div className="page-section login-layout">
        <section className="login-showcase">
          <div className="login-brand">
            <div className="login-brand-mark login-brand-mark-plain">
              <img src={logo} alt="SpherLink" />
            </div>
            <strong>SpherLink</strong>
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

          <AlertMessage message={redirectMessage || serverError} />

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
