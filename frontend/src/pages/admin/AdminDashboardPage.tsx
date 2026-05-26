import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ORIGIN } from "../../api/axios";
import { getAdminDashboard } from "../../api/admin";
import AlertMessage from "../../components/common/AlertMessage";
import AdminLayout from "../../components/admin/AdminLayout";
import type { AdminDashboardResponse, AdminUserSummary } from "../../types/admin";

function getAvatarSrc(user: AdminUserSummary) {
  return user.perfil?.foto_perfil ? `${API_ORIGIN}/storage/${user.perfil.foto_perfil}` : "";
}

function getInitials(user: AdminUserSummary) {
  const source = user.perfil?.nombre_completo || user.correo;
  return source
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    getAdminDashboard()
      .then((response) => {
        setData(response);
        setServerError("");
      })
      .catch(() => {
        setData(null);
        setServerError("No se pudo cargar el panel de administración.");
      });
  }, []);

  return (
    <AdminLayout active="dashboard" title="Panel de Administración" subtitle="Gestión central del sistema de portafolios digitales.">
      <AlertMessage message={serverError} />

      <section className="admin-hero-banner">
        <div>
          <p className="section-label admin-hero-label">Administración</p>
          <h2>Supervisa usuarios, contenido y actividad del sistema</h2>
        </div>
      </section>

      <section className="admin-stat-grid">
        <article className="surface-card admin-stat-card">
          <h3>Usuarios Totales</h3>
          <strong>{data?.resumen.usuarios_totales ?? 0}</strong>
          <p>Usuarios registrados</p>
        </article>
        <article className="surface-card admin-stat-card">
          <h3>Proyectos</h3>
          <strong>{data?.resumen.proyectos_totales ?? 0}</strong>
          <p>Proyectos registrados</p>
        </article>
        <article className="surface-card admin-stat-card">
          <h3>Habilidades</h3>
          <strong>{data?.resumen.habilidades_totales ?? 0}</strong>
          <p>Habilidades registradas</p>
        </article>
        <article className="surface-card admin-stat-card">
          <h3>Promedio</h3>
          <strong>{data?.resumen.promedio_proyectos ?? 0}</strong>
          <p>Proyectos por usuario</p>
        </article>
      </section>

      <section className="admin-dashboard-grid">
        <article className="surface-card admin-panel-card">
          <div className="admin-panel-head">
            <div>
              <h3>Usuarios Recientes</h3>
              <p>Últimos perfiles registrados en la plataforma</p>
            </div>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/usuarios")}>
              Ver Todos
            </button>
          </div>

          <div className="admin-user-list">
            {(data?.usuarios_recientes || []).map((user) => (
              <article key={user.id} className="admin-user-list-item">
                {user.perfil?.foto_perfil ? (
                  <img src={getAvatarSrc(user)} alt={user.perfil.nombre_completo} className="admin-user-thumb" />
                ) : (
                  <div className="admin-user-thumb fallback">{getInitials(user)}</div>
                )}
                <div>
                  <strong>{user.perfil?.nombre_completo || user.correo}</strong>
                  <p>{user.perfil?.titular_profesional || user.perfil?.profesion || "Perfil sin completar"}</p>
                </div>
                <button type="button" className="btn btn-tertiary" onClick={() => navigate(`/admin/usuarios?usuario_id=${user.id}`)}>
                  Ver
                </button>
              </article>
            ))}
            {!data?.usuarios_recientes?.length ? <p className="meta-text">No hay usuarios registrados todavía.</p> : null}
          </div>
        </article>

        <article className="surface-card admin-panel-card">
          <div className="admin-panel-head">
            <div>
              <h3>Estadísticas</h3>
              <p>Resumen del sistema</p>
            </div>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/reportes")}>
              Ver Reportes
            </button>
          </div>

          <div className="admin-insight-list">
            <article className="admin-insight-card tone-blue">
              <div>
                <strong>Proyectos Visibles</strong>
                <p>Publicados en portafolios</p>
              </div>
              <span>{data?.estadisticas.proyectos_visibles ?? 0}</span>
            </article>

            <article className="admin-insight-card tone-green">
              <div>
                <strong>Habilidades Técnicas</strong>
                <p>Total registradas</p>
              </div>
              <span>{data?.estadisticas.habilidades_tecnicas ?? 0}</span>
            </article>

            <article className="admin-insight-card tone-violet">
              <div>
                <strong>Habilidades Blandas</strong>
                <p>Total registradas</p>
              </div>
              <span>{data?.estadisticas.habilidades_blandas ?? 0}</span>
            </article>

            <article className="admin-insight-card tone-amber">
              <div>
                <strong>Tasa de Completitud</strong>
                <p>Portafolios con base completa</p>
              </div>
              <span>{data?.estadisticas.tasa_completitud ?? 0}%</span>
            </article>
          </div>
        </article>
      </section>

      <section className="surface-card admin-actions-strip">
        <div>
          <h3>Acciones Rápidas</h3>
          <p>Accede de forma directa a las funciones más usadas del panel.</p>
        </div>
        <div className="admin-actions-row">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/usuarios")}>
            Gestionar Usuarios
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/reportes")}>
            Ver Reportes
          </button>
        </div>
      </section>
    </AdminLayout>
  );
}
