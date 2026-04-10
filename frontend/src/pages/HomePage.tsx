import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authStore } from "../store/authStore";
import { getMyProfile, getPublicProfiles } from "../api/profile";
import { API_ORIGIN } from "../api/axios";
import { logoutUser } from "../api/auth";
import type { Perfil } from "../types/profile";
import "./HomePage.css";

type PublicPortfolio = {
  id: number;
  nombre_completo: string;
  profesion: string;
  titular_profesional?: string | null;
  biografia: string;
  foto_perfil?: string | null;
  slug: string;
};

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

function getProfileSkills(profile: PublicPortfolio) {
  const base = profile.titular_profesional || profile.profesion || "Desarrollador";
  const tokens = base.split(/[\s/,-]+/).filter((token) => token.length > 3);
  return [...tokens.slice(0, 2), "Portafolio"].slice(0, 3);
}

export default function HomePage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [publicProfiles, setPublicProfiles] = useState<PublicPortfolio[]>([]);
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
  const profileChecks = [
    { label: "Informacion basica", done: Boolean(perfil?.nombre_completo && perfil?.profesion) },
    { label: "Biografia", done: Boolean(perfil?.biografia) },
    { label: "Foto de perfil", done: Boolean(perfil?.foto_perfil) },
  ];
  const tips = [
    "Completa tu biografia con un resumen corto y claro.",
    "Usa una foto profesional para dar mas confianza.",
    "Mantén tu informacion actualizada antes de compartir tu perfil.",
  ];

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
                      {getProfileSkills(profile).map((skill) => (
                        <span key={`${profile.id}-${skill}`} className="profile-pill neutral">
                          {skill}
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
            <div className="cta-actions">
              <button className="btn btn-primary btn-block" onClick={() => navigate("/register")}>
                Registrarte
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );

  const loggedView = (
    <div className="page-section home-content">
      <div className="dashboard-grid simplified-dashboard">
        <aside className="dashboard-column left">
          <section className="surface-card dashboard-panel">
            <div className="profile-summary">
              {perfil?.foto_perfil ? (
                <img src={`${API_ORIGIN}/storage/${perfil.foto_perfil}`} alt={perfil.nombre_completo} className="summary-avatar" />
              ) : (
                <div className="summary-avatar fallback-avatar">{initials}</div>
              )}
              <div>
                <h2>{perfil?.nombre_completo || "Completa tu perfil"}</h2>
                <p>{perfil?.profesion || "Agrega tu profesion"}</p>
                <span className="meta-text">Perfil profesional</span>
              </div>
            </div>
            <button className="btn btn-secondary btn-block" onClick={() => navigate("/perfil/editar")}>
              Editar perfil
            </button>
          </section>
        </aside>

        <section className="dashboard-column center">
          <section className="surface-card dashboard-panel">
            <div className="section-head">
              <div>
                <p className="section-label">Inicio</p>
                <h1 className="dashboard-title">Bienvenido, {welcomeName}</h1>
              </div>
            </div>
            <p className="section-copy">Revisa tu informacion y manten una presentacion clara y profesional.</p>
          </section>

          <section className="surface-card dashboard-panel">
            <div className="section-head">
              <div>
                <p className="section-label">Portafolio</p>
                <h2 className="section-title">Vista previa de tu perfil</h2>
              </div>
              <Link to="/perfil" className="section-link">Ver perfil completo</Link>
            </div>
            <div className="portfolio-preview">
              <div>
                <h3>{perfil?.nombre_completo || "Tu nombre completo"}</h3>
                <p className="preview-role">{perfil?.profesion || "Agrega un titulo profesional"}</p>
                <p className="section-copy">
                  {perfil?.biografia || "Tu resumen profesional aparecera aqui cuando completes tu perfil."}
                </p>
              </div>
            </div>
          </section>
        </section>

        <aside className="dashboard-column right">
          <section className="surface-card dashboard-panel">
            <p className="section-label">Acciones</p>
            <div className="action-stack">
              <button className="btn btn-secondary btn-block" onClick={() => navigate("/perfil")}>
                Ver mi perfil
              </button>
              <button className="btn btn-secondary btn-block" onClick={() => navigate("/perfil/editar")}>
                Editar informacion
              </button>
            </div>
          </section>

          <section className="surface-card dashboard-panel">
            <p className="section-label">Estado de perfil</p>
            <div className="mini-list">
              {profileChecks.map((item) => (
                <div key={item.label} className="mini-list-item simple-status-item">
                  <span className={`status-dot ${item.done ? "done" : ""}`} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card dashboard-panel">
            <p className="section-label">Consejos</p>
            <div className="mini-list">
              {tips.map((tip) => (
                <div key={tip} className="tip-card compact-tip">
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );

  return (
    <div className="home-shell app-shell">
      <header className="home-nav">
        <div className="page-section nav-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">P</span>
            <span>PortaFolioPro</span>
          </Link>

          <div className={`nav-search ${isAuth ? "show" : ""}`}>
            <span className="search-icon" aria-hidden="true">o</span>
            <input className="form-input" type="text" placeholder="Buscar perfiles o habilidades" />
          </div>

          <nav className="nav-links">
            <Link to="/">Inicio</Link>
            <Link to="/en-proceso">Explorar</Link>
            {isAuth ? <Link to="/perfil">Mi perfil</Link> : <Link to="/login">Ingresar</Link>}
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

      <main>{isAuth ? loggedView : visitorView}</main>
    </div>
  );
}
