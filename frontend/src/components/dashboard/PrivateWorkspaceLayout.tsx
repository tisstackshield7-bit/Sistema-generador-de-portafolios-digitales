import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpeg";
import { logoutUser } from "../../api/auth";
import { authStore } from "../../store/authStore";
import type { Perfil } from "../../types/profile";

type ActiveSection = "dashboard" | "projects" | "skills" | "experience" | "profile";

type Props = {
  active: ActiveSection;
  perfil: Perfil | null;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
};

function WorkspaceIcon({ kind }: { kind: "dashboard" | "projects" | "skills" | "experience" | "profile" | "logout" }) {
  const icons = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    projects: <path d="M4 7h5l2 2h9v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Zm4 5h8m-8 4h5" />,
    skills: <path d="M12 3a4 4 0 0 1 4 4c0 1.3-.6 2.5-1.5 3.2V14l-2.5 1-2.5-1v-3.8A4 4 0 0 1 8 7a4 4 0 0 1 4-4Zm-2 13 2 1 2-1v3l-2 2-2-2v-3Z" />,
    experience: <path d="M8 6V4h8v2m-9 3h10m-13 0h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9Zm6 0v11" />,
    profile: <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 9a7 7 0 0 1 14 0" />,
    logout: <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4m4-4 5-5-5-5m5 5H9" />,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="workspace-icon">
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {icons[kind]}
      </g>
    </svg>
  );
}

function getInitials(name?: string | null) {
  if (!name) return "PP";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function PrivateWorkspaceLayout({ active, perfil, title, subtitle, actions, children }: Props) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
    } finally {
      authStore.clearSession();
      navigate("/");
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", to: "/", icon: "dashboard" as const },
    { id: "projects", label: "Proyectos", to: "/en-proceso", icon: "projects" as const },
    { id: "skills", label: "Habilidades", to: "/perfil/habilidades", icon: "skills" as const },
    { id: "experience", label: "Experiencia", to: "/en-proceso", icon: "experience" as const },
    { id: "profile", label: "Perfil", to: "/perfil/editar", icon: "profile" as const },
  ];

  return (
    <div className="workspace-shell">
      <header className="workspace-topbar">
        <div className="page-section workspace-topbar-inner">
          <Link to="/" className="workspace-brand">
            <span className="workspace-brand-mark">
              <img src={logo} alt="Portfolio Pro" className="brand-logo" />
            </span>
            <span>Portfolio Pro</span>
          </Link>

          <div className="workspace-user">
            <div className="workspace-avatar">{getInitials(perfil?.nombre_completo)}</div>
            <div className="workspace-user-meta">
              <strong>{perfil?.nombre_completo || "Mi cuenta"}</strong>
              <span>{perfil?.profesion || "Perfil profesional"}</span>
            </div>
            <button type="button" className="workspace-logout" onClick={handleLogout}>
              <WorkspaceIcon kind="logout" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="page-section workspace-layout">
        <aside className="surface-card workspace-sidebar">
          <nav className="workspace-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`workspace-nav-item ${active === item.id ? "active" : ""}`}
                onClick={() => navigate(item.to)}
              >
                <WorkspaceIcon kind={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="workspace-sidebar-footer">
            <button type="button" className="workspace-nav-item" onClick={handleLogout}>
              <WorkspaceIcon kind="logout" />
              <span>Cerrar Sesion</span>
            </button>
          </div>
        </aside>

        <main className="workspace-main">
          {title || subtitle || actions ? (
            <section className="workspace-page-head">
              <div>
                {title ? <h1>{title}</h1> : null}
                {subtitle ? <p>{subtitle}</p> : null}
              </div>
              {actions ? <div className="workspace-page-actions">{actions}</div> : null}
            </section>
          ) : null}

          {children}
        </main>
      </div>
    </div>
  );
}
