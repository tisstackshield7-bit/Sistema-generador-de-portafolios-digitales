import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

function PortfolioIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="public-portfolio-icon">
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M9 5V3.8A1.8 1.8 0 0 1 10.8 2h2.4A1.8 1.8 0 0 1 15 3.8V5" />
        <path d="M3 11h18" />
      </g>
    </svg>
  );
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

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="public-link-icon">
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </g>
    </svg>
  );
}

function TagIcon({ kind }: { kind: "category" | "stack" | "portfolio" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="public-tag-icon">
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {kind === "category" ? (
          <>
            <path d="M4 7a3 3 0 0 1 3-3h3l10 10-6 6L4 10V7Z" />
            <circle cx="9" cy="9" r="1" />
          </>
        ) : kind === "stack" ? (
          <>
            <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
            <path d="m4 12 8 4.5 8-4.5" />
            <path d="m4 16.5 8 4.5 8-4.5" />
          </>
        ) : (
          <>
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M8 10h8" />
            <path d="M8 14h5" />
          </>
        )}
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

  const title = useMemo(() => perfil?.titular_profesional || perfil?.profesion || "Perfil profesional", [perfil]);
  const technicalSkills = perfil?.habilidades?.filter((skill) => skill.tipo === "tecnica") || [];
  const softSkills = perfil?.habilidades?.filter((skill) => skill.tipo === "blanda") || [];
  const featuredCategory = technicalSkills[0]?.categoria || "Perfil integral";
  const showcaseTags = useMemo(() => {
    const tags = [
      technicalSkills[0]?.categoria,
      technicalSkills[0]?.nombre,
      softSkills[0]?.nombre || "Portafolio",
    ].filter(Boolean) as string[];

    return tags.slice(0, 3);
  }, [softSkills, technicalSkills]);

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
          <div className="public-portfolio-floating-bar">
            <Link to="/" className="public-portfolio-brand">
              <PortfolioIcon />
              <span>Portafolio Pro</span>
            </Link>

            <Link to="/" className="public-portfolio-backlink">
              Volver al inicio
              <ArrowIcon />
            </Link>
          </div>

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
              <p className="public-portfolio-eyebrow">Portafolio publico</p>
              <h1>{perfil.nombre_completo}</h1>
              <p className="public-portfolio-role">{title}</p>
              <p className="public-portfolio-bio">
                {perfil.biografia || "Este usuario aun no agrego una biografia publica."}
              </p>

              <div className="public-portfolio-meta-row">
                <span className="public-portfolio-meta-pill">{technicalSkills.length} habilidades tecnicas</span>
                <span className="public-portfolio-meta-pill">{softSkills.length} habilidades blandas</span>
                <span className="public-portfolio-meta-pill">{featuredCategory}</span>
              </div>

              <div className="public-portfolio-tag-row">
                {showcaseTags.map((tag, index) => (
                  <span key={tag} className="public-portfolio-tag-pill">
                    <TagIcon kind={index === 0 ? "category" : index === 1 ? "stack" : "portfolio"} />
                    {tag}
                  </span>
                ))}
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
            <p className="section-copy">Competencias visibles dentro del portafolio profesional.</p>
          </div>
        </section>

        <section className="public-skills-layout">
          <article className="surface-card public-skills-card">
            <h3>Habilidades Tecnicas</h3>
            {technicalSkills.length ? (
              <div className="public-skill-chip-list">
                {technicalSkills.map((skill) => (
                  <span key={skill.id} className={`public-skill-chip tone-${getSkillTone(skill)}`}>
                    {skill.nombre} - {skill.categoria || "Tecnologia"} - {skill.nivel_dominio}
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
                    {skill.nombre} - {skill.categoria || "Habilidad blanda"} - {skill.nivel_dominio}
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
