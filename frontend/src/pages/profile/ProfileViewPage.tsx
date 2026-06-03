import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile } from "../../api/profile";
import { API_ORIGIN } from "../../api/axios";
import RichTextContent from "../../components/common/RichTextContent";
import type { Perfil } from "../../types/profile";
import { getInitials } from "../../utils/avatar";
import { logoutUser } from "../../api/auth";
import { authStore } from "../../store/authStore";
import type { Project } from "../../types/project";
import { resolveProjectImageSrc } from "../../utils/projectImages";

function splitSkills(perfil: Perfil) {
  const technicalSkills = perfil.habilidades?.filter((skill) => skill.tipo === "tecnica") || [];
  const softSkills = perfil.habilidades?.filter((skill) => skill.tipo === "blanda") || [];
  const publicSkills = perfil.habilidades?.filter((skill) => skill.visible_publico) || [];

  return { technicalSkills, softSkills, publicSkills };
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
  const endDate = project.actualidad ? "Actualidad" : (formatProjectMonthYear(project.fecha_fin) || "Actualidad");

  return startDate ? `${startDate} - ${endDate}` : endDate;
}

export default function ProfileViewPage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, true>>({});

  const loadProfile = useCallback(async () => {
    try {
      const data = await getMyProfile();
      if (data.perfil) {
        setPerfil(data.perfil);
      } else {
        navigate("/perfil/crear", { replace: true });
      }
    } catch {
      setPerfil(null);
    }
  }, [navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // La sesion local se limpia aunque el token ya no exista en el servidor.
    } finally {
      authStore.clearSession();
      navigate("/");
    }
  };

  if (!perfil) {
    return (
      <div className="profile-page-shell app-shell">
        <div className="page-section surface-card auth-card">
          <p className="section-copy">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const { technicalSkills, softSkills, publicSkills } = splitSkills(perfil);
  const topTechnicalSkills = technicalSkills.slice(0, 6);
  const topSoftSkills = softSkills.slice(0, 6);
  const projects = perfil.proyectos || [];

  return (
    <div className="profile-page-shell app-shell">
      <div className="page-section profile-page-grid">
        <section className="profile-main-area">
          <header className="profile-cover surface-card">
            <div className="profile-cover-content">
              <div className="profile-identity">
                {perfil.foto_perfil ? (
                  <img src={`${API_ORIGIN}/storage/${perfil.foto_perfil}`} alt={perfil.nombre_completo} className="profile-avatar-xl" />
                ) : (
                  <div className="profile-avatar-xl fallback-avatar">{getInitials(perfil.nombre_completo)}</div>
                )}
                <div className="profile-identity-content">
                  <p className="section-label cover-label">Mi perfil</p>
                  <h1>{perfil.nombre_completo}</h1>
                  <p className="cover-role">{perfil.titular_profesional || perfil.profesion}</p>
                  <p className="cover-location">{perfil.profesion}{perfil.correo ? ` · ${perfil.correo}` : ""}</p>
                  <div className="profile-highlight-strip">
                    <div className="profile-highlight-card">
                      <span>Total habilidades</span>
                      <strong>{perfil.habilidades?.length || 0}</strong>
                    </div>
                    <div className="profile-highlight-card">
                      <span>Visibles en publico</span>
                      <strong>{publicSkills.length}</strong>
                    </div>
                    <div className="profile-highlight-card">
                      <span>Especialidad</span>
                      <strong>{technicalSkills[0]?.categoria || "Perfil general"}</strong>
                    </div>
                  </div>
                  <div className="profile-cover-actions">
                    <button className="btn btn-secondary" onClick={() => navigate("/dashboard")}>
                      Ir al inicio
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate("/perfil/habilidades")}>
                      Gestionar habilidades
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate("/perfil/editar")}>
                      Editar perfil
                    </button>
                    <button className="btn btn-tertiary cover-tertiary" onClick={handleLogout}>
                      Cerrar sesion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="profile-main-card">
            <div className="profile-section">
              <div className="section-head">
                <div>
                  <p className="section-label">Resumen profesional</p>
                  <h2>Presentacion principal</h2>
                </div>
              </div>
              <div className="profile-editorial-block">
                <RichTextContent
                  value={perfil.biografia}
                  className="profile-lead-copy"
                  fallback="Agrega un resumen para reforzar tu perfil profesional."
                />
              </div>
            </div>

            <div className="profile-section">
              <div className="section-head">
                <div>
                  <p className="section-label">Habilidades</p>
                  <h2>Competencias registradas</h2>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate("/perfil/habilidades")}>
                  Administrar
                </button>
              </div>
              {perfil.habilidades?.length ? (
                <div className="skills-showcase-grid">
                  <article className="skills-showcase-card">
                    <div className="skills-showcase-head">
                      <div>
                        <p className="section-label">Tecnicas</p>
                        <h3>Tecnologias y herramientas</h3>
                      </div>
                      <span className="skill-count-badge">{technicalSkills.length}</span>
                    </div>
                    {topTechnicalSkills.length ? (
                      <div className="skills-stack">
                        {topTechnicalSkills.map((skill) => (
                          <div key={skill.id} id={`habilidad-${skill.id}`} className="skill-detail-card">
                            <div className="skill-detail-main">
                              <strong>{skill.nombre}</strong>
                              <span>{skill.categoria || "Tecnologia"} · {skill.nivel_dominio}</span>
                            </div>
                            <span className={`skill-status-tag ${skill.visible_publico ? "is-public" : "is-private"}`}>
                              {skill.visible_publico ? "Publica" : "Oculta"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="section-copy">Aun no agregaste habilidades tecnicas.</p>
                    )}
                  </article>

                  <article className="skills-showcase-card">
                    <div className="skills-showcase-head">
                      <div>
                        <p className="section-label">Blandas</p>
                        <h3>Fortalezas profesionales</h3>
                      </div>
                      <span className="skill-count-badge">{softSkills.length}</span>
                    </div>
                    {topSoftSkills.length ? (
                      <div className="skills-stack">
                        {topSoftSkills.map((skill) => (
                          <div key={skill.id} id={`habilidad-${skill.id}`} className="skill-detail-card">
                            <div className="skill-detail-main">
                              <strong>{skill.nombre}</strong>
                              <span>{skill.categoria || "Habilidad blanda"} · {skill.nivel_dominio}</span>
                            </div>
                            <span className={`skill-status-tag ${skill.visible_publico ? "is-public" : "is-private"}`}>
                              {skill.visible_publico ? "Publica" : "Oculta"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="section-copy">Aun no agregaste habilidades blandas.</p>
                    )}
                  </article>
                </div>
              ) : (
                <p className="section-copy">Aun no agregaste habilidades a tu portafolio.</p>
              )}
            </div>

            <div className="profile-section">
              <div className="section-head">
                <div>
                  <p className="section-label">Proyectos</p>
                  <h2>Proyectos registrados</h2>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate("/perfil/proyectos")}>
                  Administrar
                </button>
              </div>

              {projects.length ? (
                <div className="portfolio-project-list">
                  {projects.map((project) => (
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
                          <div className="portfolio-project-meta">
                            <span className={`skill-status-tag ${project.visible_publico ? "is-public" : "is-private"}`}>
                              {project.visible_publico ? "Publico" : "Oculto"}
                            </span>
                            <span className="portfolio-project-date">
                              <CalendarIcon />
                              {getProjectDateRange(project)}
                            </span>
                          </div>
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
                </div>
              ) : (
                <p className="section-copy">Aun no agregaste proyectos a tu portafolio.</p>
              )}
            </div>
          </section>
        </section>

        <aside className="profile-side-column">
          <section className="profile-side-card">
            <p className="section-label">Resumen ejecutivo</p>
            <div className="profile-side-metrics">
              <div className="profile-side-metric">
                <span>Rol principal</span>
                <strong>{perfil.titular_profesional || perfil.profesion}</strong>
              </div>
              <div className="profile-side-metric">
                <span>Profesion</span>
                <strong>{perfil.profesion}</strong>
              </div>
              <div className="profile-side-metric">
                <span>Correo</span>
                <strong>{perfil.correo || "Correo de la cuenta"}</strong>
              </div>
              <div className="profile-side-metric">
                <span>Perfil publico</span>
                <strong>{publicSkills.length ? "Activo" : "En preparacion"}</strong>
              </div>
              <div className="profile-side-metric">
                <span>Cobertura</span>
                <strong>{technicalSkills.length} tecnicas / {softSkills.length} blandas</strong>
              </div>
            </div>
          </section>

          <section className="profile-side-card">
            <p className="section-label">Lo mas visible</p>
            {publicSkills.length ? (
              <div className="profile-pill-list">
                {publicSkills.slice(0, 8).map((skill) => (
                  <span key={skill.id} className="profile-pill neutral">
                    {skill.nombre}
                  </span>
                ))}
              </div>
            ) : (
              <p className="section-copy">Activa la visibilidad de tus mejores habilidades para reforzar tu perfil publico.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
