import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authStore } from "../store/authStore";
import { getMyProfile, getPublicProfiles } from "../api/profile";
import { API_ORIGIN } from "../api/axios";
import { logoutUser } from "../api/auth";
import type { Perfil, PublicProfileCard } from "../types/profile";
import PrivateWorkspaceLayout from "../components/dashboard/PrivateWorkspaceLayout";
import "./HomePage.css";
import logo from "../assets/logo.jpeg";

function getInitials(name?: string | null) {
  if (!name) return "PF";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getProfileHighlights(profile: PublicProfileCard) {
  const visibleSkills = (profile.habilidades || []).slice(0, 3).map((skill) => skill.nombre);

  if (visibleSkills.length) {
    return visibleSkills;
  }

  const role = profile.titular_profesional || profile.profesion || "Perfil profesional";
  const compactRole = role.length > 28 ? `${role.slice(0, 28).trim()}...` : role;

  return [compactRole, "Perfil publico"].slice(0, 2);
}

function DashboardActionIcon({ kind }: { kind: "view" | "edit" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-action-icon">
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {kind === "view" ? (
          <>
            <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" />
            <circle cx="12" cy="12" r="3" />
          </>
        ) : (
          <>
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </>
        )}
      </g>
    </svg>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [publicProfiles, setPublicProfiles] = useState<PublicProfileCard[]>([]);
  const isAuth = authStore.isAuthenticated();

  useEffect(() => {
    if (!isAuth) return;
    getMyProfile()
      .then((data) => setPerfil(data.perfil || null))
      .catch(() => setPerfil(null));
  }, [isAuth]);

  useEffect(() => {
    getPublicProfiles()
      .then((data) => setPublicProfiles(data.perfiles || []))
      .catch(() => setPublicProfiles([]));
  }, []);

  const initials = useMemo(() => getInitials(perfil?.nombre_completo), [perfil]);
  const welcomeName = useMemo(() => perfil?.nombre_completo?.split(" ")[0] || "Profesional", [perfil]);
  const featuredProfiles = publicProfiles.slice(0, 6);
  const technicalSkills = perfil?.habilidades?.filter((skill) => skill.tipo === "tecnica") || [];
  const softSkills = perfil?.habilidades?.filter((skill) => skill.tipo === "blanda") || [];

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
    } finally {
      authStore.clearSession();
      navigate("/");
    }
  };

  const visitorView = (
    <div className="page-section home-content">
      <div className="visitor-layout">
        <div className="visitor-main">
          <section className="hero-panel surface-card hero-panel-compact">
            <div className="hero-copy">
              <p className="section-label">Red profesional</p>
              <h1>Descubre perfiles profesionales con una presentacion mas clara.</h1>
          <p className="section-copy">
            Explora portafolios y perfiles desde una interfaz mas limpia, sobria y enfocada en el contenido.
          </p>
        </div>
      </section>

          <section className="search-highlight surface-card">
            <div>
              <p className="section-label">Buscador</p>
              <h2 className="section-title">Busca perfiles o habilidades</h2>
            </div>
            <div className="search-box">
              <span className="search-icon" aria-hidden="true">o</span>
              <input className="form-input" type="text" placeholder="Buscar perfiles, tecnologias o roles" />
              <button className="btn btn-primary" type="button">Explorar</button>
            </div>
          </section>

          <section className="surface-card section-panel">
            <div className="section-head">
              <div>
                <p className="section-label">Perfiles destacados</p>
                <h2 className="section-title">Explora perfiles recomendados</h2>
              </div>
            </div>

            <div className="profile-grid two-columns">
              {featuredProfiles.length ? (
                featuredProfiles.map((profile) => (
                  <article key={profile.id} className="network-card">
                    <div className="network-card-top">
                      {profile.foto_perfil ? (
                        <img
                          src={`${API_ORIGIN}/storage/${profile.foto_perfil}`}
                          alt={profile.nombre_completo}
                          className="network-avatar"
                        />
                      ) : (
                        <div className="network-avatar fallback-avatar">{getInitials(profile.nombre_completo)}</div>
                      )}
                      <div>
                        <h3>{profile.nombre_completo}</h3>
                        <p>{profile.titular_profesional || profile.profesion}</p>
                      </div>
                    </div>
                    <p className="network-summary">
                      {profile.biografia?.slice(0, 100) || "Perfil disponible dentro de la plataforma."}
                    </p>
                    <div className="profile-pill-list">
                      {getProfileHighlights(profile).map((item) => (
                        <span key={`${profile.id}-${item}`} className="profile-pill neutral">
                          {item}
                        </span>
                      ))}
                    </div>
                    <button className="btn btn-secondary btn-block" onClick={() => navigate(`/perfil-publico/${profile.slug}`)}>
                      Ver perfil
                    </button>
                  </article>
                ))
              ) : (
                <article className="empty-state-card">
                  <h3>Aun no hay perfiles destacados</h3>
                  <p className="section-copy">Crea tu portafolio para aparecer aqui.</p>
                  <button className="btn btn-primary" onClick={() => navigate("/register")}>
                    Registrarte
                  </button>
                </article>
              )}
            </div>
          </section>
        </div>

        <aside className="visitor-aside">
          <section className="surface-card cta-panel cta-side">
            <div>
              <p className="section-label">Comienza hoy</p>
              <h2 className="section-title">Crea una presencia profesional mas ordenada.</h2>
              <p className="section-copy">Registra tu cuenta y completa tu perfil con una interfaz mas cuidada.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );

  const loggedView = (
    <PrivateWorkspaceLayout
      active="dashboard"
      perfil={perfil}
      title=""
      subtitle=""
    >
      <section className="dashboard-hero-panel">
        <div className="dashboard-hero-copy">
          <h1 className="dashboard-title">¡Bienvenido/a, {perfil?.nombre_completo || welcomeName}!</h1>
          <p className="dashboard-hero-role">{perfil?.profesion || "Completa tu perfil profesional"}</p>
          <div className="dashboard-hero-actions">
            <button className="btn btn-secondary dashboard-ghost-button" onClick={() => navigate(perfil?.slug ? `/perfil-publico/${perfil.slug}` : "/perfil")}>
              <DashboardActionIcon kind="view" />
              Ver Portafolio Público
            </button>
            <button className="btn btn-secondary dashboard-ghost-button" onClick={() => navigate("/perfil/editar")}>
              <DashboardActionIcon kind="edit" />
              Editar Perfil
            </button>
          </div>
        </div>
      </section>

      <section className="dashboard-stat-grid sprint-grid">
        <article className="surface-card dashboard-stat-card">
          <div className="dashboard-stat-head">
            <h2>Proyectos</h2>
          </div>
          <strong>0</strong>
          <p>Disponible en proximos sprints</p>
        </article>
        <article className="surface-card dashboard-stat-card">
          <div className="dashboard-stat-head">
            <h2>Habilidades</h2>
          </div>
          <strong>{perfil?.habilidades?.length || 0}</strong>
          <p>{technicalSkills.length} tecnicas, {softSkills.length} blandas</p>
        </article>
        <article className="surface-card dashboard-stat-card">
          <div className="dashboard-stat-head">
            <h2>Experiencias</h2>
          </div>
          <strong>0</strong>
          <p>Disponible en proximos sprints</p>
        </article>
      </section>

      <section className="surface-card dashboard-profile-summary-card">
        <div className="dashboard-summary-head">
          <div>
            <p className="section-label">Resumen del perfil</p>
            <h2>Informacion basica de tu portafolio profesional</h2>
          </div>
        </div>

        <div className="dashboard-profile-summary">
          {perfil?.foto_perfil ? (
            <img src={`${API_ORIGIN}/storage/${perfil.foto_perfil}`} alt={perfil.nombre_completo} className="dashboard-profile-avatar" />
          ) : (
            <div className="dashboard-profile-avatar fallback-avatar">{initials}</div>
          )}

          <div className="dashboard-profile-copy">
            <h3>{perfil?.nombre_completo || "Completa tu perfil"}</h3>
            <p className="dashboard-profile-role">{perfil?.profesion || "Agrega tu profesion"}</p>
            <p className="section-copy">
              {perfil?.biografia || "Agrega una biografia clara para que tu perfil se vea mas profesional y completo."}
            </p>
          </div>
        </div>
      </section>

      <section className="surface-card dashboard-panel dashboard-skills-panel">
        <div className="section-head dashboard-skills-head">
          <div>
            <p className="section-label">Habilidades principales</p>
            <h2 className="section-title">Tus competencias tecnicas y blandas</h2>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate("/perfil/habilidades")}>
            Gestionar
          </button>
        </div>
        {perfil?.habilidades?.length ? (
          <div className="dashboard-skill-groups">
            <div className="dashboard-skill-group">
              <h3>Habilidades Tecnicas</h3>
              <div className="dashboard-skill-chip-list">
                {technicalSkills.length ? (
                  technicalSkills.map((skill) => (
                    <span key={skill.id} className="dashboard-skill-chip dark">
                      {skill.nombre} - {skill.nivel_dominio}
                    </span>
                  ))
                ) : (
                  <span className="dashboard-skill-chip muted">Aun no registraste habilidades tecnicas</span>
                )}
              </div>
            </div>

            <div className="dashboard-skill-group">
              <h3>Habilidades Blandas</h3>
              <div className="dashboard-skill-chip-list">
                {softSkills.length ? (
                  softSkills.map((skill) => (
                    <span key={skill.id} className="dashboard-skill-chip light">
                      {skill.nombre} - {skill.nivel_dominio}
                    </span>
                  ))
                ) : (
                  <span className="dashboard-skill-chip muted">Aun no registraste habilidades blandas</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-empty-note">
            Registra habilidades tecnicas y blandas para reforzar tu portafolio profesional.
          </div>
        )}
      </section>
    </PrivateWorkspaceLayout>
  );

  if (isAuth) {
    return loggedView;
  }

  return (
    <div className="home-shell app-shell">
      <header className="home-nav">
        <div className="page-section nav-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">
              <img src={logo} alt="Portafolio Digital de Proyectos" className="brand-logo" />
            </span>
            <span>PortaFolioPro</span>
          </Link>

          <div className={`nav-search ${isAuth ? "show" : ""}`}>
            <span className="search-icon" aria-hidden="true">o</span>
            <input className="form-input" type="text" placeholder="Buscar perfiles o habilidades" />
          </div>

          <nav className="nav-links">
            <Link to="/">Inicio</Link>
            <Link to="/en-proceso">Explorar</Link>
            {isAuth ? <Link to="/perfil/editar">Mi perfil</Link> : <Link to="/login">Ingresar</Link>}
          </nav>

          <div className="nav-actions">
            {!isAuth ? (
              <>
                <Link to="/login" className="btn btn-secondary">Iniciar sesion</Link>
                <Link to="/register" className="btn btn-primary">Registrarte</Link>
              </>
            ) : (
              <>
                <button className="icon-button" type="button" aria-label="Notificaciones">•</button>
                <div className="user-menu">
                  <div className="avatar-badge">{initials}</div>
                  <div className="user-meta">
                    <strong>{welcomeName}</strong>
                    <button className="btn btn-tertiary" type="button" onClick={handleLogout}>
                      Cerrar sesion
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main>{visitorView}</main>
    </div>
  );
}
