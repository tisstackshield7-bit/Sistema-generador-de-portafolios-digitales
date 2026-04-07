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
    const data = await getMyProfile();
    if (data.perfil) {
      setPerfil(data.perfil);
    } else {
      navigate("/perfil/crear", { replace: true });
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
    return <p style={{ padding: "40px" }}>Cargando perfil...</p>;
  }

  return (
    <div style={{ padding: "40px", background: "#f6f8fb", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "1150px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "22px",
          padding: "44px 48px 60px",
          boxShadow: "0 30px 70px rgba(15,23,42,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "32px",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "44px", color: "#0f172a" }}>Mi perfil</h1>
          <div style={{ display: "flex", gap: "16px" }}>
            <button onClick={() => navigate("/perfil/editar")} style={buttonSecondary}>
              Editar perfil
            </button>
            <button onClick={handleLogout} style={buttonPrimary}>
              Cerrar sesión
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "28px", alignItems: "center" }}>
          {perfil.foto_perfil ? (
            <img
              src={`${API_ORIGIN}/storage/${perfil.foto_perfil}`}
              alt="Perfil"
              style={avatarStyle}
            />
          ) : (
            <div
              style={{
                ...avatarStyle,
                background: "#e5edff",
                color: "#1d4ed8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "48px",
              }}
            >
              {getInitials(perfil.nombre_completo)}
            </div>
          )}

          <div>
            <h2 style={{ margin: "0 0 8px", fontSize: "32px", color: "#0f172a" }}>{perfil.nombre_completo}</h2>
            <p style={{ margin: "0 0 16px", color: "#1f2937", fontWeight: 700, fontSize: "18px" }}>
              {perfil.profesion}
            </p>
            <p style={{ margin: 0, color: "#475569", fontSize: "17px", lineHeight: 1.7 }}>{perfil.biografia}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const buttonPrimary: React.CSSProperties = {
  padding: "14px 20px",
  borderRadius: "14px",
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
  minWidth: "140px",
};

const buttonSecondary: React.CSSProperties = {
  padding: "14px 20px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#0f172a",
  fontWeight: 800,
  cursor: "pointer",
  minWidth: "140px",
};

const avatarStyle: React.CSSProperties = {
  width: "160px",
  height: "160px",
  borderRadius: "50%",
  objectFit: "cover",
  boxShadow: "0 12px 25px rgba(15,23,42,0.12)",
};
