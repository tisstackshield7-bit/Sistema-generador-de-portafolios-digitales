import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authStore } from "../../store/authStore";
import { getAuthenticatedHomePath } from "../../utils/authRedirect";

type Props = {
  children: ReactNode;
};

const REDIRECT_MESSAGE = "Debe iniciar sesion para acceder a esta seccion.";

export default function PrivateRoute({ children }: Props) {
  const location = useLocation();
  const user = authStore.getUser();

  if (!authStore.isAuthenticated()) {
    authStore.setRedirectNotice(REDIRECT_MESSAGE, location.pathname);

    return (
      <Navigate
        to="/login"
        replace
        state={{
          message: REDIRECT_MESSAGE,
          from: location.pathname,
        }}
      />
    );
  }

  if (user?.debe_cambiar_contraseña && location.pathname !== "/perfil/cambiar-contraseña") {
    return <Navigate to="/perfil/cambiar-contraseña" replace />;
  }

  if (user?.rol === "admin") {
    return <Navigate to={getAuthenticatedHomePath(user)} replace />;
  }

  return <>{children}</>;
}
