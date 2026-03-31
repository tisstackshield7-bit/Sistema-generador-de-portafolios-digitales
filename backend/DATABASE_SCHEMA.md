# Documentación de Base de Datos - PostgreSQL

## 📊 Diagrama Entidad-Relación (ER)

```
┌─────────────────────────────────────────────────────────────────┐
│                        BASE DE DATOS                            │
│                  Sistema Generador de Portafolios               │
└─────────────────────────────────────────────────────────────────┘

                              users
                         ┌──────────────┐
                         │ - id (PK)    │
                         │ - name       │◄────┐
                         │ - email      │     │
                         │ - password   │     │ has many
                         │ - bio        │     │
                         │ - phone      │     │
                         │ - website    │     │
                         │ - location   │     │
                         │ - avatar     │     │
                         │ - created_at │     │
                         └──────────────┘     │
                                 │            │
                    ┌────────────┼────────────┼────────────┬──────────────┐
                    │            │            │            │              │
            ┌───────▼────────┐  │  ┌──────────▼──────┐  ┌──▼──────────┐  │
            │  portfolios    │  │  │  experiences    │  │   skills    │  │
            │                │  │  │                 │  │             │  │
            │ - id           │  │  │ - id            │  │ - id        │  │
            │ - user_id (FK) │  │  │ - user_id (FK)  │  │ - user_id   │  │
            │ - slug         │  │  │ - job_title     │  │ - name      │  │
            │ - theme        │  │  │ - company       │  │ - category  │  │
            │ - published    │  │  │ - start_date    │  │ - level     │  │
            │ - created_at   │  │  │ - end_date      │  │ - order     │  │
            └────┬───────────┘  │  │ - is_current    │  └─────────────┘  │
                 │              │  └─────────────────┘                    │
                 │              │                                        │
            ┌────▼──────────┐   │           ┌───────────────────┐       │
            │  projects     │   │           │    education      │       │
            │               │   │           │                   │       │
            │ - id          │   │           │ - id              │       │
            │ - user_id(FK) │   │           │ - user_id (FK)    │       │
            │ - portfolio...│◄──┘           │ - institution     │◄──────┘
            │ - title       │               │ - degree          │
            │ - featured    │               │ - field_study     │
            │ - order       │               │ - start_date      │
            └────┬──────────┘               │ - end_date        │
                 │                         └───────────────────┘
            ┌────▼───────────────────────────────────────────┐
            │  project_technologies (PIVOT)                 │
            │                                               │
            │ - project_id (FK)                            │
            │ - technology_id (FK)                         │
            │ - UNIQUE(project_id, technology_id)          │
            └────┬────────────────────────┬────────────────┘
                 │                        │
            ┌────▼──────────┐    ┌────────▼──────────┐
            │  technologies │    │  social_links     │
            │               │    │                   │
            │ - id          │    │ - id              │
            │ - name        │    │ - user_id (FK)    │
            │ - slug        │    │ - platform (enum) │
            │ - color       │    │ - url             │
            │ - icon_url    │    │ - display_label   │
            └───────────────┘    └───────────────────┘

            personal_access_tokens (Sanctum Auth)
            ├─ id
            ├─ tokenable_id (FK → users)
            ├─ tokenable_type
            ├─ name
            ├─ token
            ├─ abilities
            └─ last_used_at
```

---

## 📋 Descripción de Tablas

### 🔐 `users` - Usuarios del Sistema
| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identificador único | PK, Auto-increment |
| `name` | VARCHAR(255) | Nombre completo del usuario | Requerido |
| `email` | VARCHAR(255) | Correo electrónico | Unique, Requerido |
| `password` | VARCHAR(255) | Contraseña hasheada | Requerido, Hasheada |
| `professional_title` | VARCHAR(255) | Título profesional | Opcional |
| `bio` | TEXT | Biografía profesional | Opcional |
| `location` | VARCHAR(255) | Ubicación geográfica | Opcional |
| `phone` | VARCHAR(20) | Teléfono de contacto | Opcional |
| `website` | VARCHAR(255) | Sitio web personal | Opcional |
| `avatar` | VARCHAR(255) | URL del avatar | Opcional |
| `is_active` | BOOLEAN | Estado del usuario | Default: true |
| `email_verified_at` | TIMESTAMP | Verificación de email | Nullable |
| `created_at` | TIMESTAMP | Fecha de creación | Auto |
| `updated_at` | TIMESTAMP | Fecha de actualización | Auto |

