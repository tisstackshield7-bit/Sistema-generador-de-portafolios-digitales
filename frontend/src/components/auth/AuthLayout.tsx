import type { ReactNode } from "react";
import logo from "../../assets/logo.jpeg";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="auth-shell app-shell">
      <div className="page-section auth-grid">
        <section className="surface-card auth-hero">
          <div className="auth-hero-brand">
            <img src={logo} alt="Portfolio Pro" />
            <div>
              <p className="section-label">Portfolio Pro</p>
              <strong>Portafolios profesionales verificables</strong>
            </div>
          </div>

          <div className="auth-hero-copy">
            <h1>Construye una presencia profesional clara y confiable.</h1>
            <p className="section-copy">
              Gestiona tu perfil, publica habilidades, agrega proyectos y comparte evidencias que respalden tu experiencia.
            </p>
          </div>
        </section>

        <section className="auth-card">
          <p className="section-label">Acceso</p>
          <h2>{title}</h2>
          <p className="section-copy">{subtitle}</p>
          <div className="form-stack">{children}</div>
        </section>
      </div>
    </div>
  );
}
