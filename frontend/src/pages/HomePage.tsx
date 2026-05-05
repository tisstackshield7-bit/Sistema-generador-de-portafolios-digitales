import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../api/auth";
import { API_ORIGIN } from "../api/axios";
import { getMyProfile, getPublicProfiles } from "../api/profile";
import { authStore } from "../store/authStore";
import type { Perfil, PublicProfileCard } from "../types/profile";
import type { SkillLevel } from "../types/skill";
import type { ProfileSearchFilters } from "../utils/profileFilters";
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

const initialAdvancedFilters: Pick<
  ProfileSearchFilters,
  "role" | "experienceMin" | "experienceMax" | "technologies" | "technologyLevel"
> = {
  role: "",
  experienceMin: "",
  experienceMax: "",
  technologies: [],
  technologyLevel: "",
};

function getSkillLevelRank(level?: string | null) {
  return skillLevelOrder[normalizeText(level)] ?? 99;
}

function getProfileHighlights(profile: PublicProfileCard, category?: string) {
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
  return (profile.habilidades || []).reduce((total, skill) => total + (skill.evidencias?.length || 0), 0);
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

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
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

function ProfileCard({
  profile,
  category,
  onViewProfile,
}: {
  profile: PublicProfileCard;
  category?: string;
  onViewProfile: (slug: string) => void;
}) {
  const highlights = getProfileHighlights(profile, category);
  const phoneHref = profile.telefono ? `tel:${profile.telefono.replace(/\s+/g, "")}` : "";
  const projectCount = profile.proyectos?.length || 0;
  const hasDistinctProfessionalRole = Boolean(
    profile.titular_profesional && normalizeText(profile.titular_profesional) !== normalizeText(profile.profesion),
  );

  return (
    <article className="landing-profile-card">
      <div className="landing-profile-cover" />
      <div className="landing-profile-body">
        {profile.foto_perfil ? (
          <img
            src={`${API_ORIGIN}/storage/${profile.foto_perfil}`}
            alt={profile.nombre_completo}
            className="landing-profile-avatar"
          />
        ) : (
          <div className="landing-profile-avatar landing-profile-fallback">{getInitials(profile.nombre_completo)}</div>
        )}

        <h3>{profile.nombre_completo}</h3>
        {profile.profesion ? (
          <p className="landing-profile-profession">{profile.profesion}</p>
        ) : null}
        {hasDistinctProfessionalRole ? (
          <p className="landing-profile-role">{profile.titular_profesional}</p>
        ) : null}
        {profile.correo || profile.telefono ? (
          <div className="landing-profile-contact-row" aria-label="Datos de contacto">
            {profile.correo ? (
              <a className="landing-profile-contact-link" href={`mailto:${profile.correo}`}>
                {profile.correo}
              </a>
            ) : null}
            {profile.telefono ? (
              <a className="landing-profile-contact-link" href={phoneHref}>
                {profile.telefono}
              </a>
            ) : null}
          </div>
        ) : null}

        {highlights.length > 0 && (
          <div className="landing-tag-row">
            {highlights.map((skill) => (
              <span key={`${profile.id}-${skill.id}`} className={`landing-skill-chip ${getLandingSkillTone(skill.nivel_dominio)}`}>
                {skill.nombre} - {skill.nivel_dominio}
              </span>
            ))}
          </div>
        )}

        <div className="landing-profile-proof-row">
          <span>{projectCount} {projectCount === 1 ? "proyecto" : "proyectos"}</span>
        </div>

        <button type="button" onClick={() => onViewProfile(profile.slug)}>
          Ver perfil
        </button>
      </div>
    </article>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const isAuth = authStore.isAuthenticated();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [publicProfiles, setPublicProfiles] = useState<PublicProfileCard[]>([]);
  const [profileCategories, setProfileCategories] = useState<string[]>([]);
  const [publicRoles, setPublicRoles] = useState<string[]>([]);
  const [publicTechnologies, setPublicTechnologies] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFeaturedCategory, setSelectedFeaturedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | "">("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [openFilter, setOpenFilter] = useState<"category" | "level" | null>(null);
  const [openAdvancedFilter, setOpenAdvancedFilter] = useState<"role" | "technologyLevel" | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState(initialAdvancedFilters);
  const [showAllFeaturedProfiles, setShowAllFeaturedProfiles] = useState(false);

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
        experiencia_min: advancedFilters.experienceMin,
        experiencia_max: advancedFilters.experienceMax,
        tecnologias: advancedFilters.technologies,
        nivel_tecnologia: advancedFilters.technologyLevel,
      }, controller.signal)
        .then((data) => {
          setPublicProfiles(data.perfiles || []);
          setProfileCategories(data.categorias || []);
          setPublicRoles(data.roles || []);
          setPublicTechnologies(data.tecnologias || []);
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
  const welcomeName = useMemo(
    () => perfil?.nombres || perfil?.nombre_completo?.split(" ")[0] || user?.correo?.split("@")[0] || "Profesional",
    [perfil, user],
  );

  const filteredProfiles = useMemo(() => publicProfiles, [publicProfiles]);

  const hasActiveAdvancedFilters = Boolean(
    advancedFilters.role ||
      advancedFilters.experienceMin ||
      advancedFilters.experienceMax ||
      advancedFilters.technologies.length ||
      advancedFilters.technologyLevel,
  );
  const hasActiveSearch = Boolean(appliedQuery || selectedCategory || selectedLevel || hasActiveAdvancedFilters);

  const roleOptions = publicRoles;
  const technologyOptions = publicTechnologies;
  const searchResults = useMemo(
    () =>
      filteredProfiles
        .sort((left, right) => compareProfilesBySkillLevel(left, right, selectedCategory || undefined))
        .slice(0, 6),
    [filteredProfiles, selectedCategory],
  );

  const featuredProfiles = useMemo(
    () =>
      filteredProfiles
        .filter((profile) => getProfileHighlights(profile, selectedFeaturedCategory || undefined).length > 0)
        .sort((left, right) => compareFeaturedProfiles(left, right, selectedFeaturedCategory || undefined)),
    [filteredProfiles, selectedFeaturedCategory],
  );

  const visibleFeaturedProfiles = showAllFeaturedProfiles ? featuredProfiles : featuredProfiles.slice(0, 6);

  useEffect(() => {
    setShowAllFeaturedProfiles(false);
  }, [selectedFeaturedCategory, selectedLevel, appliedQuery]);

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
    setAppliedQuery("");
    setSelectedCategory("");
    setSelectedLevel("");
    setAdvancedFilters(initialAdvancedFilters);
  };

  return (
    <div className="home-landing-shell">
      <header className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <Link to="/" className="landing-brand">
            <span className="landing-brand-mark">P</span>
            <span>
              Porta<span>FolioPro</span>
            </span>
          </Link>

          <nav className="landing-links" aria-label="Navegacion principal">
            <a href="#inicio">Inicio</a>
            <a href="#explorar">Explorar</a>
          </nav>

          <div className="landing-actions">
            {isAuth ? (
              <>
                <Link to="/dashboard" className="landing-login-link">
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
              {hasActiveAdvancedFilters ? <span>{advancedFilters.technologies.length + (advancedFilters.role ? 1 : 0) + (advancedFilters.experienceMin || advancedFilters.experienceMax ? 1 : 0) + (advancedFilters.technologyLevel ? 1 : 0)}</span> : null}
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
                      <div className="landing-filter-options">
                        <button
                          type="button"
                          className={!advancedFilters.role ? "active" : ""}
                          onClick={() => {
                            updateAdvancedFilter("role", "");
                            closeAdvancedFilterMenu();
                          }}
                        >
                          Todos los roles
                        </button>
                        {roleOptions.map((role) => (
                          <button
                            type="button"
                            key={role}
                            className={advancedFilters.role === role ? "active" : ""}
                            onClick={() => {
                              updateAdvancedFilter("role", role);
                              closeAdvancedFilterMenu();
                            }}
                          >
                            {role}
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

                <div className="landing-advanced-tech-group">
                  <span>Tecnologias</span>
                  <div className="landing-advanced-tech-list">
                    {technologyOptions.length ? (
                      technologyOptions.map((technology) => (
                        <button
                          type="button"
                          key={technology}
                          className={advancedFilters.technologies.includes(technology) ? "active" : ""}
                          onClick={() => toggleTechnologyFilter(technology)}
                        >
                          {technology}
                        </button>
                      ))
                    ) : (
                      <p>No hay tecnologias publicadas.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
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
              <h2>Profesionales destacados</h2>
              <p>Perfiles con habilidades y proyectos publicados.</p>
            </div>
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
            {visibleFeaturedProfiles.length ? (
              <>
                <div className="landing-profile-grid">
                  {visibleFeaturedProfiles.map((profile) => (
                    <ProfileCard
                      key={`featured-${profile.id}`}
                      profile={profile}
                      category={selectedFeaturedCategory || undefined}
                      onViewProfile={viewPublicProfile}
                    />
                  ))}
                </div>

                {featuredProfiles.length > 6 ? (
                  <div className="landing-directory-actions">
                    <button
                      type="button"
                      className="landing-show-all-profiles"
                      onClick={() => setShowAllFeaturedProfiles((current) => !current)}
                    >
                      {showAllFeaturedProfiles ? "Ver menos perfiles" : `Ver mas perfiles (${featuredProfiles.length - 6})`}
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
            <h2>
              Porta<span>FolioPro</span>
            </h2>
            <p>Plataforma para crear y compartir portafolios digitales.</p>
          </div>
          <div>
            <h3>Producto</h3>
            <a href="#explorar">Explorar</a>
            <a href="#perfiles">Perfiles</a>
            <Link to={isAuth ? "/dashboard" : "/register"}>{isAuth ? "Dashboard" : "Registrarse"}</Link>
          </div>
          <div>
            <h3>Cuenta</h3>
            <Link to="/login">Iniciar sesion</Link>
            <Link to="/perfil/editar">Mi perfil</Link>
          </div>
          <div>
            <h3>Legal</h3>
            <span>Privacidad</span>
            <span>Terminos</span>
          </div>
        </div>
        <p className="landing-copyright">(c) 2026 PortaFolioPro. Todos los derechos reservados.</p>
      </footer>

      <button className="landing-top-button" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Volver arriba">
        ^
      </button>
    </div>
  );
}
