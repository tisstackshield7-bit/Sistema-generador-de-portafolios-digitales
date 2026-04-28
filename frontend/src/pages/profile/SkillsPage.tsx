import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertMessage from "../../components/common/AlertMessage";
import PrivateWorkspaceLayout from "../../components/dashboard/PrivateWorkspaceLayout";
import { getMyProfile } from "../../api/profile";
import { createSkill, deleteSkill, getMySkills, updateSkill, updateSkillVisibility } from "../../api/skills";
import type { Perfil } from "../../types/profile";
import type { Skill, SkillPayload, SkillType } from "../../types/skill";

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
  nivel_dominio: "",
  visible_publico: false,
  certificado_pdf: null,
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
    });
    setErrors({});
    setServerError("");
    setShowForm(true);
  };

  const openEditForm = (skill: Skill) => {
    setEditingSkill(skill);
    setForm({
      tipo: skill.tipo,
      nombre: skill.nombre,
      categoria: skill.categoria || (skill.tipo === "blanda" ? skill.nombre : ""),
      nivel_dominio: skill.nivel_dominio,
      visible_publico: skill.visible_publico,
      certificado_pdf: null,
    });
    setErrors({});
    setServerError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSkill(null);
    setForm({
      ...EMPTY_FORM,
      tipo: activeTab,
      categoria: "",
    });
    setErrors({});
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (form.tipo === "tecnica" && !form.nombre.trim()) {
      nextErrors.nombre = "El nombre de la habilidad es obligatorio.";
    }

    if (!form.categoria) {
      nextErrors.categoria = "La categoria es obligatoria.";
    }

    if (!form.nivel_dominio) {
      nextErrors.nivel_dominio = "El nivel de dominio es obligatorio.";
    }

    if (form.tipo === "tecnica" && form.visible_publico && !form.certificado_pdf && !editingSkill?.certificado_pdf) {
      nextErrors.certificado_pdf = "Debes subir un certificado PDF para publicar esta habilidad.";
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
      const payload = {
        ...form,
        nombre: form.tipo === "tecnica" ? form.nombre.trim() : form.categoria,
        categoria: form.categoria,
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
    } catch (error: any) {
      const apiErrors = error?.response?.data?.errors || {};
      const fieldErrors: Record<string, string> = {};

      Object.entries(apiErrors).forEach(([field, value]) => {
        fieldErrors[field] = Array.isArray(value) ? String(value[0]) : String(value);
      });

      setErrors((prev) => ({ ...prev, ...fieldErrors }));
      setServerError(error?.response?.data?.message || "No se pudo guardar la habilidad.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (skill: Skill) => {
    try {
      const data = await updateSkillVisibility(skill.id, !skill.visible_publico);
      const updatedSkill = data.habilidad as Skill;

      setHabilidades((prev) => prev.map((item) => (item.id === updatedSkill.id ? updatedSkill : item)));
      setServerError("");
    } catch (error: any) {
      setServerError(error?.response?.data?.message || "No se pudo actualizar la visibilidad.");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteSkill(pendingDelete.id);
      setHabilidades((prev) => prev.filter((item) => item.id !== pendingDelete.id));
      setServerError("");
    } catch (error: any) {
      setServerError(error?.response?.data?.message || "No se pudo eliminar la habilidad.");
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
                              {skill.certificado_pdf ? "Certificado adjunto" : "Sin certificado"}
                            </span>
                          </div>

                          <div className="skill-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => openEditForm(skill)}>
                              Editar
                            </button>
                            <button type="button" className="btn btn-secondary icon-button-text" onClick={() => handleToggleVisibility(skill)}>
                              <EyeIcon off={!skill.visible_publico} />
                              {skill.visible_publico ? "Ocultar" : "Mostrar"}
                            </button>
                            <button type="button" className="btn btn-secondary danger-outline" onClick={() => setPendingDelete(skill)}>
                              Eliminar
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
            <section className="surface-card skills-modal" role="dialog" aria-modal="true">
              <div className="skills-modal-head">
                <div>
                  <p className="section-label">{editingSkill ? "Editar habilidad" : "Nueva habilidad"}</p>
                  <h2>{form.tipo === "tecnica" ? "Nueva Habilidad Tecnica" : "Nueva Habilidad Blanda"}</h2>
                </div>
              </div>

              <form className="form-stack" onSubmit={handleSubmit}>
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
                ) : null}

                <div className="form-field">
                  <label className="form-label">Categoria *</label>
                  <select
                    className={`form-input${errors.categoria ? " error" : ""}`}
                    value={form.categoria}
                    onChange={(event) => setForm((prev) => ({ ...prev, categoria: event.target.value }))}
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

                <div className="form-field">
                  <label className="form-label">
                    Certificado PDF {form.tipo === "tecnica" ? (form.visible_publico && !editingSkill?.certificado_pdf ? "*" : "") : "(opcional)"}
                  </label>
                  <input
                    className={`form-file${errors.certificado_pdf ? " error" : ""}`}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setForm((prev) => ({ ...prev, certificado_pdf: file }));
                    }}
                  />
                  <p className="form-help">
                    {editingSkill?.certificado_pdf
                      ? "Ya existe un certificado. Sube otro PDF solo si quieres reemplazarlo."
                      : form.tipo === "blanda"
                        ? "Puedes subir un PDF si quieres respaldar esta habilidad. Maximo 5 MB."
                        : "PDF publico que respalda esta habilidad. Maximo 5 MB."}
                  </p>
                  {errors.certificado_pdf ? <p className="form-error">{errors.certificado_pdf}</p> : null}
                </div>

                <label className="visibility-toggle">
                  <span>
                    <strong>Visible en portafolio publico</strong>
                    <small>Controla si esta habilidad aparece en tu portafolio publico</small>
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