**Índices:**
- PRIMARY KEY: `id`
- UNIQUE: `email`
- INDEX: `is_active`

---

### 💼 `portfolios` - Portafolios de Usuarios
| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identificador único | PK |
| `user_id` | BIGINT | ID del usuario dueño | FK → users, Cascade |
| `title` | VARCHAR(255) | Título del portafolio | Requerido |
| `slug` | VARCHAR(255) | URL-friendly name | Unique con user_id |
| `description` | TEXT | Descripción del portafolio | Opcional |
| `is_published` | BOOLEAN | Estado de publicación | Default: false |
| `theme` | VARCHAR(50) | Tema del portafolio | Default: 'dark' (dark/light) |
| `custom_domain` | VARCHAR(255) | Dominio personalizado | Unique, Nullable |
| `meta_description` | VARCHAR(160) | Meta description SEO | Opcional |
| `deleted_at` | TIMESTAMP | Borrado lógico | Soft delete |
| `created_at` | TIMESTAMP | Fecha de creación | Auto |
| `updated_at` | TIMESTAMP | Fecha de actualización | Auto |

**Índices:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id`
- UNIQUE: `custom_domain`
- INDEX: `is_published`, `created_at`

---

### 💻 `projects` - Proyectos en Portafolios
| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identificador único | PK |
| `user_id` | BIGINT | ID del usuario | FK → users, Cascade |
| `portfolio_id` | BIGINT | ID del portafolio | FK → portfolios, Cascade |
| `title` | VARCHAR(255) | Título del proyecto | Requerido |
| `slug` | VARCHAR(255) | URL-friendly name | Opcional |
| `description` | TEXT | Descripción completa | Requerido |
| `project_url` | VARCHAR(255) | URL del proyecto en vivo | Opcional |
| `github_url` | VARCHAR(255) | URL del repositorio | Opcional |
| `start_date` | DATE | Fecha de inicio | Requerido |
| `end_date` | DATE | Fecha de finalización | Nullable (actual) |
| `featured` | BOOLEAN | Destacado en portafolio | Default: false |
| `order` | INT | Orden de visualización | Default: 0 |
| `deleted_at` | TIMESTAMP | Borrado lógico | Soft delete |
| `created_at` | TIMESTAMP | Fecha de creación | Auto |
| `updated_at` | TIMESTAMP | Fecha de actualización | Auto |

**Índices:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id`, `portfolio_id`
- INDEX: `featured`, `order`, `created_at`

---

