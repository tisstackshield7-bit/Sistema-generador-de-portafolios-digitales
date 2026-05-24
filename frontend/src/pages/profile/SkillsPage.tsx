import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import AlertMessage from "../../components/common/AlertMessage";
import RichTextEditor from "../../components/common/RichTextEditor";
import PrivateWorkspaceLayout from "../../components/dashboard/PrivateWorkspaceLayout";
import { getMyProfile } from "../../api/profile";
import { createSkill, deleteSkill, getMySkills, updateSkill, updateSkillVisibility } from "../../api/skills";
import type { Perfil } from "../../types/profile";
import type { Skill, SkillEvidencePayload, SkillPayload, SkillType } from "../../types/skill";
import { isRichTextEmpty, limitRichText } from "../../utils/richText";
import { sanitizeAlphaNumericText } from "../../utils/validations";

const FALLBACK_TECHNICAL_CATEGORIES = [
  "Frontend",
  "Backend",
  "Mobile",
  "Bases de datos",
  "DevOps / Cloud",
  "Lenguajes de programacion",
  "Herramientas",
  "Diseno y UX",
];

const FALLBACK_SOFT_CATEGORIES = [
  "Comunicacion",
  "Liderazgo",
  "Colaboracion",
  "Pensamiento critico",
  "Organizacion",
  "Flexibilidad",
  "Innovacion",
  "Relaciones interpersonales",
];

const FALLBACK_LEVELS = ["Basico", "Intermedio", "Avanzado"];

const EMPTY_FORM: SkillPayload = {
  tipo: "tecnica",
  nombre: "",
  categoria: "",
  categoria_personalizada: "",
  nivel_dominio: "",
  visible_publico: false,
  certificado_pdf: null,
  evidencias: [],
};

const EMPTY_EVIDENCE: SkillEvidencePayload = {
  tipo: "certificado",
  titulo: "",
  descripcion: "",
  url: "",
  emisor: "",
  fecha: "",
  archivo: null,
  archivo_actual: null,
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

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`icon-16 category-chevron ${expanded ? "expanded" : ""}`}>
      <path
        d="m6 9 6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function normalizeSkillType(value: SkillType) {
  return value === "tecnica" ? "Tecnica" : "Blanda";
}

function groupSkillsByCategory(skills: Skill[]) {
  return skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const category = skill.categoria || "Sin categoria";
    acc[category] = [...(acc[category] || []), skill];
    return acc;
  }, {});
}

function hasEvidenceContent(evidence: SkillEvidencePayload) {
  return Boolean(
    evidence.titulo.trim()
      || !isRichTextEmpty(evidence.descripcion || "")
      || evidence.url?.trim()
      || evidence.emisor?.trim()
      || evidence.fecha
      || evidence.archivo
      || evidence.archivo_actual,
  );
}

function getSupportLabel(skill: Skill) {
  return (skill.evidencias?.length || skill.certificado_pdf) ? "Nivel respaldado" : "Nivel declarado";
}

function hasSavedEvidence(skill: Skill) {
  return Boolean(skill.certificado_pdf || skill.evidencias?.length);
}

function getEvidenceSummary(evidence: SkillEvidencePayload, index: number) {
  const fallbackTitle = evidence.titulo.trim() || `Evidencia ${index + 1}`;
  const hasAttachment = evidence.archivo || evidence.archivo_actual || evidence.url?.trim();

  return {
    title: fallbackTitle,
    detail: `${evidence.tipo}${hasAttachment ? " con respaldo" : ""}`,
  };
}

