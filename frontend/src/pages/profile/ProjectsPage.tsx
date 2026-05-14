import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import AlertMessage from "../../components/common/AlertMessage";
import RichTextContent from "../../components/common/RichTextContent";
import RichTextEditor from "../../components/common/RichTextEditor";
import PrivateWorkspaceLayout from "../../components/dashboard/PrivateWorkspaceLayout";
import { getMyProfile } from "../../api/profile";
import { createProject, deleteProject, getMyProjects, updateProject, updateProjectVisibility } from "../../api/projects";
import { getMySkills } from "../../api/skills";
import type { Perfil } from "../../types/profile";
import type { Project, ProjectPayload } from "../../types/project";
import type { Skill } from "../../types/skill";
import { resolveProjectImageSrc, isAbsoluteImageUrl } from "../../utils/projectImages";
import { isRichTextEmpty, limitRichText } from "../../utils/richText";
import { sanitizeAlphaNumericText, sanitizePlainMultilineText, validateProjectImage } from "../../utils/validations";

const EMPTY_FORM: ProjectPayload = {
  titulo: "",
  rol: "",
  descripcion: "",
  fecha_inicio: "",
  fecha_fin: "",
  tecnologias: "",
  logros: "",
  enlace_proyecto: "",
  url_imagen: "",
  visible_publico: false,
};

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

