import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import FormInput from "../../components/common/FormInput";
import AlertMessage from "../../components/common/AlertMessage";
import { validateEmail, validateRequired } from "../../utils/validations";
import { loginUser } from "../../api/auth";
import { authStore } from "../../store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errors, setErrors] = useState<{ correo?: string; contrasena?: string }>({});
  const [serverError, setServerError] = useState("");
  const redirectMessage = (location.state as any)?.message || "";
  const redirectTo = (location.state as any)?.from || "/perfil";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const correoError = validateEmail(correo);
    const contrasenaError = validateRequired(contrasena, "La contraseña es obligatoria.");

    setErrors({
      correo: correoError,
      contrasena: contrasenaError,
    });

    setServerError("");

    if (correoError || contrasenaError) return;

    try {
      const data = await loginUser({ correo, contrasena });
      authStore.setSession(data.token, data.usuario);
      navigate(redirectTo);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Credenciales incorrectas.";
      setServerError(msg);
    }
  };

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Accede a tu portafolio digital y gestiona tu información profesional"
    >
      <AlertMessage message={redirectMessage || serverError} />

      <form onSubmit={handleSubmit}>
        <FormInput
          label="Correo electrónico"
          value={correo}
          onChange={setCorreo}
          error={errors.correo}
          placeholder="Ingresa tu correo electrónico"
        />

        <FormInput
          label="Contraseña"
          type="password"
          value={contrasena}
          onChange={setContrasena}
          error={errors.contrasena}
          placeholder="Ingresa tu contraseña"
        />

        <div style={{ marginBottom: "16px" }}>
          <Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
        </div>

        <button type="submit" style={buttonPrimary}>
          Iniciar sesión
        </button>
      </form>

      <p style={{ marginTop: "16px" }}>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </AuthLayout>
  );
}

const buttonPrimary: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};
