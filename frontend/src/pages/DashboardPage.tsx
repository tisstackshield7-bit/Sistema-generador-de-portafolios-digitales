import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ORIGIN } from "../api/axios";
import { getMyProfile } from "../api/profile";
import AlertMessage from "../components/common/AlertMessage";
import RichTextContent from "../components/common/RichTextContent";
import PrivateWorkspaceLayout from "../components/dashboard/PrivateWorkspaceLayout";
import type { Perfil } from "../types/profile";
import { downloadProfileCvPdf } from "../utils/cvExport";
import { resolveProjectImageSrc } from "../utils/projectImages";
import "./HomePage.css";

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

function formatExperienceMonthYear(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-BO", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function getExperienceDateRange(experience: NonNullable<Perfil["experiencias"]>[number]) {
  const start = formatExperienceMonthYear(experience.fecha_inicio);
  const end = experience.actualidad ? "Actualidad" : formatExperienceMonthYear(experience.fecha_fin);
  return [start, end].filter(Boolean).join(" - ");
}

function getAcademicExperienceMeta(experience: NonNullable<Perfil["experiencias"]>[number]) {
  return [experience.subtipo_academico, experience.estado_academico, experience.area_especializacion]
    .filter(Boolean)
    .join(" · ");
}

function DashboardExperienceIcon({ type }: { type: "laboral" | "academica" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
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

function SocialButtonIcon({ type }: { type: "linkedin" | "github" | "web" }) {
  if (type === "github") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3.5a8.5 8.5 0 0 0-2.7 16.6c.4.1.6-.2.6-.4v-1.5c-2.3.5-2.8-1-2.8-1-.4-.9-.9-1.2-.9-1.2-.8-.5.1-.5.1-.5.8.1 1.3.9 1.3.9.8 1.3 2 1 2.4.8.1-.6.3-1 .5-1.2-1.8-.2-3.7-.9-3.7-4a3.1 3.1 0 0 1 .8-2.2 2.9 2.9 0 0 1 .1-2.1s.7-.2 2.3.8a8 8 0 0 1 4.2 0c1.6-1 2.3-.8 2.3-.8.4.9.1 1.8.1 2.1.5.6.8 1.3.8 2.2 0 3.1-1.9 3.8-3.7 4 .3.3.6.8.6 1.6v2.3c0 .3.2.5.6.4A8.5 8.5 0 0 0 12 3.5Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (type === "web") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8" />
          <path d="M4 12h16M12 4c2 2.2 3 4.8 3 8s-1 5.8-3 8M12 4c-2 2.2-3 4.8-3 8s1 5.8 3 8" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <g fill="currentColor">
        <path d="M6.7 9.2H3.9v9h2.8v-9Z" />
        <path d="M5.3 5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" />
        <path d="M10.8 9.2H8.1v9h2.7v-4.7c0-1.2.6-2 1.7-2s1.5.8 1.5 2v4.7h2.8V13c0-2.7-1.4-4-3.3-4-1.5 0-2.2.8-2.6 1.4h-.1V9.2Z" />
      </g>
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="project-link-icon">
      <g fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 4h6v6" />
        <path d="m10 14 10-10" />
        <path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4" />
      </g>
    </svg>
  );
}

function DashboardExperienceSection({
  experiences,
  emptyMessage,
  label,
  title,
  onManage,
}: {
  experiences: NonNullable<Perfil["experiencias"]>;
  emptyMessage: string;
  label: string;
  title: string;
  onManage: () => void;
}) {
  return (
    <section className="surface-card dashboard-panel dashboard-experience-panel">
      <div className="section-head dashboard-skills-head">
        <div>
          <p className="section-label">{label}</p>
          <h2 className="section-title">{title}</h2>
        </div>
        <button className="btn btn-secondary" onClick={onManage}>
          Gestionar
        </button>
      </div>

      {experiences.length ? (
        <div className="dashboard-experience-list">
          {experiences.map((experience) => (
            <article key={experience.id} className="dashboard-experience-item">
              <div className={`dashboard-experience-mark ${experience.tipo}`}>
                <DashboardExperienceIcon type={experience.tipo} />
              </div>
              <div className="dashboard-experience-copy">
                <h3>{experience.titulo}</h3>
                <p className="dashboard-experience-place">{experience.institucion}</p>
                {experience.tipo === "academica" && getAcademicExperienceMeta(experience) ? (
                  <p className="dashboard-experience-location">{getAcademicExperienceMeta(experience)}</p>
                ) : null}
                {experience.ubicacion ? <p className="dashboard-experience-location">{experience.ubicacion}</p> : null}
                <p className="dashboard-experience-date">{getExperienceDateRange(experience)}</p>
                {experience.descripcion ? (
                  <RichTextContent value={experience.descripcion} className="dashboard-experience-description" />
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="dashboard-empty-note">{emptyMessage}</div>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [downloadError, setDownloadError] = useState("");
  const [downloadingCv, setDownloadingCv] = useState<"pdf" | null>(null);

  useEffect(() => {
    getMyProfile()
      .then((data) => setPerfil(data.perfil || null))
      .catch(() => setPerfil(null));
  }, []);

  const initials = useMemo(() => getInitials(perfil?.nombre_completo), [perfil]);
  const technicalSkills = perfil?.habilidades?.filter((skill) => skill.tipo === "tecnica") || [];
  const softSkills = perfil?.habilidades?.filter((skill) => skill.tipo === "blanda") || [];
  const publicProjects = perfil?.proyectos?.filter((project) => project.visible_publico) || [];
  const recentProjects = perfil?.proyectos?.slice(0, 3) || [];
  const experiences = perfil?.experiencias || [];
  const workExperiences = experiences.filter((experience) => experience.tipo === "laboral");
  const academicExperiences = experiences.filter((experience) => experience.tipo === "academica");
  const recentWorkExperiences = workExperiences.slice(0, 3);
  const recentAcademicExperiences = academicExperiences.slice(0, 3);
  const socialLinks = [
    perfil?.linkedin_url ? { type: "linkedin" as const, label: "LinkedIn", url: perfil.linkedin_url } : null,
    perfil?.github_url ? { type: "github" as const, label: "GitHub", url: perfil.github_url } : null,
    perfil?.sitio_web_url ? { type: "web" as const, label: "Sitio Web", url: perfil.sitio_web_url } : null,
  ].filter(Boolean) as { type: "linkedin" | "github" | "web"; label: string; url: string }[];

  const validateCvRequirements = () => {
    const missing: string[] = [];
    const hasProfilePhoto = Boolean(perfil?.foto_perfil);
    const hasVisibleSkill =
      technicalSkills.some((skill) => skill.visible_publico !== false) ||
      softSkills.some((skill) => skill.visible_publico !== false);
    const hasVisibleExperience =
      academicExperiences.some((experience) => experience.visible_publico !== false) ||
      workExperiences.some((experience) => experience.visible_publico !== false);

    if (!hasProfilePhoto) {
      missing.push("Subir una foto de perfil.");
    }

    if (!hasVisibleSkill) {
      missing.push("Registrar y activar al menos una habilidad técnica o blanda.");
    }

    if (!hasVisibleExperience) {
      missing.push("Registrar y activar al menos una experiencia académica o laboral.");
    }

    return missing;
  };

  const handleDownloadPdf = async () => {
    const missing = validateCvRequirements();

    if (missing.length > 0) {
      setDownloadError(
        `<strong>No es posible descargar tu CV todavía.</strong><br /><br />Para generar un currículum completo y presentable, primero debes completar la siguiente información:<br /><br /><ul>${missing
          .map((item) => `<li>${item}</li>`)
          .join("")}</ul>`
      );
      return;
    }

    try {
      setDownloadError("");
      setDownloadingCv("pdf");
      await downloadProfileCvPdf(perfil);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "No se pudo descargar el CV en PDF.");
    } finally {
      setDownloadingCv(null);
    }
  };

  return (
    <PrivateWorkspaceLayout active="dashboard" perfil={perfil} title="" subtitle="">
      <AlertMessage message={downloadError} />

      <section className="dashboard-hero-panel">
        <div className="dashboard-hero-copy">
          <p className="section-label dashboard-light-label">Dashboard</p>
          <h1 className="dashboard-title">Bienvenido/a, {perfil?.nombre_completo || "Profesional"}</h1>
          <p className="dashboard-hero-role">{perfil?.titular_profesional || perfil?.profesion || "Completa tu perfil profesional"}</p>
          <div className="dashboard-hero-actions">
            <button
              className="btn btn-secondary dashboard-ghost-button"
              onClick={() => navigate(perfil?.slug ? `/perfil-publico/${perfil.slug}` : "/perfil/editar")}
            >
              Ver portafolio publico
            </button>
            <button
              type="button"
              className="btn btn-primary dashboard-cv-button"
              onClick={handleDownloadPdf}
              disabled={!perfil || downloadingCv !== null}
            >
              {downloadingCv === "pdf" ? "Generando PDF..." : "Descargar CV en PDF"}
            </button>
          </div>
        </div>
      </section>

      <section className="dashboard-stat-grid sprint-grid">
        <article className="surface-card dashboard-stat-card">
          <div className="dashboard-stat-head">
            <h2>Habilidades</h2>
          </div>
          <strong>{perfil?.habilidades?.length || 0}</strong>
          <p>
            {technicalSkills.length} tecnicas, {softSkills.length} blandas
          </p>
        </article>
        <article className="surface-card dashboard-stat-card">
          <div className="dashboard-stat-head">
            <h2>Experiencias</h2>
          </div>
          <strong>{experiences.length}</strong>
          <p>
            {workExperiences.length} laborales, {academicExperiences.length} academicas
          </p>
        </article>
        <article className="surface-card dashboard-stat-card">
          <div className="dashboard-stat-head">
            <h2>Proyectos</h2>
          </div>
          <strong>{perfil?.proyectos?.length || 0}</strong>
          <p>{publicProjects.length} visibles en publico</p>
        </article>
      </section>

      <section className="surface-card dashboard-profile-summary-card">
        <div className="dashboard-summary-head">
          <div>
            <h2>Resumen del Perfil</h2>
            <p>Informacion basica de tu portafolio profesional</p>
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
            <p className="dashboard-profile-role">{perfil?.titular_profesional || "Agrega tu rol o especialidad"}</p>
            <RichTextContent
              value={perfil?.biografia}
              className="dashboard-profile-bio"
              fallback="Agrega una biografia clara para que tu perfil se vea mas profesional y completo."
            />
          </div>
        </div>

        <div className="dashboard-profile-links">
          <h3>Enlaces Profesionales:</h3>
          {socialLinks.length ? (
            <div className="dashboard-profile-link-row">
              {socialLinks.map((link) => (
                <a key={link.type} href={link.url} target="_blank" rel="noreferrer" className="dashboard-profile-link-button">
                  <SocialButtonIcon type={link.type} />
                  <span>{link.label}</span>
                  <span aria-hidden="true" className="dashboard-external-mark">↗</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="dashboard-profile-links-empty">Agrega LinkedIn, GitHub o sitio web desde Perfil.</p>
          )}
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
              <h3>Habilidades tecnicas</h3>
              <div className="dashboard-skill-chip-list">
                {technicalSkills.map((skill) => (
                  <span key={skill.id} className="dashboard-skill-chip dark">
                    {skill.nombre} - {skill.nivel_dominio}
                  </span>
                ))}
              </div>
            </div>

            <div className="dashboard-skill-group">
              <h3>Habilidades blandas</h3>
              <div className="dashboard-skill-chip-list">
                {softSkills.map((skill) => (
                  <span key={skill.id} className="dashboard-skill-chip light">
                    {skill.nombre} - {skill.nivel_dominio}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-empty-note">
            Registra habilidades tecnicas y blandas para reforzar tu portafolio profesional.
          </div>
        )}
      </section>

      <DashboardExperienceSection
        experiences={recentWorkExperiences}
        label="Experiencia laboral"
        title="Trayectoria laboral y participaciones"
        emptyMessage="Aun no registraste experiencia laboral. Esta seccion mostrara tus cargos, empresas y periodos profesionales."
        onManage={() => navigate("/perfil/experiencia-laboral")}
      />

      <DashboardExperienceSection
        experiences={recentAcademicExperiences}
        label="Experiencia academica"
        title="Formacion y trayectoria academica"
        emptyMessage="Aun no registraste experiencia academica. Esta seccion mostrara estudios, cursos y certificaciones."
        onManage={() => navigate("/perfil/experiencia-academica")}
      />

      <section className="surface-card dashboard-panel dashboard-projects-panel">
        <div className="section-head dashboard-skills-head">
          <div>
            <p className="section-label">Proyectos registrados</p>
            <h2 className="section-title">Tus trabajos mas recientes</h2>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate("/perfil/proyectos")}>
            Gestionar
          </button>
        </div>

        {recentProjects.length ? (
          <div className="dashboard-project-list">
            {recentProjects.map((project) => (
              <article key={project.id} className="dashboard-project-card">
                {resolveProjectImageSrc(project.url_imagen) ? (
                  <img src={resolveProjectImageSrc(project.url_imagen) || ""} alt={project.titulo} className="dashboard-project-thumb" />
                ) : (
                  <div className="dashboard-project-thumb fallback-thumb">
                    {project.titulo.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="dashboard-project-copy">
                  <div className="dashboard-project-head">
                    <div>
                      <h3>{project.titulo}</h3>
                      <p>{project.rol}</p>
                    </div>
                    <span className={`skill-status-tag ${project.visible_publico ? "is-public" : "is-private"}`}>
                      {project.visible_publico ? "Publico" : "Oculto"}
                    </span>
                  </div>

                  <RichTextContent value={project.descripcion} className="section-copy" />

                  <div className="dashboard-skill-chip-list">
                    {(project.tecnologias || []).slice(0, 5).map((technology) => (
                      <span key={technology} className="dashboard-skill-chip muted">
                        {technology}
                      </span>
                    ))}
                  </div>

                  {project.enlace_proyecto ? (
                    <a href={project.enlace_proyecto} target="_blank" rel="noreferrer" className="dashboard-project-link">
                      <ExternalLinkIcon />
                      Abrir evidencia
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-note">
            Registra tus proyectos para que aparezcan en el dashboard y en tu portafolio publico.
          </div>
        )}
      </section>
    </PrivateWorkspaceLayout>
  );
}
