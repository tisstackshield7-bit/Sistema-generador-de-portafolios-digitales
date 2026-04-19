import { useEffect, useMemo, useState } from "react";
import {
  createSkill,
  deleteSkill,
  getSkills,
  toggleSkillVisibility,
  updateSkill,
} from "../../api/skills";
import SkillFormModal from "../../components/skills/SkillFormModal";
import type { CreateSkillPayload, Skill, UpdateSkillPayload } from "../../types/skill";
import { useNavigate } from "react-router-dom";

const categoryOptions = [
  "Frontend",
  "Backend",
  "Base de Datos",
  "DevOps",
  "Mobile",
  "Testing",
  "Diseño",
  "Otras",
];

export default function SkillsPage() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [tab, setTab] = useState<"tecnica" | "blanda">("tecnica");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const response = await getSkills();
      setSkills(response.data ?? []);
    } catch (error) {
      console.error("Error al cargar habilidades:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const filteredSkills = useMemo(
    () => skills.filter((skill) => skill.tipo === tab),
    [skills, tab]
  );

  const groupedSkills = useMemo(() => {
    if (tab === "blanda") {
      return {
        "Habilidades Blandas": filteredSkills,
      };
    }

    return filteredSkills.reduce<Record<string, Skill[]>>((acc, skill) => {
      const key = skill.categoria || "Otras";
      if (!acc[key]) acc[key] = [];
      acc[key].push(skill);
      return acc;
    }, {});
  }, [filteredSkills, tab]);

  const openCreateModal = () => {
    setMode("create");
    setSelectedSkill(null);
    setModalOpen(true);
  };

  const openEditModal = (skill: Skill) => {
    setMode("edit");
    setSelectedSkill(skill);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: CreateSkillPayload | UpdateSkillPayload) => {
    if (mode === "create") {
      await createSkill(payload as CreateSkillPayload);
    } else if (selectedSkill) {
      await updateSkill(selectedSkill.id, payload as UpdateSkillPayload);
    }
    await loadSkills();
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("¿Deseas eliminar esta habilidad?");
    if (!confirmed) return;

    await deleteSkill(id);
    await loadSkills();
  };

  const handleToggleVisibility = async (id: number) => {
    await toggleSkillVisibility(id);
    await loadSkills();
  };

  const getLevelClass = (nivel: string) => {
    switch (nivel) {
      case "basico":
        return "skill-badge skill-badge--basic";
      case "intermedio":
        return "skill-badge skill-badge--intermediate";
      case "avanzado":
        return "skill-badge skill-badge--advanced";
      default:
        return "skill-badge";
    }
  };

  return (
    <div className="skills-page-shell">
      <aside className="skills-sidebar">
        <div className="skills-brand">Portfolio Pro</div>

        <nav className="skills-sidebar-nav">
          <button type="button" className="skills-nav-item" onClick={() => navigate("/")}>
            Dashboard
          </button>
          <button type="button" className="skills-nav-item" onClick={() => navigate("/en-proceso")}>
            Proyectos
          </button>
          <button type="button" className="skills-nav-item skills-nav-item--active">
            Habilidades
          </button>
          <button type="button" className="skills-nav-item" onClick={() => navigate("/en-proceso")}>
            Experiencia
          </button>
          <button type="button" className="skills-nav-item" onClick={() => navigate("/perfil")}>
            Perfil
          </button>
        </nav>

        <button type="button" className="skills-logout" onClick={() => navigate("/perfil")}>
          Cerrar Sesión
        </button>
      </aside>

      <main className="skills-main">
        <header className="skills-header">
          <div>
            <h1>Habilidades</h1>
            <p>Gestiona tus habilidades organizadas por categorías</p>
          </div>
        </header>

        <section className="skills-toolbar">
          <div className="skills-tabs">
            <button
              type="button"
              className={tab === "tecnica" ? "skills-tab skills-tab--active" : "skills-tab"}
              onClick={() => setTab("tecnica")}
            >
              Habilidades Técnicas ({skills.filter((s) => s.tipo === "tecnica").length})
            </button>
            <button
              type="button"
              className={tab === "blanda" ? "skills-tab skills-tab--active" : "skills-tab"}
              onClick={() => setTab("blanda")}
            >
              Habilidades Blandas ({skills.filter((s) => s.tipo === "blanda").length})
            </button>
          </div>

          <button type="button" className="skills-create-btn" onClick={openCreateModal}>
            {tab === "tecnica" ? "+ Nueva Habilidad Técnica" : "+ Nueva Habilidad Blanda"}
          </button>
        </section>

        {loading ? (
          <p className="skills-empty">Cargando habilidades...</p>
        ) : filteredSkills.length === 0 ? (
          <p className="skills-empty">No hay habilidades registradas todavía.</p>
        ) : (
          <section className="skills-groups">
            {Object.entries(groupedSkills).map(([groupName, groupSkills]) => (
              <div className="skills-group" key={groupName}>
                <div className="skills-group-header">
                  <div>
                    <h2>{groupName}</h2>
                    <p>{groupSkills.length} habilidad(es)</p>
                  </div>
                </div>

                <div className="skills-cards">
                  {groupSkills.map((skill) => (
                    <article className="skills-card" key={skill.id}>
                      <div className="skills-card-top">
                        <h3>{skill.nombre}</h3>
                        <span className={getLevelClass(skill.nivel)}>
                          {skill.nivel.charAt(0).toUpperCase() + skill.nivel.slice(1)}
                        </span>
                      </div>

                      <div className="skills-card-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => handleToggleVisibility(skill.id)}
                          title={skill.es_visible ? "Ocultar" : "Mostrar"}
                        >
                          {skill.es_visible ? "👁️" : "🙈"}
                        </button>

                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => openEditModal(skill)}
                          title="Editar"
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          onClick={() => handleDelete(skill.id)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        <SkillFormModal
          isOpen={modalOpen}
          mode={mode}
          skillType={mode === "create" ? tab : selectedSkill?.tipo ?? "tecnica"}
          initialSkill={selectedSkill}
          categoryOptions={categoryOptions}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      </main>
    </div>
  );
}