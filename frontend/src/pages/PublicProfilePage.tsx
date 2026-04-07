import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_ORIGIN } from "../api/axios";
import { getPublicProfiles } from "../api/profile";
import type { Perfil } from "../types/profile";

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

  if (loading) {
    return <p style={{ padding: "40px" }}>Cargando perfil...</p>;
  }

  if (!perfil) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px" }}>
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            background: "#fff",
            borderRadius: "20px",
            padding: "32px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h1 style={{ marginTop: 0, color: "#0f172a" }}>Perfil no encontrado</h1>
          <p style={{ color: "#475569", marginBottom: "20px" }}>
            No se encontro informacion publica para este portafolio.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "12px 18px",
              borderRadius: "12px",
              border: "none",
              background: "#2563eb",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 24px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <Link to="/" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
          Volver al inicio
        </Link>

        <div
          style={{
            background: "#fff",
            borderRadius: "24px",
            padding: "36px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
            marginTop: "18px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "24px", alignItems: "center" }}>
            {perfil.foto_perfil ? (
              <img
                src={`${API_ORIGIN}/storage/${perfil.foto_perfil}`}
                alt={perfil.nombre_completo}
                style={{ width: "140px", height: "140px", borderRadius: "24px", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "140px",
                  height: "140px",
                  borderRadius: "24px",
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "40px",
                  fontWeight: 800,
                }}
              >
                {perfil.nombre_completo.slice(0, 1).toUpperCase()}
              </div>
            )}

            <div>
              <p
                style={{
                  margin: "0 0 8px",
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontSize: "12px",
                }}
              >
                Portafolio publico
              </p>
              <h1 style={{ margin: "0 0 10px", color: "#0f172a", fontSize: "40px" }}>{perfil.nombre_completo}</h1>
              <p style={{ margin: "0 0 16px", color: "#1e293b", fontSize: "18px", fontWeight: 700 }}>
                {perfil.titular_profesional || perfil.profesion}
              </p>
              <p style={{ margin: 0, color: "#475569", fontSize: "17px", lineHeight: 1.7 }}>
                {perfil.biografia || "Este usuario aun no agrego una biografia publica."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
