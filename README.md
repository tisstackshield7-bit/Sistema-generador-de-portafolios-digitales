# 🎨 Sistema Generador de Portafolios Digitales

**Full-Stack Application** para crear, gestionar y publicar portafolios profesionales con un diseño moderno y responsivo.

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (React + Vite)  │  Backend (Laravel 11)  │  Database  │
│  ────────────────────────────────────────────────────────────── │
│  • React 18              │  • RESTful API         │  PostgreSQL │
│  • Vite                  │  • Sanctum Auth        │  10 Tables  │
│  • TailwindCSS           │  • Policies & Guards   │  +Seeders   │
│  • Zustand               │  • CORS Enabled        │             │
│  • React Router          │  • Model Relationships │             │
│  └───────────────────────┘  └────────────────────┘  └──────────┘
```

---

## ✨ Características Principales

### 📱 Frontend React
- ✅ Autenticación completa (Register/Login/Logout)
- ✅ Dashboard con estadísticas
- ✅ Gestión de perfil de usuario
- ✅ Interfaz responsiva (mobile-first)
- ✅ Tema oscuro personalizable
- ✅ Componentes reutilizables
- ✅ Gestión de estado con Zustand
- ✅ Interceptores de API con tokens

### 🚀 Backend Laravel API
- ✅ API RESTful completa
- ✅ Autenticación con Sanctum (Bearer tokens)
- ✅ 8 Modelos con relaciones complejas
- ✅ Políticas de autorización (ownership-based)
- ✅ CORS configurado para desarrollo
- ✅ Validaciones integradas
- ✅ Middleware de autenticación
- ✅ Rutas protegidas y públicas

### 💾 Base de Datos PostgreSQL
- ✅ 10 tablas normalizadas
- ✅ Relaciones One-to-Many y Many-to-Many
- ✅ Soft deletes en datos sensibles
- ✅ Índices optimizados
- ✅ Valores ENUM para constraints
- ✅ Seeders con datos de prueba
- ✅ Migraciones versionadas

---

## 📁 Estructura del Proyecto

```
Sistema-generador-de-portafolios-digitales/
│
├── 📂 frontend/                          # Application React + Vite
│   ├── src/
│   │   ├── pages/                        # Login, Register, Dashboard, Profile
│   │   ├── components/                   # Reusable (Button, Input, Card, etc)
│   │   ├── stores/                       # Zustand (authStore, portfolioStore)
│   │   ├── services/                     # API client with Axios
│   │   ├── utils/                        # Helpers & utilities
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── README.md
│
├── 📂 backend/                           # API Laravel 11
│   ├── app/
│   │   ├── Models/                       # User, Portfolio, Project, etc
│   │   ├── Http/Controllers/             # API endpoints
│   │   ├── Http/Requests/                # Form validation
│   │   └── Policies/                     # Authorization logic
│   ├── database/
│   │   ├── migrations/                   # 10 table schemas
│   │   └── seeders/                      # Test data generators
│   ├── routes/
│   │   └── api.php                       # RESTful API routes
│   ├── composer.json
│   ├── .env.example
│   ├── DATABASE_SCHEMA.md                # Schema documentation
│   └── README.md
│
├── README.md                             # Main documentation
├── DB_SETUP_GUIDE.md                     # Database setup instructions
└── SETUP.md                              # Complete setup guide
```

---

## 🎯 Fases de Desarrollo

### ✅ Fase 1: Backend Laravel API
- Models (8): User, Portfolio, Project, Experience, Skill, Education, SocialLink, Technology
- Controllers (8): Auth, User, Portfolio, Project, Experience, Skill, Education, SocialLink
- Policies (6): Ownership-based authorization
- Routes: 30+ endpoints RESTful
- **Status**: ✅ COMPLETADAS

### ✅ Fase 2: Frontend React + Vite
- Pages (4): Login, Register, Dashboard, Profile
- Components (7): ProtectedRoute, Navbar, Button, Input, Card, Toast, LoadingSpinner
- Stores (2): authStore, portfolioStore
- Services: Axios client with interceptors
- Styling: TailwindCSS + responsive design
- **Status**: ✅ COMPLETADAS

### ✅ Fase 3: Base de Datos PostgreSQL
- Migraciones (10): Tables, foreign keys, indexes
- Schema: Normalizadas 1NF/2NF/3NF
- Seeders (2): Technologies (20), Users (1 con datos relacionados)
- Documentation: Schema ER diagram, setup guide
- **Status**: ✅ COMPLETADAS

### ⏳ Fase 4: Rutas CRUD Adicionales (Próximas)
- Páginas para gestión de Proyectos
- Páginas para gestión de Habilidades
- Páginas para gestión de Educación
- Páginas para gestión de Experiencia

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- PHP 8.2+
- Composer
- PostgreSQL 12+

### 1. Clonar Repositorio
```bash
cd c:\Users\pc\Desktop\AlexHadoop\TIS_1_2026\proyecto\
git clone <repo-url>
cd Sistema-generador-de-portafolios-digitales
```

### 2. Configurar Backend
```bash
cd backend

