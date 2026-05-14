import { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "../../components/common/FormInput";
import AlertMessage from "../../components/common/AlertMessage";
import { validateEmail } from "../../utils/validations";
import { requestPasswordRecovery } from "../../api/password";

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
              <span>P</span>
            </div>
            <strong>PortaFolio<span>Pro</span></strong>
          </div>

          <div className="login-showcase-copy">
            <h1>
              <span className="recovery-title-line">Recupera tu</span>
              <span className="recovery-title-line">acceso de forma</span>
              <span className="recovery-title-line recovery-title-accent">rapida y segura.</span>
            </h1>
            <p>
              <span className="recovery-copy-line">No pierdas el contacto con tus</span>
              <span className="recovery-copy-line">oportunidades. Restablece tu contrasena y</span>
              <span className="recovery-copy-line">sigue destacando tu talento al mundo.</span>
            </p>
          </div>

          <div className="login-feature-list">
            <article className="login-feature-card">
              <CheckBadge />
              <div>
                <strong>Acceso protegido</strong>
                <p>Te enviaremos una clave temporal unica y con tiempo limite para proteger tu identidad.</p>
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
              Te enviaremos una contrasena temporal de 8 caracteres a tu correo. La contrasena dura 30 minutos y la usaras para iniciar sesion antes de cambiarla.
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
              Enviar contrasena temporal
            </button>
          </form>

          <div className="login-register-row recovery-footer-row">
            <span>Quieres volver?</span>
            <Link to="/login">Ir a inicio de sesion</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
