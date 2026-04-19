import type { Skill } from "../../types/skill";
import SkillCard from "./SkillCard";

type Props = {
  skills: Skill[];
  onEdit: (skill: Skill) => void;
  onDelete: (id: number) => void;
  onToggleVisibility: (id: number) => void;
};

export default function SkillList({
  skills,
  onEdit,
  onDelete,
  onToggleVisibility,
}: Props) {
  if (!skills.length) {
    return <p>No hay habilidades registradas.</p>;
  }

  return (
    <div className="skill-list">
      {skills.map((skill) => (
        <SkillCard
          key={skill.id}
          skill={skill}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleVisibility={onToggleVisibility}
        />
      ))}
    </div>
  );
}