import { useState } from "react";
import { Link } from "react-router-dom";
import AuthMiniFooter from "../../components/auth/AuthMiniFooter";
import FormInput from "../../components/common/FormInput";
import AlertMessage from "../../components/common/AlertMessage";
import { validateEmail } from "../../utils/validations";
import { requestPasswordRecovery } from "../../api/password";
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
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setServerError(apiError?.response?.data?.message || "Ocurrio un error.");
    }
  };

  return (
    <div className="login-shell app-shell">
      <div className="page-section login-layout recovery-layout">
        <section className="login-showcase recovery-showcase">
          <div className="login-brand">
            <div className="login-brand-mark login-brand-mark-plain">
              <img src={logo} alt="SpherLink" />
            </div>
            <strong>SpherLink</strong>
          </div>

          <div className="login-showcase-copy">
            <h1>
              <span className="recovery-title-line">Recupera el acceso</span>
              <span className="recovery-title-line">a tu perfil</span>
              <span className="recovery-title-line recovery-title-accent">sin friccion.</span>
            </h1>
            <p>
              <span className="recovery-copy-line">Te enviaremos una clave temporal para</span>
              <span className="recovery-copy-line">volver a entrar, proteger tu cuenta y</span>
              <span className="recovery-copy-line">actualizar tu contraseña enseguida.</span>
            </p>
          </div>

          <div className="login-feature-list">
            <article className="login-feature-card">
              <CheckBadge />
              <div>
                <strong>Clave temporal segura</strong>
                <p>Recibe una contraseña de uso limitado para recuperar el acceso sin exponer tu cuenta.</p>
              </div>
            </article>

            <article className="login-feature-card">
              <CheckBadge />
              <div>
                <strong>Recuperacion guiada</strong>
                <p>Entra, cambia tu contraseña y vuelve a tu panel con el mismo flujo que usa el resto de la plataforma.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="login-panel recovery-panel">
          <Link to="/" className="login-back-link">
            <span aria-hidden="true">{"\u2190"}</span>
            <span>Volver al inicio</span>
          </Link>

          <div className="login-panel-head recovery-panel-head">
            <span className="recovery-kicker">ACCESO</span>
            <h2>Recuperar acceso</h2>
            <p>
              Ingresa tu correo y te enviaremos una contraseña temporal de 8 caracteres. Tendra una vigencia de 30 minutos para que puedas iniciar sesion y cambiarla.
            </p>
          </div>

          <AlertMessage message={message || serverError} />

          <form onSubmit={handleSubmit} className="form-stack login-form">
            <FormInput
              label="Correo electronico"
              value={correo}
              onChange={setCorreo}
              error={error}
              placeholder="usuario@ejemplo.com"
            />

            <button type="submit" className="btn btn-primary btn-block login-submit-button">
              Enviar contraseña temporal
            </button>
          </form>

          <div className="login-register-row recovery-footer-row">
            <span>Quieres volver?</span>
            <Link to="/login">Ir a inicio de sesion</Link>
          </div>
        </section>
      </div>
      <AuthMiniFooter />
    </div>
  );
}
