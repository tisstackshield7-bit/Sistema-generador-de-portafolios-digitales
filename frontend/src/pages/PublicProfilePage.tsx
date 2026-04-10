import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_ORIGIN } from "../api/axios";
import { getPublicProfiles } from "../api/profile";
import type { Perfil } from "../types/profile";

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

export default function PublicProfilePage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getPublicProfiles();
        const found = (data.perfiles || []).find((item: Perfil) => item.slug === slug) || null;
        setPerfil(found);
      } catch {
        setPerfil(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [slug]);

  const title = useMemo(() => perfil?.titular_profesional || perfil?.profesion || "Perfil profesional", [perfil]);

  if (loading) {
    return (
      <div className="profile-page-shell app-shell">
        <div className="page-section surface-card auth-card">
          <p className="section-copy">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="profile-page-shell app-shell">
        <div className="page-section public-profile-card">
          <h1>Perfil no encontrado</h1>
          <p className="section-copy">No encontramos informacion publica para este portafolio.</p>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-shell app-shell">
      <div className="page-section public-profile-layout">
        <Link to="/" className="section-link">
          Volver al inicio
        </Link>

        <section className="profile-cover surface-card">
          <div className="profile-cover-content">
            <div className="profile-identity">
              {perfil.foto_perfil ? (
                <img src={`${API_ORIGIN}/storage/${perfil.foto_perfil}`} alt={perfil.nombre_completo} className="profile-avatar-xl" />
              ) : (
                <div className="profile-avatar-xl fallback-avatar">{getInitials(perfil.nombre_completo)}</div>
              )}
              <div>
                <p className="section-label cover-label">Portafolio publico</p>
                <h1>{perfil.nombre_completo}</h1>
                <p className="cover-role">{title}</p>
                <p className="cover-location">La Paz, Bolivia</p>
              </div>
            </div>
          </div>
        </section>

        <div className="profile-page-grid">
          <section className="public-profile-card">
            <div className="profile-section">
              <p className="section-label">Resumen profesional</p>
              <p className="section-copy">{perfil.biografia || "Este usuario aun no agrego una biografia publica."}</p>
            </div>
          </section>

          <aside className="profile-side-column">
            <section className="profile-side-card">
              <p className="section-label">Informacion</p>
              <ul className="side-detail-list">
                <li>Profesion: {title}</li>
                <li>Ubicacion: La Paz, Bolivia</li>
                <li>Perfil publico disponible</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
