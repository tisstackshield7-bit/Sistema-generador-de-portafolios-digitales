import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { API_ORIGIN } from "../../api/axios";
import { getAdminUsers, updateAdminUserStatus } from "../../api/admin";
import AlertMessage from "../../components/common/AlertMessage";
import RichTextContent from "../../components/common/RichTextContent";
import AdminLayout from "../../components/admin/AdminLayout";
import type { AdminUserSummary, AdminUsersResponse } from "../../types/admin";

function getAvatarSrc(user: AdminUserSummary) {
  return user.perfil?.foto_perfil ? `${API_ORIGIN}/storage/${user.perfil.foto_perfil}` : "";
}

function getInitials(user: AdminUserSummary) {
  const source = user.perfil?.nombre_completo || user.correo;
  return source
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function normalizeText(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function filterUsers(users: AdminUserSummary[], query: string) {
  const normalizedQuery = normalizeText(query).trim();

  if (!normalizedQuery) {
    return users;
  }

  return users.filter((user) => {
    const profile = user.perfil;
    const haystack = [
      user.correo,
      profile?.nombre_completo,
      profile?.profesion,
      profile?.titular_profesional,
      profile?.biografia,
      profile?.telefono,
      profile?.ubicacion,
    ]
      .filter(Boolean)
      .map((item) => normalizeText(item))
      .join(" ");

    return haystack.includes(normalizedQuery);
  });
}

export default function AdminUsersPage() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<AdminUsersResponse | null>(null);
  const [query, setQuery] = useState("");
  const [highlightedUserId, setHighlightedUserId] = useState<number | null>(null);
  const [savingUserId, setSavingUserId] = useState<number | null>(null);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const selectedUserId = Number(searchParams.get("usuario_id") || 0) || undefined;

    getAdminUsers(selectedUserId)
      .then((response) => {
        setData(response);
        if (selectedUserId) {
          setHighlightedUserId(selectedUserId);
          window.setTimeout(() => {
            document.getElementById(`admin-user-card-${selectedUserId}`)?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, 80);
        }
      })
      .catch(() => {
        setData(null);
        setServerError("No se pudieron cargar los usuarios.");
      });
  }, [searchParams]);

  const filteredUsers = useMemo(() => filterUsers(data?.usuarios || [], query), [data?.usuarios, query]);

  const focusUserCard = (userId: number) => {
    setHighlightedUserId(userId);
    document.getElementById(`admin-user-card-${userId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const handleToggleStatus = async (user: AdminUserSummary) => {
    const nextStatus = user.estado === "activo" ? "bloqueado" : "activo";
    setSavingUserId(user.id);
    setServerError("");

    try {
      const response = await updateAdminUserStatus(user.id, nextStatus);

      setData((current) => {
        if (!current || !response.usuario) return current;

        return {
          ...current,
          usuario_destacado: current.usuario_destacado?.id === user.id ? response.usuario : current.usuario_destacado,
          usuarios: current.usuarios.map((item) => (item.id === user.id ? response.usuario as AdminUserSummary : item)),
        };
      });
    } catch {
      setServerError("No se pudo actualizar el estado del usuario.");
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <AdminLayout active="users" title="Gestion de Usuarios" subtitle="Administra los usuarios del sistema">
      <AlertMessage message={serverError} />

      <section className="surface-card admin-user-directory-card">
        <div className="admin-panel-head admin-user-directory-head">
          <div>
            <h3>Usuarios Registrados</h3>
            <p>{filteredUsers.length} usuarios en el sistema</p>
          </div>

          <label className="admin-search-field">
            <span aria-hidden="true">
              <svg viewBox="0 0 20 20">
                <path
                  d="M8.8 14.4a5.6 5.6 0 1 1 0-11.2 5.6 5.6 0 0 1 0 11.2Zm4.1-1.5 3.9 3.9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar usuarios..."
            />
          </label>
        </div>

        <div className="admin-user-directory-list">
          {filteredUsers.map((user) => (
            <article
              key={user.id}
              id={`admin-user-card-${user.id}`}
              className={`admin-directory-user-card${highlightedUserId === user.id ? " is-highlighted" : ""}`}
            >
              <div className="admin-directory-user-main">
                {user.perfil?.foto_perfil ? (
                  <img src={getAvatarSrc(user)} alt={user.perfil.nombre_completo} className="admin-directory-avatar" />
                ) : (
                  <div className="admin-directory-avatar fallback">{getInitials(user)}</div>
                )}

                <div className="admin-directory-copy">
                  <div className="admin-directory-title-row">
                    <div>
                      <h3>{user.perfil?.nombre_completo || user.correo}</h3>
                      <p>{user.perfil?.titular_profesional || user.perfil?.profesion || "Perfil sin completar"}</p>
                    </div>
                    <div className="admin-directory-actions">
                      <span className={`admin-status-badge ${user.estado}`}>{user.estado}</span>
                      <button
                        type="button"
                        className={`btn ${user.estado === "activo" ? "btn-secondary" : "btn-primary"} admin-directory-link`}
                        onClick={() => handleToggleStatus(user)}
                        disabled={savingUserId === user.id}
                      >
                        {user.estado === "activo" ? "Bloquear" : "Reactivar"}
                      </button>
                      {user.estado === "activo" && user.perfil?.slug ? (
                        <Link to={`/perfil-publico/${user.perfil.slug}`} className="btn btn-secondary admin-directory-link">
                          Ver Portafolio
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  {user.perfil?.biografia ? (
                    <RichTextContent value={user.perfil.biografia} className="admin-directory-bio" />
                  ) : (
                    <p className="admin-directory-bio">Este usuario aun no completo su descripcion profesional.</p>
                  )}

                  <div className="admin-directory-meta">
                    <span>{user.correo}</span>
                    {user.perfil?.telefono ? <span>{user.perfil.telefono}</span> : null}
                    {user.perfil?.ubicacion ? <span>{user.perfil.ubicacion}</span> : null}
                  </div>

                  <div className="admin-directory-pills">
                    <span>{user.perfil?.proyectos_count || 0} Proyectos</span>
                    <span>{user.perfil?.habilidades_count || 0} Habilidades</span>
                    <span>{user.perfil?.proyectos_visibles_count || 0} Visibles</span>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {!filteredUsers.length ? <p className="meta-text">No hay usuarios que coincidan con la busqueda.</p> : null}
        </div>
      </section>

      <section className="surface-card admin-panel-card">
        <div className="admin-panel-head">
          <div>
            <h3>Resumen de Usuarios</h3>
            <p>Vista rapida de estadisticas por usuario</p>
          </div>
        </div>

        <div className="admin-users-table-wrap">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Profesion</th>
                <th>Proyectos</th>
                <th>Habilidades</th>
                <th>Visibles</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.perfil?.nombre_completo || user.correo}</td>
                  <td>{user.perfil?.titular_profesional || user.perfil?.profesion || "Sin perfil"}</td>
                  <td>{user.perfil?.proyectos_count || 0}</td>
                  <td>{user.perfil?.habilidades_count || 0}</td>
                  <td>{user.perfil?.proyectos_visibles_count || 0}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-table-eye"
                      onClick={() => focusUserCard(user.id)}
                      aria-label={`Ver usuario ${user.perfil?.nombre_completo || user.correo}`}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M1.5 12s3.8-6.5 10.5-6.5S22.5 12 22.5 12 18.7 18.5 12 18.5 1.5 12 1.5 12Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="12" r="3.1" fill="none" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}
