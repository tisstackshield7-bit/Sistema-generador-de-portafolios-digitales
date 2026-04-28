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

  return (
    <PrivateWorkspaceLayout active="dashboard" perfil={perfil} title="" subtitle="">
      <section className="dashboard-hero-panel">
        <div className="dashboard-hero-copy">
          <p className="section-label dashboard-light-label">Dashboard</p>
          <h1 className="dashboard-title">Bienvenido/a, {perfil?.nombre_completo || "Profesional"}</h1>
          <p className="dashboard-hero-role">{perfil?.profesion || "Completa tu perfil profesional"}</p>
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
          <p>
            {technicalSkills.length} tecnicas, {softSkills.length} blandas
          </p>
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
    </PrivateWorkspaceLayout>
  );
}
