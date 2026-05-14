import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import AlertMessage from "../../components/common/AlertMessage";
import { getMe } from "../../api/auth";
import { authStore } from "../../store/authStore";

export default function SocialAuthCallbackPage() {
  const navigate = useNavigate();
  const { provider = "social" } = useParams();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const completeSocialAuth = async () => {
      const token = searchParams.get("token");
      const redirectTo = searchParams.get("redirect_to") || "/dashboard";
      const message = searchParams.get("message") || `Inicio de sesion exitoso con ${provider}.`;

      if (!token) {
        setError(`No se pudo completar la autenticacion con ${provider}.`);
        return;
      }

      localStorage.setItem("token", token);

      try {
        const response = await getMe();
        authStore.setSession(token, response.usuario);
        navigate(redirectTo, { replace: true, state: { message } });
      } catch {
        authStore.clearSession();
        setError(`No se pudo recuperar la sesion de ${provider}.`);
      }
    };

    void completeSocialAuth();
  }, [navigate, provider, searchParams]);

  return (
    <div className="login-shell app-shell">
      <div className="page-section">
        <div className="auth-card" style={{ maxWidth: 520, margin: "0 auto" }}>
          <h2>Conectando con {provider}</h2>
          <p className="meta-text">Estamos completando tu inicio de sesion.</p>
          <AlertMessage message={error} />
        </div>
      </div>
    </div>
  );
}
