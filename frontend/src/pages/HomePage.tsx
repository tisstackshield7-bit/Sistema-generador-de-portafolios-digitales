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

export const popularTechnologies = ["React", "Laravel", "Vue", "Java", "Python", "Angular", "UI/UX", "Docker", "SQL"];

export const quickActions = [
  "Crear tu portafolio",
  "Mostrar proyectos",
  "Registrar habilidades",
  "Publicar experiencia",
  "Compartir certificaciones",
  "Incluir CV en línea y GitHub",
];

const tips = [
  "Asegúrate de compartir tu CV actualizado.",
  "Completa tu GitHub con tus proyectos más recientes.",
  "Añade recomendaciones de colegas para ganar confianza.",
];

export default function HomePage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [publicProfiles, setPublicProfiles] = useState<PublicPortfolio[]>([]);
  const isAuth = authStore.isAuthenticated();

  const initials = useMemo(
    () =>
      perfil?.nombre_completo
        ? perfil.nombre_completo
            .split(" ")
            .filter(Boolean)
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "VT",
    [perfil]
  );

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

  const welcomeName = useMemo(() => perfil?.nombre_completo?.split(" ")[0] || "visitante", [perfil]);

  const renderPortfolioCards = (ctaLabel = "Ver portafolio") => (
    <div className="cards-grid">
      {(publicProfiles.length ? publicProfiles : []).map((p) => (
        <div key={p.id} className="card portfolio-card">
          {p.foto_perfil ? (
            <img src={`${API_ORIGIN}/storage/${p.foto_perfil}`} alt={p.nombre_completo} className="avatar-img" />
          ) : (
            <div className="avatar-fallback">{p.nombre_completo.slice(0, 1)}</div>
          )}
          <div className="portfolio-main">
            <div className="portfolio-name">{p.nombre_completo}</div>
            <div className="portfolio-role">{p.titular_profesional || p.profesion}</div>
            <p className="portfolio-bio">
              {p.biografia?.slice(0, 90) || "Sin biografía"}
              {p.biografia?.length > 90 ? "..." : ""}
            </p>
          </div>
          <button
            className="btn btn-outline portfolio-btn"
            onClick={() => navigate(`/perfil-publico/${p.slug}`)}
          >
            {ctaLabel}
          </button>
        </div>
      ))}
      {!publicProfiles.length && (
        <div className="card portfolio-card empty">
          <div className="portfolio-main">
            <div className="portfolio-name">No hay portafolios todavía</div>
            <p className="portfolio-bio">Crea el tuyo y aparecerá aquí.</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/register")}>
            Crear portafolio
          </button>
        </div>
      )}
    </div>
  );

  const visitorView = (
    <div className="home-grid visitor-grid">
      <section className="main-column">
        <div className="card hero">
          <p className="eyebrow">Idea de forma: visitante</p>
          <h1>Descubre portafolios digitales de proyectos de software</h1>
          <p className="muted">Explora portafolios, proyectos, habilidades y acreditaciones desde una sola vista.</p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => navigate("/login")}>
              Iniciar sesión
            </button>
            <button className="btn btn-ghost" onClick={() => navigate("/register")}>
              Regístrate
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Portafolios destacados</p>
              <h3>Explora perfiles recomendados</h3>
            </div>
          </div>
          {renderPortfolioCards()}
        </div>

      </section>

      <aside className="side-column">
        <div className="card sticky">
          <p className="eyebrow">Completa tu perfil profesional</p>
          <p className="muted">Únete a la comunidad y muestra tu experiencia.</p>
          <button className="btn btn-primary" onClick={() => navigate("/register")}>
            Únete a la comunidad
          </button>
        </div>
      </aside>
    </div>
  );

  const loggedView = (
    <div className="home-grid logged">
      <section className="main-column">
        <div className="card hero logged-hero">
          <div>
            <p className="eyebrow">Hola, {welcomeName}</p>
            <h1>¿Quieres revisar tu portafolio?</h1>
            <p className="muted">Gestiona tu perfil, habilidades y proyectos desde un solo lugar.</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/perfil/editar")}>
            Editar mi portafolio
          </button>
        </div>

        <div className="card">
          <div className="card-header">
            <p className="eyebrow">Vista previa de mi portafolio</p>
            <Link to="/perfil/editar" className="link-muted">
              Gestiona tus datos
            </Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            {perfil?.foto_perfil ? (
              <img
                src={`${API_ORIGIN}/storage/${perfil.foto_perfil}`}
                alt={perfil.nombre_completo}
                className="avatar-img"
                style={{ width: 72, height: 72, borderRadius: "16px" }}
              />
            ) : (
              <div className="avatar-fallback" style={{ width: 72, height: 72, borderRadius: "16px" }}>
                {initials}
              </div>
            )}
            <div>
              <div className="portfolio-name">{perfil?.nombre_completo}</div>
              <div className="portfolio-role">{perfil?.profesion}</div>
              <p className="portfolio-bio" style={{ marginTop: 6 }}>{perfil?.biografia}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button className="btn btn-outline" onClick={() => navigate("/perfil")}>Ver mi perfil</button>
            <button className="btn btn-primary" onClick={() => navigate("/perfil/editar")}>Editar perfil</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <p className="eyebrow">Estado de mi perfil</p>
          </div>
          <ul className="checklist">
            <li>
              <span className="check-icon">✔</span> Información básica completa
            </li>
            <li>
              <span className="check-icon">✔</span> Biografía agregada
            </li>
            <li>
              <span className="check-icon">✔</span> Foto de perfil agregada
            </li>
          </ul>
        </div>
      </section>

      <aside className="side-column">
        <div className="card">
          <p className="eyebrow">Acciones rápidas</p>
          <div className="side-buttons">
            <button className="btn btn-outline full" onClick={() => navigate("/perfil")}>
              Ver perfil
            </button>
            <button className="btn btn-outline full" onClick={() => navigate("/perfil/editar")}>
              Editar perfil
            </button>
          </div>
        </div>

        <div className="card">
          <p className="eyebrow">Consejos</p>
          <ul className="simple-list">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );

  return (
    <div className="home-shell">
      <header className="home-nav">
        <div className="brand">PortaFolioPro</div>
        <div className="nav-search">
          <input type="text" placeholder="Buscar portafolios, talentos" />
        </div>
        <div className="nav-actions">
          <Link to="/en-proceso">Explorar</Link>
          {!isAuth ? (
            <>
              <Link to="/login" className="btn btn-outline small">
                Iniciar sesión
              </Link>
              <Link to="/register" className="btn btn-primary small">
                Regístrate
              </Link>
            </>
          ) : (
            <>
              <Link to="/perfil" className="btn btn-outline small">
                Mi perfil
              </Link>
              <button
                className="btn btn-primary small"
                onClick={async () => {
                  try {
                    await logoutUser();
                  } catch {
                  } finally {
                    authStore.clearSession();
                    navigate("/");
                  }
                }}
              >
                Cerrar sesión
              </button>
              <div className="avatar-badge">{initials}</div>
            </>
          )}
        </div>
      </header>

      <main className="home-body">{isAuth ? loggedView : visitorView}</main>
    </div>
  );
}
