import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "center",
        padding: "40px",
        gap: "40px",
        background: "#f8fafc",
      }}
    >
      <div>
        <h1 style={{ fontSize: "40px", marginBottom: "12px" }}>
          Portafolio Digital de Proyectos de Software
        </h1>
        <p style={{ color: "#475569", fontSize: "18px" }}>
          Impulsa tu carrera profesional y gestiona tu perfil digital.
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginBottom: "8px" }}>{title}</h2>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}