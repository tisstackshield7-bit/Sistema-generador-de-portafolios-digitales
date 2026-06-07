import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../api/auth";
import AlertMessage from "../../components/common/AlertMessage";
import FormInput from "../../components/common/FormInput";
import PrivateWorkspaceLayout from "../../components/dashboard/PrivateWorkspaceLayout";
import { getMyProfile } from "../../api/profile";
import { changePassword } from "../../api/password";
import { authStore } from "../../store/authStore";
import type { Perfil } from "../../types/profile";
import { getAuthenticatedHomePath } from "../../utils/authRedirect";
import { validatePassword, validateRequired } from "../../utils/validations";

type ApiErrorData = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

function getApiErrorData(error: unknown) {
  if (error instanceof AxiosError) {
    return error.response?.data as ApiErrorData | undefined;
  }

  return undefined;
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const currentUser = authStore.getUser();
  const requiereCambioObligatorio = !!currentUser?.debe_cambiar_contraseña;
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [contraseñaActual, setcontraseñaActual] = useState("");
  const [contraseñaNueva, setcontraseñaNueva] = useState("");
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
      contraseña_actual: validateRequired(contraseñaActual, "La contraseña actual es obligatoria."),
      contraseña_nueva: validatePassword(contraseñaNueva),
    };

    if (contraseñaNueva !== confirmacion) {
      nextErrors.confirmacion = "La confirmacion de la nueva contraseña no coincide.";
    }

    setErrors(nextErrors);
    setServerError("");
    setMessage("");

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setSaving(true);

    try {
      const data = await changePassword(contraseñaActual, contraseñaNueva, confirmacion);
      const storedUser = authStore.getUser();

      if (storedUser && data.usuario) {
        authStore.updateUser({
          ...storedUser,
          ...data.usuario,
        });
      }

      setMessage(data.message);
      setcontraseñaActual("");
      setcontraseñaNueva("");
      setConfirmacion("");
      setTimeout(() => navigate(getAuthenticatedHomePath(authStore.getUser())), 900);
    } catch (error: unknown) {
      const errorData = getApiErrorData(error);
      const apiErrors = errorData?.errors || {};
      const fieldErrors: Record<string, string> = {};

      Object.entries(apiErrors).forEach(([field, value]) => {
        fieldErrors[field] = Array.isArray(value) ? String(value[0]) : String(value);
      });

      setErrors((prev) => ({ ...prev, ...fieldErrors }));
      setServerError(errorData?.message || "No se pudo cambiar la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!requiereCambioObligatorio) {
      navigate(getAuthenticatedHomePath(currentUser));
      return;
    }

    try {
      await logoutUser();
    } catch {
      // Continue clearing the local session even if the server logout fails.
    } finally {
      authStore.clearSession();
      navigate("/login");
    }
  };

  return (
    <PrivateWorkspaceLayout
      active="profile"
      perfil={perfil}
      title="Cambiar contraseña"
      subtitle={
        requiereCambioObligatorio
          ? "Debes reemplazar la contraseña temporal por una definitiva para continuar."
          : "Actualiza tu acceso y reemplaza la contraseña temporal por una definitiva."
      }
    >
      <section className="surface-card workspace-section-card">
        <div className="workspace-section-head">
          <div>
            <p className="section-label">Seguridad</p>
            <h2>{requiereCambioObligatorio ? "Cambio obligatorio de contraseña" : "Define una nueva contraseña"}</h2>
          </div>
        </div>

        <AlertMessage message={message || serverError} />

        <form className="form-stack" onSubmit={handleSubmit}>
          <FormInput
            label="contraseña actual"
            type="password"
            value={contraseñaActual}
            onChange={setcontraseñaActual}
            error={errors.contraseña_actual}
            placeholder="Ingresa tu contraseña actual o temporal"
            togglePassword
          />

          <FormInput
            label="Nueva contraseña"
            type="password"
            value={contraseñaNueva}
            onChange={setcontraseñaNueva}
            error={errors.contraseña_nueva}
            placeholder="Define una contraseña segura"
            togglePassword
          />

          <FormInput
            label="Confirmar nueva contraseña"
            type="password"
            value={confirmacion}
            onChange={setConfirmacion}
            error={errors.confirmacion}
            placeholder="Repite la nueva contraseña"
            togglePassword
          />

          <div className="form-actions-row">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              {requiereCambioObligatorio ? "Cerrar sesion" : "Cancelar"}
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              Guardar contraseña
            </button>
          </div>
        </form>
      </section>
    </PrivateWorkspaceLayout>
  );
}
