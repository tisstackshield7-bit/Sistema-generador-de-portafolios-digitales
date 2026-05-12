import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_ORIGIN } from "../api/axios";
import { getPublicProfileBySlug } from "../api/profile";
import RichTextContent from "../components/common/RichTextContent";
import { authStore } from "../store/authStore";
import type { Perfil } from "../types/profile";
import type { Project } from "../types/project";
import type { Skill } from "../types/skill";
import { getAuthenticatedHomePath } from "../utils/authRedirect";
import { resolveProjectImageSrc } from "../utils/projectImages";

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

function ExperienceMarkIcon({ type }: { type: "laboral" | "academica" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="public-experience-icon">
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {type === "laboral" ? (
          <>
            <path d="M8 7V5h8v2" />
            <rect x="4" y="7" width="16" height="13" rx="2" />
            <path d="M4 12h16M10 12v2h4v-2" />
          </>
        ) : (
          <>
            <path d="m3 8 9-4 9 4-9 4-9-4Z" />
            <path d="M7 10.2v4.3c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4.3" />
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

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="project-date-icon">
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </g>
    </svg>
  );
}

function buildCertificateViewerUrl(path: string) {
  return `${API_ORIGIN}/storage/${path}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
}

function buildStorageUrl(path: string) {
  return `${API_ORIGIN}/storage/${path}`;
}

function formatProjectMonthYear(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-BO", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function getProjectDateRange(project: Project) {
  const startDate = formatProjectMonthYear(project.fecha_inicio);
  const endDate = formatProjectMonthYear(project.fecha_fin) || "Actualidad";

  return startDate ? `${startDate} - ${endDate}` : endDate;
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`category-chevron ${expanded ? "expanded" : ""}`}>
      <path
        d="m6 9 6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PublicProfilePage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, true>>({});
  const [certificateUrl, setCertificateUrl] = useState("");
  const [evidenceSkill, setEvidenceSkill] = useState<Skill | null>(null);
  const [expandedSkillGroups, setExpandedSkillGroups] = useState({
    technical: false,
    soft: false,
  });
  const [loading, setLoading] = useState(true);
  const title = perfil?.titular_profesional || perfil?.profesion || "Perfil profesional";
  const technicalSkills = perfil?.habilidades?.filter((skill) => skill.tipo === "tecnica" && skill.visible_publico) || [];
  const softSkills = perfil?.habilidades?.filter((skill) => skill.tipo === "blanda" && skill.visible_publico) || [];
  const publicProjects = perfil?.proyectos?.filter((project) => project.visible_publico) || [];
  const publicExperiences = perfil?.experiencias?.filter((experience) => experience.visible_publico) || [];
  const publicWorkExperiences = publicExperiences.filter((experience) => experience.tipo === "laboral");
  const publicEducationExperiences = publicExperiences.filter((experience) => experience.tipo === "academica");
  const visibility = {
    mostrar_correo: true,
    mostrar_telefono: false,
    mostrar_redes: true,
    mostrar_biografia: true,
    mostrar_habilidades: true,
    mostrar_proyectos: true,
    mostrar_experiencia: true,
    mostrar_evidencias: true,
    ...(perfil?.visibilidad || {}),
  };
  const summaryText = perfil?.biografia || "Perfil publico disponible dentro de la plataforma.";
  const backToHomePath = authStore.isAuthenticated() ? getAuthenticatedHomePath(authStore.getUser()) : "/";
  const backToHomeLabel = authStore.isAuthenticated() ? "Volver al dashboard" : "Volver al inicio";
  const phoneHref = perfil?.telefono ? `tel:${perfil.telefono.replace(/\s+/g, "")}` : "";

  const handleInternalSkillLink = (event: React.MouseEvent<HTMLDivElement>) => {
    const link = (event.target as HTMLElement).closest("a");
    const href = link?.getAttribute("href") || "";

    if (!href.startsWith("#habilidad-")) return;

    event.preventDefault();

    const skillId = Number(href.replace("#habilidad-", ""));
    const targetSkill = [...technicalSkills, ...softSkills].find((skill) => skill.id === skillId);

    if (!targetSkill) return;

    setEvidenceSkill(targetSkill);
  };

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
    <div className="public-portfolio-shell app-shell" onClick={handleInternalSkillLink}>
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
              <p className="public-portfolio-profession">{perfil.profesion}</p>
              {(visibility.mostrar_correo && perfil.correo) || (visibility.mostrar_telefono && perfil.telefono) || perfil.ubicacion ? (
                <div className="public-portfolio-contact-row" aria-label="Datos de contacto">
                  {visibility.mostrar_correo && perfil.correo ? (
                    <a className="public-portfolio-contact-link" href={`mailto:${perfil.correo}`}>
                      {perfil.correo}
                    </a>
                  ) : null}
                  {visibility.mostrar_telefono && perfil.telefono ? (
                    <a className="public-portfolio-contact-link" href={phoneHref}>
                      {perfil.telefono}
                    </a>
                  ) : null}
                  {perfil.ubicacion ? (
                    <span className="public-portfolio-contact-link as-text">
                      {perfil.ubicacion}
                    </span>
                  ) : null}
                </div>
              ) : null}
              {visibility.mostrar_biografia ? <RichTextContent value={summaryText} className="public-portfolio-bio" /> : null}

              {visibility.mostrar_redes && (perfil.linkedin_url || perfil.github_url || perfil.sitio_web_url) ? (
                <div className="public-social-links">
                  {perfil.linkedin_url ? <a href={perfil.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a> : null}
                  {perfil.github_url ? <a href={perfil.github_url} target="_blank" rel="noreferrer">GitHub</a> : null}
                  {perfil.sitio_web_url ? <a href={perfil.sitio_web_url} target="_blank" rel="noreferrer">Sitio web</a> : null}
                </div>
              ) : null}

              <div className="public-portfolio-meta-row">
                <span className="public-portfolio-meta-pill">
                  <PortfolioIcon />
                  <span>{technicalSkills.length} habilidades tecnicas</span>
                </span>
                <span className="public-portfolio-meta-pill">
                  <RibbonIcon />
                  <span>{softSkills.length} habilidades blandas</span>
                </span>
                <span className="public-portfolio-meta-pill">
                  <PortfolioIcon />
                  <span>{publicProjects.length} proyectos</span>
                </span>
              </div>

              <div className="public-portfolio-tag-row">
                <button type="button" className="public-portfolio-tag-pill" onClick={() => navigate(backToHomePath)}>
                  {backToHomeLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="page-section public-portfolio-content">
        {visibility.mostrar_habilidades ? (
          <>
            <section className="public-skills-intro">
              <div className="public-skills-title-mark">
                <RibbonIcon />
              </div>
              <div className="public-skills-heading">
                <h2>Habilidades</h2>
                <p className="public-skill-help">Pulsa una habilidad para ver su certificado.</p>
              </div>
            </section>

            <section className="public-skills-layout">
              <article className="surface-card public-skills-card">
                <button
                  type="button"
                  className="public-skill-group-toggle"
                  onClick={() => setExpandedSkillGroups((prev) => ({ ...prev, technical: !prev.technical }))}
                  aria-expanded={expandedSkillGroups.technical}
                >
                  <span>
                    <strong>Habilidades Tecnicas</strong>
                  </span>
                  <ChevronIcon expanded={expandedSkillGroups.technical} />
                </button>
                {expandedSkillGroups.technical && technicalSkills.length ? (
                  <div className="public-skill-chip-list">
                    {technicalSkills.map((skill) => (
                      skill.evidencias?.length && visibility.mostrar_evidencias ? (
                        <button
                          key={skill.id}
                          id={`habilidad-${skill.id}`}
                          type="button"
                          className={`public-skill-chip tone-${getSkillTone(skill)} is-clickable`}
                          onClick={() => setEvidenceSkill(skill)}
                        >
                          {skill.nombre} - {skill.nivel_dominio}
                        </button>
                      ) : skill.certificado_pdf ? (
                        <button
                          key={skill.id}
                          id={`habilidad-${skill.id}`}
                          type="button"
                          className={`public-skill-chip tone-${getSkillTone(skill)} is-clickable`}
                          onClick={() => setCertificateUrl(buildCertificateViewerUrl(skill.certificado_pdf || ""))}
                        >
                          {skill.nombre} - {skill.nivel_dominio}
                        </button>
                      ) : (
                        <span key={skill.id} id={`habilidad-${skill.id}`} className={`public-skill-chip tone-${getSkillTone(skill)}`}>
                          {skill.nombre} - {skill.nivel_dominio}
                        </span>
                      )
                    ))}
                  </div>
                ) : (
                  expandedSkillGroups.technical ? <p className="section-copy">No hay habilidades tecnicas visibles.</p> : null
                )}
              </article>

              <article className="surface-card public-skills-card">
                <button
                  type="button"
                  className="public-skill-group-toggle"
                  onClick={() => setExpandedSkillGroups((prev) => ({ ...prev, soft: !prev.soft }))}
                  aria-expanded={expandedSkillGroups.soft}
                >
                  <span>
                    <strong>Habilidades Blandas</strong>
                  </span>
                  <ChevronIcon expanded={expandedSkillGroups.soft} />
                </button>
                {expandedSkillGroups.soft && softSkills.length ? (
                  <div className="public-skill-chip-list">
                    {softSkills.map((skill) => (
                      skill.evidencias?.length && visibility.mostrar_evidencias ? (
                        <button
                          key={skill.id}
                          id={`habilidad-${skill.id}`}
                          type="button"
                          className={`public-skill-chip tone-${getSkillTone(skill)} is-clickable`}
                          onClick={() => setEvidenceSkill(skill)}
                        >
                          {skill.nombre} - {skill.nivel_dominio}
                        </button>
                      ) : skill.certificado_pdf ? (
                        <button
                          key={skill.id}
                          id={`habilidad-${skill.id}`}
                          type="button"
                          className={`public-skill-chip tone-${getSkillTone(skill)} is-clickable`}
                          onClick={() => setCertificateUrl(buildCertificateViewerUrl(skill.certificado_pdf || ""))}
                        >
                          {skill.nombre} - {skill.nivel_dominio}
                        </button>
                      ) : (
                        <span key={skill.id} id={`habilidad-${skill.id}`} className={`public-skill-chip tone-${getSkillTone(skill)}`}>
                          {skill.nombre} - {skill.nivel_dominio}
                        </span>
                      )
                    ))}
                  </div>
                ) : (
                  expandedSkillGroups.soft ? <p className="section-copy">No hay habilidades blandas visibles.</p> : null
                )}
              </article>
            </section>
          </>
        ) : null}

        {visibility.mostrar_proyectos ? (
          <>
            <section className="public-skills-intro">
              <div className="public-skills-title-mark">
                <PortfolioIcon />
              </div>
              <div className="public-skills-heading">
                <h2>Proyectos</h2>
              </div>
            </section>

            {publicProjects.length ? (
              <section className="portfolio-project-list">
                {publicProjects.map((project) => (
                  <article key={project.id} className="surface-card portfolio-project-card">
                {resolveProjectImageSrc(project.url_imagen) && !imageErrors[project.id] ? (
                  <img
                    src={resolveProjectImageSrc(project.url_imagen) || ""}
                    alt={project.titulo}
                    className="portfolio-project-image"
                    onError={() => setImageErrors((prev) => ({ ...prev, [project.id]: true }))}
                  />
                ) : (
                  <div className="portfolio-project-image project-image-fallback">{project.titulo.slice(0, 2).toUpperCase()}</div>
                )}

                <div className="portfolio-project-body">
                  <div className="portfolio-project-head">
                    <div>
                      <h3>{project.titulo}</h3>
                      <p>{project.rol}</p>
                    </div>
                    <span className="portfolio-project-date">
                      <CalendarIcon />
                      {getProjectDateRange(project)}
                    </span>
                  </div>

                  <RichTextContent value={project.descripcion} className="portfolio-project-description" />

                  {(project.tecnologias || []).length ? (
                    <div className="portfolio-project-block">
                      <span className="portfolio-project-label">Tecnologias:</span>
                      <div className="portfolio-project-tags">
                        {project.tecnologias.map((technology) => (
                          <span key={technology}>{technology}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {project.logros?.length ? (
                    <div className="portfolio-project-block">
                      <span className="portfolio-project-label">Logros destacados:</span>
                      <ul className="project-achievement-list">
                        {project.logros.map((achievement) => (
                          <li key={achievement}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {project.enlace_proyecto ? (
                    <a href={project.enlace_proyecto} target="_blank" rel="noreferrer" className="portfolio-project-link">
                      Ver proyecto
                      <span aria-hidden="true">-&gt;</span>
                    </a>
                  ) : null}
                </div>
                  </article>
                ))}
              </section>
            ) : (
              <section className="surface-card public-skills-card">
                <p className="section-copy">No hay proyectos visibles.</p>
              </section>
            )}
          </>
        ) : null}

        {visibility.mostrar_experiencia && publicExperiences.length ? (
          <section className="public-experience-section">
            {publicWorkExperiences.length ? (
              <div className="public-experience-group">
                <h2>Experiencia Laboral</h2>
                <div className="public-experience-list">
                  {publicWorkExperiences.map((experience) => (
                    <article key={experience.id} className="surface-card public-experience-card">
                      <div className="public-experience-mark laboral">
                        <ExperienceMarkIcon type="laboral" />
                      </div>
                      <div className="public-experience-body">
                        <h3>{experience.titulo}</h3>
                        <p className="public-experience-place">{experience.institucion}</p>
                        {experience.ubicacion ? <p className="public-experience-location">{experience.ubicacion}</p> : null}
                        <p className="public-experience-date">
                          {formatProjectMonthYear(experience.fecha_inicio)} - {experience.actualidad ? "Presente" : formatProjectMonthYear(experience.fecha_fin)}
                        </p>
                        {experience.descripcion ? <RichTextContent value={experience.descripcion} className="public-experience-description" /> : null}
                        {experience.logros?.length ? (
                          <ul className="project-achievement-list public-experience-achievements">
                            {experience.logros.map((achievement) => (
                              <li key={achievement}>{achievement}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {publicEducationExperiences.length ? (
              <div className="public-experience-group">
                <h2>Educacion</h2>
                <div className="public-experience-list">
                  {publicEducationExperiences.map((experience) => (
                    <article key={experience.id} className="surface-card public-experience-card">
                      <div className="public-experience-mark academica">
                        <ExperienceMarkIcon type="academica" />
                      </div>
                      <div className="public-experience-body">
                        <h3>{experience.titulo}</h3>
                        <p className="public-experience-place">{experience.institucion}</p>
                        {experience.ubicacion ? <p className="public-experience-location">{experience.ubicacion}</p> : null}
                        <p className="public-experience-date">
                          {formatProjectMonthYear(experience.fecha_inicio)} - {experience.actualidad ? "Presente" : formatProjectMonthYear(experience.fecha_fin)}
                        </p>
                        {experience.descripcion ? <RichTextContent value={experience.descripcion} className="public-experience-description" /> : null}
                        {experience.logros?.length ? (
                          <ul className="project-achievement-list public-experience-achievements">
                            {experience.logros.map((achievement) => (
                              <li key={achievement}>{achievement}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}
      </main>

      {certificateUrl ? (
        <div className="public-certificate-backdrop" role="presentation" onClick={() => setCertificateUrl("")}>
          <section className="public-certificate-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="public-certificate-head">
              <h2>Certificado</h2>
              <button type="button" onClick={() => setCertificateUrl("")}>
                Cerrar
              </button>
            </div>
            <iframe src={certificateUrl} title="Certificado de habilidad" className="public-certificate-frame" />
          </section>
        </div>
      ) : null}

      {evidenceSkill && visibility.mostrar_evidencias ? (
        <div className="public-certificate-backdrop" role="presentation" onClick={() => setEvidenceSkill(null)}>
          <section className="public-certificate-modal evidence-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="skill-modal-head">
              <div>
                <span className="skill-modal-eyebrow">
                  Habilidad {evidenceSkill.tipo === "tecnica" ? "tecnica" : "blanda"}
                </span>
                <h2>{evidenceSkill.nombre}</h2>
                <p>{evidenceSkill.categoria || "Sin categoria"} - Nivel {evidenceSkill.nivel_dominio}</p>
              </div>
              <button type="button" className="skill-modal-close" onClick={() => setEvidenceSkill(null)}>
                Cerrar
              </button>
            </div>
            <div className="public-evidence-list">
              <article className="public-evidence-card skill-overview-card">
                <div>
                  <span className="portfolio-project-label">
                    Habilidad {evidenceSkill.tipo === "tecnica" ? "tecnica" : "blanda"}
                  </span>
                  <h3>{evidenceSkill.nombre}</h3>
                  <p className="meta-text">
                    {evidenceSkill.categoria || "Sin categoria"} · Nivel {evidenceSkill.nivel_dominio}
                  </p>
                </div>
                <div className="skill-actions">
                  {evidenceSkill.certificado_pdf ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        setEvidenceSkill(null);
                        setCertificateUrl(buildCertificateViewerUrl(evidenceSkill.certificado_pdf || ""));
                      }}
                    >
                      Ver certificado
                    </button>
                  ) : null}
                </div>
              </article>

              {(evidenceSkill.evidencias || []).length ? (
                (evidenceSkill.evidencias || []).map((evidence) => (
                  <article key={evidence.id} className="public-evidence-card skill-evidence-card">
                    <div>
                      <span className="portfolio-project-label">{evidence.tipo}</span>
                      <h3>{evidence.titulo}</h3>
                      {evidence.descripcion ? <RichTextContent value={evidence.descripcion} className="section-copy" /> : null}
                      {evidence.emisor ? <p className="meta-text">Emisor: {evidence.emisor}</p> : null}
                    </div>
                    <div className="skill-actions">
                      {evidence.url ? (
                        <a href={evidence.url} target="_blank" rel="noreferrer" className="btn btn-secondary">
                          Abrir enlace
                        </a>
                      ) : null}
                      {evidence.archivo ? (
                        <a href={buildStorageUrl(evidence.archivo)} target="_blank" rel="noreferrer" className="btn btn-secondary">
                          Abrir archivo
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))
              ) : (
                <article className="public-evidence-card skill-empty-evidence">
                  <div>
                    <span className="portfolio-project-label">Respaldo</span>
                    <h3>Nivel declarado</h3>
                    <p className="section-copy">Esta habilidad no tiene evidencias publicas registradas todavia.</p>
                  </div>
                </article>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