function getSoftSkillCertificate(evidencias: SkillEvidencePayload[] = []) {
  return evidencias[0] || { ...EMPTY_EVIDENCE, tipo: "certificado" as const };
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

export default function SkillsPage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [habilidades, setHabilidades] = useState<Skill[]>([]);
  const [activeTab, setActiveTab] = useState<SkillType>("tecnica");
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Skill | null>(null);
  const [form, setForm] = useState<SkillPayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedEvidenceIndex, setExpandedEvidenceIndex] = useState<number | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [technicalCategories, setTechnicalCategories] = useState<string[]>(FALLBACK_TECHNICAL_CATEGORIES);
  const [softCategories, setSoftCategories] = useState<string[]>(FALLBACK_SOFT_CATEGORIES);
  const [levels, setLevels] = useState<string[]>(FALLBACK_LEVELS);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileData = await getMyProfile();

        if (!profileData.perfil) {
          navigate("/perfil/crear", { replace: true });
          return;
        }

        const skillData = await getMySkills();

        setPerfil(profileData.perfil);
        setHabilidades(skillData.habilidades || []);
        setTechnicalCategories(skillData.categorias_tecnicas || FALLBACK_TECHNICAL_CATEGORIES);
        setSoftCategories(skillData.categorias_blandas || FALLBACK_SOFT_CATEGORIES);
        setLevels(skillData.niveles_dominio || FALLBACK_LEVELS);
      } catch {
        setServerError("No se pudieron cargar las habilidades.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const filteredSkills = useMemo(
    () => habilidades.filter((item) => item.tipo === activeTab),
    [habilidades, activeTab],
  );

  const technicalCount = habilidades.filter((item) => item.tipo === "tecnica").length;
  const softCount = habilidades.filter((item) => item.tipo === "blanda").length;
  const groupedTechnical = useMemo(
    () => groupSkillsByCategory(habilidades.filter((item) => item.tipo === "tecnica")),
    [habilidades],
  );
  const groupedSoft = useMemo(
    () => groupSkillsByCategory(habilidades.filter((item) => item.tipo === "blanda")),
    [habilidades],
  );
  const categoryOptions = useMemo(
    () => (form.tipo === "tecnica" ? technicalCategories : softCategories),
    [form.tipo, softCategories, technicalCategories],
  );
  const activeGroups = activeTab === "tecnica" ? groupedTechnical : groupedSoft;

  useEffect(() => {
    setCollapsedCategories((prev) => {
      const next = { ...prev };

      Object.keys(groupedTechnical).forEach((category) => {
        const key = `tecnica:${category}`;
        if (!(key in next)) {
          next[key] = false;
        }
      });

      Object.keys(groupedSoft).forEach((category) => {
        const key = `blanda:${category}`;
        if (!(key in next)) {
          next[key] = false;
        }
      });

      return next;
    });
  }, [groupedSoft, groupedTechnical]);

  const openCreateForm = (tipo: SkillType) => {
    setActiveTab(tipo);
    setEditingSkill(null);
    setForm({
      ...EMPTY_FORM,
      tipo,
      categoria: "",
      evidencias: tipo === "blanda" ? [{ ...EMPTY_EVIDENCE, tipo: "certificado" }] : [],
    });
    setErrors({});
    setServerError("");
    setExpandedEvidenceIndex(null);
    setShowForm(true);
  };

  const openEditForm = (skill: Skill) => {
    const isKnownSoftSkill = skill.tipo === "blanda" && softCategories.includes(skill.categoria || skill.nombre);
    const skillEvidence = skill.tipo === "blanda"
      ? (skill.evidencias?.slice(0, 1) || [])
      : (skill.evidencias || []);

    setEditingSkill(skill);
    setForm({
      tipo: skill.tipo,
      nombre: skill.nombre,
      categoria: skill.tipo === "blanda"
        ? (isKnownSoftSkill ? (skill.categoria || skill.nombre) : "__custom__")
        : (skill.categoria || ""),
      categoria_personalizada: skill.tipo === "blanda" && !isKnownSoftSkill ? sanitizeAlphaNumericText(skill.categoria || skill.nombre) : "",
      nivel_dominio: skill.nivel_dominio,
      visible_publico: skill.visible_publico,
      certificado_pdf: null,
      evidencias: skillEvidence.map((evidence) => ({
        id: evidence.id,
        tipo: evidence.tipo,
        titulo: sanitizeAlphaNumericText(evidence.titulo || ""),
        descripcion: evidence.descripcion || "",
        url: evidence.url || "",
        emisor: sanitizeAlphaNumericText(evidence.emisor || ""),
        fecha: evidence.fecha || "",
        archivo: null,
        archivo_actual: evidence.archivo || null,
      })),
    });
    setErrors({});
    setServerError("");
    setExpandedEvidenceIndex((skill.evidencias || []).length ? 0 : null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSkill(null);
    setForm({
      ...EMPTY_FORM,
      tipo: activeTab,
      categoria: "",
      categoria_personalizada: "",
      evidencias: [],
    });
    setErrors({});
    setExpandedEvidenceIndex(null);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (form.tipo === "tecnica" && !form.nombre.trim()) {
      nextErrors.nombre = "El nombre de la habilidad es obligatorio.";
    }

    if (!form.categoria) {
      nextErrors.categoria = form.tipo === "blanda" ? "La habilidad blanda es obligatoria." : "La categoria es obligatoria.";
    }

    if (form.tipo === "blanda" && form.categoria === "__custom__" && !form.categoria_personalizada?.trim()) {
      nextErrors.categoria_personalizada = "Escribe la habilidad blanda personalizada.";
    }

    if (!form.nivel_dominio) {
      nextErrors.nivel_dominio = "El nivel de dominio es obligatorio.";
    }

    if (form.tipo === "blanda") {
      const evidence = getSoftSkillCertificate(form.evidencias || []);

      if (evidence.archivo && evidence.archivo.type !== "application/pdf") {
        nextErrors["evidencias.0.archivo"] = "Solo se permite subir certificados PDF.";
      }
    }

    (form.tipo === "tecnica" ? (form.evidencias || []) : []).forEach((evidence, index) => {
      if (!hasEvidenceContent(evidence)) return;

      if (!evidence.titulo.trim()) {
        nextErrors[`evidencias.${index}.titulo`] = "El titulo de la evidencia es obligatorio.";
      }

      if (!evidence.url?.trim() && !evidence.archivo) {
        nextErrors[`evidencias.${index}.url`] = "Agrega un enlace o archivo para esta evidencia.";
      }
    });

    if (form.tipo === "tecnica" && form.visible_publico && !(form.evidencias || []).some(hasEvidenceContent)) {
      nextErrors.visible_publico = "Agrega al menos una evidencia para publicar esta habilidad tecnica.";
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
      const normalizedSoftEvidence = getSoftSkillCertificate(form.evidencias || []);
      const softSkillName = form.categoria === "__custom__"
        ? (form.categoria_personalizada || "").trim()
        : form.categoria.trim();
      const payload: SkillPayload = {
        ...form,
        nombre: form.tipo === "tecnica"
          ? form.nombre.trim()
          : softSkillName,
        categoria: form.tipo === "blanda" ? softSkillName : form.categoria,
        categoria_personalizada: form.tipo === "blanda" && form.categoria === "__custom__"
          ? (form.categoria_personalizada || "").trim()
          : "",
        evidencias: form.tipo === "blanda"
          ? ((normalizedSoftEvidence.archivo || normalizedSoftEvidence.archivo_actual)
            ? [{
              ...normalizedSoftEvidence,
              tipo: "certificado" as const,
              titulo: normalizedSoftEvidence.titulo.trim() || `Certificado de ${softSkillName}`,
              descripcion: "",
              url: "",
              emisor: "",
              fecha: "",
            }]
            : [])
          : (form.evidencias || []).filter(hasEvidenceContent),
      };

      const data = editingSkill
        ? await updateSkill(editingSkill.id, payload)
        : await createSkill(payload);

      const updatedSkill = data.habilidad as Skill;

      setHabilidades((prev) => {
        if (editingSkill) {
          return prev.map((item) => (item.id === updatedSkill.id ? updatedSkill : item));
        }

        return [updatedSkill, ...prev];
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
      setServerError(errorData?.message || "No se pudo guardar la habilidad.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (skill: Skill) => {
    if (!skill.visible_publico && skill.tipo === "tecnica" && !hasSavedEvidence(skill)) {
      setServerError("Agrega al menos una evidencia antes de publicar esta habilidad tecnica.");
      return;
    }

    try {
      const data = await updateSkillVisibility(skill.id, !skill.visible_publico);
      const updatedSkill = data.habilidad as Skill;

      setHabilidades((prev) => prev.map((item) => (item.id === updatedSkill.id ? updatedSkill : item)));
      setServerError("");
    } catch (error: unknown) {
      const errorData = getApiErrorData(error);
      setServerError(errorData?.message || "No se pudo actualizar la visibilidad.");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteSkill(pendingDelete.id);
      setHabilidades((prev) => prev.filter((item) => item.id !== pendingDelete.id));
      setServerError("");
    } catch (error: unknown) {
      const errorData = getApiErrorData(error);
      setServerError(errorData?.message || "No se pudo eliminar la habilidad.");
    } finally {
      setPendingDelete(null);
    }
  };

  const toggleCategory = (category: string) => {
    const key = `${activeTab}:${category}`;
    setCollapsedCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <div className="profile-page-shell app-shell">
        <div className="page-section surface-card auth-card">
          <p className="section-copy">Cargando habilidades...</p>
        </div>
      </div>
    );
  }

  return (
    <PrivateWorkspaceLayout
      active="skills"
      perfil={perfil}
      title="Habilidades"
      subtitle=""
    >
      <div className="skills-page">

        <AlertMessage message={serverError} />

        <section className="skills-summary-grid">
          <article className="surface-card skills-summary-card">
            <p className="section-label">Tecnicas</p>
            <strong>{technicalCount}</strong>
            <p className="meta-text">Competencias enfocadas en herramientas y tecnologias.</p>
          </article>
          <article className="surface-card skills-summary-card">
            <p className="section-label">Blandas</p>
            <strong>{softCount}</strong>
            <p className="meta-text">Competencias interpersonales que fortalecen tu perfil.</p>
          </article>
        </section>

        <section className="surface-card skills-panel">
          <div className="skills-toolbar">
            <div className="skills-tabs" role="tablist" aria-label="Tipos de habilidades">
              <button
                type="button"
                className={`skills-tab ${activeTab === "tecnica" ? "active" : ""}`}
                onClick={() => setActiveTab("tecnica")}
              >
                Habilidades tecnicas
              </button>
              <button
                type="button"
                className={`skills-tab ${activeTab === "blanda" ? "active" : ""}`}
                onClick={() => setActiveTab("blanda")}
              >
                Habilidades blandas
              </button>
            </div>

            <button className="btn btn-primary" onClick={() => openCreateForm(activeTab)}>
              {activeTab === "tecnica" ? "+ Nueva Habilidad Tecnica" : "+ Nueva Habilidad Blanda"}
            </button>
          </div>

          {filteredSkills.length ? (
            <div className="skills-category-list">
              {Object.entries(activeGroups).map(([category, skills]) => {
                const categoryKey = `${activeTab}:${category}`;
                const isCollapsed = collapsedCategories[categoryKey] ?? false;

                return (
                <section key={category} className="surface-card skill-category-panel">
                  <button
                    type="button"
                    className="skill-category-toggle"
                    onClick={() => toggleCategory(category)}
                    aria-expanded={!isCollapsed}
                  >
                    <div className="skill-category-head">
                      <div>
                        <p className="section-label">Categoria</p>
                        <h3>{category}</h3>
                      </div>
                      <div className="skill-category-meta">
                        <span className="skill-count-badge">{skills.length}</span>
                        <ChevronIcon expanded={!isCollapsed} />
                      </div>
                    </div>
                  </button>

                  {!isCollapsed ? (
                    <div className="skills-card-grid">
                      {skills.map((skill) => (
                        <article key={skill.id} className="skill-card compact-skill-card">
                          <div className="skill-card-head">
                            <div>
                              <p className="section-label">Habilidad {normalizeSkillType(skill.tipo)}</p>
                              <h3>{skill.nombre}</h3>
                            </div>
                            <span className={`skill-visibility-pill ${skill.visible_publico ? "visible" : "hidden"}`}>
                              {skill.visible_publico ? "Visible" : "Oculta"}
                            </span>
                          </div>

                          <div className="profile-pill-list">
                            <span className="profile-pill neutral">{skill.nivel_dominio}</span>
                            <span className={`profile-pill ${skill.certificado_pdf ? "" : "neutral"}`}>
                              {getSupportLabel(skill)}
                            </span>
                            {skill.evidencias?.length ? (
                              <span className="profile-pill neutral">{skill.evidencias.length} evidencias</span>
                            ) : null}
                          </div>

                          <div className="skill-actions">
                            <button type="button" className="card-icon-action" onClick={() => openEditForm(skill)} title="Editar" aria-label={`Editar ${skill.nombre}`}>
                              <EditIcon />
                            </button>
                            <button
                              type="button"
                              className="card-icon-action"
                              onClick={() => handleToggleVisibility(skill)}
                              title={skill.visible_publico ? "Ocultar" : "Mostrar"}
                              aria-label={`${skill.visible_publico ? "Ocultar" : "Mostrar"} ${skill.nombre}`}
                              disabled={!skill.visible_publico && skill.tipo === "tecnica" && !hasSavedEvidence(skill)}
                            >
                              <EyeIcon off={!skill.visible_publico} />
                            </button>
                            <button type="button" className="card-icon-action danger" onClick={() => setPendingDelete(skill)} title="Eliminar" aria-label={`Eliminar ${skill.nombre}`}>
                              <TrashIcon />
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : null}
                </section>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-card empty-skills-card">
              <h3>No tienes habilidades {activeTab === "tecnica" ? "tecnicas" : "blandas"} registradas</h3>
              <p className="section-copy">Crea tu primera habilidad para enriquecer tu portafolio.</p>
            </div>
          )}
        </section>

        {showForm ? (
          <div className="skills-modal-backdrop" role="presentation">
            <section className="surface-card skills-modal skill-editor-modal" role="dialog" aria-modal="true">
              <div className="skills-modal-head">
                <div>
                  <p className="section-label">{editingSkill ? "Editar habilidad" : "Nueva habilidad"}</p>
                  <h2>{form.tipo === "tecnica" ? "Nueva Habilidad Tecnica" : "Nueva Habilidad Blanda"}</h2>
                </div>
              </div>

              <form className="form-stack" onSubmit={handleSubmit}>
                <section className="skill-form-section">
                  <div>
                    <p className="section-label">Datos de la habilidad</p>
                    <p className="form-help">
                      {form.tipo === "tecnica"
                        ? "Define la competencia, su categoria y el nivel que declaras en tu portafolio."
                        : "Registra la habilidad blanda y el nivel que declaras en tu portafolio."}
                    </p>
                  </div>

                  <div className="skill-basics-grid">
                    {form.tipo === "tecnica" ? (
                      <div className="form-field">
                        <label className="form-label">Nombre de la Habilidad *</label>
                        <input
                          className={`form-input${errors.nombre ? " error" : ""}`}
                          value={form.nombre}
                          placeholder="Ej: React, Python, Docker"
                          onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
                        />
                        {errors.nombre ? <p className="form-error">{errors.nombre}</p> : null}
                      </div>
                    ) : (
                      <div className="form-field">
                        <label className="form-label">Habilidad blanda *</label>
                        <select
                          className={`form-input${errors.categoria ? " error" : ""}`}
                          value={form.categoria}
                          onChange={(event) => setForm((prev) => ({
                            ...prev,
                            categoria: event.target.value,
                            categoria_personalizada: event.target.value === "__custom__" ? prev.categoria_personalizada : "",
                          }))}
                        >
                          <option value="">Selecciona una habilidad blanda</option>
                          {softCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                          <option value="__custom__">+ Agregar otra habilidad blanda</option>
                        </select>
                        {errors.categoria ? <p className="form-error">{errors.categoria}</p> : null}
                      </div>
                    )}

                    {form.tipo === "blanda" && form.categoria === "__custom__" ? (
                      <div className="form-field">
                        <label className="form-label">Nueva habilidad blanda *</label>
                        <input
                          className={`form-input${errors.categoria_personalizada ? " error" : ""}`}
                          value={form.categoria_personalizada}
                          placeholder="Ej: Resolucion de conflictos"
                          onChange={(event) => setForm((prev) => ({ ...prev, categoria_personalizada: sanitizeAlphaNumericText(event.target.value) }))}
                        />
                        {errors.categoria_personalizada ? <p className="form-error">{errors.categoria_personalizada}</p> : null}
                      </div>
                    ) : null}

                    {form.tipo === "tecnica" ? (
                      <div className="form-field">
                        <label className="form-label">Categoria *</label>
                        <select
                          className={`form-input${errors.categoria ? " error" : ""}`}
                          value={form.categoria}
                          onChange={(event) => setForm((prev) => ({
                            ...prev,
                            categoria: event.target.value,
                            categoria_personalizada: "",
                          }))}
                        >
                          <option value="">Selecciona una categoria</option>
                          {categoryOptions.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        {errors.categoria ? <p className="form-error">{errors.categoria}</p> : null}
                      </div>
                    ) : null}

                    <div className="form-field">
                      <label className="form-label">Nivel de Dominio *</label>
                      <select
                        className={`form-input${errors.nivel_dominio ? " error" : ""}`}
                        value={form.nivel_dominio}
                        onChange={(event) => setForm((prev) => ({ ...prev, nivel_dominio: event.target.value as SkillPayload["nivel_dominio"] }))}
                      >
                        <option value="">Selecciona un nivel</option>
                        {levels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                      {errors.nivel_dominio ? <p className="form-error">{errors.nivel_dominio}</p> : null}
                    </div>
                  </div>
                </section>

                <section className="form-field evidence-builder">
                  <div className="evidence-builder-head">
                    <div>
                      <label className="form-label">Evidencias de respaldo</label>
                      <p className="form-help">
                        {form.tipo === "tecnica"
                          ? "Agrega certificados, cursos, videos, proyectos o documentos. La habilidad seguira siendo visible aunque solo tenga nivel declarado."
                          : "Para habilidad blanda solo se permite subir un certificado PDF opcional."}
                      </p>
                    </div>
                    {form.tipo === "tecnica" ? (
                      <button
                        type="button"
                        className="btn btn-secondary evidence-add-button"
                        onClick={() => {
                          const nextIndex = form.evidencias?.length || 0;
                          setForm((prev) => ({
                            ...prev,
                            evidencias: [...(prev.evidencias || []), { ...EMPTY_EVIDENCE }],
                          }));
                          setExpandedEvidenceIndex(nextIndex);
                        }}
                      >
                        + Agregar evidencia
                      </button>
                    ) : null}
                  </div>

                  {form.tipo === "blanda" ? (
                    <div className="evidence-form-card expanded">
                      <div className="evidence-card-fields">
                        <div className="form-field">
                          <label className="form-label">Certificado PDF</label>
                          <input
                            className={`form-file${errors["evidencias.0.archivo"] ? " error" : ""}`}
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={(event) => {
                              const file = event.target.files?.[0] || null;
                              setForm((prev) => ({
                                ...prev,
                                evidencias: [{
                                  ...getSoftSkillCertificate(prev.evidencias || []),
                                  tipo: "certificado",
                                  archivo: file,
                                  archivo_actual: file ? null : getSoftSkillCertificate(prev.evidencias || []).archivo_actual,
                                }],
                              }));
                            }}
                          />
                          {errors["evidencias.0.archivo"] ? <p className="form-error">{errors["evidencias.0.archivo"]}</p> : null}
                          {getSoftSkillCertificate(form.evidencias || []).archivo_actual && !getSoftSkillCertificate(form.evidencias || []).archivo ? (
                            <p className="form-help">Certificado actual cargado. Selecciona otro PDF solo si deseas reemplazarlo.</p>
                          ) : null}
                        </div>

                        {(getSoftSkillCertificate(form.evidencias || []).archivo || getSoftSkillCertificate(form.evidencias || []).archivo_actual) ? (
                          <div className="evidence-actions-row">
                            <button
                              type="button"
                              className="btn btn-secondary danger-outline"
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  evidencias: [{ ...EMPTY_EVIDENCE, tipo: "certificado" }],
                                }));
                              }}
                            >
                              Quitar certificado
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (form.evidencias || []).length ? (
                    <div className="evidence-form-list">
                      {(form.evidencias || []).map((evidence, index) => (
                        <section key={index} className={`evidence-form-card ${expandedEvidenceIndex === index ? "expanded" : ""}`}>
                          <button
                            type="button"
                            className="evidence-card-toggle"
                            onClick={() => setExpandedEvidenceIndex((current) => (current === index ? null : index))}
                            aria-expanded={expandedEvidenceIndex === index}
                          >
                            <span>
                              <strong>{getEvidenceSummary(evidence, index).title}</strong>
                              <small>{getEvidenceSummary(evidence, index).detail}</small>
                            </span>
                            <ChevronIcon expanded={expandedEvidenceIndex === index} />
                          </button>

                          {expandedEvidenceIndex === index ? (
                            <div className="evidence-card-fields">
                              <div className="workspace-form-grid">
                                <div className="form-field">
                                  <label className="form-label">Tipo</label>
                                  <select
                                    className="form-input"
                                    value={evidence.tipo}
                                    onChange={(event) => setForm((prev) => {
                                      const evidencias = [...(prev.evidencias || [])];
                                      evidencias[index] = { ...evidencias[index], tipo: event.target.value as SkillEvidencePayload["tipo"] };
                                      return { ...prev, evidencias };
                                    })}
                                  >
                                    <option value="certificado">Certificado</option>
                                    <option value="proyecto">Proyecto</option>
                                    <option value="curso">Curso</option>
                                    <option value="video">Video</option>
                                    <option value="documento">Documento</option>
                                    <option value="experiencia">Experiencia</option>
                                  </select>
                                </div>

                                <div className="form-field">
                                  <label className="form-label">Titulo</label>
                                  <input
                                    className={`form-input${errors[`evidencias.${index}.titulo`] ? " error" : ""}`}
                                    value={evidence.titulo}
                                    placeholder="Ej: Certificado React Avanzado"
                                    onChange={(event) => setForm((prev) => {
                                      const evidencias = [...(prev.evidencias || [])];
                                      evidencias[index] = { ...evidencias[index], titulo: sanitizeAlphaNumericText(event.target.value) };
                                      return { ...prev, evidencias };
                                    })}
                                  />
                                  {errors[`evidencias.${index}.titulo`] ? <p className="form-error">{errors[`evidencias.${index}.titulo`]}</p> : null}
                                </div>
                              </div>

                              <RichTextEditor
                                label="Descripcion"
                                value={evidence.descripcion || ""}
                                placeholder="Describe brevemente que respalda esta evidencia."
                                onChange={(value) => setForm((prev) => {
                                  const evidencias = [...(prev.evidencias || [])];
                                  evidencias[index] = {
                                    ...evidencias[index],
                                    descripcion: limitRichText(value, 900),
                                  };
                                  return { ...prev, evidencias };
                                })}
                              />

                              <div className="workspace-form-grid">
                                <div className="form-field">
                                  <label className="form-label">URL</label>
                                  <input
                                    className={`form-input${errors[`evidencias.${index}.url`] ? " error" : ""}`}
                                    value={evidence.url}
                                    placeholder="https://..."
                                    onChange={(event) => setForm((prev) => {
                                      const evidencias = [...(prev.evidencias || [])];
                                      evidencias[index] = { ...evidencias[index], url: event.target.value };
                                      return { ...prev, evidencias };
                                    })}
                                  />
                                  {errors[`evidencias.${index}.url`] ? <p className="form-error">{errors[`evidencias.${index}.url`]}</p> : null}
                                </div>

                                <div className="form-field">
                                  <label className="form-label">Archivo</label>
                                  <input
                                    className="form-file"
                                    type="file"
                                    accept="application/pdf,image/*,video/mp4,video/quicktime"
                                    onChange={(event) => {
                                      const file = event.target.files?.[0] || null;
                                      setForm((prev) => {
                                        const evidencias = [...(prev.evidencias || [])];
                                        evidencias[index] = {
                                          ...evidencias[index],
                                          archivo: file,
                                          archivo_actual: file ? null : evidencias[index].archivo_actual,
                                        };
                                        return { ...prev, evidencias };
                                      });
                                    }}
                                  />
                                  {evidence.archivo_actual && !evidence.archivo ? (
                                    <p className="form-help">Archivo actual cargado. Selecciona otro solo si deseas reemplazarlo.</p>
                                  ) : null}
                                </div>
                              </div>

                              <div className="workspace-form-grid">
                                <div className="form-field">
                                  <label className="form-label">Emisor / institucion</label>
                                  <input
                                    className="form-input"
                                    value={evidence.emisor}
                                    placeholder="Ej: Coursera, AWS, universidad"
                                    onChange={(event) => setForm((prev) => {
                                      const evidencias = [...(prev.evidencias || [])];
                                      evidencias[index] = { ...evidencias[index], emisor: sanitizeAlphaNumericText(event.target.value) };
                                      return { ...prev, evidencias };
                                    })}
                                  />
                                </div>

                                <div className="form-field">
                                  <label className="form-label">Fecha</label>
                                  <input
                                    className="form-input"
                                    type="date"
                                    value={evidence.fecha}
                                    onChange={(event) => setForm((prev) => {
                                      const evidencias = [...(prev.evidencias || [])];
                                      evidencias[index] = { ...evidencias[index], fecha: event.target.value };
                                      return { ...prev, evidencias };
                                    })}
                                  />
                                </div>
                              </div>

                              <div className="evidence-actions-row">
                                <button
                                  type="button"
                                  className="btn btn-secondary danger-outline"
                                  onClick={() => {
                                    setForm((prev) => ({
                                      ...prev,
                                      evidencias: (prev.evidencias || []).filter((_, evidenceIndex) => evidenceIndex !== index),
                                    }));
                                    setExpandedEvidenceIndex(null);
                                  }}
                                >
                                  Quitar evidencia
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  onClick={() => setExpandedEvidenceIndex(null)}
                                >
                                  Listo
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </section>
                      ))}
                    </div>
                  ) : (
                    <p className="form-help">Sin evidencias adicionales. La habilidad se mostrara como nivel declarado.</p>
                  )}
                </section>

                <label className="visibility-toggle">
                  <span>
                    <strong>Visible en portafolio publico</strong>
                    <small>Controla si esta habilidad aparece en tu portafolio publico</small>
                  </span>
                  <button
                    type="button"
                    className={`toggle-switch ${form.visible_publico ? "active" : ""}`}
                    onClick={() => setForm((prev) => {
                      const nextVisible = !prev.visible_publico;

                      if (nextVisible && prev.tipo === "tecnica" && !(prev.evidencias || []).some(hasEvidenceContent)) {
                        setErrors((current) => ({
                          ...current,
                          visible_publico: "Agrega al menos una evidencia para publicar esta habilidad tecnica.",
                        }));
                        return prev;
                      }

                      setErrors((current) => {
                        const { visible_publico, ...rest } = current;
                        return rest;
                      });

                      return { ...prev, visible_publico: nextVisible };
                    })}
                    aria-pressed={form.visible_publico}
                  >
                    <span />
                  </button>
                </label>
                {errors.visible_publico ? <p className="form-error">{errors.visible_publico}</p> : null}

                <div className="form-actions-row">
                  <button type="button" className="btn btn-secondary" onClick={closeForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {editingSkill ? "Guardar" : "Crear Habilidad"}
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
              <h3>Eliminar "{pendingDelete.nombre}"</h3>
              <p className="section-copy">Esta accion quitara la habilidad de tu lista registrada.</p>
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
