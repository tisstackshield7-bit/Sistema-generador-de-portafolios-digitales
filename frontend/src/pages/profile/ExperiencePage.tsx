import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import AlertMessage from "../../components/common/AlertMessage";
import RichTextContent from "../../components/common/RichTextContent";
import RichTextEditor from "../../components/common/RichTextEditor";
import PrivateWorkspaceLayout from "../../components/dashboard/PrivateWorkspaceLayout";
import { getMyProfile } from "../../api/profile";
import {
  createExperience,
  deleteExperience,
  getMyExperiences,
  updateExperience,
  updateExperienceVisibility,
} from "../../api/experience";
import type { Perfil } from "../../types/profile";
import type { Experience, ExperiencePayload, ExperienceType } from "../../types/experience";
import { isRichTextEmpty, limitRichText } from "../../utils/richText";

const EMPTY_FORM: ExperiencePayload = {
  tipo: "laboral",
  titulo: "",
  institucion: "",
  ubicacion: "",
  descripcion: "",
  fecha_inicio: "",
  fecha_fin: "",
  actualidad: false,
  logros: "",
  visible_publico: false,
};

type ApiErrorData = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

function getApiErrorData(error: unknown) {
  if (error instanceof AxiosError) {
    return error.response?.data as ApiErrorData | undefined;
  }

  return undefined;
}

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-BO", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function getDateRange(experience: Experience) {
  const start = formatDate(experience.fecha_inicio);
  const end = experience.actualidad ? "Presente" : formatDate(experience.fecha_fin);
  return [start, end].filter(Boolean).join(" - ");
}

function normalizeAchievements(value = "") {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function EyeIcon({ off = false }: { off?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-16">
      <path
        d={off
          ? "M3 4.5 19.5 21M10.6 6.2A10.9 10.9 0 0 1 12 6c5.5 0 9.4 4.8 10 6-.3.7-1.8 3-4.3 4.7M14.8 14.9A3 3 0 0 1 9.1 9.2"
          : "M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExperienceIcon({ type }: { type: ExperienceType }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="experience-card-icon">
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
            <path d="M21 8v6" />
          </>
        )}
      </g>
    </svg>
  );
}