### 🛠️ `technologies` - Tecnologías Disponibles
| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identificador único | PK |
| `name` | VARCHAR(100) | Nombre de la tecnología | Requerido |
| `slug` | VARCHAR(100) | URL-friendly name | Unique |
| `color` | VARCHAR(7) | Color hexadecimal | Nullable (ej: #FF5733) |
| `icon_url` | VARCHAR(255) | URL del icono | Nullable |
| `created_at` | TIMESTAMP | Fecha de creación | Auto |
| `updated_at` | TIMESTAMP | Fecha de actualización | Auto |

**Índices:**
- PRIMARY KEY: `id`
- UNIQUE: `slug`

**Datos Incluidos (20 tecnologías):**
- Backend: PHP, Laravel, Python
- Frontend: React, Vue.js, Angular, JavaScript, TypeScript, TailwindCSS, Bootstrap
- Databases: MySQL, PostgreSQL, MongoDB
- DevOps: Docker, AWS, Linux
- Tools: Git, REST API, GraphQL, Webpack

---

### 🔗 `project_technologies` - Relación Many-to-Many
| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|-------------|
| `project_id` | BIGINT | ID del proyecto | FK → projects, Cascade |
| `technology_id` | BIGINT | ID de la tecnología | FK → technologies |
| `created_at` | TIMESTAMP | Fecha de asociación | Auto |

**Índices:**
- PRIMARY KEY: `(project_id, technology_id)`
- FOREIGN KEYS: `project_id`, `technology_id`

---

### 💼 `experiences` - Experiencia Laboral
| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identificador único | PK |
| `user_id` | BIGINT | ID del usuario | FK → users, Cascade |
| `job_title` | VARCHAR(255) | Título del puesto | Requerido |
| `company` | VARCHAR(255) | Nombre de la empresa | Requerido |
| `location` | VARCHAR(255) | Ubicación de trabajo | Opcional |
| `start_date` | DATE | Fecha de inicio | Requerido |
| `end_date` | DATE | Fecha de finalización | Nullable |
| `is_current` | BOOLEAN | ¿Trabajo actual? | Default: false |
| `description` | TEXT | Descripción de funciones | Opcional |
| `deleted_at` | TIMESTAMP | Borrado lógico | Soft delete |
| `created_at` | TIMESTAMP | Fecha de creación | Auto |
| `updated_at` | TIMESTAMP | Fecha de actualización | Auto |

**Índices:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id`
- INDEX: `is_current`, `start_date`

---

### 🎓 `education` - Educación y Certificaciones
| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identificador único | PK |
| `user_id` | BIGINT | ID del usuario | FK → users, Cascade |
| `institution` | VARCHAR(255) | Nombre de institución | Requerido |
| `degree` | VARCHAR(100) | Tipo de grado | Requerido (Licenciatura/Máster/Certificación) |
| `field_of_study` | VARCHAR(255) | Campo de estudio | Requerido |
| `start_date` | DATE | Fecha de inicio | Requerido |
| `end_date` | DATE | Fecha de finalización | Nullable |
| `description` | TEXT | Descripción adicional | Opcional |
| `certificate_url` | VARCHAR(255) | URL del certificado | Opcional |
| `logo_url` | VARCHAR(255) | URL del logo institución | Opcional |
| `is_current` | BOOLEAN | ¿Cursando actualmente? | Default: false |
| `deleted_at` | TIMESTAMP | Borrado lógico | Soft delete |
| `created_at` | TIMESTAMP | Fecha de creación | Auto |
| `updated_at` | TIMESTAMP | Fecha de actualización | Auto |

**Índices:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id`
- INDEX: `is_current`, `start_date`

---

### 🎯 `skills` - Habilidades Profesionales
| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identificador único | PK |
| `user_id` | BIGINT | ID del usuario | FK → users, Cascade |
| `name` | VARCHAR(100) | Nombre de habilidad | Requerido |
| `category` | VARCHAR(100) | Categoría (Backend/Frontend/DevOps) | Requerido |
| `proficiency_level` | ENUM | Nivel de dominio | beginner/intermediate/advanced/expert |
| `order` | INT | Orden de visualización | Default: 0 |
| `created_at` | TIMESTAMP | Fecha de creación | Auto |
| `updated_at` | TIMESTAMP | Fecha de actualización | Auto |

**Índices:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id`
- INDEX: `category`, `proficiency_level`

---

### 🔗 `social_links` - Enlaces a Redes Sociales
| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identificador único | PK |
| `user_id` | BIGINT | ID del usuario | FK → users, Cascade |
| `platform` | ENUM | Red social | github/linkedin/twitter/facebook/instagram/youtube/portfolio/behance/codepen/dribbble |
| `url` | VARCHAR(255) | URL del perfil | Requerido |
| `display_label` | VARCHAR(100) | Etiqueta mostrada | Opcional |
| `created_at` | TIMESTAMP | Fecha de creación | Auto |
| `updated_at` | TIMESTAMP | Fecha de actualización | Auto |

**Índices:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id`
- UNIQUE: `(user_id, platform)`

---

### 🔓 `personal_access_tokens` - Autenticación Sanctum
| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|-------------|
| `id` | BIGINT | Identificador único | PK |
| `tokenable_id` | BIGINT | ID del usuario autenticado | FK → users, Cascade |
| `tokenable_type` | VARCHAR(255) | Tipo de modelo | App\Models\User |
| `name` | VARCHAR(255) | Nombre del token | Requerido |
| `token` | VARCHAR(80) | Hash del token | Unique |
| `abilities` | JSON | Permisos del token | Default: ['*'] (admin) |
| `last_used_at` | TIMESTAMP | Último uso | Nullable |
| `created_at` | TIMESTAMP | Fecha de creación | Auto |
| `updated_at` | TIMESTAMP | Fecha de actualización | Auto |

**Índices:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `tokenable_id`
- UNIQUE: `token`

---

## 🔄 Relaciones

| De | A | Tipo | Restricción |
|----|----|------|------------|
| users | portfolios | 1:N | Cascade Delete |
| users | projects | 1:N | Cascade Delete |
| users | experiences | 1:N | Cascade Delete |
| users | education | 1:N | Cascade Delete |
| users | skills | 1:N | Cascade Delete |
| users | social_links | 1:N | Cascade Delete |
| users | personal_access_tokens | 1:N | Cascade Delete |
| portfolios | projects | 1:N | Cascade Delete |
| projects | technologies | N:M | Pivot Table |

---

## 📊 Estrategia de Indexación

### Índices de Rendimiento:
- **Búsquedas por usuario**: `users.id`, `portfolios.user_id`, `projects.user_id`
- **Filtros de publicación**: `portfolios.is_published`, `projects.featured`
- **Ordenamiento**: `projects.order`, `skills.order`
- **Búsquedas por slug**: `portfolios.slug`, `projects.slug`
- **Rango de fechas**: `experiences.start_date`, `projects.created_at`

### Composición:
```sql
-- Búsquedas comunes (ya indexadas):
SELECT * FROM projects WHERE user_id = 1 AND featured = true;
SELECT * FROM experiences WHERE user_id = 1 AND is_current = true;
SELECT * FROM portfolios WHERE slug = 'my-portfolio' AND is_published = true;

-- JOIN performance (FK indexed):
SELECT p.* FROM projects p 
  WHERE p.portfolio_id = 5 
  ORDER BY p.order ASC;
```

---

## 🔒 Soft Deletes

Implementados en:
- `portfolios` - Conserva histórico de portafolios eliminados
- `projects` - Recuperación de proyectos borrados
- `experiences` - Mantiene registro laboral
- `education` - Conserva historial educativo
- `social_links` - Previene pérdida de datos de contacto

**Nota**: `users` NO tiene soft delete (borrado permanente requiere cascada).

---

## 📝 Enums (Tipos Enumerados)

### `proficiency_level` (skills)
```
'beginner' → Novato (< 1 año)
'intermediate' → Intermedio (1-3 años)
'advanced' → Avanzado (3-5 años)
'expert' → Experto (> 5 años)
```

### `platform` (social_links)
```
'github'      → GitHub
'linkedin'    → LinkedIn
'twitter'     → Twitter
'facebook'    → Facebook
'instagram'   → Instagram
'youtube'     → YouTube
'portfolio'   → Portafolio personal
'behance'     → Behance
'codepen'     → CodePen
'dribbble'    → Dribbble
```

---

## 🚀 Comandos de Ejecución

### 1. Ejecutar migraciones
```bash
php artisan migrate
```

### 2. Ejecutar con seeders (datos de prueba)
```bash
php artisan migrate --seed
```

### 3. Solo seeders
```bash
php artisan db:seed
```

### 4. Revertir migraciones
```bash
php artisan migrate:rollback
```

### 5. Reset completo
```bash
php artisan migrate:refresh --seed
```

---

## ✅ Notación Normalización

- **1NF**: Todos los campos contienen valores atómicos
- **2NF**: Todas las dependencias funcionales están basadas en clave primaria
- **3NF**: Sin dependencias funcionales entre atributos no-clave

---

## 📌 Consideraciones de Seguridad

✅ **Hasheado de contraseñas**: bcrypt en `users.password`
✅ **SQL Injection**: Parametrized queries (Laravel QueryBuilder)
✅ **Soft Deletes**: Datos sensibles no se eliminan permanentemente
✅ **Foreign Keys**: Integridad referencial con cascade appropriado
✅ **Tokens Sanctum**: Hashing de tokens en `personal_access_tokens.token`
✅ **Timestamps**: Auditoria de creación/actualización automática

