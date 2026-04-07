import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile } from "../../api/profile";
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
      navigate("/login");
    }
  };

  if (!perfil) {
    return <p style={{ padding: "40px" }}>Cargando perfil...</p>;
  }

  return (
    <div style={{ padding: "40px", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        background: "#fff",
        borderRadius: "16px",
        padding: "32px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
          <h1>Mi perfil</h1>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => navigate("/perfil/editar")} style={buttonSecondary}>
              Editar perfil
            </button>
            <button onClick={handleLogout} style={buttonPrimary}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {perfil.foto_perfil ? (
          <img
            src={`http://127.0.0.1:8000/storage/${perfil.foto_perfil}`}
            alt="Perfil"
            style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "#dbeafe",
            color: "#1d4ed8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            fontWeight: 700
          }}>
            {getInitials(perfil.nombre_completo)}
          </div>
        )}

        <h2 style={{ marginTop: "20px" }}>{perfil.nombre_completo}</h2>
        <p style={{ color: "#475569", fontWeight: 600 }}>{perfil.profesion}</p>
        <p style={{ marginTop: "16px", lineHeight: 1.6 }}>{perfil.biografia}</p>
      </div>
    </div>
  );
}

const buttonPrimary: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const buttonSecondary: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#0f172a",
  fontWeight: 700,
  cursor: "pointer",
};
