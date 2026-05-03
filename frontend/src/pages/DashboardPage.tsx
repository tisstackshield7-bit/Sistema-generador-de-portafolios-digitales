import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ORIGIN } from "../api/axios";
import { getMyProfile } from "../api/profile";
import PrivateWorkspaceLayout from "../components/dashboard/PrivateWorkspaceLayout";
import type { Perfil } from "../types/profile";
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

export default function DashboardPage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil | null>(null);

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
  const phoneHref = perfil?.telefono ? `tel:${perfil.telefono.replace(/\s+/g, "")}` : "";

  return (
    <PrivateWorkspaceLayout active="dashboard" perfil={perfil} title="" subtitle="">
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
            <button className="btn btn-secondary dashboard-ghost-button" onClick={() => navigate("/perfil/editar")}>
              Editar perfil
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
          <strong>0</strong>
          <p>Sin experiencia registrada</p>
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
            <p className="dashboard-profile-role">{perfil?.titular_profesional || "Agrega tu rol o especialidad"}</p>
            <div className="dashboard-contact-list" aria-label="Datos de contacto">
              {perfil?.correo ? (
                <a className="dashboard-contact-item" href={`mailto:${perfil.correo}`}>
                  <strong>{perfil.correo}</strong>
                </a>
              ) : (
                <span className="dashboard-contact-item muted">
                  <strong>Correo de la cuenta</strong>
                </span>
              )}

              {perfil?.telefono ? (
                <a className="dashboard-contact-item" href={phoneHref}>
                  <strong>{perfil.telefono}</strong>
                </a>
              ) : (
                <span className="dashboard-contact-item muted">
                  <strong>Agrega tu numero</strong>
                </span>
              )}
            </div>
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

      <section className="surface-card dashboard-panel dashboard-experience-panel">
        <div className="section-head dashboard-skills-head">
          <div>
            <p className="section-label">Experiencia profesional</p>
            <h2 className="section-title">Trayectoria laboral y participaciones</h2>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate("/perfil/experiencia")}>
            Gestionar
          </button>
        </div>

        <div className="dashboard-empty-note">
          Aun no registraste experiencia. Esta seccion quedara preparada para cargos, instituciones, periodos, logros y evidencias profesionales.
        </div>
      </section>

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
                {project.url_imagen ? (
                  <img src={project.url_imagen} alt={project.titulo} className="dashboard-project-thumb" />
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

                  <p className="section-copy">{project.descripcion}</p>

                  <div className="dashboard-skill-chip-list">
                    {(project.tecnologias || []).slice(0, 5).map((technology) => (
                      <span key={technology} className="dashboard-skill-chip muted">
                        {technology}
                      </span>
                    ))}
                  </div>

                  {project.enlace_proyecto ? (
                    <a href={project.enlace_proyecto} target="_blank" rel="noreferrer" className="dashboard-project-link">
                      Ver evidencia
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
