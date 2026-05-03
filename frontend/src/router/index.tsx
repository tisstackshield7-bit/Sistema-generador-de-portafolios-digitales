import { createBrowserRouter } from "react-router-dom";
import RegisterPage from "../pages/auth/RegisterPage";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import BasicProfileCreatePage from "../pages/profile/BasicProfileCreatePage";
import BasicProfileEditPage from "../pages/profile/BasicProfileEditPage";
import ChangePasswordPage from "../pages/profile/ChangePasswordPage";
import ProfileViewPage from "../pages/profile/ProfileViewPage";
import SkillsPage from "../pages/profile/SkillsPage";
import ProjectsPage from "../pages/profile/ProjectsPage";
import ExperiencePage from "../pages/profile/ExperiencePage";
import PrivateRoute from "../components/auth/PrivateRoute";
import HomePage from "../pages/HomePage";
import ComingSoonPage from "../pages/ComingSoonPage";
import PublicProfilePage from "../pages/PublicProfilePage";
import DashboardPage from "../pages/DashboardPage";

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
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardPage />
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
    path: "/perfil/cambiar-contrasena",
    element: (
      <PrivateRoute>
        <ChangePasswordPage />
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
    path: "/perfil/habilidades",
    element: (
      <PrivateRoute>
        <SkillsPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/perfil/proyectos",
    element: (
      <PrivateRoute>
        <ProjectsPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/perfil/experiencia",
    element: (
      <PrivateRoute>
        <ExperiencePage />
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
