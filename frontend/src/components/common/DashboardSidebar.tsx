import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../api/auth";
import { authStore } from "../../store/authStore";

type Props = {
  activePage: "dashboard" | "proyectos" | "habilidades" | "experiencia" | "perfil";
};

export default function DashboardSidebar({ activePage }: Props) {
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
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="3" y="3" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
      action: () => navigate("/"),
    },
    {
      id: "proyectos",
      label: "Proyectos",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="3" y="5" width="18" height="3" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <rect x="3" y="10.5" width="18" height="3" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <rect x="3" y="16" width="18" height="3" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
      action: () => navigate("/en-proceso"),
    },
    {
      id: "habilidades",
      label: "Habilidades",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M7 4.5C7 3.67 7.67 3 8.5 3h7c.83 0 1.5.67 1.5 1.5V12c0 1.38-.56 2.63-1.46 3.54l-3.04 3.04a.75.75 0 0 1-1.06 0L8.96 15.54A5.007 5.007 0 0 1 7 12V4.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8.5 7.5h7" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8.5 10.5h4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
      action: () => navigate("/habilidades"),
    },
    {
      id: "experiencia",
      label: "Experiencia",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M7 6V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8.5 12.5h7" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
      action: () => navigate("/en-proceso"),
    },
    {
      id: "perfil",
      label: "Perfil",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M5 20c0-3.866 3.582-7 8-7s8 3.134 8 7" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
      action: () => navigate("/perfil"),
    },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <span>Portfolio Pro</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-nav-item ${activePage === item.id ? "sidebar-nav-item--active" : ""}`}
            onClick={item.action}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button type="button" className="sidebar-logout" onClick={handleLogout}>
        <span>↪</span>
        <span>Cerrar Sesión</span>
      </button>
    </aside>
  );
}
