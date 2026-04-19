import { createBrowserRouter } from "react-router-dom";
import RegisterPage from "../pages/auth/RegisterPage";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import BasicProfileCreatePage from "../pages/profile/BasicProfileCreatePage";
import BasicProfileEditPage from "../pages/profile/BasicProfileEditPage";
import ProfileViewPage from "../pages/profile/ProfileViewPage";
import SkillsPage from "../pages/profile/SkillsPage";
import PrivateRoute from "../components/auth/PrivateRoute";
import HomePage from "../pages/HomePage";
import ComingSoonPage from "../pages/ComingSoonPage";
import PublicProfilePage from "../pages/PublicProfilePage";

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
  {
    path: "/habilidades",
    element: (
      <PrivateRoute>
        <SkillsPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/en-proceso",
    element: <ComingSoonPage />,
  },
  {
    path: "/perfil-publico/:slug",
    element: <PublicProfilePage />,
  },
]);