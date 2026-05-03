import type { PublicProfileCard } from "../types/profile";
import type { SkillLevel } from "../types/skill";

export interface ProfileSearchFilters {
  query: string;
  area: string;
  level: SkillLevel | "";
  role: string;
  experienceMin: string;
  experienceMax: string;
  technologies: string[];
  technologyLevel: SkillLevel | "";
}

function normalizeText(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function toNumber(value: string) {
  if (value.trim() === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getProjectExperienceYears(profile: PublicProfileCard) {
  const ranges = (profile.proyectos || [])
    .map((project) => {
      const start = project.fecha_inicio ? new Date(project.fecha_inicio) : null;
      const end = project.fecha_fin ? new Date(project.fecha_fin) : new Date();

      if (!start || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
        return 0;
      }

      return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    })
    .filter((years) => years > 0);

  if (!ranges.length) return null;

  return Math.round(ranges.reduce((total, years) => total + years, 0) * 10) / 10;
}

function getProfileExperience(profile: PublicProfileCard) {
  const explicitExperience = (profile as PublicProfileCard & { experiencia?: number | string | null }).experiencia;

  if (explicitExperience !== undefined && explicitExperience !== null && explicitExperience !== "") {
    const parsed = Number(explicitExperience);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return getProjectExperienceYears(profile);
}

function profileMatchesText(profile: PublicProfileCard, query: string) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) return true;

  const searchableValues = [
    profile.nombre_completo,
    profile.profesion,
    profile.titular_profesional,
    ...(profile.habilidades || []).map((skill) => skill.nombre),
    ...(profile.habilidades || []).map((skill) => skill.categoria || ""),
    ...(profile.proyectos || []).map((project) => project.titulo),
    ...(profile.proyectos || []).flatMap((project) => project.tecnologias || []),
  ];

  return searchableValues.some((value) => normalizeText(value).includes(normalizedQuery));
}

function profileMatchesTechnology(profile: PublicProfileCard, technology: string, technologyLevel: SkillLevel | "") {
  const normalizedTechnology = normalizeText(technology);
  const normalizedTechnologyLevel = normalizeText(technologyLevel);

  return (profile.habilidades || []).some((skill) => {
    const matchesName = normalizeText(skill.nombre) === normalizedTechnology;
    const matchesLevel = !normalizedTechnologyLevel || normalizeText(skill.nivel_dominio) === normalizedTechnologyLevel;

    return matchesName && matchesLevel;
  });
}

export function filterProfiles(profiles: PublicProfileCard[], filters: ProfileSearchFilters) {
  const normalizedArea = normalizeText(filters.area);
  const normalizedLevel = normalizeText(filters.level);
  const normalizedRole = normalizeText(filters.role);
  const minExperience = toNumber(filters.experienceMin);
  const maxExperience = toNumber(filters.experienceMax);

  return profiles.filter((profile) => {
    if (!profileMatchesText(profile, filters.query)) return false;

    if (normalizedArea) {
      const hasArea = (profile.habilidades || []).some((skill) => normalizeText(skill.categoria) === normalizedArea);
      if (!hasArea) return false;
    }

    if (normalizedLevel) {
      const hasLevel = (profile.habilidades || []).some((skill) => normalizeText(skill.nivel_dominio) === normalizedLevel);
      if (!hasLevel) return false;
    }

    if (normalizedRole) {
      const roleValues = [
        profile.profesion,
        profile.titular_profesional,
        ...(profile.proyectos || []).map((project) => project.rol),
      ];
      const hasRole = roleValues.some((role) => normalizeText(role).includes(normalizedRole));
      if (!hasRole) return false;
    }

    if (minExperience !== null || maxExperience !== null) {
      const experience = getProfileExperience(profile);
      if (experience === null) return false;
      if (minExperience !== null && experience < minExperience) return false;
      if (maxExperience !== null && experience > maxExperience) return false;
    }

    if (filters.technologies.length > 0) {
      const hasAllTechnologies = filters.technologies.every((technology) =>
        profileMatchesTechnology(profile, technology, filters.technologyLevel),
      );

      if (!hasAllTechnologies) return false;
    }

    return true;
  });
}
