import { useEffect, useState } from "react";
import type { CreateSkillPayload, Skill, UpdateSkillPayload } from "../../types/skill";

type Props = {
  isOpen: boolean;
  mode: "create" | "edit";
  skillType: "tecnica" | "blanda";
  initialSkill?: Skill | null;
  categoryOptions: string[];
  onClose: () => void;
  onSubmit: (payload: CreateSkillPayload | UpdateSkillPayload) => Promise<void>;
};

export default function SkillFormModal({
  isOpen,
  mode,
  skillType,
  initialSkill,
  categoryOptions,
  onClose,
  onSubmit,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [nivel, setNivel] = useState<"basico" | "intermedio" | "avanzado">("intermedio");
  const [esVisible, setEsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialSkill) {
      setNombre(initialSkill.nombre);
      setCategoria(initialSkill.categoria ?? "");
      setNivel(initialSkill.nivel);
      setEsVisible(initialSkill.es_visible);
      return;
    }

    setNombre("");
    setCategoria("");
    setNivel("intermedio");
    setEsVisible(false);
  }, [mode, initialSkill, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create") {
      if (!nombre.trim()) return;
      if (skillType === "tecnica" && !categoria.trim()) return;

      const payload: CreateSkillPayload = {
        nombre: nombre.trim(),
        tipo: skillType,
        categoria: skillType === "tecnica" ? categoria.trim() : null,
        nivel,
        es_visible: esVisible,
      };

      setLoading(true);
      try {
        await onSubmit(payload);
        onClose();
      } finally {
        setLoading(false);
      }
      return;
    }

    const payload: UpdateSkillPayload = {
      nivel,
      es_visible: esVisible,
    };

    setLoading(true);
    try {
      await onSubmit(payload);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="skill-modal-backdrop">
      <div className="skill-modal">
        <div className="skill-modal__header">
          <div>
            <h3>
              {mode === "create"
                ? skillType === "tecnica"
                  ? "Nueva Habilidad Técnica"
                  : "Nueva Habilidad Blanda"
                : "Editar Habilidad"}
            </h3>
            <p>
              {skillType === "tecnica"
                ? "Agrega una nueva habilidad a tu portafolio y organízala por categoría"
                : "Agrega una nueva habilidad a tu portafolio"}
            </p>
          </div>

          <button type="button" className="skill-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="skill-form">
          <label className="skill-label">
            Nombre de la Habilidad *
            <input
              className="skill-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={mode === "edit"}
              placeholder={
                skillType === "tecnica"
                  ? "Ej: React, Python, Docker"
                  : "Ej: Trabajo en equipo, Liderazgo"
              }
            />
          </label>

          {skillType === "tecnica" && (
            <label className="skill-label">
              Categoría *
              <select
                className="skill-input"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                disabled={mode === "edit"}
              >
                <option value="">Selecciona una categoría</option>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="skill-label">
            Nivel de Dominio *
            <select
              className="skill-input"
              value={nivel}
              onChange={(e) => setNivel(e.target.value as typeof nivel)}
            >
              <option value="basico">Básico</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </label>

          <div className="skill-visibility-box">
            <div>
              <strong>Visible en portafolio público</strong>
              <p>Controla si esta habilidad aparece en tu portafolio público</p>
            </div>

            <label className="skill-switch">
              <input
                type="checkbox"
                checked={esVisible}
                onChange={(e) => setEsVisible(e.target.checked)}
              />
              <span className="skill-switch-slider"></span>
            </label>
          </div>

          <div className="skill-form__actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Guardando..." : mode === "create" ? "Crear Habilidad" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}