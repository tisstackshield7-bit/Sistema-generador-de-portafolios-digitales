import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import FormInput from "../../components/common/FormInput";
import AlertMessage from "../../components/common/AlertMessage";
import { validateEmail, validatePassword } from "../../utils/validations";
import { registerUser } from "../../api/auth";
import { authStore } from "../../store/authStore";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errors, setErrors] = useState<{ correo?: string; contrasena?: string }>({});
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const correoError = validateEmail(correo);
    const contrasenaError = validatePassword(contrasena);

    const nextErrors = {
      correo: correoError,
      contrasena: contrasenaError,
    };

    setErrors(nextErrors);
    setServerError("");

    if (correoError || contrasenaError) return;

    try {
      const data = await registerUser({ correo, contrasena });
      authStore.setSession(data.token, data.usuario);
      navigate(data.redirect_to || "/perfil/crear");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Ocurrió un error al registrar.";
      setServerError(msg);
    }
  };

  return (
    <AuthLayout
      title="Únete ¡Es gratis!"
      subtitle="Crea tu cuenta para comenzar tu portafolio profesional"
    >
      <AlertMessage message={serverError} />

      <form onSubmit={handleSubmit}>
        <FormInput
          label="Correo electrónico"
          value={correo}
          onChange={setCorreo}
          error={errors.correo}
          placeholder="Ej: usuario@correo.com"
        />

        <FormInput
          label="Contraseña"
          type="password"
          value={contrasena}
          onChange={setContrasena}
          error={errors.contrasena}
          placeholder="Ej: Admin123$"
        />

        <button type="submit" style={buttonPrimary}>
          Continuar con el registro
        </button>
      </form>

      <p style={{ marginTop: "16px" }}>
        ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
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
