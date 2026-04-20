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
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<{
    nombre?: string;
    categoria?: string;
  }>({});

  useEffect(() => {
    if (mode === "edit" && initialSkill) {
      setNombre(initialSkill.nombre);
      setCategoria(initialSkill.categoria ?? "");
      setNivel(initialSkill.nivel);
      setEsVisible(initialSkill.es_visible);
      setFormError("");
      setErrors({});
      return;
    }

    setNombre("");
    setCategoria("");
    setNivel("intermedio");
    setEsVisible(false);
    setFormError("");
    setErrors({});
  }, [mode, initialSkill, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create") {
      const nextErrors = {
        nombre: !nombre.trim() ? "El nombre de la habilidad es obligatorio." : "",
        categoria:
          skillType === "tecnica" && !categoria.trim()
            ? "La categoria es obligatoria para una habilidad tecnica."
            : "",
      };

      setErrors(nextErrors);

      if (nextErrors.nombre || nextErrors.categoria) {
        setFormError("Completa los campos obligatorios antes de guardar la habilidad.");
        return;
      }

      setFormError("");

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
                  ? "Nueva Habilidad Tecnica"
                  : "Nueva Habilidad Blanda"
                : "Editar Habilidad"}
            </h3>
            <p>
              {skillType === "tecnica"
                ? "Agrega una nueva habilidad a tu portafolio y organizala por categoria"
                : "Agrega una nueva habilidad a tu portafolio"}
            </p>
          </div>

          <button type="button" className="skill-close-btn" onClick={onClose}>
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="skill-form">
          {formError ? <p className="skill-form-error">{formError}</p> : null}

          <label className="skill-label">
            Nombre de la Habilidad *
            <input
              className={`skill-input${errors.nombre ? " skill-input--error" : ""}`}
              value={nombre}
              onChange={(e) => {
                const value = e.target.value;
                setNombre(value);
                setErrors((prev) => ({
                  ...prev,
                  nombre: value.trim() ? "" : prev.nombre,
                }));
                if (value.trim()) {
                  setFormError("");
                }
              }}
              disabled={mode === "edit"}
              placeholder={
                skillType === "tecnica"
                  ? "Ej: React, Python, Docker"
                  : "Ej: Trabajo en equipo, Liderazgo"
              }
            />
            {errors.nombre ? <span className="skill-field-error">{errors.nombre}</span> : null}
          </label>

          {skillType === "tecnica" && (
            <label className="skill-label">
              Categoria *
              <select
                className={`skill-input${errors.categoria ? " skill-input--error" : ""}`}
                value={categoria}
                onChange={(e) => {
                  const value = e.target.value;
                  setCategoria(value);
                  setErrors((prev) => ({
                    ...prev,
                    categoria: value.trim() ? "" : prev.categoria,
                  }));
                  if (value.trim()) {
                    setFormError("");
                  }
                }}
                disabled={mode === "edit"}
              >
                <option value="">Selecciona una categoria</option>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.categoria ? <span className="skill-field-error">{errors.categoria}</span> : null}
            </label>
          )}

          <label className="skill-label">
            Nivel de Dominio *
            <select
              className="skill-input"
              value={nivel}
              onChange={(e) => setNivel(e.target.value as typeof nivel)}
            >
              <option value="basico">Basico</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </label>

          <div className="skill-visibility-box">
            <div>
              <strong>Visible en portafolio publico</strong>
              <p>Controla si esta habilidad aparece en tu portafolio publico</p>
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
