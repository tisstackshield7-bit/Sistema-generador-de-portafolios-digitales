import { useEffect, useState } from "react";
import { exportAdminReports, getAdminReports } from "../../api/admin";
import AlertMessage from "../../components/common/AlertMessage";
import AdminLayout from "../../components/admin/AdminLayout";
import type { AdminReportsResponse } from "../../types/admin";

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatTypeLabel(type: string) {
  return type.replace(/_/g, " ");
}

export default function AdminReportsPage() {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminReportsResponse | null>(null);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    getAdminReports({ buscar: query, tipo: selectedType, page })
      .then((response) => {
        setData(response);
        setServerError("");
      })
      .catch(() => {
        setData(null);
        setServerError("No se pudieron cargar los reportes.");
      });
  }, [page, query, selectedType]);

  const handleExport = async () => {
    try {
      const blob = await exportAdminReports({ buscar: query, tipo: selectedType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "logs-actividad.csv";
      anchor.click();
      URL.revokeObjectURL(url);
      setServerError("");
    } catch {
      setServerError("No se pudo exportar el reporte.");
    }
  };

  return (
    <AdminLayout
      active="reports"
      title="Reportes y Estadisticas"
      subtitle="Analisis completo del sistema de portafolios"
      actions={(
        <button type="button" className="btn btn-primary" onClick={handleExport}>
          Exportar Logs
        </button>
      )}
    >
      <AlertMessage message={serverError} />

      <section className="surface-card admin-report-tabs">
        <button type="button" className="admin-report-tab active">
          Logs de Actividad
          <span>{data?.reportes.total ?? 0}</span>
        </button>
      </section>

      <section className="admin-report-summary-grid">
        <article className="surface-card admin-report-summary-card tone-blue">
          <div>
            <h3>Total Actividades</h3>
            <strong>{data?.resumen.total_actividades ?? 0}</strong>
          </div>
        </article>
        <article className="surface-card admin-report-summary-card tone-green">
          <div>
            <h3>Inicios de Sesion</h3>
            <strong>{data?.resumen.inicios_sesion ?? 0}</strong>
          </div>
        </article>
        <article className="surface-card admin-report-summary-card tone-violet">
          <div>
            <h3>Ediciones</h3>
            <strong>{data?.resumen.ediciones ?? 0}</strong>
          </div>
        </article>
        <article className="surface-card admin-report-summary-card tone-amber">
          <div>
            <h3>Busquedas</h3>
            <strong>{data?.resumen.busquedas ?? 0}</strong>
          </div>
        </article>
      </section>

      <section className="surface-card admin-report-toolbar">
        <input
          className="form-input"
          value={query}
          onChange={(event) => {
            setPage(1);
            setQuery(event.target.value);
          }}
          placeholder="Buscar actividades..."
        />
        <select
          className="form-input"
          value={selectedType}
          onChange={(event) => {
            setPage(1);
            setSelectedType(event.target.value);
          }}
        >
          <option value="">Todas las acciones</option>
          {(data?.tipos || []).map((type) => (
            <option key={type} value={type}>
              {formatTypeLabel(type)}
            </option>
          ))}
        </select>
      </section>

      <section className="surface-card admin-panel-card">
        <div className="admin-panel-head">
          <div>
            <h3>Registro de Actividades</h3>
            <p>Historial completo de acciones registradas en la plataforma</p>
          </div>
        </div>

        <div className="admin-report-list">
          {(data?.reportes.data || []).map((report) => (
            <article key={report.id} className="admin-report-card">
              <div className="admin-report-main">
                <div className="admin-report-badge">{formatTypeLabel(report.tipo)}</div>
                <div>
                  <strong>{report.actor_nombre || report.actor_correo || "Sistema"}</strong>
                  <p>{report.descripcion}</p>
                  <small>{formatDate(report.creado_en)}{report.ip_usuario ? ` · ${report.ip_usuario}` : ""}</small>
                </div>
              </div>
            </article>
          ))}
          {!data?.reportes.data?.length ? <p className="meta-text">No hay actividades que coincidan con esos filtros.</p> : null}
        </div>

        {data?.reportes ? (
          <div className="admin-pagination">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={data.reportes.current_page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Anterior
            </button>
            <span>
              Pagina {data.reportes.current_page} de {data.reportes.last_page}
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={data.reportes.current_page >= data.reportes.last_page}
              onClick={() => setPage((current) => current + 1)}
            >
              Siguiente
            </button>
          </div>
        ) : null}
      </section>
    </AdminLayout>
  );
}
