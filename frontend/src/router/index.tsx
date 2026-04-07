import { createBrowserRouter } from "react-router-dom";
import RegisterPage from "../pages/auth/RegisterPage";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import BasicProfileCreatePage from "../pages/profile/BasicProfileCreatePage";
import BasicProfileEditPage from "../pages/profile/BasicProfileEditPage";
import ProfileViewPage from "../pages/profile/ProfileViewPage";
import PrivateRoute from "../components/auth/PrivateRoute";
import HomePage from "../pages/HomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/recuperar-contrasena",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/restablecer-contrasena/:token",
    element: <ResetPasswordPage />,
  },
  {
    path: "/perfil/crear",
    element: (
      <PrivateRoute>
        <BasicProfileCreatePage />
      </PrivateRoute>
    ),
  },
  {
    path: "/perfil/editar",
    element: (
      <PrivateRoute>
        <BasicProfileEditPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/perfil",
    element: (
      <PrivateRoute>
        <ProfileViewPage />
      </PrivateRoute>
    ),
  },
]);
