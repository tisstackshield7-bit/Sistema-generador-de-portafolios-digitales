import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../api/auth";
import { API_ORIGIN } from "../api/axios";
import { getMyProfile, getPublicProfiles } from "../api/profile";
import { authStore } from "../store/authStore";
import type { Perfil, PublicProfileCard } from "../types/profile";
import type { SkillLevel } from "../types/skill";
import { getAuthenticatedHomePath } from "../utils/authRedirect";
import type { ProfileSearchFilters } from "../utils/profileFilters";
import { richTextToPlainText } from "../utils/richText";
import logo from "../assets/logof.png";
import "./HomePage.css";

function getInitials(name?: string | null) {
  if (!name) return "PF";

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function normalizeText(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const skillLevelOrder: Record<string, number> = {
  avanzado: 0,
  intermedio: 1,
  basico: 2,
};

const skillLevels: SkillLevel[] = ["Avanzado", "Intermedio", "Basico"];

const defaultProfileVisibility = {
  mostrar_correo: true,
  mostrar_telefono: false,
  mostrar_redes: true,
  mostrar_biografia: true,
  mostrar_habilidades: true,
  mostrar_proyectos: true,
  mostrar_experiencia: true,
  mostrar_evidencias: true,
};

const initialAdvancedFilters: Pick<
  ProfileSearchFilters,
  "role" | "experienceType" | "experienceMin" | "experienceMax" | "technologies" | "technologyLevel"
> = {
  role: "",
  experienceType: "todas",
  experienceMin: "",
  experienceMax: "",
  technologies: [],
  technologyLevel: "",
};

const experienceTypeLabels: Record<typeof initialAdvancedFilters.experienceType, string> = {
  todas: "Todas las experiencias",
  laboral: "Experiencia laboral",
  academica: "Experiencia academica",
};

const experienceTypeOptions = Object.entries(experienceTypeLabels) as [
  typeof initialAdvancedFilters.experienceType,
  string,
][];

const FEATURED_PROFILE_LIMIT = 10;

function getSkillLevelRank(level?: string | null) {
  return skillLevelOrder[normalizeText(level)] ?? 99;
}

function getProfileVisibility(profile: PublicProfileCard) {
  return {
    ...defaultProfileVisibility,
    ...(profile.visibilidad || {}),
  };
}

function getProfileHighlights(profile: PublicProfileCard, category?: string) {
  if (!getProfileVisibility(profile).mostrar_habilidades) {
    return [];
  }

  const normalizedCategory = normalizeText(category);

  return (profile.habilidades || [])
    .filter((skill) => skill.tipo === "tecnica")
    .filter((skill) => !normalizedCategory || normalizeText(skill.categoria) === normalizedCategory)
    .sort((left, right) => {
      const leftLevel = getSkillLevelRank(left.nivel_dominio);
      const rightLevel = getSkillLevelRank(right.nivel_dominio);

      return leftLevel - rightLevel || left.nombre.localeCompare(right.nombre);
    })
    .slice(0, 3);
}

function getCategoryDomId(category: string) {
  return `featured-category-${normalizeText(category).replace(/\s+/g, "-") || "general"}`;
}

function compareProfilesBySkillLevel(left: PublicProfileCard, right: PublicProfileCard, category?: string) {
  const leftHighlights = getProfileHighlights(left, category);
  const rightHighlights = getProfileHighlights(right, category);
  const maxComparedSkills = Math.max(leftHighlights.length, rightHighlights.length);

  for (let index = 0; index < maxComparedSkills; index += 1) {
    const levelDifference = getSkillLevelRank(leftHighlights[index]?.nivel_dominio) - getSkillLevelRank(rightHighlights[index]?.nivel_dominio);

    if (levelDifference !== 0) {
      return levelDifference;
    }
  }

  return left.nombre_completo.localeCompare(right.nombre_completo);
}

function countProfileEvidences(profile: PublicProfileCard) {
  if (!getProfileVisibility(profile).mostrar_evidencias) {
    return 0;
  }

  return (profile.habilidades || []).reduce((total, skill) => total + (skill.evidencias?.length || 0), 0);
}

function getProfileExperienceYears(profile: PublicProfileCard) {
  const visibility = getProfileVisibility(profile);
  const sourceItems = visibility.mostrar_experiencia
    ? (profile.experiencias || []).filter((experience) => experience.tipo === "laboral")
    : [];
  const fallbackItems = visibility.mostrar_proyectos ? (profile.proyectos || []) : [];
  const ranges = (sourceItems.length ? sourceItems : fallbackItems)
    .map((item) => {
      const start = item.fecha_inicio ? new Date(item.fecha_inicio) : null;
      const isCurrent = "actualidad" in item ? item.actualidad : false;
      const end = isCurrent ? new Date() : (item.fecha_fin ? new Date(item.fecha_fin) : new Date());

      if (!start || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
        return 0;
      }

      return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    })
    .filter((years) => years > 0);

  if (!ranges.length) return 0;

  return Math.max(1, Math.round(ranges.reduce((total, years) => total + years, 0)));
}

function formatExperienceLabel(years: number) {
  if (!years) return "Sin registro";
  return `${years} ${years === 1 ? "ano" : "anos"}`;
}

function getProfileCompleteness(profile: PublicProfileCard) {
  const visibility = getProfileVisibility(profile);
  const biography = richTextToPlainText(profile.biografia || "").replace(/\s+/g, " ").trim();
  const score = [
    Boolean(profile.foto_perfil),
    Boolean(profile.profesion),
    Boolean(profile.titular_profesional),
    visibility.mostrar_biografia && biography.length >= 40,
    visibility.mostrar_habilidades && Boolean(profile.habilidades?.length),
    visibility.mostrar_proyectos && Boolean(profile.proyectos?.length),
    countProfileEvidences(profile) > 0,
  ].filter(Boolean).length;

  if (score >= 6) return { label: "Perfil completo", tone: "complete" };
  if (score >= 4) return { label: "Con avances", tone: "progress" };
  return { label: "En construccion", tone: "draft" };
}

function getProfileSummary(profile: PublicProfileCard) {
  const visibility = getProfileVisibility(profile);
  const biography = visibility.mostrar_biografia
    ? richTextToPlainText(profile.biografia || "").replace(/\s+/g, " ").trim()
    : "";
  const projectCount = visibility.mostrar_proyectos ? (profile.proyectos?.length || 0) : 0;
  const skillCount = visibility.mostrar_habilidades ? (profile.habilidades?.length || 0) : 0;
  const evidenceCount = countProfileEvidences(profile);
  const experienceYears = getProfileExperienceYears(profile);
  const role = profile.titular_profesional || profile.profesion || "Perfil profesional";
  const profession = profile.titular_profesional && profile.profesion
    ? ` en ${profile.profesion}`
    : "";

  if (biography && biography.length <= 130) {
    return biography;
  }

  if (projectCount || skillCount || evidenceCount) {
    return `${role}${profession}. ${skillCount} habilidades, ${projectCount} proyectos y ${formatExperienceLabel(experienceYears)} de experiencia registrada.`;
  }

  return `${role}${profession}. Perfil profesional en proceso de actualización.`;
}

function compareFeaturedProfiles(left: PublicProfileCard, right: PublicProfileCard, category?: string) {
  const evidenceDifference = countProfileEvidences(right) - countProfileEvidences(left);

  if (evidenceDifference !== 0) return evidenceDifference;

  const projectDifference = (right.proyectos?.length || 0) - (left.proyectos?.length || 0);

  if (projectDifference !== 0) return projectDifference;

  const skillDifference = (right.habilidades?.length || 0) - (left.habilidades?.length || 0);

  if (skillDifference !== 0) return skillDifference;

  return compareProfilesBySkillLevel(left, right, category);
}

function getLandingSkillTone(level: SkillLevel) {
  if (level === "Avanzado") return "advanced";
  if (level === "Intermedio") return "intermediate";
  return "basic";
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        d="M8.8 14.4a5.6 5.6 0 1 1 0-11.2 5.6 5.6 0 0 1 0 11.2Zm4.1-1.5 3.9 3.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" className={className}>
      <path
        d="M5.5 7.5 10 12l4.5-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        d="m6 6 8 8M14 6l-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LandingSocialIcon({ type }: { type: "linkedin" | "github" | "web" }) {
  if (type === "github") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3.5a8.5 8.5 0 0 0-2.7 16.6c.4.1.6-.2.6-.4v-1.5c-2.3.5-2.8-1-2.8-1-.4-.9-.9-1.2-.9-1.2-.8-.5.1-.5.1-.5.8.1 1.3.9 1.3.9.8 1.3 2 1 2.4.8.1-.6.3-1 .5-1.2-1.8-.2-3.7-.9-3.7-4a3.1 3.1 0 0 1 .8-2.2 2.9 2.9 0 0 1 .1-2.1s.7-.2 2.3.8a8 8 0 0 1 4.2 0c1.6-1 2.3-.8 2.3-.8.4.9.1 1.8.1 2.1.5.6.8 1.3.8 2.2 0 3.1-1.9 3.8-3.7 4 .3.3.6.8.6 1.6v2.3c0 .3.2.5.6.4A8.5 8.5 0 0 0 12 3.5Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (type === "web") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8" />
          <path d="M4 12h16M12 4c2 2.2 3 4.8 3 8s-1 5.8-3 8M12 4c-2 2.2-3 4.8-3 8s1 5.8 3 8" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <g fill="currentColor">
        <path d="M6.7 9.2H3.9v9h2.8v-9Z" />
        <path d="M5.3 5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" />
        <path d="M10.8 9.2H8.1v9h2.7v-4.7c0-1.2.6-2 1.7-2s1.5.8 1.5 2v4.7h2.8V13c0-2.7-1.4-4-3.3-4-1.5 0-2.2.8-2.6 1.4h-.1V9.2Z" />
      </g>
    </svg>
  );
}

function ProfileCard({
  profile,
  category,
  ranking,
  onViewProfile,
}: {
  profile: PublicProfileCard;
  category?: string;
  ranking?: number;
  onViewProfile: (slug: string) => void;
}) {
  const highlights = getProfileHighlights(profile, category);
  const visibility = getProfileVisibility(profile);
  const projectCount = visibility.mostrar_proyectos ? (profile.proyectos?.length || 0) : 0;
  const skillCount = visibility.mostrar_habilidades ? (profile.habilidades?.length || 0) : 0;
  const experienceYears = getProfileExperienceYears(profile);
  const summary = getProfileSummary(profile);
  const completeness = getProfileCompleteness(profile);
  const socialLinks = visibility.mostrar_redes
    ? [
        profile.linkedin_url ? { type: "linkedin" as const, label: "LinkedIn", url: profile.linkedin_url } : null,
        profile.github_url ? { type: "github" as const, label: "GitHub", url: profile.github_url } : null,
        profile.sitio_web_url ? { type: "web" as const, label: "Sitio Web", url: profile.sitio_web_url } : null,
      ].filter(Boolean) as { type: "linkedin" | "github" | "web"; label: string; url: string }[]
    : [];

  return (
    <article className={`landing-profile-card${ranking ? ` has-ranking rank-${Math.min(ranking, 4)}` : ""}`}>
      {ranking ? (
        <span className="landing-ranking-badge">
          <span>{ranking === 1 ? "TOP" : "N°"}</span>
          <strong>{ranking}</strong>
        </span>
      ) : null}
      <div className="landing-profile-body">
        <div className="landing-profile-identity-block">
          {profile.foto_perfil ? (
            <img
              src={`${API_ORIGIN}/storage/${profile.foto_perfil}`}
              alt={profile.nombre_completo}
              className="landing-profile-avatar"
            />
          ) : (
            <div className="landing-profile-avatar landing-profile-fallback">{getInitials(profile.nombre_completo)}</div>
          )}

          <div className="landing-profile-main-copy">
            <div className="landing-profile-title-row">
              <h3>{profile.nombre_completo}</h3>
              <span className={`landing-profile-status ${completeness.tone}`}>{completeness.label}</span>
            </div>
            <p className="landing-profile-profession">
              {[profile.titular_profesional, profile.profesion]
                .filter(Boolean)
                .filter((value, index, list) => index === 0 || normalizeText(value) !== normalizeText(list[0]))
                .join(" · ") || "Perfil profesional"}
            </p>
            {profile.ubicacion ? <p className="landing-profile-location">{profile.ubicacion}</p> : null}
            <p className="landing-profile-summary">{summary}</p>
          </div>
        </div>

        <div className="landing-profile-evidence-strip" aria-label="Indicadores del perfil">
          <span><strong>{projectCount}</strong> proyectos</span>
          <span><strong>{skillCount}</strong> habilidades</span>
          <span><strong>{experienceYears || "-"}</strong> experiencia</span>
        </div>

        <div className="landing-profile-footer">
          {highlights.length > 0 ? (
            <div className="landing-tag-row">
              {highlights.map((skill) => (
                <span key={`${profile.id}-${skill.id}`} className={`landing-skill-chip ${getLandingSkillTone(skill.nivel_dominio)}`}>
                  {skill.nombre} · {skill.nivel_dominio}
                </span>
              ))}
            </div>
          ) : (
            <p className="landing-profile-muted">Sin habilidades destacadas visibles.</p>
          )}
          {socialLinks.length ? (
            <div className="landing-profile-social-row" aria-label="Enlaces profesionales">
              {socialLinks.map((link) => (
                <a key={`${profile.id}-${link.type}`} href={link.url} target="_blank" rel="noreferrer" title={link.label}>
                  <LandingSocialIcon type={link.type} />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          ) : null}
          <button type="button" onClick={() => onViewProfile(profile.slug)}>
            Ver portafolio
          </button>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const isAuth = authStore.isAuthenticated();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [publicProfiles, setPublicProfiles] = useState<PublicProfileCard[]>([]);
  const [featuredProfilesSource, setFeaturedProfilesSource] = useState<PublicProfileCard[]>([]);
  const [profileCategories, setProfileCategories] = useState<string[]>([]);
  const [publicRoles, setPublicRoles] = useState<string[]>([]);
  const [publicTechnologies, setPublicTechnologies] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [technologySearch, setTechnologySearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFeaturedCategory, setSelectedFeaturedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | "">("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [openFilter, setOpenFilter] = useState<"category" | "level" | null>(null);
  const [openAdvancedFilter, setOpenAdvancedFilter] = useState<"role" | "experienceType" | "technologyLevel" | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState(initialAdvancedFilters);
  const [showAllFeaturedProfiles, setShowAllFeaturedProfiles] = useState(false);
  const [collapsedFeaturedCategories, setCollapsedFeaturedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const controller = new AbortController();

    getPublicProfiles({}, controller.signal)
      .then((data) => {
        setFeaturedProfilesSource(data.perfiles || []);
        setProfileCategories(data.categorias || []);
        setPublicRoles(data.roles || []);
        setPublicTechnologies(data.tecnologias || []);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setFeaturedProfilesSource([]);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();
    const searchableQuery = trimmedQuery.length >= 2 ? trimmedQuery : "";
    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      setAppliedQuery(searchableQuery);
      getPublicProfiles({
        buscar: searchableQuery,
        categoria: selectedCategory,
        nivel: selectedLevel,
        rol: advancedFilters.role,
        tipo_experiencia: advancedFilters.experienceType,
        experiencia_min: advancedFilters.experienceMin,
        experiencia_max: advancedFilters.experienceMax,
        tecnologias: advancedFilters.technologies,
        nivel_tecnologia: advancedFilters.technologyLevel,
      }, controller.signal)
        .then((data) => {
          setPublicProfiles(data.perfiles || []);
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setPublicProfiles([]);
          }
        });
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [advancedFilters, query, selectedCategory, selectedLevel]);

  useEffect(() => {
    if (!isAuth) {
      setPerfil(null);
      return;
    }

    getMyProfile()
      .then((data) => setPerfil(data.perfil || null))
      .catch(() => setPerfil(null));
  }, [isAuth]);

  const user = authStore.getUser();
  const dashboardPath = getAuthenticatedHomePath(user);
  const welcomeName = useMemo(
    () => perfil?.nombres || perfil?.nombre_completo?.split(" ")[0] || user?.correo?.split("@")[0] || "Profesional",
    [perfil, user],
  );

  const filteredProfiles = useMemo(() => publicProfiles, [publicProfiles]);

  const selectedTechnologies = advancedFilters.technologies;
  const advancedActiveFilterCount =
    (advancedFilters.role ? 1 : 0) +
    (advancedFilters.experienceType !== "todas" ? 1 : 0) +
    (advancedFilters.experienceMin ? 1 : 0) +
    (advancedFilters.experienceMax ? 1 : 0) +
    selectedTechnologies.length +
    (advancedFilters.technologyLevel ? 1 : 0);
  const hasActiveAdvancedFilters = advancedActiveFilterCount > 0;
  const hasActiveSearch = Boolean(appliedQuery || selectedCategory || selectedLevel || hasActiveAdvancedFilters);

  const roleOptions = publicRoles;
  const searchedRoleOptions = useMemo(() => {
    const normalizedSearch = normalizeText(roleSearch).trim();

    if (!normalizedSearch) {
      return roleOptions.slice(0, 14);
    }

    return roleOptions
      .filter((role) => normalizeText(role).includes(normalizedSearch))
      .slice(0, 18);
  }, [roleOptions, roleSearch]);
  const technologyOptions = publicTechnologies;
  const technologySummary =
    selectedTechnologies.length === 0
      ? "Todas las tecnologías"
      : selectedTechnologies.length <= 2
        ? selectedTechnologies.join(", ")
        : `${selectedTechnologies.length} tecnologías seleccionadas`;

  const technologyUsage = useMemo(() => {
    const usage = new Map<string, number>();

    featuredProfilesSource.forEach((profile) => {
      (profile.habilidades || []).forEach((skill) => {
        usage.set(skill.nombre, (usage.get(skill.nombre) || 0) + 1);
      });

      (profile.proyectos || []).forEach((project) => {
        (project.tecnologias || []).forEach((technology) => {
          usage.set(technology, (usage.get(technology) || 0) + 1);
        });
      });
    });

    return usage;
  }, [featuredProfilesSource]);
  const popularTechnologyOptions = useMemo(
    () =>
      [...technologyOptions]
        .sort((left, right) => {
          const usageDifference = (technologyUsage.get(right) || 0) - (technologyUsage.get(left) || 0);
          return usageDifference || left.localeCompare(right);
        })
        .slice(0, 12),
    [technologyOptions, technologyUsage],
  );
  const searchedTechnologyOptions = useMemo(() => {
    const normalizedSearch = normalizeText(technologySearch).trim();
    const selected = new Set(selectedTechnologies);

    if (!normalizedSearch) {
      return popularTechnologyOptions.filter((technology) => !selected.has(technology));
    }

    return technologyOptions
      .filter((technology) => normalizeText(technology).includes(normalizedSearch))
      .filter((technology) => !selected.has(technology))
      .sort((left, right) => {
        const usageDifference = (technologyUsage.get(right) || 0) - (technologyUsage.get(left) || 0);
        return usageDifference || left.localeCompare(right);
      })
      .slice(0, 18);
  }, [popularTechnologyOptions, selectedTechnologies, technologyOptions, technologySearch, technologyUsage]);

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (selectedLevel ? 1 : 0) +
    advancedActiveFilterCount;
  const searchResults = useMemo(
    () =>
      [...filteredProfiles]
        .sort((left, right) => compareProfilesBySkillLevel(left, right, selectedCategory || undefined))
        .slice(0, 6),
    [filteredProfiles, selectedCategory],
  );

  const featuredProfiles = useMemo(
    () =>
      [...featuredProfilesSource]
        .filter((profile) => getProfileHighlights(profile, selectedFeaturedCategory || undefined).length > 0)
        .sort((left, right) => compareFeaturedProfiles(left, right, selectedFeaturedCategory || undefined)),
    [featuredProfilesSource, selectedFeaturedCategory],
  );

  const featuredRankingByProfileId = useMemo(() => {
    const rankings = new Map<number, number>();

    featuredProfiles.slice(0, 10).forEach((profile, index) => {
      rankings.set(profile.id, index + 1);
    });

    return rankings;
  }, [featuredProfiles]);

  const groupedFeaturedProfiles = useMemo(() => {
    if (!selectedFeaturedCategory) {
      return featuredProfiles.length
        ? [{ category: "Todos", profiles: featuredProfiles }]
        : [];
    }

    const groups = new Map<string, PublicProfileCard[]>();

    featuredProfiles.forEach((profile) => {
      groups.set(selectedFeaturedCategory, [...(groups.get(selectedFeaturedCategory) || []), profile]);
    });

    return Array.from(groups.entries()).map(([category, profiles]) => ({ category, profiles }));
  }, [featuredProfiles, selectedFeaturedCategory]);

  const visibleFeaturedGroups = useMemo(
    () =>
      groupedFeaturedProfiles.map(({ category, profiles }) => ({
        category,
        profiles: showAllFeaturedProfiles ? profiles : profiles.slice(0, FEATURED_PROFILE_LIMIT),
        hiddenCount: showAllFeaturedProfiles ? 0 : Math.max(profiles.length - FEATURED_PROFILE_LIMIT, 0),
        total: profiles.length,
      })),
    [groupedFeaturedProfiles, showAllFeaturedProfiles],
  );

  useEffect(() => {
    setShowAllFeaturedProfiles(false);
    setCollapsedFeaturedCategories({});
  }, [selectedFeaturedCategory]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // The local session is cleared even if the backend session already expired.
    } finally {
      authStore.clearSession();
      setPerfil(null);
      navigate("/");
    }
  };

  const closeFilterMenu = () => setOpenFilter(null);
  const closeAdvancedFilterMenu = () => setOpenAdvancedFilter(null);
  const viewPublicProfile = (slug: string) => navigate(`/perfil-publico/${slug}`);
  const updateAdvancedFilter = <Key extends keyof typeof advancedFilters>(key: Key, value: (typeof advancedFilters)[Key]) => {
    setAdvancedFilters((current) => ({ ...current, [key]: value }));
  };
  const toggleTechnologyFilter = (technology: string) => {
    setAdvancedFilters((current) => {
      const exists = current.technologies.includes(technology);

      return {
        ...current,
        technologies: exists
          ? current.technologies.filter((item) => item !== technology)
          : [...current.technologies, technology],
      };
    });
  };
  const clearAllFilters = () => {
    setQuery("");
    setTechnologySearch("");
    setRoleSearch("");
    setAppliedQuery("");
    setSelectedCategory("");
    setSelectedLevel("");
    setAdvancedFilters(initialAdvancedFilters);
    setShowAdvancedFilters(false);
    closeFilterMenu();
    closeAdvancedFilterMenu();
  };
  const toggleFeaturedCategory = (category: string) => {
    setCollapsedFeaturedCategories((current) => ({
      ...current,
      [category]: !current[category],
    }));
  };
  const activeFilterChips = [
    selectedCategory ? { key: "category", label: `Area: ${selectedCategory}`, onRemove: () => setSelectedCategory("") } : null,
    selectedLevel ? { key: "level", label: `Nivel: ${selectedLevel}`, onRemove: () => setSelectedLevel("") } : null,
    advancedFilters.role ? { key: "role", label: `Rol: ${advancedFilters.role}`, onRemove: () => updateAdvancedFilter("role", "") } : null,
    advancedFilters.experienceType !== "todas"
      ? {
          key: "experienceType",
          label: experienceTypeLabels[advancedFilters.experienceType],
          onRemove: () => updateAdvancedFilter("experienceType", "todas"),
        }
      : null,
    advancedFilters.experienceMin || advancedFilters.experienceMax
      ? {
          key: "experience",
          label: `Experiencia: ${advancedFilters.experienceMin || "0"}-${advancedFilters.experienceMax || "max"} anos`,
          onRemove: () => {
            updateAdvancedFilter("experienceMin", "");
            updateAdvancedFilter("experienceMax", "");
          },
        }
      : null,
    advancedFilters.technologyLevel
      ? {
          key: "technologyLevel",
          label: `Nivel tech: ${advancedFilters.technologyLevel}`,
          onRemove: () => updateAdvancedFilter("technologyLevel", ""),
        }
      : null,
    ...selectedTechnologies.map((technology) => ({
      key: `technology-${technology}`,
      label: technology,
      onRemove: () => toggleTechnologyFilter(technology),
    })),
  ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

  return (
    <div className="home-landing-shell">
      <header className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <Link to="/" className="landing-brand">
            <span className="landing-brand-mark">
              <img src={logo} alt="SpherLink" />
            </span>
            <span>SpherLink</span>
          </Link>

          <nav className="landing-links" aria-label="Navegacion principal">
            <a href="#inicio">Inicio</a>
            <a href="#explorar">Explorar</a>
          </nav>

          <div className="landing-actions">
            {isAuth ? (
              <>
                <Link to={dashboardPath} className="landing-login-link">
                  Dashboard
                </Link>
                <button className="landing-primary-button" type="button" onClick={handleLogout}>
                  Cerrar sesion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="landing-login-link">
                  Iniciar sesion
                </Link>
                <Link to="/register" className="landing-primary-button">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section id="inicio" className="landing-hero">
          <div className="landing-container landing-hero-inner">
            <div className="landing-hero-copy">
              <span className="landing-badge">
                <span aria-hidden="true">*</span>
                {isAuth ? `Bienvenido, ${welcomeName}` : "Plataforma profesional para mostrar tu talento"}
              </span>

              <h1>
                {isAuth
                  ? "Continua construyendo tu presencia profesional"
                  : "Crea un portafolio digital que destaque tu perfil profesional"}
              </h1>

              <p>
                {isAuth
                  ? "Revisa perfiles publicados, actualiza tu informacion y vuelve a tu panel para gestionar tu portafolio."
                  : "Publica tus proyectos, habilidades, experiencia y conecta con empresas o profesionales interesados en tu talento."}
              </p>

            </div>
          </div>
        </section>

        <section id="explorar" className="landing-search-section">
          <div className="landing-search-card">
            <div className="landing-filter-menu">
              <button type="button" onClick={() => setOpenFilter(openFilter === "category" ? null : "category")}>
                <span>{selectedCategory || "Todas las areas"}</span>
                <ChevronIcon />
              </button>
              {openFilter === "category" ? (
                <div className="landing-filter-options">
                  <button type="button" className={!selectedCategory ? "active" : ""} onClick={() => { setSelectedCategory(""); closeFilterMenu(); }}>
                    Todas las areas
                  </button>
                  {profileCategories.map((category) => (
                    <button type="button" key={category} className={selectedCategory === category ? "active" : ""} onClick={() => { setSelectedCategory(category); closeFilterMenu(); }}>
                      {category}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <label className="landing-search-input">
              <span aria-hidden="true">
                <SearchIcon />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nombre, tecnologia o proyecto..."
              />
              {query ? (
                <button
                  type="button"
                  className="landing-search-clear"
                  onClick={() => setQuery("")}
                  aria-label="Limpiar busqueda"
                >
                  <CloseIcon />
                </button>
              ) : null}
            </label>

            <div className="landing-filter-menu">
              <button type="button" onClick={() => setOpenFilter(openFilter === "level" ? null : "level")}>
                <span>{selectedLevel || "Todos los niveles"}</span>
                <ChevronIcon />
              </button>
              {openFilter === "level" ? (
                <div className="landing-filter-options">
                  <button type="button" className={!selectedLevel ? "active" : ""} onClick={() => { setSelectedLevel(""); closeFilterMenu(); }}>
                    Todos los niveles
                  </button>
                  {skillLevels.map((level) => (
                    <button type="button" key={level} className={selectedLevel === level ? "active" : ""} onClick={() => { setSelectedLevel(level); closeFilterMenu(); }}>
                      {level}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className="landing-search-submit"
              onClick={() => {
                setAppliedQuery(query.trim());
                document.getElementById("perfiles")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Buscar
            </button>
          </div>

          <div className="landing-advanced-filter-shell">
            <button
              type="button"
              className={`landing-advanced-toggle${showAdvancedFilters ? " active" : ""}`}
              onClick={() => setShowAdvancedFilters((current) => !current)}
            >
              Filtros avanzados
              {hasActiveAdvancedFilters ? <span>{advancedActiveFilterCount}</span> : null}
            </button>

            {showAdvancedFilters ? (
              <div className="landing-advanced-panel">
                <div className="landing-advanced-field">
                  <span>Rol</span>
                  <div className="landing-filter-menu landing-advanced-menu">
                    <button
                      type="button"
                      onClick={() => setOpenAdvancedFilter(openAdvancedFilter === "role" ? null : "role")}
                    >
                      <span>{advancedFilters.role || "Todos los roles"}</span>
                      <ChevronIcon />
                    </button>
                    {openAdvancedFilter === "role" ? (
                      <div className="landing-filter-options landing-role-options">
                        <label className="landing-dropdown-search">
                          <SearchIcon />
                          <input
                            value={roleSearch}
                            onChange={(event) => setRoleSearch(event.target.value)}
                            placeholder="Buscar rol..."
                          />
                          {roleSearch ? (
                            <button type="button" onClick={() => setRoleSearch("")} aria-label="Limpiar rol">
                              <CloseIcon />
                            </button>
                          ) : null}
                        </label>
                        <button
                          type="button"
                          className={!advancedFilters.role ? "active" : ""}
                          onClick={() => {
                            updateAdvancedFilter("role", "");
                            setRoleSearch("");
                            closeAdvancedFilterMenu();
                          }}
                        >
                          Todos los roles
                        </button>
                        {searchedRoleOptions.length ? (
                          searchedRoleOptions.map((role) => (
                            <button
                              type="button"
                              key={role}
                              className={advancedFilters.role === role ? "active" : ""}
                              onClick={() => {
                                updateAdvancedFilter("role", role);
                                setRoleSearch("");
                                closeAdvancedFilterMenu();
                              }}
                            >
                              {role}
                            </button>
                          ))
                        ) : (
                          <p>No hay roles con ese texto.</p>
                        )}
                        {!roleSearch && roleOptions.length > searchedRoleOptions.length ? (
                          <small>Mostrando roles principales. Usa el buscador para encontrar otros.</small>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="landing-advanced-field">
                  <span>Tipo de experiencia</span>
                  <div className="landing-filter-menu landing-advanced-menu">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenAdvancedFilter(openAdvancedFilter === "experienceType" ? null : "experienceType")
                      }
                    >
                      <span>{experienceTypeLabels[advancedFilters.experienceType]}</span>
                      <ChevronIcon />
                    </button>
                    {openAdvancedFilter === "experienceType" ? (
                      <div className="landing-filter-options">
                        {experienceTypeOptions.map(([type, label]) => (
                          <button
                            type="button"
                            key={type}
                            className={advancedFilters.experienceType === type ? "active" : ""}
                            onClick={() => {
                              updateAdvancedFilter("experienceType", type);
                              closeAdvancedFilterMenu();
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="landing-advanced-range">
                  <label className="landing-advanced-field">
                    <span>Experiencia min.</span>
                    <input
                      type="number"
                      min="0"
                      value={advancedFilters.experienceMin}
                      onChange={(event) => updateAdvancedFilter("experienceMin", event.target.value)}
                      placeholder="0"
                    />
                  </label>
                  <label className="landing-advanced-field">
                    <span>Experiencia max.</span>
                    <input
                      type="number"
                      min="0"
                      value={advancedFilters.experienceMax}
                      onChange={(event) => updateAdvancedFilter("experienceMax", event.target.value)}
                      placeholder="10"
                    />
                  </label>
                </div>

                <div className="landing-advanced-field">
                  <span>Nivel por tecnologia</span>
                  <div className="landing-filter-menu landing-advanced-menu">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenAdvancedFilter(openAdvancedFilter === "technologyLevel" ? null : "technologyLevel")
                      }
                    >
                      <span>{advancedFilters.technologyLevel || "Cualquier nivel"}</span>
                      <ChevronIcon />
                    </button>
                    {openAdvancedFilter === "technologyLevel" ? (
                      <div className="landing-filter-options">
                        <button
                          type="button"
                          className={!advancedFilters.technologyLevel ? "active" : ""}
                          onClick={() => {
                            updateAdvancedFilter("technologyLevel", "");
                            closeAdvancedFilterMenu();
                          }}
                        >
                          Cualquier nivel
                        </button>
                        {skillLevels.map((level) => (
                          <button
                            type="button"
                            key={level}
                            className={advancedFilters.technologyLevel === level ? "active" : ""}
                            onClick={() => {
                              updateAdvancedFilter("technologyLevel", level);
                              closeAdvancedFilterMenu();
                            }}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="landing-advanced-tech-group" aria-label={technologySummary}>
                  <strong className="landing-technology-title">Tecnologias</strong>
                  <label className="landing-technology-search">
                    <SearchIcon />
                    <input
                      value={technologySearch}
                      onChange={(event) => setTechnologySearch(event.target.value)}
                      placeholder="Buscar tecnologia..."
                    />
                    {technologySearch ? (
                      <button type="button" onClick={() => setTechnologySearch("")} aria-label="Limpiar tecnologia">
                        <CloseIcon />
                      </button>
                    ) : null}
                  </label>

                  {selectedTechnologies.length ? (
                    <div className="landing-selected-tech-list" aria-label="Tecnologias seleccionadas">
                      {selectedTechnologies.map((technology) => (
                        <button type="button" key={technology} onClick={() => toggleTechnologyFilter(technology)}>
                          {technology}
                          <CloseIcon />
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <div className="landing-advanced-tech-list">
                    {searchedTechnologyOptions.length ? (
                      searchedTechnologyOptions.map((technology) => (
                        <button type="button" key={technology} onClick={() => toggleTechnologyFilter(technology)}>
                          {technology}
                          {!technologySearch && technologyUsage.get(technology) ? (
                            <span>{technologyUsage.get(technology)}</span>
                          ) : null}
                        </button>
                      ))
                    ) : (
                      <p>{technologyOptions.length ? "No hay tecnologias con ese texto." : "No hay tecnologias publicadas."}</p>
                    )}
                  </div>

                  {!technologySearch && technologyOptions.length > popularTechnologyOptions.length ? (
                    <small className="landing-technology-help">
                      Mostrando tecnologias populares. Usa el buscador para encontrar otras.
                    </small>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {activeFilterChips.length && !showAdvancedFilters ? (
            <div className="landing-active-filters" aria-label="Filtros activos">
              <div className="landing-active-filters-head">
                <strong>{activeFilterCount} filtros activos</strong>
                <button type="button" onClick={clearAllFilters}>
                  Limpiar todo
                </button>
              </div>
              <div className="landing-active-filter-list">
                {activeFilterChips.map((chip) => (
                  <button key={chip.key} type="button" className="landing-active-filter-chip" onClick={chip.onRemove}>
                    <span>{chip.label}</span>
                    <CloseIcon />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {hasActiveSearch && (
          <section className="landing-container landing-results-section">
            <div className="landing-results-head">
              <div>
                <h2>Resultados de busqueda</h2>
                <p>{searchResults.length ? `${searchResults.length} perfiles encontrados` : "No hay perfiles con esos filtros."}</p>
              </div>
              <button
                type="button"
                onClick={clearAllFilters}
              >
                Limpiar filtros
              </button>
            </div>

            {searchResults.length ? (
              <div className="landing-profile-grid">
                {searchResults.map((profile) => (
                  <ProfileCard
                    key={`result-${profile.id}`}
                    profile={profile}
                    category={selectedCategory || undefined}
                    onViewProfile={viewPublicProfile}
                  />
                ))}
              </div>
            ) : (
              <article className="landing-empty-card">
                <h3>No se encontraron perfiles</h3>
                <p>Prueba con otro nombre, tecnologia, area o nivel.</p>
              </article>
            )}
          </section>
        )}

        <section id="perfiles" className={`landing-container landing-featured-section ${isAuth ? "landing-featured-section-auth" : ""}`}>
          <div className="landing-section-head">
            <div>
              <h2>Talento disponible</h2>
              <p>Perfiles ordenados por experiencia, proyectos publicados y habilidades visibles.</p>
            </div>
            <span className="landing-featured-count">{featuredProfiles.length} perfiles</span>
          </div>

          <div className="landing-category-tabs" aria-label="Categorias profesionales">
            <button
              type="button"
              className={!selectedFeaturedCategory ? "active" : ""}
              onClick={() => setSelectedFeaturedCategory("")}
            >
              Todos
            </button>
            {profileCategories.map((category) => (
              <button
                type="button"
                key={category}
                className={selectedFeaturedCategory === category ? "active" : ""}
                onClick={() => setSelectedFeaturedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="landing-featured-directory">
            {visibleFeaturedGroups.length ? (
              <>
                <div className="landing-category-stack">
                  {visibleFeaturedGroups.map(({ category, profiles, hiddenCount, total }) => {
                    const isCollapsed = collapsedFeaturedCategories[category] ?? false;
                    const categoryId = getCategoryDomId(category);

                    return (
                      <section key={category} className="landing-category-group">
                        <div className="landing-category-head">
                          <div>
                            <h3>{category}</h3>
                            <span>{total} perfiles visibles</span>
                          </div>
                          <div className="landing-category-actions">
                            {hiddenCount > 0 ? <span>{hiddenCount} mas al expandir</span> : null}
                            <button
                              type="button"
                              className="landing-category-toggle"
                              onClick={() => toggleFeaturedCategory(category)}
                              aria-expanded={!isCollapsed}
                              aria-controls={categoryId}
                            >
                              <span>{isCollapsed ? "Mostrar" : "Ocultar"}</span>
                              <ChevronIcon className={`landing-category-chevron${isCollapsed ? "" : " is-expanded"}`} />
                            </button>
                          </div>
                        </div>

                        <div id={categoryId} className="landing-category-body" hidden={isCollapsed}>
                          <div className="landing-profile-grid">
                            {profiles.map((profile) => (
                              <ProfileCard
                                key={`featured-${category}-${profile.id}`}
                                profile={profile}
                                category={selectedFeaturedCategory || category}
                                ranking={featuredRankingByProfileId.get(profile.id)}
                                onViewProfile={viewPublicProfile}
                              />
                            ))}
                          </div>
                        </div>
                      </section>
                    );
                  })}
                </div>

                {featuredProfiles.length > FEATURED_PROFILE_LIMIT ? (
                  <div className="landing-directory-actions">
                    <button
                      type="button"
                      className="landing-show-all-profiles"
                      onClick={() => setShowAllFeaturedProfiles((current) => !current)}
                    >
                      {showAllFeaturedProfiles ? "Ver menos perfiles" : `Ver mas perfiles (${featuredProfiles.length - FEATURED_PROFILE_LIMIT})`}
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <article className="landing-empty-card">
                <h3>No se encontraron perfiles</h3>
                <p>Prueba con otro nombre, tecnologia o area profesional.</p>
              </article>
            )}
          </div>
        </section>

        {!isAuth && (
          <section className="landing-container landing-cta-section">
            <div className="landing-cta-card">
              <h2>Construye tu presencia profesional hoy</h2>
              <p>Empieza gratis y crea un portafolio que represente tu experiencia, habilidades y proyectos.</p>
              <Link to="/register">Crear cuenta gratis</Link>
            </div>
          </section>
        )}
      </main>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-grid">
          <div>
            <h2>SpherLink</h2>
            <p>Plataforma para crear y compartir portafolios digitales.</p>
          </div>
          <div>
            <h3>Producto</h3>
            <a href="#explorar">Explorar</a>
            <a href="#perfiles">Perfiles</a>
            <Link to={isAuth ? dashboardPath : "/register"}>{isAuth ? "Dashboard" : "Registrarse"}</Link>
          </div>
          <div>
            <h3>Cuenta</h3>
            <Link to="/login">Iniciar sesion</Link>
            <Link to={isAuth ? dashboardPath : "/perfil/editar"}>{isAuth ? "Mi panel" : "Mi perfil"}</Link>
          </div>
          <div>
            <h3>Legal</h3>
            <span>Privacidad</span>
            <span>Terminos</span>
          </div>
        </div>
        <p className="landing-copyright">(c) 2026 SpherLink. Todos los derechos reservados.</p>
      </footer>

      <button className="landing-top-button" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Volver arriba">
        ^
      </button>
    </div>
  );
}
