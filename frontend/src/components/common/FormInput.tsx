import { useState } from "react";

type Props = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  pattern?: string;
  title?: string;
  inputMode?: "text" | "search" | "none" | "tel" | "url" | "email" | "numeric" | "decimal";
  togglePassword?: boolean;
};

export default function FormInput({
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  pattern,
  title,
  inputMode,
  togglePassword = false,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const finalType =
    type === "password" && togglePassword
      ? showPassword
        ? "text"
        : "password"
      : type;

  return (
    <div className="form-field">
      <label className="form-label">{label}</label>

      <div style={{ position: "relative" }}>
        <input
          className={`form-input${error ? " error" : ""}${type === "password" && togglePassword ? " has-toggle" : ""}`}
          type={finalType}
          value={value}
          placeholder={placeholder}
          pattern={pattern}
          title={title}
          inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)}
        />

        {type === "password" && togglePassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              color: "#64748b",
            }}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12c.74-2.1 2-3.93 3.6-5.32" />
                <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.05 11.05 0 0 1-4.17 5.94" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <path d="M1 1l22 22" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        ) : null}
      </div>

      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}