# Instalar dependencias
composer install

# Configurar variables de entorno
copy .env.example .env

# Generar clave de aplicación
php artisan key:generate

# Crear base de datos y ejecutar migraciones
php artisan migrate --seed

# Iniciar servidor
php artisan serve           # http://localhost:8000
```

### 3. Configurar Frontend
```bash
cd ../frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev                 # http://localhost:5173
```

### 4. Probar Autenticación
```
Email:    juan@example.com
Password: password123
```

---

## 📚 Documentación Detallada

### Backend
- [Backend README →](./backend/README.md)
- [Database Schema →](./backend/DATABASE_SCHEMA.md)

### Frontend
- [Frontend README →](./frontend/README.md)

### Configuración General
- [Setup Guide →](./SETUP.md)
- [Database Setup →](./DB_SETUP_GUIDE.md)

---

## 🔗 Endpoints API

### Autenticación
```
POST   /api/auth/register         # Crear usuario
POST   /api/auth/login            # Iniciar sesión
POST   /api/auth/logout           # Cerrar sesión (protegido)
```

### Usuarios
```
GET    /api/user                  # Obtener perfil (protegido)
PUT    /api/user                  # Actualizar perfil (protegido)
```

### Portafolios
```
GET    /api/portfolios            # Listar portafolios públicos
GET    /api/user/portfolios       # Portafolios del usuario (protegido)
POST   /api/portfolios            # Crear portafolio (protegido)
GET    /api/portfolios/{id}       # Obtener portafolio
PUT    /api/portfolios/{id}       # Actualizar (protegido, ownership)
DELETE /api/portfolios/{id}       # Eliminar (protegido, ownership)
```

### Proyectos
```
GET    /api/projects              # Listar públicos
GET    /api/user/projects         # Proyectos del usuario (protegido)
POST   /api/projects              # Crear (protegido)
GET    /api/projects/{id}         # Obtener
PUT    /api/projects/{id}         # Actualizar (protegido)
DELETE /api/projects/{id}         # Eliminar (protegido)
```

**+ Experiencias, Habilidades, Educación, Enlaces Sociales** (estructura similar)

---

## 🗄️ Base de Datos

### Tablas (10)
- `users` - Usuarios del sistema
- `portfolios` - Portafolios profesionales
- `projects` - Proyectos en portafolios
- `technologies` - Tecnologías reutilizables
- `project_technologies` - Relación M:M (pivot)
- `experiences` - Historial laboral
- `skills` - Habilidades profesionales
- `education` - Educación y certificaciones
- `social_links` - Enlaces a redes sociales
- `personal_access_tokens` - Tokens Sanctum

### Características
✅ Foreign keys con cascade delete
✅ Soft deletes en datos sensibles
✅ Índices en columnas de búsqueda
✅ Valores ENUM para constraints
✅ Unique constraints (email, slug, etc)

---

## 🔐 Autenticación & Seguridad

### Flujo de Autenticación
```
1. Usuario se registra → Hash de contraseña (bcrypt)
2. Usuario inicia sesión → Generación de token Sanctum
3. Token se almacena en localStorage (frontend)
4. Cada request incluye: Authorization: Bearer {token}
5. Middleware verifica token en cada endpoint protegido
```

### Protecciones Implementadas
✅ **Hasheado de contraseñas**: bcrypt
✅ **CORS configurado**: Localhost:3000 y 5173
✅ **Bearer tokens**: Sanctum API authentication
✅ **Ownership policies**: Solo el usuario puede modificar sus datos
✅ **SQL Injection prevention**: Query builder parametrizado
✅ **CSRF**: Middleware incluido

---

## 📦 Dependencias Principales

### Frontend
```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.20.0",
  "zustand": "^4.4.1",
  "axios": "^1.6.2",
  "tailwindcss": "^3.4.1",
  "lucide-react": "^0.294.0",
  "date-fns": "^2.30.0"
}
```

### Backend
```
laravel/framework: ^11.0
laravel/sanctum: ^4.0
php: ^8.2
```

### Database
```
PostgreSQL: 12.0+
```

---

## 🐛 Troubleshooting

### Error de conexión a BD
```bash
# Verificar que PostgreSQL está corriendo
# Windows: Services → PostgreSQL
# Linux: sudo systemctl status postgresql

# Verificar .env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
```

### Error de token
```bash
# Regenerar clave de app
php artisan key:generate