function normalizeTechnologies(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeAchievements(value = "") {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value?: string | null) {
  if (!value) return "Actualidad";
  return new Intl.DateTimeFormat("es-BO", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

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

function getProjectFallback(project: Project) {
  return project.titulo.trim().slice(0, 2).toUpperCase() || "PR";
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [proyectos, setProyectos] = useState<Project[]>([]);
  const [habilidades, setHabilidades] = useState<Skill[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<number, true>>({});
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectPayload>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [imageDirty, setImageDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileData = await getMyProfile();

        if (!profileData.perfil) {
          navigate("/perfil/crear", { replace: true });
          return;
        }

        const [projectData, skillData] = await Promise.all([getMyProjects(), getMySkills()]);
        setPerfil(profileData.perfil);
        setProyectos(projectData.proyectos || []);
        setHabilidades(skillData.habilidades || []);
      } catch {
        setServerError("No se pudieron cargar los proyectos.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  useEffect(() => {
    if (!imageFile) {
      setFilePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setFilePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const publicCount = useMemo(() => proyectos.filter((project) => project.visible_publico).length, [proyectos]);
  const technologyCount = useMemo(
    () => new Set(proyectos.flatMap((project) => project.tecnologias || [])).size,
    [proyectos],
  );
  const skillLinkSuggestions = useMemo(
    () => habilidades.map((skill) => ({
      label: skill.nombre,
      href: `#habilidad-${skill.id}`,
    })),
    [habilidades],
  );

  const openCreateForm = () => {
    setEditingProject(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setExistingImage(null);
    setImageDirty(false);
    setErrors({});
    setServerError("");
    setShowForm(true);
  };

  const openEditForm = (project: Project) => {
    setEditingProject(project);
    setForm({
      titulo: sanitizeAlphaNumericText(project.titulo),
      rol: sanitizeAlphaNumericText(project.rol),
      descripcion: project.descripcion,
      fecha_inicio: project.fecha_inicio || "",
      fecha_fin: project.fecha_fin || "",
      tecnologias: (project.tecnologias || []).join(", "),
      logros: sanitizePlainMultilineText((project.logros || []).join("\n")),
      enlace_proyecto: project.enlace_proyecto || "",
      url_imagen: isAbsoluteImageUrl(project.url_imagen) ? project.url_imagen || "" : "",
      visible_publico: project.visible_publico,
    });
    setImageFile(null);
    setExistingImage(project.url_imagen || null);
    setImageDirty(false);
    setErrors({});
    setServerError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setExistingImage(null);
    setImageDirty(false);
    setErrors({});
  };

  const handleImageUrlChange = (value: string) => {
    if (value.trim() && imageFile) {
      setImageFile(null);
    }

    setImageDirty(true);
    setForm((prev) => ({ ...prev, url_imagen: value }));

    if (errors.url_imagen || errors.imagen_archivo) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.url_imagen;
        delete next.imagen_archivo;
        return next;
      });
    }
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    setImageDirty(true);
    setImageFile(file);
    setForm((prev) => ({ ...prev, url_imagen: "" }));
    setExistingImage(null);

    if (errors.url_imagen || errors.imagen_archivo) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.url_imagen;
        delete next.imagen_archivo;
        return next;
      });
    }
  };

  const clearProjectImage = () => {
    setImageDirty(true);
    setImageFile(null);
    setExistingImage(null);
    setForm((prev) => ({ ...prev, url_imagen: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const technologies = normalizeTechnologies(form.tecnologias);
    const urlPattern = /^https?:\/\/.+\..+/i;

    if (!form.titulo.trim()) nextErrors.titulo = "El titulo del proyecto es obligatorio.";
    if (!form.rol.trim()) nextErrors.rol = "Tu rol en el proyecto es obligatorio.";
    if (isRichTextEmpty(form.descripcion)) nextErrors.descripcion = "La descripcion del proyecto es obligatoria.";
    if (!form.fecha_inicio) nextErrors.fecha_inicio = "La fecha de inicio es obligatoria.";
    if (!technologies.length) nextErrors.tecnologias = "Debes agregar al menos una tecnologia.";
    if (form.fecha_inicio && form.fecha_fin && form.fecha_fin < form.fecha_inicio) {
      nextErrors.fecha_fin = "La fecha de fin no puede ser anterior a la fecha de inicio.";
    }
    if (form.enlace_proyecto?.trim() && !urlPattern.test(form.enlace_proyecto.trim())) {
      nextErrors.enlace_proyecto = "Ingrese un enlace valido";
    }
    if (imageFile) {
      const imageError = validateProjectImage(imageFile);
      if (imageError) nextErrors.imagen_archivo = imageError;
    } else if (form.url_imagen?.trim() && !urlPattern.test((form.url_imagen || "").trim())) {
      nextErrors.url_imagen = "Ingrese una URL de imagen valida.";
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
      const payload: ProjectPayload = {
        ...form,
        titulo: form.titulo.trim(),
        rol: form.rol.trim(),
        descripcion: limitRichText(form.descripcion, 1800),
        tecnologias: normalizeTechnologies(form.tecnologias).join(", "),
        logros: normalizeAchievements(form.logros).join("\n"),
        enlace_proyecto: form.enlace_proyecto?.trim() || "",
        imagen_archivo: imageFile,
        visible_publico: form.visible_publico,
      };

      if (!editingProject || imageDirty || (form.url_imagen || "").trim()) {
        payload.url_imagen = form.url_imagen?.trim() || "";
      }

      const data = editingProject
        ? await updateProject(editingProject.id, payload)
        : await createProject(payload);
      const updatedProject = data.proyecto as Project;
      setImageErrors((prev) => {
        const next = { ...prev };
        delete next[updatedProject.id];
        return next;
      });

      setProyectos((prev) => {
        if (editingProject) {
          return prev.map((item) => (item.id === updatedProject.id ? updatedProject : item));
        }

        return [updatedProject, ...prev];
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
      setServerError(errorData?.message || "No se pudo guardar el proyecto.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (project: Project) => {
    try {
      const data = await updateProjectVisibility(project.id, !project.visible_publico);
      const updatedProject = data.proyecto as Project;

      setProyectos((prev) => prev.map((item) => (item.id === updatedProject.id ? updatedProject : item)));
      setServerError("");
    } catch (error: unknown) {
      const errorData = getApiErrorData(error);
      setServerError(errorData?.message || "No se pudo actualizar la visibilidad.");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteProject(pendingDelete.id);
      setProyectos((prev) => prev.filter((item) => item.id !== pendingDelete.id));
      setServerError("");
    } catch (error: unknown) {
      const errorData = getApiErrorData(error);
      setServerError(errorData?.message || "No se pudo eliminar el proyecto.");
    } finally {
      setPendingDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="profile-page-shell app-shell">
        <div className="page-section surface-card auth-card">
          <p className="section-copy">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  const imagePreview = filePreview || (form.url_imagen || "").trim() || resolveProjectImageSrc(existingImage);

  return (
    <PrivateWorkspaceLayout active="projects" perfil={perfil} title="Proyectos" subtitle="">
      <div className="projects-page">
        <AlertMessage message={serverError} />

        <section className="skills-summary-grid">
          <article className="surface-card skills-summary-card">
            <p className="section-label">Registrados</p>
            <strong>{proyectos.length}</strong>
            <p className="meta-text">Proyectos personales dentro de tu portafolio.</p>
          </article>
          <article className="surface-card skills-summary-card">
            <p className="section-label">Visibles</p>
            <strong>{publicCount}</strong>
            <p className="meta-text">Proyectos publicados en tu portafolio publico.</p>
          </article>
          <article className="surface-card skills-summary-card">
            <p className="section-label">Tecnologias</p>
            <strong>{technologyCount}</strong>
            <p className="meta-text">Herramientas registradas en tus proyectos.</p>
          </article>
        </section>

        <section className="surface-card skills-panel">
          <div className="skills-toolbar">
            <div>
              <p className="section-label">Lista de proyectos</p>
              <h2 className="section-title">Experiencia practica registrada</h2>
            </div>
            <button className="btn btn-primary" onClick={openCreateForm}>
              + Nuevo Proyecto
            </button>
          </div>

          {proyectos.length ? (
            <div className="projects-card-grid">
              {proyectos.map((project) => (
                <article key={project.id} className="project-card">
                  {resolveProjectImageSrc(project.url_imagen) && !imageErrors[project.id] ? (
                    <img
                      src={resolveProjectImageSrc(project.url_imagen) || ""}
                      alt={project.titulo}
                      className="project-card-image"
                      onError={() => setImageErrors((prev) => ({ ...prev, [project.id]: true }))}
                    />
                  ) : (
                    <div className="project-card-image project-image-fallback">{getProjectFallback(project)}</div>
                  )}

                  <div className="skill-card-head">
                    <div>
                      <p className="section-label">{formatDate(project.fecha_inicio)} - {formatDate(project.fecha_fin)}</p>
                      <h3>{project.titulo}</h3>
                    </div>
                    <span className={`skill-visibility-pill ${project.visible_publico ? "visible" : "hidden"}`}>
                      {project.visible_publico ? "Visible" : "Oculto"}
                    </span>
                  </div>

                  <p className="project-role">{project.rol}</p>
                  <RichTextContent value={project.descripcion} className="section-copy" />

                  <div className="profile-pill-list">
                    {(project.tecnologias || []).map((technology) => (
                      <span key={technology} className="profile-pill neutral">
                        {technology}
                      </span>
                    ))}
                  </div>

                  {project.logros?.length ? (
                    <ul className="project-achievement-list">
                      {project.logros.map((achievement) => (
                        <li key={achievement}>{achievement}</li>
                      ))}
                    </ul>
                  ) : null}

                  {project.enlace_proyecto ? (
                    <a href={project.enlace_proyecto} target="_blank" rel="noreferrer" className="project-link">
                      Ver evidencia
                    </a>
                  ) : null}

                  <div className="skill-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => openEditForm(project)}>
                      Editar
                    </button>
                    <button type="button" className="btn btn-secondary icon-button-text" onClick={() => handleToggleVisibility(project)}>
                      <EyeIcon off={!project.visible_publico} />
                      {project.visible_publico ? "Ocultar" : "Mostrar"}
                    </button>
                    <button type="button" className="btn btn-secondary danger-outline" onClick={() => setPendingDelete(project)}>
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state-card empty-skills-card">
              <h3>No tienes proyectos registrados</h3>
              <p className="section-copy">Crea tu primer proyecto para mostrar tu experiencia practica.</p>
            </div>
          )}
        </section>

        {showForm ? (
          <div className="skills-modal-backdrop" role="presentation">
            <section className="surface-card skills-modal project-modal" role="dialog" aria-modal="true">
              <div className="skills-modal-head">
                <div>
                  <p className="section-label">{editingProject ? "Editar proyecto" : "Nuevo proyecto"}</p>
                  <h2>{editingProject ? "Actualizar proyecto" : "Nuevo Proyecto"}</h2>
                </div>
              </div>

              <form className="form-stack" onSubmit={handleSubmit}>
                <div className="workspace-form-grid">
                  <div className="form-field">
                    <label className="form-label">Titulo *</label>
                    <input
                      className={`form-input${errors.titulo ? " error" : ""}`}
                      value={form.titulo}
                      placeholder="Ej: Plataforma de portafolios"
                      onChange={(event) => setForm((prev) => ({ ...prev, titulo: sanitizeAlphaNumericText(event.target.value) }))}
                    />
                    {errors.titulo ? <p className="form-error">{errors.titulo}</p> : null}
                  </div>

                  <div className="form-field">
                    <label className="form-label">Tu Rol *</label>
                    <input
                      className={`form-input${errors.rol ? " error" : ""}`}
                      value={form.rol}
                      placeholder="Ej: Desarrollador full stack"
                      onChange={(event) => setForm((prev) => ({ ...prev, rol: sanitizeAlphaNumericText(event.target.value) }))}
                    />
                    {errors.rol ? <p className="form-error">{errors.rol}</p> : null}
                  </div>
                </div>

                <RichTextEditor
                  label="Descripcion *"
                  value={form.descripcion}
                  placeholder="Describe objetivos, alcance y tu aporte principal."
                  onChange={(value) => setForm((prev) => ({ ...prev, descripcion: limitRichText(value, 1800) }))}
                  error={errors.descripcion}
                  linkSuggestions={skillLinkSuggestions}
                />

                <div className="workspace-form-grid">
                  <div className="form-field">
                    <label className="form-label">Fecha inicio *</label>
                    <input
                      className={`form-input${errors.fecha_inicio ? " error" : ""}`}
                      type="date"
                      value={form.fecha_inicio}
                      onChange={(event) => setForm((prev) => ({ ...prev, fecha_inicio: event.target.value }))}
                    />
                    {errors.fecha_inicio ? <p className="form-error">{errors.fecha_inicio}</p> : null}
                  </div>

                  <div className="form-field">
                    <label className="form-label">Fecha fin</label>
                    <input
                      className={`form-input${errors.fecha_fin ? " error" : ""}`}
                      type="date"
                      value={form.fecha_fin}
                      onChange={(event) => setForm((prev) => ({ ...prev, fecha_fin: event.target.value }))}
                    />
                    {errors.fecha_fin ? <p className="form-error">{errors.fecha_fin}</p> : null}
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Tecnologias *</label>
                  <input
                    className={`form-input${errors.tecnologias ? " error" : ""}`}
                    value={form.tecnologias}
                    placeholder="React, Laravel, PostgreSQL"
                    onChange={(event) => setForm((prev) => ({ ...prev, tecnologias: event.target.value }))}
                  />
                  <p className="form-help">Escribe las tecnologias separadas por coma.</p>
                  {errors.tecnologias ? <p className="form-error">{errors.tecnologias}</p> : null}
                </div>

                <div className="workspace-form-grid">
                  <div className="form-field">
                    <label className="form-label">Enlace del proyecto</label>
                    <input
                      className={`form-input${errors.enlace_proyecto ? " error" : ""}`}
                      value={form.enlace_proyecto}
                      placeholder="https://github.com/proyecto"
                      onChange={(event) => setForm((prev) => ({ ...prev, enlace_proyecto: event.target.value }))}
                    />
                    {errors.enlace_proyecto ? <p className="form-error">{errors.enlace_proyecto}</p> : null}
                  </div>

                  <div className="form-field">
                    <label className="form-label">URL de la Imagen</label>
                    <input
                      className={`form-input${errors.url_imagen ? " error" : ""}`}
                      value={form.url_imagen}
                      placeholder="https://sitio.com/imagen.png"
                      onChange={(event) => handleImageUrlChange(event.target.value)}
                    />
                    {errors.url_imagen ? <p className="form-error">{errors.url_imagen}</p> : null}
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Subir imagen</label>
                  {imagePreview ? <img src={imagePreview} alt="Vista previa del proyecto" className="project-form-image-preview" /> : null}
                  <input
                    className={`form-file${errors.imagen_archivo ? " error" : ""}`}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleImageFileChange}
                  />
                  <p className="form-help">Puedes usar una URL externa o subir un archivo JPG, PNG o WEBP de hasta 5 MB.</p>
                  {existingImage && !(form.url_imagen || "").trim() && !imageFile ? (
                    <p className="form-help">La imagen actual se mantendra si no la reemplazas.</p>
                  ) : null}
                  {imagePreview ? (
                    <button type="button" className="btn btn-secondary project-image-clear-button" onClick={clearProjectImage}>
                      Quitar imagen
                    </button>
                  ) : null}
                  {errors.imagen_archivo ? <p className="form-error">{errors.imagen_archivo}</p> : null}
                </div>

                <div className="form-field">
                  <label className="form-label">Logros (uno por linea)</label>
                  <textarea
                    className="form-input form-textarea"
                    value={form.logros}
                    placeholder={"Logro 1\nLogro 2\nLogro 3"}
                    onChange={(event) => setForm((prev) => ({ ...prev, logros: sanitizePlainMultilineText(event.target.value) }))}
                  />
                  <p className="form-help">Agrega resultados, impactos o mejoras importantes del proyecto.</p>
                </div>

                <label className="visibility-toggle">
                  <span>
                    <strong>Visible en portafolio publico</strong>
                    <small>Controla si este proyecto aparece en tu portafolio publico</small>
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
                    Guardar proyecto
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
              <p className="section-copy">Esta accion quitara el proyecto de tu lista registrada.</p>
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
