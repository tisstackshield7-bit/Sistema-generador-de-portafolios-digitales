import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile } from "../../api/profile";
import { API_ORIGIN } from "../../api/axios";
import type { Perfil } from "../../types/profile";
import { getInitials } from "../../utils/avatar";
import { logoutUser } from "../../api/auth";
import { authStore } from "../../store/authStore";

export default function ProfileViewPage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const data = await getMyProfile();
      if (data.perfil) {
        setPerfil(data.perfil);
      } else {
        navigate("/perfil/crear", { replace: true });
      }
    } catch {
      setPerfil(null);
    }
  }, [navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
    } finally {
      authStore.clearSession();
      navigate("/");
    }
  };

  if (!perfil) {
    return (
      <div className="profile-page-shell app-shell">
        <div className="page-section surface-card auth-card">
          <p className="section-copy">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-shell app-shell">
      <div className="page-section profile-page-grid">
        <section className="profile-main-area">
          <header className="profile-cover surface-card">
            <div className="profile-cover-content">
              <div className="profile-identity">
                {perfil.foto_perfil ? (
                  <img src={`${API_ORIGIN}/storage/${perfil.foto_perfil}`} alt={perfil.nombre_completo} className="profile-avatar-xl" />
                ) : (
                  <div className="profile-avatar-xl fallback-avatar">{getInitials(perfil.nombre_completo)}</div>
                )}
                <div className="profile-identity-content">
                  <p className="section-label cover-label">Mi perfil</p>
                  <h1>{perfil.nombre_completo}</h1>
                  <p className="cover-role">{perfil.profesion}</p>
                  <p className="cover-location">La Paz, Bolivia</p>
                  <div className="profile-cover-actions">
                    <button className="btn btn-secondary" onClick={() => navigate("/")}>
                      Ir al inicio
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate("/perfil/editar")}>
                      Editar perfil
                    </button>
                    <button className="btn btn-tertiary cover-tertiary" onClick={handleLogout}>
                      Cerrar sesion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="profile-main-card">
              <div className="profile-section">
              <div className="section-head">
                <div>
                  <p className="section-label">Resumen profesional</p>
                  <h2>Presentacion principal</h2>
                </div>
              </div>
              <p className="section-copy">{perfil.biografia || "Agrega un resumen para reforzar tu perfil profesional."}</p>
            </div>
          </section>
        </section>

        <aside className="profile-side-column">
          <section className="profile-side-card">
            <p className="section-label">Informacion</p>
            <ul className="side-detail-list">
              <li>Profesion: {perfil.profesion}</li>
              <li>Correo: {perfil.correo || "No registrado"}</li>
              <li>Celular: {perfil.telefono || "No registrado"}</li>
              <li>Ubicacion: La Paz, Bolivia</li>
              <li>Estado: Perfil activo</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
