import type { ReactNode } from "react";

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
          <div>
            <p className="section-label">PortaFolioPro</p>
            <h1>Un acceso mas limpio para tu perfil profesional.</h1>
            <p className="section-copy">
              Esta vista ahora prioriza jerarquia visual, menos ruido y una presentacion mas sobria.
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