export default function ExperiencePage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [experiencias, setExperiencias] = useState<Experience[]>([]);
  const [activeTab, setActiveTab] = useState<ExperienceType>("laboral");
  const [showForm, setShowForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Experience | null>(null);
  const [form, setForm] = useState<ExperiencePayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, experienceData] = await Promise.all([getMyProfile(), getMyExperiences()]);
        setPerfil(profileData.perfil || null);
        setExperiencias(experienceData.experiencias || []);
      } catch {
        setServerError("No se pudo cargar la experiencia.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const laboralCount = experiencias.filter((item) => item.tipo === "laboral").length;
  const academicCount = experiencias.filter((item) => item.tipo === "academica").length;
  const filteredExperiences = useMemo(
    () => experiencias.filter((item) => item.tipo === activeTab),
    [activeTab, experiencias],
  );

  const openCreateForm = (tipo: ExperienceType) => {
    setActiveTab(tipo);
    setEditingExperience(null);
    setForm({ ...EMPTY_FORM, tipo });
    setErrors({});
    setServerError("");
    setShowForm(true);
  };

  const openEditForm = (experience: Experience) => {
    setEditingExperience(experience);
    setForm({
      tipo: experience.tipo,
      titulo: experience.titulo,
      institucion: experience.institucion,
      ubicacion: experience.ubicacion || "",
      descripcion: experience.descripcion || "",
      fecha_inicio: experience.fecha_inicio || "",
      fecha_fin: experience.fecha_fin || "",
      actualidad: experience.actualidad,
      logros: (experience.logros || []).join("\n"),
      visible_publico: experience.visible_publico,
    });
    setErrors({});
    setServerError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingExperience(null);
    setForm({ ...EMPTY_FORM, tipo: activeTab });
    setErrors({});
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.titulo.trim()) nextErrors.titulo = "El titulo es obligatorio.";
    if (!form.institucion.trim()) nextErrors.institucion = "La institucion es obligatoria.";
    if (isRichTextEmpty(form.descripcion || "")) nextErrors.descripcion = "La descripcion es obligatoria.";
    if (!form.fecha_inicio) nextErrors.fecha_inicio = "La fecha de inicio es obligatoria.";
    if (form.fecha_inicio && form.fecha_fin && form.fecha_fin < form.fecha_inicio) {
      nextErrors.fecha_fin = "La fecha de fin no puede ser anterior a la fecha de inicio.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError("");

    if (!validate()) return;

    setSaving(true);

    try {
      const payload: ExperiencePayload = {
        ...form,
        titulo: form.titulo.trim(),
        institucion: form.institucion.trim(),
        ubicacion: form.ubicacion?.trim() || "",
        descripcion: isRichTextEmpty(form.descripcion || "") ? "" : limitRichText(form.descripcion || "", 1800),
        fecha_fin: form.fecha_fin || "",
        actualidad: !form.fecha_fin,
        logros: normalizeAchievements(form.logros).join("\n"),
      };

      const data = editingExperience
        ? await updateExperience(editingExperience.id, payload)
        : await createExperience(payload);
      const updatedExperience = data.experiencia as Experience;

      setExperiencias((prev) => {
        if (editingExperience) {
          return prev.map((item) => (item.id === updatedExperience.id ? updatedExperience : item));
        }

        return [updatedExperience, ...prev];
      });

      closeForm();
    } catch (error: unknown) {
      const errorData = getApiErrorData(error);
      const apiErrors = errorData?.errors || {};
      const fieldErrors: Record<string, string> = {};

      Object.entries(apiErrors).forEach(([field, value]) => {
        fieldErrors[field] = Array.isArray(value) ? String(value[0]) : String(value);
      });

      setErrors((prev) => ({ ...prev, ...fieldErrors }));
      setServerError(errorData?.message || "No se pudo guardar la experiencia.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (experience: Experience) => {
    try {
      const data = await updateExperienceVisibility(experience.id, !experience.visible_publico);
      const updatedExperience = data.experiencia as Experience;
      setExperiencias((prev) => prev.map((item) => (item.id === updatedExperience.id ? updatedExperience : item)));
      setServerError("");
    } catch (error: unknown) {
      const errorData = getApiErrorData(error);
      setServerError(errorData?.message || "No se pudo actualizar la visibilidad.");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteExperience(pendingDelete.id);
      setExperiencias((prev) => prev.filter((item) => item.id !== pendingDelete.id));
      setServerError("");
    } catch (error: unknown) {
      const errorData = getApiErrorData(error);
      setServerError(errorData?.message || "No se pudo eliminar la experiencia.");
    } finally {
      setPendingDelete(null);
    }
  };

  if (loading) {
    return (
      <PrivateWorkspaceLayout active="experience" perfil={perfil} title="Experiencia" subtitle="Gestiona tu experiencia laboral y academica">
        <section className="surface-card workspace-section-card">
          <p className="section-copy">Cargando experiencia...</p>
        </section>
      </PrivateWorkspaceLayout>
    );
  }

  return (
    <PrivateWorkspaceLayout active="experience" perfil={perfil} title="Experiencia" subtitle="Gestiona tu experiencia laboral y academica">
      <div className="experience-page">
        <AlertMessage message={serverError} />

        <div className="experience-toolbar">
          <div className="skills-tabs" role="tablist" aria-label="Tipos de experiencia">
            <button type="button" className={`skills-tab ${activeTab === "laboral" ? "active" : ""}`} onClick={() => setActiveTab("laboral")}>
              Experiencia Laboral ({laboralCount})
            </button>
            <button type="button" className={`skills-tab ${activeTab === "academica" ? "active" : ""}`} onClick={() => setActiveTab("academica")}>
              Experiencia Academica ({academicCount})
            </button>
          </div>

          <button type="button" className="btn btn-primary" onClick={() => openCreateForm(activeTab)}>
            + Nueva Experiencia {activeTab === "laboral" ? "Laboral" : "Academica"}
          </button>
        </div>

        <section className="experience-list">
          {filteredExperiences.length ? (
            filteredExperiences.map((experience) => (
              <article key={experience.id} className="surface-card experience-card">
                <div className="experience-card-mark">
                  <ExperienceIcon type={experience.tipo} />
                </div>

                <div className="experience-card-body">
                  <div className="experience-card-head">
                    <div>
                      <h2>{experience.titulo}</h2>
                      <p className="experience-institution">{experience.institucion}</p>
                      {experience.ubicacion ? <p className="meta-text">{experience.ubicacion}</p> : null}
                      <p className="meta-text">{getDateRange(experience)}</p>
                    </div>
                    <span className={`skill-visibility-pill ${experience.visible_publico ? "visible" : "hidden"}`}>
                      {experience.visible_publico ? "Visible" : "Oculta"}
                    </span>
                  </div>

                  {experience.descripcion ? (
                    <RichTextContent value={experience.descripcion} className="section-copy" />
                  ) : null}

                  {experience.logros?.length ? (
                    <div>
                      <p className="experience-achievement-label">Logros</p>
                      <ul className="project-achievement-list">
                        {experience.logros.map((achievement) => (
                          <li key={achievement}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                </div>

                <div className="experience-card-actions">
                  <button type="button" className="icon-action-button" onClick={() => handleToggleVisibility(experience)} title={experience.visible_publico ? "Ocultar" : "Mostrar"}>
                    <EyeIcon off={!experience.visible_publico} />
                  </button>
                  <button type="button" className="icon-action-button" onClick={() => openEditForm(experience)} title="Editar">
                    Editar
                  </button>
                  <button type="button" className="icon-action-button danger" onClick={() => setPendingDelete(experience)} title="Eliminar">
                    Eliminar
                  </button>
                </div>
              </article>
            ))
          ) : (
            <article className="surface-card empty-state-card">
              <h3>No tienes experiencia {activeTab === "laboral" ? "laboral" : "academica"} registrada</h3>
              <p className="section-copy">Agrega una experiencia para enriquecer tu portafolio profesional.</p>
            </article>
          )}
        </section>

        {showForm ? (
          <div className="skills-modal-backdrop" role="presentation">
            <section className="surface-card skills-modal experience-form-modal" role="dialog" aria-modal="true">
              <div className="skills-modal-head">
                <div>
                  <h2>{editingExperience ? "Actualizar experiencia" : `Nueva Experiencia ${form.tipo === "laboral" ? "Laboral" : "Academica"}`}</h2>
                  <p className="section-copy">
                    {editingExperience ? "Actualiza la informacion que aparecera en tu portafolio." : "Agrega una nueva experiencia a tu portafolio."}
                  </p>
                </div>
                <button type="button" className="modal-close-button" onClick={closeForm} aria-label="Cerrar formulario">
                  x
                </button>
              </div>

              <form className="form-stack experience-form-stack" onSubmit={handleSubmit}>
                <div className="form-field">
                  <label className="form-label">{form.tipo === "laboral" ? "Cargo/Posicion *" : "Titulo academico *"}</label>
                  <input
                    className={`form-input${errors.titulo ? " error" : ""}`}
                    value={form.titulo}
                    placeholder={form.tipo === "laboral" ? "Ej: Desarrollador Full Stack Senior" : "Ej: Master en Ingenieria de Software"}
                    onChange={(event) => setForm((prev) => ({ ...prev, titulo: event.target.value }))}
                  />
                  {errors.titulo ? <p className="form-error">{errors.titulo}</p> : null}
                </div>

                <div className="form-field">
                  <label className="form-label">{form.tipo === "laboral" ? "Empresa *" : "Institucion *"}</label>
                  <input
                    className={`form-input${errors.institucion ? " error" : ""}`}
                    value={form.institucion}
                    placeholder={form.tipo === "laboral" ? "Ej: TechCorp Solutions" : "Ej: Universidad Politecnica"}
                    onChange={(event) => setForm((prev) => ({ ...prev, institucion: event.target.value }))}
                  />
                  {errors.institucion ? <p className="form-error">{errors.institucion}</p> : null}
                </div>

                <div className="form-field">
                  <label className="form-label">Ubicacion</label>
                  <input
                    className={`form-input${errors.ubicacion ? " error" : ""}`}
                    value={form.ubicacion || ""}
                    placeholder="Ej: Cercado, Cochabamba"
                    onChange={(event) => setForm((prev) => ({ ...prev, ubicacion: event.target.value }))}
                  />
                  {errors.ubicacion ? <p className="form-error">{errors.ubicacion}</p> : null}
                </div>

                <RichTextEditor
                  label="Descripcion *"
                  value={form.descripcion || ""}
                  error={errors.descripcion}
                  placeholder="Describe tus responsabilidades, logros y aprendizajes..."
                  onChange={(value) => setForm((prev) => ({ ...prev, descripcion: limitRichText(value, 1800) }))}
                />

                <div className="workspace-form-grid">
                  <div className="form-field">
                    <label className="form-label">Fecha de Inicio *</label>
                    <input
                      className={`form-input${errors.fecha_inicio ? " error" : ""}`}
                      type="date"
                      value={form.fecha_inicio}
                      onChange={(event) => setForm((prev) => ({ ...prev, fecha_inicio: event.target.value }))}
                    />
                    {errors.fecha_inicio ? <p className="form-error">{errors.fecha_inicio}</p> : null}
                  </div>

                  <div className="form-field">
                    <label className="form-label">Fecha de Fin</label>
                    <input
                      className={`form-input${errors.fecha_fin ? " error" : ""}`}
                      type="date"
                      value={form.fecha_fin}
                      onChange={(event) => setForm((prev) => ({ ...prev, fecha_fin: event.target.value }))}
                    />
                    <p className="form-help">Deja en blanco si es actual</p>
                    {errors.fecha_fin ? <p className="form-error">{errors.fecha_fin}</p> : null}
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Logros (uno por linea)</label>
                  <textarea
                    className="form-input form-textarea"
                    value={form.logros}
                    placeholder={"Logro 1\nLogro 2\nLogro 3"}
                    onChange={(event) => setForm((prev) => ({ ...prev, logros: event.target.value }))}
                  />
                </div>

                <label className="visibility-toggle experience-public-toggle">
                  <span>
                    <strong>Visible en portafolio publico</strong>
                    <small>Controla si esta experiencia aparece en tu portafolio publico.</small>
                  </span>
                  <button
                    type="button"
                    className={`toggle-switch ${form.visible_publico ? "active" : ""}`}
                    onClick={() => setForm((prev) => ({ ...prev, visible_publico: !prev.visible_publico }))}
                    aria-pressed={form.visible_publico}
                  >
                    <span />
                  </button>
                </label>

                <div className="form-actions-row">
                  <button type="button" className="btn btn-secondary" onClick={closeForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {editingExperience ? "Guardar Cambios" : "Crear Experiencia"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        ) : null}

        {pendingDelete ? (
          <div className="skills-modal-backdrop" role="presentation">
            <section className="surface-card confirm-card" role="dialog" aria-modal="true">
              <p className="section-label">Confirmar eliminacion</p>
              <h3>Eliminar "{pendingDelete.titulo}"</h3>
              <p className="section-copy">Esta accion quitara la experiencia de tu portafolio.</p>
              <div className="form-actions-row">
                <button type="button" className="btn btn-secondary" onClick={() => setPendingDelete(null)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={confirmDelete}>
                  Confirmar eliminacion
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </PrivateWorkspaceLayout>
  );
}
