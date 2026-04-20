import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authStore } from "../store/authStore";
import { getMyProfile, getPublicProfiles } from "../api/profile";
import { getSkills } from "../api/skills";
import { API_ORIGIN } from "../api/axios";
import { logoutUser } from "../api/auth";
import DashboardSidebar from "../components/common/DashboardSidebar";
import type { Perfil } from "../types/profile";
import type { Skill } from "../types/skill";
import "./HomePage.css";
import logo from "../assets/logo.jpeg";

type PublicPortfolio = {
  id: number;
  nombre_completo: string;
  profesion: string;
  titular_profesional?: string | null;
  biografia: string;
  foto_perfil?: string | null;
  slug: string;
};

type HomePageProps = {
  showDashboard?: boolean;
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

export default function HomePage({ showDashboard = false }: HomePageProps) {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [publicProfiles, setPublicProfiles] = useState<PublicPortfolio[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const isAuth = authStore.isAuthenticated();

  useEffect(() => {
    if (!isAuth) return;
    getMyProfile()
      .then((data) => setPerfil(data.perfil || null))
      .catch(() => setPerfil(null));
  }, [isAuth]);

  useEffect(() => {
    if (!isAuth) return;
    getSkills()
      .then((data) => setSkills(data.data || []))
      .catch(() => setSkills([]));
  }, [isAuth]);

  useEffect(() => {
    getPublicProfiles()
      .then((data) => setPublicProfiles(data.perfiles || []))
      .catch(() => setPublicProfiles([]));
  }, []);

  const initials = useMemo(() => getInitials(perfil?.nombre_completo), [perfil]);
  const welcomeName = useMemo(() => perfil?.nombre_completo?.split(" ")[0] || "Profesional", [perfil]);
  
  const filteredProfiles = useMemo(() => {
    if (!searchTerm.trim()) return publicProfiles.slice(0, 6);
    return publicProfiles.filter((profile) => 
      profile.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.profesion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile.titular_profesional?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    ).slice(0, 12);
  }, [publicProfiles, searchTerm]);
  
  const featuredProfiles = filteredProfiles;
  const showDashboardView = showDashboard && isAuth;
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
    <div className="home-shell">
      <section className="hero-panel-visitor">
        <div className="hero-content-visitor">
          <h1 className="hero-title-visitor">Descubre Talento Profesional</h1>
          <p className="hero-subtitle-visitor">Explora portafolios de profesionales destacados en tecnología, diseño y desarrollo</p>
          <div className="search-bar-container">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nombre o profesión..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          <p className="profiles-count">{publicProfiles.length} profesionales disponibles</p>
        </div>
      </section>

      <div className="page-section profiles-section-visitor">
        <div className="profiles-section-header">
          <div>
            <p className="section-label">Perfiles destacados</p>
            <h2 className="section-title-visitor">Los perfiles que más buscan las empresas</h2>
          </div>
          <p className="section-copy section-copy-visitor">Seleccionamos estos profesionales por su experiencia, habilidades y presencia destacada.</p>
        </div>
        <div className="profiles-grid-visitor">
          {featuredProfiles.length ? (
            featuredProfiles.map((profile) => (
              <article key={profile.id} className="profile-card-visitor">
                <div className="profile-card-header-visitor">
                  {profile.foto_perfil ? (
                    <img
                      src={`${API_ORIGIN}/storage/${profile.foto_perfil}`}
                      alt={profile.nombre_completo}
                      className="profile-card-image-visitor"
                    />
                  ) : (
                    <div className="profile-card-image-visitor fallback-avatar">
                      {getInitials(profile.nombre_completo)}
                    </div>
                  )}
                </div>
                <div className="profile-card-body-visitor">
                  <h3 className="profile-card-name-visitor">{profile.nombre_completo}</h3>
                  <p className="profile-card-role-visitor">{profile.titular_profesional || profile.profesion}</p>
                  <p className="profile-card-location-visitor">📍 Madrid, España</p>
                  <p className="profile-card-bio-visitor">
                    {profile.biografia?.slice(0, 100) || "Perfil disponible dentro de la plataforma."}
                  </p>
                  <div>
                    <p className="profile-card-skills-label">Habilidades</p>
                    <div className="profile-pill-list">
                      {getProfileSkills(profile).map((skill) => (
                        <span key={`${profile.id}-${skill}`} className="profile-pill neutral">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="profile-card-stats">
                    <div className="profile-card-stat">
                      <div className="profile-card-stat-value">{getProfileSkills(profile).length}</div>
                      <div className="profile-card-stat-label">Habilidades</div>
                    </div>
                    <div className="profile-card-stat">
                      <div className="profile-card-stat-value">{(profile.id % 4) + 1}</div>
                      <div className="profile-card-stat-label">Proyectos</div>
                    </div>
                    <div className="profile-card-icons">
                      <button className="icon-btn" type="button">in</button>
                      <button className="icon-btn" type="button">gh</button>
                      <button className="icon-btn" type="button">🌐</button>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary profile-card-button" 
                    onClick={() => navigate(`/perfil-publico/${profile.slug}`)}
                  >
                    Ver Portafolio Completo
                  </button>
                </div>
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
      </div>
    </div>
  );

  const loggedHomeView = (
    <div className="home-shell">
      <section className="hero-panel-visitor">
        <div className="hero-content-visitor">
          <h1 className="hero-title-visitor">Hola de nuevo, {welcomeName}</h1>
          <p className="hero-subtitle-visitor">Busca y explora perfiles de profesionales destacados</p>
          <div className="search-bar-container">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nombre o profesión..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
        </div>
      </section>

      <div className="page-section profiles-section-visitor">
        <div className="profiles-section-header">
          <p className="section-label">Perfiles destacados</p>
          <h2 className="section-title-visitor">Qué perfiles están liderando la lista</h2>
          <p className="section-copy section-copy-visitor">Perfiles seleccionados por sus habilidades, experiencia y profesionalismo.</p>
        </div>
        <div className="profiles-grid-visitor">
          {featuredProfiles.length ? (
            featuredProfiles.map((profile) => (
              <article key={profile.id} className="profile-card-visitor">
                <div className="profile-card-header-visitor">
                  {profile.foto_perfil ? (
                    <img
                      src={`${API_ORIGIN}/storage/${profile.foto_perfil}`}
                      alt={profile.nombre_completo}
                      className="profile-card-image-visitor"
                    />
                  ) : (
                    <div className="profile-card-image-visitor fallback-avatar">
                      {getInitials(profile.nombre_completo)}
                    </div>
                  )}
                </div>
                <div className="profile-card-body-visitor">
                  <h3 className="profile-card-name-visitor">{profile.nombre_completo}</h3>
                  <p className="profile-card-role-visitor">{profile.titular_profesional || profile.profesion}</p>
                  <p className="profile-card-location-visitor">📍 Madrid, España</p>
                  <p className="profile-card-bio-visitor">
                    {profile.biografia?.slice(0, 100) || "Perfil disponible dentro de la plataforma."}
                  </p>
                  <div>
                    <p className="profile-card-skills-label">Habilidades</p>
                    <div className="profile-pill-list">
                      {getProfileSkills(profile).map((skill) => (
                        <span key={`${profile.id}-${skill}`} className="profile-pill neutral">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="profile-card-stats">
                    <div className="profile-card-stat">
                      <div className="profile-card-stat-value">{getProfileSkills(profile).length}</div>
                      <div className="profile-card-stat-label">Habilidades</div>
                    </div>
                    <div className="profile-card-stat">
                      <div className="profile-card-stat-value">{(profile.id % 4) + 1}</div>
                      <div className="profile-card-stat-label">Proyectos</div>
                    </div>
                    <div className="profile-card-icons">
                      <button className="icon-btn" type="button">in</button>
                      <button className="icon-btn" type="button">gh</button>
                      <button className="icon-btn" type="button">🌐</button>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary profile-card-button" 
                    onClick={() => navigate(`/perfil-publico/${profile.slug}`)}
                  >
                    Ver Portafolio Completo
                  </button>
                </div>
              </article>
            ))
          ) : (
            <article className="empty-state-card">
              <h3>Aun no hay perfiles destacados</h3>
              <p className="section-copy">Crea tu portafolio para aparecer aqui.</p>
              <button className="btn btn-primary" onClick={() => navigate("/perfil/editar")}>Editar perfil</button>
            </article>
          )}
        </div>
      </div>
    </div>
  );

  const loggedView = (
    <div className="dashboard-with-sidebar">
      <DashboardSidebar activePage="dashboard" />
      
      <div className="dashboard-main-content">
        <header className="dashboard-header">
          <div>
            <h1>¡Bienvenido/a, {welcomeName}!</h1>
            <p>{perfil?.profesion || "Profesional"}</p>
          </div>
          <div className="dashboard-header-actions">
            <button className="btn btn-secondary" onClick={() => navigate("/perfil")}>Ver Portafolio Público</button>
            <button className="btn btn-primary" onClick={() => navigate("/perfil/editar")}>Editar Perfil</button>
          </div>
        </header>

        <section className="summary-cards-grid">
          <div className="summary-card">
            <div className="summary-card-header">
              <div className="summary-card-title">Proyectos</div>
              <div className="summary-card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <rect x="3" y="5" width="18" height="3" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="3" y="10.5" width="18" height="3" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="3" y="16" width="18" height="3" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </div>
            </div>
            <div className="summary-card-value">3</div>
            <div className="summary-card-subtitle">3 total (3 visibles)</div>
          </div>

          <div className="summary-card">
            <div className="summary-card-header">
              <div className="summary-card-title">Habilidades</div>
              <div className="summary-card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M7 4.5C7 3.67 7.67 3 8.5 3h7c.83 0 1.5.67 1.5 1.5V12c0 1.38-.56 2.63-1.46 3.54l-3.04 3.04a.75.75 0 0 1-1.06 0L8.96 15.54A5.007 5.007 0 0 1 7 12V4.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M8.5 7.5h7" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M8.5 10.5h4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </div>
            </div>
            <div className="summary-card-value">{skills.length}</div>
            <div className="summary-card-subtitle">
              {skills.filter((s) => s.tipo === "tecnica").length} técnicas, {skills.filter((s) => s.tipo === "blanda").length} blandas
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-card-header">
              <div className="summary-card-title">Experiencias</div>
              <div className="summary-card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M7 6V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M8.5 12.5h7" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </div>
            </div>
            <div className="summary-card-value">4</div>
            <div className="summary-card-subtitle">2 laborales, 2 académicas</div>
          </div>
        </section>

        <section className="surface-card dashboard-panel">
          <div className="section-head">
            <div>
              <p className="section-label">Resumen del Perfil</p>
              <h2>Información básica de tu portafolio profesional</h2>
            </div>
          </div>

          <div className="profile-resume-container">
            <div className="profile-resume-info">
              {perfil?.foto_perfil ? (
                <img
                  src={`${API_ORIGIN}/storage/${perfil.foto_perfil}`}
                  alt={perfil.nombre_completo}
                  className="resume-avatar"
                />
              ) : (
                <div className="resume-avatar fallback-avatar">{initials}</div>
              )}
              <div>
                <h3>{perfil?.nombre_completo}</h3>
                <p className="resume-role">{perfil?.profesion}</p>
                <p className="resume-bio">{perfil?.biografia}</p>
              </div>
            </div>

            {/* Enlaces Profesionales */}
            <div className="resume-links">
              <p className="section-label">Enlaces Profesionales:</p>
              <div className="links-grid">
                <a href="#" className="link-button">LinkedIn</a>
                <a href="#" className="link-button">GitHub</a>
                <a href="#" className="link-button">Sitio Web</a>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card dashboard-panel">
          <div className="section-head">
            <div>
              <p className="section-label">Proyectos Recientes</p>
              <h2>Tus últimos proyectos agregados</h2>
            </div>
            <a href="#" className="section-link">
              Ver Todos
            </a>
          </div>
          <p className="section-copy">Los proyectos aparecerán aquí cuando agregues algunos.</p>
        </section>
      </div>
    </div>
  );

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
                <button className="btn btn-primary" type="button" onClick={() => navigate("/dashboard")}>Ir al Dashboard</button>
                <div className="user-menu">
                  {perfil?.foto_perfil ? (
                    <img src={`${API_ORIGIN}/storage/${perfil.foto_perfil}`} alt={perfil.nombre_completo} className="avatar-badge" />
                  ) : (
                    <div className="avatar-badge">{initials}</div>
                  )}
                  <div className="user-meta">
                    <strong>{perfil?.nombre_completo || welcomeName}</strong>
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

      <main>{showDashboardView ? loggedView : isAuth ? loggedHomeView : visitorView}</main>
    </div>
  );
}
