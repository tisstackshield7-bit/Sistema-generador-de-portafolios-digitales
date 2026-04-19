import type { Skill } from "../../types/skill";

type Props = {
  skill: Skill;
  onEdit: (skill: Skill) => void;
  onDelete: (id: number) => void;
  onToggleVisibility: (id: number) => void;
};

export default function SkillCard({
  skill,
  onEdit,
  onDelete,
  onToggleVisibility,
}: Props) {
  return (
    <div className="skill-card">
      <div className="skill-card__header">
        <div>
          <h4>{skill.nombre}</h4>
          {skill.categoria && <p>{skill.categoria}</p>}
        </div>
        <span>{skill.nivel}</span>
      </div>

      <div className="skill-card__actions">
        <button type="button" onClick={() => onToggleVisibility(skill.id)}>
          {skill.es_visible ? "Ocultar" : "Mostrar"}
        </button>

        <button type="button" onClick={() => onEdit(skill)}>
          Editar
        </button>

        <button type="button" onClick={() => onDelete(skill.id)}>
          Eliminar
        </button>
      </div>
    </div>
  );
}