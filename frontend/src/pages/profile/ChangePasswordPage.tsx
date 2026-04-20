import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertMessage from "../../components/common/AlertMessage";
import FormInput from "../../components/common/FormInput";
import PrivateWorkspaceLayout from "../../components/dashboard/PrivateWorkspaceLayout";
import { getMyProfile } from "../../api/profile";
import { changePassword } from "../../api/password";
import { authStore } from "../../store/authStore";
import type { Perfil } from "../../types/profile";
import { validatePassword, validateRequired } from "../../utils/validations";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [contrasenaNueva, setContrasenaNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((data) => setPerfil(data.perfil || null))
      .catch(() => setPerfil(null));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {
      contrasena_actual: validateRequired(contrasenaActual, "La contrasena actual es obligatoria."),
      contrasena_nueva: validatePassword(contrasenaNueva),
    };

    if (contrasenaNueva !== confirmacion) {
      nextErrors.confirmacion = "La confirmacion de la nueva contrasena no coincide.";
    }

    setErrors(nextErrors);
    setServerError("");
    setMessage("");

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setSaving(true);

    try {
      const data = await changePassword(contrasenaActual, contrasenaNueva, confirmacion);
      const storedUser = authStore.getUser();

      if (storedUser && data.usuario) {
        authStore.updateUser({
          ...storedUser,
          ...data.usuario,
        });
      }

      setMessage(data.message);
      setContrasenaActual("");
      setContrasenaNueva("");
      setConfirmacion("");
      setTimeout(() => navigate("/"), 900);
    } catch (error: any) {
      const apiErrors = error?.response?.data?.errors || {};
      const fieldErrors: Record<string, string> = {};

      Object.entries(apiErrors).forEach(([field, value]) => {
        fieldErrors[field] = Array.isArray(value) ? String(value[0]) : String(value);
      });

      setErrors((prev) => ({ ...prev, ...fieldErrors }));
      setServerError(error?.response?.data?.message || "No se pudo cambiar la contrasena.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PrivateWorkspaceLayout
      active="profile"
      perfil={perfil}
      title="Cambiar contrasena"
      subtitle="Actualiza tu acceso y reemplaza la contrasena temporal por una definitiva."
    >
      <section className="surface-card workspace-section-card">
        <div className="workspace-section-head">
          <div>
            <p className="section-label">Seguridad</p>
            <h2>Define una nueva contrasena</h2>
          </div>
        </div>

        <AlertMessage message={message || serverError} />

        <form className="form-stack" onSubmit={handleSubmit}>
          <FormInput
            label="Contrasena actual"
            type="password"
            value={contrasenaActual}
            onChange={setContrasenaActual}
            error={errors.contrasena_actual}
            placeholder="Ingresa tu contrasena actual o temporal"
          />

          <FormInput
            label="Nueva contrasena"
            type="password"
            value={contrasenaNueva}
            onChange={setContrasenaNueva}
            error={errors.contrasena_nueva}
            placeholder="Define una contrasena segura"
          />

          <FormInput
            label="Confirmar nueva contrasena"
            type="password"
            value={confirmacion}
            onChange={setConfirmacion}
            error={errors.confirmacion}
            placeholder="Repite la nueva contrasena"
          />

          <div className="form-actions-row">
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/")}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              Guardar contrasena
            </button>
          </div>
        </form>
      </section>
    </PrivateWorkspaceLayout>
  );
}
