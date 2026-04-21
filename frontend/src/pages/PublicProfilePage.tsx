import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_ORIGIN } from "../api/axios";
import { getPublicProfileBySlug } from "../api/profile";
import type { Perfil } from "../types/profile";
import type { Skill } from "../types/skill";

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

function RibbonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="public-portfolio-icon">
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4.5" />
        <path d="m9.5 12 1.2 8L12 18.3 13.3 20l1.2-8" />
      </g>
    </svg>
  );
}

function PortfolioIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="public-link-icon">
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M9 5V3.8A1.8 1.8 0 0 1 10.8 2h2.4A1.8 1.8 0 0 1 15 3.8V5" />
        <path d="M3 11h18" />
      </g>
    </svg>
  );
}

function getSkillTone(skill: Skill) {
  if (skill.nivel_dominio === "Avanzado") return "orange";
  if (skill.nivel_dominio === "Intermedio") return "green";
  return skill.tipo === "tecnica" ? "blue" : "violet";
}

export default function PublicProfilePage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const title = perfil?.titular_profesional || perfil?.profesion || "Perfil profesional";
  const technicalSkills = perfil?.habilidades?.filter((skill) => skill.tipo === "tecnica" && skill.visible_publico) || [];
  const softSkills = perfil?.habilidades?.filter((skill) => skill.tipo === "blanda" && skill.visible_publico) || [];
  const summaryText = perfil?.biografia || "Perfil publico disponible dentro de la plataforma.";

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!slug) {
          setPerfil(null);
          return;
        }

        const data = await getPublicProfileBySlug(slug);
        setPerfil(data.perfil || null);
      } catch {
        setPerfil(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [slug]);

  if (loading) {
    return (
      <div className="profile-page-shell app-shell">
        <div className="page-section surface-card auth-card">
          <p className="section-copy">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="profile-page-shell app-shell">
        <div className="page-section public-profile-card">
          <h1>Perfil no encontrado</h1>
          <p className="section-copy">No encontramos informacion publica para este portafolio.</p>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-portfolio-shell app-shell">
      <section className="public-portfolio-hero">
        <div className="page-section public-portfolio-hero-inner">
          <div className="public-portfolio-identity">
            {perfil.foto_perfil ? (
              <img
                src={`${API_ORIGIN}/storage/${perfil.foto_perfil}`}
                alt={perfil.nombre_completo}
                className="public-portfolio-avatar"
              />
            ) : (
              <div className="public-portfolio-avatar fallback-avatar">{getInitials(perfil.nombre_completo)}</div>
            )}

            <div className="public-portfolio-copy">
              <h1>{perfil.nombre_completo}</h1>
              <p className="public-portfolio-role">{title}</p>
              <p className="public-portfolio-bio">{summaryText}</p>

              <div className="public-portfolio-meta-row">
                <span className="public-portfolio-meta-pill">
                  <PortfolioIcon />
                  <span>{technicalSkills.length} habilidades tecnicas</span>
                </span>
                <span className="public-portfolio-meta-pill">
                  <RibbonIcon />
                  <span>{softSkills.length} habilidades blandas</span>
                </span>
              </div>

              <div className="public-portfolio-tag-row">
                <button type="button" className="public-portfolio-tag-pill" onClick={() => navigate("/")}>
                  Volver al inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="page-section public-portfolio-content">
        <section className="public-skills-intro">
          <div className="public-skills-title-mark">
            <RibbonIcon />
          </div>
          <div>
            <h2>Habilidades</h2>
          </div>
        </section>

        <section className="public-skills-layout">
          <article className="surface-card public-skills-card">
            <h3>Habilidades Tecnicas</h3>
            {technicalSkills.length ? (
              <div className="public-skill-chip-list">
                {technicalSkills.map((skill) => (
                  <span key={skill.id} className={`public-skill-chip tone-${getSkillTone(skill)}`}>
                    {skill.nombre} - {skill.nivel_dominio}
                  </span>
                ))}
              </div>
            ) : (
              <p className="section-copy">No hay habilidades tecnicas visibles.</p>
            )}
          </article>

          <article className="surface-card public-skills-card">
            <h3>Habilidades Blandas</h3>
            {softSkills.length ? (
              <div className="public-skill-chip-list">
                {softSkills.map((skill) => (
                  <span key={skill.id} className={`public-skill-chip tone-${getSkillTone(skill)}`}>
                    {skill.nombre} - {skill.nivel_dominio}
                  </span>
                ))}
              </div>
            ) : (
              <p className="section-copy">No hay habilidades blandas visibles.</p>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
