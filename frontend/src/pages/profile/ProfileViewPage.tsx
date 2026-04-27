import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile } from "../../api/profile";
import type { Perfil } from "../../types/profile";
import { getInitials } from "../../utils/avatar";
import { logoutUser } from "../../api/auth";
import { authStore } from "../../store/authStore";
import { getProfilePhotoUrl } from "../../utils/profilePhoto";

function splitSkills(perfil: Perfil) {
  const technicalSkills = perfil.habilidades?.filter((skill) => skill.tipo === "tecnica") || [];
  const softSkills = perfil.habilidades?.filter((skill) => skill.tipo === "blanda") || [];
  const publicSkills = perfil.habilidades?.filter((skill) => skill.visible_publico) || [];

  return { technicalSkills, softSkills, publicSkills };
}

export default function ProfileViewPage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil | null>(null);

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
  const profilePhotoUrl = getProfilePhotoUrl(perfil.foto_perfil);

  return (
    <div className="profile-page-shell app-shell">
      <div className="page-section profile-page-grid">
        <section className="profile-main-area">
          <header className="profile-cover surface-card">
            <div className="profile-cover-content">
              <div className="profile-identity">
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt={perfil.nombre_completo} className="profile-avatar-xl" />
                ) : (
                  <div className="profile-avatar-xl fallback-avatar">{getInitials(perfil.nombre_completo)}</div>
                )}
                <div className="profile-identity-content">
                  <p className="section-label cover-label">Mi perfil</p>
                  <h1>{perfil.nombre_completo}</h1>
                  <p className="cover-role">{perfil.profesion}</p>
                  <p className="cover-location">Portafolio profesional listo para compartir</p>
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
                    <button className="btn btn-secondary" onClick={() => navigate("/")}>
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
                <p className="profile-lead-copy">{perfil.biografia || "Agrega un resumen para reforzar tu perfil profesional."}</p>
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
                          <div key={skill.id} className="skill-detail-card">
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
                          <div key={skill.id} className="skill-detail-card">
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
          </section>
        </section>

        <aside className="profile-side-column">
          <section className="profile-side-card">
            <p className="section-label">Resumen ejecutivo</p>
            <div className="profile-side-metrics">
              <div className="profile-side-metric">
                <span>Rol principal</span>
                <strong>{perfil.profesion}</strong>
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