# Limpiar cache
php artisan cache:clear
```

### Error CORS
```bash
# Verificar SANCTUM_STATEFUL_DOMAINS en .env
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:5173
```

---

## 📊 Estadísticas del Proyecto

| Componente | Cantidad | Estado |
|-----------|----------|--------|
| Backend Controllers | 8 | ✅ |
| Frontend Pages | 4 | ✅ |
| Components | 7 | ✅ |
| Database Tables | 10 | ✅ |
| API Endpoints | 30+ | ✅ |
| Seeders | 2 | ✅ |
| Lines of Code | 2500+ | ✅ |

---

## 🎓 Conceptos Implementados

### Backend
- **MVC Pattern**: Models, Controllers, Views (API response)
- **RESTful Architecture**: Proper HTTP methods and status codes
- **Authentication**: Bearer token via Sanctum
- **Authorization**: Policies with ownership verification
- **CORS**: Cross-Origin Resource Sharing
- **Validation**: Form requests
- **Soft Deletes**: Logical deletion

### Frontend
- **Component-based**: Reusable components
- **State Management**: Zustand stores
- **Routing**: React Router protected routes
- **API Integration**: Axios with interceptors
- **Form Handling**: Controlled components
- **Error Boundaries**: Try-catch patterns

### Database
- **Normalization**: 1NF, 2NF, 3NF
- **Relationships**: One-to-Many, Many-to-Many
- **Indexing**: Performance optimization
- **Constraints**: Referential integrity
- **Migrations**: Schema versioning

---

## 📝 Convenciones de Código

### Laravel
```php
// Routes: /api/{resource}/{action}
Route::apiResource('portfolios', PortfolioController::class);

// Models: Singular, CamelCase
class Portfolio extends Model

// Methods: camelCase, verb-based
public function storeProject()
```

### React
```jsx
// Components: PascalCase
export function DashboardPage()

// Hooks: use prefix
const { user, logout } = useAuthStore()

// Props: Explicit & typed
function Button({ label, onClick, variant })
```

### Database
```sql
-- Tables: Plural, snake_case
CREATE TABLE portfolios

-- Columns: snake_case
portfolio_id, is_published

-- Indexes: idx_{table}_{column}
CREATE INDEX idx_projects_user_id
```

---

## 🚀 Próximas Mejoras

- [ ] Upload de archivos (avatar, certificates)
- [ ] Búsqueda avanzada de portafolios
- [ ] Comentarios y valoraciones
- [ ] Notificaciones por email
- [ ] Exportar portafolio a PDF
- [ ] Repositorio público de portafolios
- [ ] Estadísticas de visitas
- [ ] Temas adicionales
- [ ] Multilanguage (i18n)
- [ ] Progressive Web App (PWA)

---

## 📞 Soporte

Para preguntas o problemas, consulta:
- [SETUP.md](./SETUP.md) - Guía de configuración completa
- [DB_SETUP_GUIDE.md](./DB_SETUP_GUIDE.md) - Configuración de base de datos
- [backend/README.md](./backend/README.md) - Documentación del backend
- [frontend/README.md](./frontend/README.md) - Documentación del frontend
- [backend/DATABASE_SCHEMA.md](./backend/DATABASE_SCHEMA.md) - Schema de BD

---

## 📄 Licencia

Este proyecto es código educativo. Libre de usar y modificar.

---

**Creado con ❤️ para aprender full-stack development**

## Estructura de Datos

### Usuario
- Perfil personal
- Múltiples portafolios
- Experiencias laborales
- Educación
- Habilidades
- Enlaces sociales

### Portafolio
- Información general
- Proyectos asociados
- Publicado/Borrador
- Personalización

### Proyecto
- Descripción
- Fecha inicio/fin
- URLs (sitio, GitHub)
- Tecnologías utilizadas
- Destacado o no

## Scripts Disponibles

### Backend
```bash
php artisan serve          # Inicia el servidor
php artisan migrate        # Ejecuta migraciones
php artisan tinker         # Consola interactiva
php artisan make:model ...  # Genera modelos
```

### Frontend
```bash
npm run dev                # Inicia servidor de desarrollo
npm run build              # Construye para producción
npm run preview            # Vista previa de producción
npm run lint               # Valida código
```

## Mejoras Futuras

- [ ] Carga de imágenes
- [ ] Exportar portafolio PDF
- [ ] Temas personalizables
- [ ] Analytics/Estadísticas
- [ ] Sistema de comentarios
- [ ] Reseñas de trabajos
- [ ] Integración con redes sociales
- [ ] Modo publicación de blog

## Estructura del Código

### Backend
- Controladores API por recurso
- Modelos Eloquent con relaciones
- Políticas de autorización
- Validaciones personalizadas

### Frontend
- Componentes funcionales con Hooks
- State management con Zustand
- Servicios para API
- Rutas protegidas

## Screenshots

[Aquí irían los screenshots de la aplicación]

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la licencia MIT - ver el archivo LICENSE para más detalles.

## Autor

**Stack Shield** - [tisstackshield7-bit](https://github.com/tisstackshield7-bit)

## Soporte

Para reportar bugs o sugerencias, abre un issue en GitHub.

---

**Versión:** 1.0.0  
**Última actualización:** Marzo 2026
