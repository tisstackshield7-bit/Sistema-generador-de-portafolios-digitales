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
          <div className="flex flex-col gap-5">
  <div className="flex items-center gap-4">
    <img
      src={logo}
      alt="Portafolio Digital de Proyectos"
      className="h-20 w-20 rounded-2xl object-cover border border-slate-200 bg-white shadow-sm"
    />

    <div>
      <p className="section-label !mb-1">Portafolio Digital de Proyectos de Software</p>
    </div>
  </div>

  <div>
    <h1>Un acceso mas limpio para tu perfil profesional.</h1>
    <p className="section-copy">
      Unete a nuestra comunidad de mentes creativas. Al registrarte, podras explorar proyectos exclusivos, acceder a recursos y conectar con ideas que estan transformando la industria. Tu proximo gran paso comienza con un clic.
    </p>
  </div>
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
