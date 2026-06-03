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
import type {
  AcademicAccreditationType,
  AcademicExperienceStatus,
  AcademicExperienceSubtype,
  Experience,
  ExperiencePayload,
  ExperienceType,
} from "../../types/experience";
import { isRichTextEmpty, limitRichText, richTextToPlainText, sanitizeRichText } from "../../utils/richText";
import {
  sanitizeAlphaNumericText,
  sanitizeDigits,
  sanitizeLocationText,
  sanitizePlainMultilineText,
  validatePastOrTodayDate,
} from "../../utils/validations";

const EMPTY_FORM: ExperiencePayload = {
  tipo: "laboral",
  titulo: "",
  institucion: "",
  ubicacion: "",
  descripcion: "",
  fecha_inicio: "",
  fecha_fin: "",
  actualidad: false,
  subtipo_academico: "",
  estado_academico: "",
  area_especializacion: "",
  tipo_acreditacion: "Sin acreditacion",
  cantidad_acreditacion: "",
  url_credencial: "",
  logros: "",
  visible_publico: false,
};

type AcademicFormationType = AcademicExperienceSubtype;

type AcademicDetails = {
  tipoFormacion: AcademicFormationType | "";
  especializacionArea: string;
  tipoAcreditacion: AcademicAccreditationType;
  cantidadAcreditacion: string;
  estadoAcademico: AcademicExperienceStatus | "";
  urlCredencial: string;
};

const EMPTY_ACADEMIC_DETAILS: AcademicDetails = {
  tipoFormacion: "Curso",
  especializacionArea: "",
  tipoAcreditacion: "Sin acreditacion",
  cantidadAcreditacion: "",
  estadoAcademico: "Finalizado",
  urlCredencial: "",
};

const ACADEMIC_FORMATION_OPTIONS: AcademicFormationType[] = [
  "Carrera universitaria",
  "Tecnico superior",
  "Diplomado",
  "Curso",
  "Bootcamp",
  "Certificacion",
  "Taller",
  "Seminario",
  "Posgrado / Maestria",
  "Investigacion",
  "Ponencia / Publicacion",
  "Otro",
];

const ACADEMIC_STATUS_OPTIONS: AcademicExperienceStatus[] = ["En curso", "Finalizado", "Vigente", "Vencido"];
const ACADEMIC_ACCREDITATION_OPTIONS: AcademicAccreditationType[] = ["Horas", "Modulos", "Creditos", "Sin acreditacion"];

type ApiErrorData = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

function focusFirstExperienceError() {
  window.requestAnimationFrame(() => {
    const modal = document.querySelector(".experience-form-modal");
    const firstErrorField = document.querySelector(
      ".experience-form-modal .form-input.error, .experience-form-modal .form-file.error, .experience-form-modal .form-textarea.error",
    ) as HTMLElement | null;

    if (modal instanceof HTMLElement) {
      modal.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (firstErrorField) {
      firstErrorField.scrollIntoView({ block: "center", behavior: "smooth" });
      firstErrorField.focus();
    }
  });
}

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
  const end = experience.actualidad ? "Actualidad" : formatDate(experience.fecha_fin);
  return [start, end].filter(Boolean).join(" - ");
}

function getAcademicMeta(experience: Experience) {
  const legacy = parseAcademicDescription(experience.descripcion || "").details;

  return {
    subtipo: experience.subtipo_academico || legacy.tipoFormacion,
    estado: experience.estado_academico || (experience.actualidad ? "En curso" : ""),
    area: experience.area_especializacion || legacy.especializacionArea,
    acreditacion: experience.tipo_acreditacion || legacy.tipoAcreditacion,
    cantidad: experience.cantidad_acreditacion ? String(experience.cantidad_acreditacion) : legacy.cantidadAcreditacion,
    urlCredencial: experience.url_credencial || "",
  };
}

