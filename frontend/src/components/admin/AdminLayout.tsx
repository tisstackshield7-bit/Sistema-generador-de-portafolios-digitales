import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../../api/auth";
import { authStore } from "../../store/authStore";

type ActiveSection = "dashboard" | "users" | "reports";

type Props = {
  active: ActiveSection;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

function AdminIcon({ kind }: { kind: "dashboard" | "users" | "reports" | "logout" }) {
  const icons = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    users: (
      <>
        <path d="M16 19a4 4 0 0 0-8 0" />
        <circle cx="12" cy="9" r="3.2" />
        <path d="M5 19a4 4 0 0 1 2.2-3.6M19 19a4 4 0 0 0-2.2-3.6" />
      </>
    ),
    reports: (
      <>
        <path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
      </>
    ),
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

export default function AdminLayout({ active, title, subtitle, actions, children }: Props) {
  const navigate = useNavigate();
  const user = authStore.getUser();
  const displayName = user?.nombre || "Administrador del Sistema";
  const displayLabel = user?.correo || "Panel administrativo";
  const initial = displayName.charAt(0).toUpperCase() || "A";

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
    { id: "dashboard", label: "Dashboard", to: "/admin/dashboard", icon: "dashboard" as const },
    { id: "users", label: "Usuarios", to: "/admin/usuarios", icon: "users" as const },
    { id: "reports", label: "Reportes", to: "/admin/reportes", icon: "reports" as const },
  ];

  return (
    <div className="workspace-shell admin-shell">
      <header className="workspace-topbar admin-topbar">
        <div className="page-section workspace-topbar-inner">
          <Link to="/" className="workspace-brand">
            <span className="workspace-brand-mark">P</span>
            <span>
              Portfo<span>lio Pro</span>
            </span>
          </Link>

          <div className="workspace-user">
            <div className="workspace-avatar admin-avatar">{initial}</div>
            <div className="workspace-user-meta">
              <strong>{displayName}</strong>
              <span>{displayLabel}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="page-section workspace-layout admin-layout">
        <aside className="surface-card workspace-sidebar admin-sidebar">
          <nav className="workspace-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`workspace-nav-item ${active === item.id ? "active" : ""}`}
                onClick={() => navigate(item.to)}
              >
                <AdminIcon kind={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="workspace-sidebar-footer">
            <button type="button" className="workspace-nav-item" onClick={handleLogout}>
              <AdminIcon kind="logout" />
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
