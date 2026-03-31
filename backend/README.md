# Sistema Generador de Portafolios Digitales - Backend

API REST desarrollada con Laravel para la gestión de portafolios digitales.

## Instalación y Configuración

### Requisitos

- PHP 8.2+
- Composer
- MySQL 8.0+
- Node.js (opcional para herramientas frontend)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tisstackshield7-bit/Sistema-generador-de-portafolios-digitales.git
cd backend
```

2. **Instalar dependencias**
```bash
composer install
```

3. **Configurar el archivo .env**
```bash
cp .env.example .env
php artisan key:generate
```

4. **Configurar la base de datos**
Edita el archivo `.env` con tus credenciales de MySQL:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=portafolios_db
DB_USERNAME=root
DB_PASSWORD=
```

5. **Ejecutar migraciones**
```bash
php artisan migrate
```

6. **Iniciar el servidor**
```bash
php artisan serve
```

El servidor estará disponible en `http://localhost:8000`

## Autenticación

El backend utiliza **Laravel Sanctum** para autenticación token-based.

### Endpoints de Autenticación

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión (requiere autenticación)
- `GET /api/auth/user` - Obtener usuario actual (requiere autenticación)

## Estructura de Modelos

### User
- id, name, email, password
- professional_title, bio, avatar_url, cover_image_url
- location, phone, website, is_active

### Portfolio
- id, user_id, title, slug, description
- theme, is_published, custom_domain
- meta_description, meta_keywords

### Project
- id, user_id, portfolio_id, title, slug, description
- thumbnail_url, project_url, github_url
- start_date, end_date, featured, order
- Relación: belongsToMany(Technology)

### Experience
- id, user_id, job_title, company, location
- start_date, end_date, is_current
- description, company_logo_url

### Skill
- id, user_id, name, category
- proficiency_level (beginner, intermediate, advanced, expert)
- order

### Education
- id, user_id, institution, degree, field_of_study
- start_date, end_date, is_current
- description, certificate_url, institution_logo_url

### SocialLink
- id, user_id, platform, url, icon, display_label

### Technology
- id, name, slug, color, icon_url
- Relación: belongsToMany(Project)

## Endpoints de API

### Rutas Protegidas (requieren autenticación)

#### Usuario
- `GET /api/user` - Obtener perfil
- `PUT /api/user` - Actualizar perfil
- `PUT /api/user/password` - Cambiar contraseña

#### Portafolios
- `GET /api/portfolios` - Listar portafolios
- `POST /api/portfolios` - Crear portafolio
- `GET /api/portfolios/{id}` - Obtener portafolio
- `PUT /api/portfolios/{id}` - Actualizar portafolio
- `DELETE /api/portfolios/{id}` - Eliminar portafolio

#### Proyectos
- `GET /api/projects` - Listar proyectos
- `POST /api/projects` - Crear proyecto
- `GET /api/projects/{id}` - Obtener proyecto
- `PUT /api/projects/{id}` - Actualizar proyecto
- `DELETE /api/projects/{id}` - Eliminar proyecto
- `GET /api/projects-technologies` - Obtener todas las tecnologías

#### Experiencias
- `GET /api/experiences` - Listar experiencias
- `POST /api/experiences` - Crear experiencia
- `GET /api/experiences/{id}` - Obtener experiencia
- `PUT /api/experiences/{id}` - Actualizar experiencia
- `DELETE /api/experiences/{id}` - Eliminar experiencia

#### Habilidades
- `GET /api/skills` - Listar habilidades
- `POST /api/skills` - Crear habilidad
- `GET /api/skills/{id}` - Obtener habilidad
- `PUT /api/skills/{id}` - Actualizar habilidad
- `DELETE /api/skills/{id}` - Eliminar habilidad
- `GET /api/skills/by-category` - Agrupar por categoría

#### Educación
- `GET /api/education` - Listar educación
- `POST /api/education` - Crear educación
- `GET /api/education/{id}` - Obtener educación
- `PUT /api/education/{id}` - Actualizar educación
- `DELETE /api/education/{id}` - Eliminar educación

#### Enlaces Sociales
- `GET /api/social-links` - Listar enlaces sociales
- `POST /api/social-links` - Crear enlace social
- `GET /api/social-links/{id}` - Obtener enlace social
- `PUT /api/social-links/{id}` - Actualizar enlace social
- `DELETE /api/social-links/{id}` - Eliminar enlace social
- `GET /api/social-links/platforms` - Obtener plataformas disponibles

### Rutas Públicas

- `GET /api/portfolios/{slug}` - Obtener portafolio público
- `GET /api/users/{id}` - Obtener perfil público
- `GET /api/users/{id}/projects` - Obtener proyectos públicos
- `GET /api/health` - Health check

## CORS

El backend está configurado para aceptar solicitudes desde:
- http://localhost:3000
- http://localhost:5173

Configura estas URLs en la variable de entorno `CORS_ALLOWED_ORIGINS`

## Variables de Entorno

```
APP_NAME="Sistema Portafolios Digitales"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=portafolios_db
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Estructura de Directorios

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   └── Middleware/
│   ├── Models/
│   ├── Policies/
│   ├── Providers/
│   └── Services/
├── bootstrap/
├── config/
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
├── routes/
├── storage/
├── public/
├── tests/
├── composer.json
├── .env.example
└── README.md
```

## Desarrollo

- Usar rutas RESTful con controladores por recurso
- Validación de entrada en los requests
- Políticas de autorización para proteger datos
- Usar Eloquent ORM para queries
- Soft deletes para datos sensibles

## Próximas características

- [ ] Carga de archivos (avatares, proyectos)
- [ ] Temas personalizados para portafolios
- [ ] URL personalizadas
- [ ] Estadísticas de visitas
- [ ] Sistema de comentarios
- [ ] Etiquetado de proyectos
