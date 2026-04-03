import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authStore } from "../../store/authStore";

type Props = {
  children: ReactNode;
};

export default function PrivateRoute({ children }: Props) {
  const location = useLocation();

  if (!authStore.isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          message: "Debe iniciar sesión para acceder a esta sección.",
          from: location.pathname,
        }}
      />
    );
  }

  return <>{children}</>;
}