function normalizeAchievements(value = "") {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizeAcademicLocationText(value: string) {
  return value.replace(/[^A-Za-z0-9\u00C1\u00C9\u00CD\u00D3\u00DA\u00DC\u00D1\u00E1\u00E9\u00ED\u00F3\u00FA\u00FC\u00F1\s.,/-]/g, "");
}

function parseAcademicDescription(description = "") {
  const plainText = richTextToPlainText(description);

  if (!plainText.startsWith("Tipo de formación:")) {
    return {
      details: EMPTY_ACADEMIC_DETAILS,
      description,
    };
  }

  const lines = plainText.split(/\n/).map((line) => line.trim()).filter(Boolean);
  const descriptionIndex = lines.findIndex((line) => line === "Descripción:");
  const metaLines = descriptionIndex >= 0 ? lines.slice(0, descriptionIndex) : lines;
  const detailText = descriptionIndex >= 0 ? lines.slice(descriptionIndex + 1).join("\n\n") : "";
  const nextDetails: AcademicDetails = { ...EMPTY_ACADEMIC_DETAILS };

  metaLines.forEach((line) => {
    if (line.startsWith("Tipo de formación:")) {
      const value = line.replace("Tipo de formación:", "").trim();
      const normalizedValue = value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace("Posgrado", "Posgrado / Maestria")
        .replace("Certificacion", "Certificacion");

      if (ACADEMIC_FORMATION_OPTIONS.includes(normalizedValue as AcademicFormationType)) {
        nextDetails.tipoFormacion = normalizedValue as AcademicFormationType;
      }
    }

    if (line.startsWith("Especialización / Área:")) {
      nextDetails.especializacionArea = line.replace("Especialización / Área:", "").trim();
    }

    if (line.startsWith("Acreditación:")) {
      const value = line.replace("Acreditación:", "").trim();
      const [typeValue, amountValue = ""] = value.split(":").map((item) => item.trim());
      const normalizedType = typeValue
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace("Créditos", "Creditos")
        .replace("Módulos", "Modulos");

      if (ACADEMIC_ACCREDITATION_OPTIONS.includes(normalizedType as AcademicAccreditationType)) {
        nextDetails.tipoAcreditacion = normalizedType as AcademicAccreditationType;
        nextDetails.cantidadAcreditacion = sanitizeDigits(amountValue);
      }
    }
  });

  return {
    details: nextDetails,
    description: sanitizeRichText(detailText),
  };
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

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-16">
      <path
        d="M4 20h4.8L19 9.8 14.2 5 4 15.2V20Zm12.5-13.5 1-1a1.7 1.7 0 0 1 2.4 2.4l-1 1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-16">
      <path
        d="M4 7h16m-10 4v6m4-6v6M9 7V5h6v2m-9 0 1 13h10l1-13"
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

type ExperiencePageProps = {
  type: ExperienceType;
};

const PAGE_COPY: Record<ExperienceType, { active: "academic-experience" | "work-experience"; title: string; subtitle: string; button: string; empty: string; emptyDescription: string }> = {
  academica: {
    active: "academic-experience",
    title: "Experiencia Académica",
    subtitle: "Gestiona tu experiencia académica.",
    button: "+ Nueva Experiencia Académica",
    empty: "académica",
    emptyDescription: "Agrega estudios, cursos, certificaciones o especializaciones para enriquecer tu portafolio profesional.",
  },
  laboral: {
    active: "work-experience",
    title: "Experiencia Laboral",
    subtitle: "Gestiona tu experiencia laboral.",
    button: "+ Nueva Experiencia Laboral",
    empty: "laboral",
    emptyDescription: "Agrega una experiencia para enriquecer tu portafolio profesional.",
  },
};

export default function ExperiencePage({ type }: ExperiencePageProps) {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [experiencias, setExperiencias] = useState<Experience[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Experience | null>(null);
  const [form, setForm] = useState<ExperiencePayload>({ ...EMPTY_FORM, tipo: type });
  const [academicDetails, setAcademicDetails] = useState<AcademicDetails>(EMPTY_ACADEMIC_DETAILS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

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

  const pageCopy = PAGE_COPY[type];
  const filteredExperiences = useMemo(
    () => experiencias.filter((item) => item.tipo === type),
    [type, experiencias],
  );

  const openCreateForm = () => {
    setEditingExperience(null);
    setForm({ ...EMPTY_FORM, tipo: type });
    setAcademicDetails(EMPTY_ACADEMIC_DETAILS);
    setErrors({});
    setServerError("");
    setShowForm(true);
  };

  const openEditForm = (experience: Experience) => {
    const academicForm = experience.tipo === "academica" ? parseAcademicDescription(experience.descripcion || "") : null;

    setEditingExperience(experience);
    setForm({
      tipo: experience.tipo,
      titulo: sanitizeAlphaNumericText(experience.titulo),
      institucion: sanitizeAlphaNumericText(experience.institucion),
      ubicacion: sanitizeLocationText(experience.ubicacion || ""),
      descripcion: academicForm?.description || experience.descripcion || "",
      fecha_inicio: experience.fecha_inicio || "",
      fecha_fin: experience.fecha_fin || "",
      actualidad: experience.actualidad,
      subtipo_academico: experience.subtipo_academico || "",
      estado_academico: experience.estado_academico || "",
      area_especializacion: experience.area_especializacion || "",
      tipo_acreditacion: experience.tipo_acreditacion || "Sin acreditacion",
      cantidad_acreditacion: experience.cantidad_acreditacion ? String(experience.cantidad_acreditacion) : "",
      url_credencial: experience.url_credencial || "",
      logros: sanitizePlainMultilineText((experience.logros || []).join("\n")),
      visible_publico: experience.visible_publico,
    });
    setAcademicDetails({
      tipoFormacion: experience.subtipo_academico || academicForm?.details.tipoFormacion || "Curso",
      especializacionArea: experience.area_especializacion || academicForm?.details.especializacionArea || "",
      tipoAcreditacion: experience.tipo_acreditacion || academicForm?.details.tipoAcreditacion || "Sin acreditacion",
      cantidadAcreditacion: experience.cantidad_acreditacion ? String(experience.cantidad_acreditacion) : (academicForm?.details.cantidadAcreditacion || ""),
      estadoAcademico: experience.estado_academico || (experience.actualidad ? "En curso" : "Finalizado"),
      urlCredencial: experience.url_credencial || "",
    });
    setErrors({});
    setServerError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingExperience(null);
    setForm({ ...EMPTY_FORM, tipo: type });
    setAcademicDetails(EMPTY_ACADEMIC_DETAILS);
    setErrors({});
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.titulo.trim()) nextErrors.titulo = "El titulo es obligatorio.";
    if (!form.institucion.trim()) nextErrors.institucion = "La institucion es obligatoria.";
    if (
      form.tipo === "academica" &&
      academicDetails.tipoAcreditacion !== "Sin acreditacion" &&
      academicDetails.cantidadAcreditacion &&
      !/^\d+$/.test(academicDetails.cantidadAcreditacion)
    ) {
      nextErrors.cantidad_acreditacion = "La cantidad debe ser numerica.";
    }
    if (isRichTextEmpty(form.descripcion || "")) nextErrors.descripcion = "La descripcion es obligatoria.";
    if (!form.fecha_inicio) nextErrors.fecha_inicio = "La fecha de inicio es obligatoria.";
    if (!nextErrors.fecha_inicio) {
      nextErrors.fecha_inicio = validatePastOrTodayDate(form.fecha_inicio, "La fecha de inicio no puede ser futura.");
    }
    if (!form.actualidad && form.fecha_inicio && form.fecha_fin && form.fecha_fin < form.fecha_inicio) {
      nextErrors.fecha_fin = "La fecha de fin no puede ser anterior a la fecha de inicio.";
    } else if (!form.actualidad && form.fecha_fin) {
      nextErrors.fecha_fin = validatePastOrTodayDate(form.fecha_fin, "La fecha de fin no puede ser futura.");
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setServerError(Object.values(nextErrors)[0] || "Revisa los campos marcados en rojo.");
      focusFirstExperienceError();
    }
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError("");

    if (form.tipo !== "academica" && !validate()) return;

    setSaving(true);

    try {
      const payload: ExperiencePayload = {
        ...form,
        titulo: form.titulo.trim(),
        institucion: form.institucion.trim(),
        ubicacion: form.ubicacion?.trim() || "",
        descripcion: isRichTextEmpty(form.descripcion || "") ? "" : limitRichText(form.descripcion || "", 1800),
        fecha_fin: form.actualidad ? "" : (form.fecha_fin || ""),
        actualidad: form.actualidad,
        subtipo_academico: form.tipo === "academica" ? academicDetails.tipoFormacion : "",
        estado_academico: form.tipo === "academica" ? academicDetails.estadoAcademico : "",
        area_especializacion: form.tipo === "academica" ? academicDetails.especializacionArea.trim() : "",
        tipo_acreditacion: form.tipo === "academica" ? academicDetails.tipoAcreditacion : "",
        cantidad_acreditacion: form.tipo === "academica" ? academicDetails.cantidadAcreditacion : "",
        url_credencial: form.tipo === "academica" ? academicDetails.urlCredencial.trim() : "",
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
      <PrivateWorkspaceLayout active={pageCopy.active} perfil={perfil} title={pageCopy.title} subtitle={pageCopy.subtitle}>
        <section className="surface-card workspace-section-card">
          <p className="section-copy">Cargando experiencia...</p>
        </section>
      </PrivateWorkspaceLayout>
    );
  }

  return (
    <PrivateWorkspaceLayout active={pageCopy.active} perfil={perfil} title={pageCopy.title} subtitle={pageCopy.subtitle}>
      <div className="experience-page">
        <AlertMessage message={serverError} />

        <div className="experience-toolbar">
          <button type="button" className="btn btn-primary" onClick={openCreateForm}>
            {pageCopy.button}
          </button>
        </div>

        <section className="experience-list">
          {filteredExperiences.length ? (
            filteredExperiences.map((experience) => {
              const academicMeta = getAcademicMeta(experience);

              return (
              <article key={experience.id} className="surface-card experience-card">
                <div className="experience-card-mark">
                  <ExperienceIcon type={experience.tipo} />
                </div>

                <div className="experience-card-body">
                  <div className="experience-card-head">
                    <div>
                      <h2>{experience.titulo}</h2>
                      <p className="experience-institution">{experience.institucion}</p>
                      {experience.tipo === "academica" ? (
                        <p className="meta-text">
                          {[
                            academicMeta.subtipo,
                            academicMeta.estado,
                            academicMeta.area,
                          ].filter(Boolean).join(" · ")}
                        </p>
                      ) : null}
                      {experience.ubicacion ? <p className="meta-text">{experience.ubicacion}</p> : null}
                      <p className="meta-text">{getDateRange(experience)}</p>
                      {experience.tipo === "academica" && academicMeta.urlCredencial ? (
                        <div className="experience-academic-tools">
                          <span className="experience-academic-label">Credencial</span>
                          <a href={academicMeta.urlCredencial} target="_blank" rel="noreferrer" className="experience-academic-link">
                            Abrir enlace
                          </a>
                        </div>
                      ) : null}
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
                  <button
                    type="button"
                    className="card-icon-action"
                    onClick={() => handleToggleVisibility(experience)}
                    title={experience.visible_publico ? "Ocultar" : "Mostrar"}
                    aria-label={`${experience.visible_publico ? "Ocultar" : "Mostrar"} ${experience.titulo}`}
                  >
                    <EyeIcon off={!experience.visible_publico} />
                  </button>
                  <button type="button" className="card-icon-action" onClick={() => openEditForm(experience)} title="Editar" aria-label={`Editar ${experience.titulo}`}>
                    <EditIcon />
                  </button>
                  <button type="button" className="card-icon-action danger" onClick={() => setPendingDelete(experience)} title="Eliminar" aria-label={`Eliminar ${experience.titulo}`}>
                    <TrashIcon />
                  </button>
                </div>
              </article>
            )})
          ) : (
            <article className="surface-card empty-state-card">
              <h3>No tienes experiencia {pageCopy.empty} registrada</h3>
              <p className="section-copy">{pageCopy.emptyDescription}</p>
            </article>
          )}
        </section>

        {showForm ? (
          <div className="skills-modal-backdrop" role="presentation">
            <section className="surface-card skills-modal experience-form-modal" role="dialog" aria-modal="true">
              <div className="skills-modal-head">
                <div>
                  <h2>{editingExperience ? "Actualizar experiencia" : `Nueva Experiencia ${form.tipo === "laboral" ? "Laboral" : "Académica"}`}</h2>
                  <p className="section-copy">
                    {editingExperience
                      ? "Actualiza la informacion que aparecera en tu portafolio."
                      : form.tipo === "academica"
                        ? "Agrega una nueva formación, curso o certificación a tu portafolio."
                        : "Agrega una nueva experiencia a tu portafolio."}
                  </p>
                </div>
                <button type="button" className="modal-close-button" onClick={closeForm} aria-label="Cerrar formulario">
                  x
                </button>
              </div>

              <form className="form-stack experience-form-stack" onSubmit={handleSubmit}>
                <div className="form-field">
                  <label className="form-label">{form.tipo === "laboral" ? "Cargo/Posicion *" : "Título / Curso / Programa *"}</label>
                  <input
                    className={`form-input${errors.titulo ? " error" : ""}`}
                    value={form.titulo}
                    onChange={(event) => setForm((prev) => ({ ...prev, titulo: sanitizeAlphaNumericText(event.target.value) }))}
                  />
                  {errors.titulo ? <p className="form-error">{errors.titulo}</p> : null}
                </div>

                <div className="form-field">
                  <label className="form-label">{form.tipo === "laboral" ? "Empresa *" : "Institución *"}</label>
                  <input
                    className={`form-input${errors.institucion ? " error" : ""}`}
                    value={form.institucion}
                    onChange={(event) => setForm((prev) => ({ ...prev, institucion: sanitizeAlphaNumericText(event.target.value) }))}
                  />
                  {errors.institucion ? <p className="form-error">{errors.institucion}</p> : null}
                </div>

                {form.tipo === "academica" ? (
                  <>
                    <div className="workspace-form-grid">
                      <div className="form-field">
                        <label className="form-label">Subtipo academico *</label>
                        <select
                          className={`form-input${errors.subtipo_academico ? " error" : ""}`}
                          value={academicDetails.tipoFormacion}
                          onChange={(event) =>
                            setAcademicDetails((prev) => ({
                              ...prev,
                              tipoFormacion: event.target.value as AcademicFormationType | "",
                            }))
                          }
                        >
                          <option value="">Selecciona un subtipo academico</option>
                          {ACADEMIC_FORMATION_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {errors.subtipo_academico ? <p className="form-error">{errors.subtipo_academico}</p> : null}
                      </div>

                      <div className="form-field">
                        <label className="form-label">Estado academico *</label>
                        <select
                          className={`form-input${errors.estado_academico ? " error" : ""}`}
                          value={academicDetails.estadoAcademico}
                          onChange={(event) => {
                            const nextValue = event.target.value as AcademicExperienceStatus | "";
                            setAcademicDetails((prev) => ({
                              ...prev,
                              estadoAcademico: nextValue,
                            }));
                            if (nextValue === "En curso") {
                              setForm((prev) => ({ ...prev, actualidad: true, fecha_fin: "" }));
                            }
                          }}
                        >
                          <option value="">Selecciona un estado</option>
                          {ACADEMIC_STATUS_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {errors.estado_academico ? <p className="form-error">{errors.estado_academico}</p> : null}
                      </div>
                    </div>

                    <div className="form-field">
                      <label className="form-label">Area / especializacion</label>
                      <input
                        className="form-input"
                        value={academicDetails.especializacionArea}
                        onChange={(event) =>
                          setAcademicDetails((prev) => ({
                            ...prev,
                            especializacionArea: sanitizeAlphaNumericText(event.target.value),
                          }))
                        }
                      />
                    </div>
                  </>
                ) : null}

                <div className="form-field">
                  <label className="form-label">{form.tipo === "academica" ? "Ubicación" : "Ubicacion"}</label>
                  <input
                    className={`form-input${errors.ubicacion ? " error" : ""}`}
                    value={form.ubicacion || ""}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        ubicacion: form.tipo === "academica" ? sanitizeAcademicLocationText(event.target.value) : sanitizeLocationText(event.target.value),
                      }))
                    }
                  />
                  {errors.ubicacion ? <p className="form-error">{errors.ubicacion}</p> : null}
                </div>

                <RichTextEditor
                  label={form.tipo === "academica" ? "Descripción *" : "Descripcion *"}
                  value={form.descripcion || ""}
                  error={errors.descripcion}
                  placeholder={form.tipo === "academica" ? "Describe lo aprendido, actividades realizadas, proyectos o conocimientos adquiridos..." : "Describe tus responsabilidades, logros y aprendizajes..."}
                  onChange={(value) => setForm((prev) => ({ ...prev, descripcion: limitRichText(value, 1800) }))}
                />

                <div className="workspace-form-grid">
                  <div className="form-field">
                    <label className="form-label">Fecha de Inicio *</label>
                    <input
                      className={`form-input${errors.fecha_inicio ? " error" : ""}`}
                      type="date"
                      max={today}
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
                      max={today}
                      disabled={form.actualidad}
                      value={form.fecha_fin}
                      onChange={(event) => setForm((prev) => ({ ...prev, fecha_fin: event.target.value, actualidad: false }))}
                    />
                    <label className="visibility-toggle current-status-toggle">
                      <span className="current-status-copy">
                        <strong>En actualidad</strong>
                        <small>Oculta la fecha de fin mientras sigues en esta experiencia o formacion.</small>
                      </span>
                      <button
                        type="button"
                        className={`toggle-switch ${form.actualidad ? "active" : ""}`}
                        onClick={() => setForm((prev) => ({
                          ...prev,
                          actualidad: !prev.actualidad,
                          fecha_fin: !prev.actualidad ? "" : prev.fecha_fin,
                        }))}
                        aria-pressed={form.actualidad}
                      >
                        <span />
                      </button>
                    </label>
                    {errors.fecha_fin ? <p className="form-error">{errors.fecha_fin}</p> : null}
                  </div>
                </div>

                {form.tipo === "academica" ? (
                  <div className="form-stack">
                    <p className="section-label">Acreditación</p>
                    <div className="workspace-form-grid">
                      <div className="form-field">
                        <label className="form-label">Tipo de acreditación</label>
                        <select
                          className="form-input"
                          value={academicDetails.tipoAcreditacion}
                          onChange={(event) => {
                            const nextValue = event.target.value as AcademicAccreditationType;
                            setAcademicDetails((prev) => ({
                              ...prev,
                              tipoAcreditacion: nextValue,
                              cantidadAcreditacion: nextValue === "Sin acreditacion" ? "" : prev.cantidadAcreditacion,
                            }));
                          }}
                        >
                          {ACADEMIC_ACCREDITATION_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-field">
                        <label className="form-label">Cantidad</label>
                        <input
                          className={`form-input${errors.cantidad_acreditacion ? " error" : ""}`}
                          type="number"
                          min="0"
                          value={academicDetails.cantidadAcreditacion}
                          placeholder="Ej: 40, 6, 120"
                          disabled={academicDetails.tipoAcreditacion === "Sin acreditacion"}
                          onChange={(event) =>
                            setAcademicDetails((prev) => ({
                              ...prev,
                              cantidadAcreditacion: sanitizeDigits(event.target.value),
                            }))
                          }
                        />
                        {errors.cantidad_acreditacion ? <p className="form-error">{errors.cantidad_acreditacion}</p> : null}
                      </div>
                    </div>

                    {academicDetails.tipoFormacion === "Certificacion" ? (
                      <div className="form-field">
                        <label className="form-label">URL de credencial</label>
                        <input
                          className={`form-input${errors.url_credencial ? " error" : ""}`}
                          value={academicDetails.urlCredencial}
                          placeholder="https://..."
                          onChange={(event) =>
                            setAcademicDetails((prev) => ({
                              ...prev,
                              urlCredencial: event.target.value,
                            }))
                          }
                        />
                        {errors.url_credencial ? <p className="form-error">{errors.url_credencial}</p> : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="form-field">
                  <label className="form-label">Logros (uno por linea)</label>
                  <textarea
                    className="form-input form-textarea"
                    value={form.logros}
                    placeholder={
                      form.tipo === "academica"
                        ? "Ej:\nFinalicé el curso con certificación.\nRealicé prácticas de configuración de redes.\nDesarrollé un proyecto final."
                        : "Logro 1\nLogro 2\nLogro 3"
                    }
                    onChange={(event) => setForm((prev) => ({ ...prev, logros: sanitizePlainMultilineText(event.target.value) }))}
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
                    {editingExperience ? "Guardar Cambios" : form.tipo === "academica" ? "Crear Experiencia Académica" : "Crear Experiencia"}
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
