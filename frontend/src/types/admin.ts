export interface AdminUserSummary {
  id: number;
  correo: string;
  estado: string;
  rol: string;
  creado_en?: string | null;
  perfil: {
    id: number;
    nombre_completo: string;
    profesion?: string | null;
    titular_profesional?: string | null;
    biografia?: string | null;
    telefono?: string | null;
    ubicacion?: string | null;
    foto_perfil?: string | null;
    slug?: string | null;
    proyectos_count: number;
    habilidades_count: number;
    proyectos_visibles_count: number;
  } | null;
}

export interface AdminReportItem {
  id: number;
  categoria: string;
  tipo: string;
  descripcion: string;
  actor_nombre?: string | null;
  actor_correo?: string | null;
  actor_rol?: string | null;
  ip_usuario?: string | null;
  creado_en?: string | null;
}

export interface AdminDashboardResponse {
  resumen: {
    usuarios_totales: number;
    proyectos_totales: number;
    habilidades_totales: number;
    promedio_proyectos: number;
  };
  estadisticas: {
    proyectos_visibles: number;
    habilidades_tecnicas: number;
    habilidades_blandas: number;
    tasa_completitud: number;
  };
  usuarios_recientes: AdminUserSummary[];
  reportes_recientes: AdminReportItem[];
}

export interface AdminUsersResponse {
  usuario_destacado: AdminUserSummary | null;
  usuarios: AdminUserSummary[];
  actividad_reciente: AdminReportItem[];
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface AdminReportsResponse {
  resumen: {
    total_actividades: number;
    inicios_sesion: number;
    ediciones: number;
    busquedas: number;
  };
  reportes: PaginatedResponse<AdminReportItem>;
  filtros: {
    buscar: string;
    tipo: string;
  };
  tipos: string[];
}
