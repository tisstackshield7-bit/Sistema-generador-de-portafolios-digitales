import { useNavigate } from "react-router-dom";

export default function ComingSoonPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "640px",
          textAlign: "center",
        }}
      >
        <p style={{ margin: "0 0 12px", color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          PortaFolioPro
        </p>
        <h1 style={{ margin: "0 0 16px", fontSize: "44px", color: "#0f172a" }}>P&aacute;gina en proceso</h1>
        <p style={{ margin: "0 0 28px", color: "#475569", fontSize: "18px", lineHeight: 1.6 }}>
          Esta secci&oacute;n todav&iacute;a est&aacute; en construcci&oacute;n.
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "14px 24px",
            borderRadius: "12px",
            border: "none",
            background: "#2563eb",
            color: "#ffffff",
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
