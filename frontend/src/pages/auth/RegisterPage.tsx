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

    setErrors({ correo: correoError, contrasena: contrasenaError });
    setServerError("");

    if (correoError || contrasenaError) return;

    try {
      const data = await registerUser({ correo, contrasena });
      authStore.setSession(data.token, data.usuario);
      navigate(data.redirect_to || "/perfil/crear");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Ocurrio un error al registrar.";
      setServerError(msg);
    }
  };

  return (
    <AuthLayout title="Crear cuenta" subtitle="Comienza tu presencia profesional con un registro rapido y claro.">
      <AlertMessage message={serverError} />

      <form onSubmit={handleSubmit} className="form-stack">
        <FormInput
          label="Correo electronico"
          value={correo}
          onChange={setCorreo}
          error={errors.correo}
          placeholder="tu-correo@ejemplo.com"
        />

        <FormInput
          label="Contrasena"
          type="password"
          value={contrasena}
          onChange={setContrasena}
          error={errors.contrasena}
          placeholder="Usa mayusculas, numeros y simbolos"
          togglePassword
        />

        <button type="submit" className="btn btn-primary btn-block">
          Continuar
        </button>
      </form>

      <div className="auth-links-row">
        <span className="meta-text">Ya tienes una cuenta?</span>
        <Link to="/login">Iniciar sesion</Link>
      </div>
    </AuthLayout>
  );
}

