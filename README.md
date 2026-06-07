# Sistema Generador de Portafolios Digitales

Sistema web para crear, administrar y publicar portafolios digitales profesionales. Incluye registro e inicio de sesion, perfiles publicos, gestion de habilidades, proyectos, experiencias, recuperacion de contrasena y panel administrativo.

## Tecnologias

- Backend: Laravel 11, PHP 8.2, PostgreSQL
- Frontend: React 19, TypeScript, Vite
- Cliente HTTP: Axios
- Autenticacion: tokens propios almacenados en la tabla `sesiones`
- Base de datos principal: PostgreSQL

## Estructura del proyecto

```text
.
+-- backend/      API REST Laravel
+-- frontend/     Aplicacion React/Vite
+-- .gitignore
```

## Requisitos

- PHP 8.2 o superior
- Composer
- Node.js 20 o superior
- npm
- PostgreSQL
- Git

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/tisstackshield7-bit/Sistema-generador-de-portafolios-digitales.git
cd Sistema-generador-de-portafolios-digitales
```

### 2. Configurar backend

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

Edita `backend/.env` con tus datos locales:

```env
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=portafolio
DB_USERNAME=postgres
DB_PASSWORD=tu_password

MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=no-reply@example.com
MAIL_FROM_NAME=PortafolioPro

ADMIN_INITIAL_EMAIL=admin@example.com
ADMIN_INITIAL_PASSWORD=ChangeMe123!
```

Crea la base de datos en PostgreSQL:

```sql
CREATE DATABASE portafolio;
```

Ejecuta migraciones y seeders:

```bash
php artisan migrate
php artisan db:seed
php artisan storage:link
```

Levanta el backend:

```bash
php artisan serve
```

La API quedara disponible en:

```text
http://127.0.0.1:8000/api
```

### 3. Configurar frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La aplicacion quedara disponible en:

```text
http://localhost:5173
```

Nota: el frontend apunta por defecto a `http://127.0.0.1:8000/api` desde `frontend/src/api/axios.ts`.

## Comandos utiles

Backend:

```bash
cd backend
php artisan serve
php artisan migrate
php artisan db:seed
php artisan test
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run lint
npm run preview
```

## Credenciales iniciales

El seeder crea un usuario administrador usando estas variables:

```env
ADMIN_INITIAL_EMAIL=admin@example.com
ADMIN_INITIAL_PASSWORD=ChangeMe123!
```

Cambia esos valores en `.env` antes de ejecutar:

```bash
php artisan db:seed
```

## Modulos principales

- Autenticacion de usuarios
- Recuperacion de contrasena por correo
- Cambio obligatorio de contrasena temporal
- Creacion y edicion de perfil profesional
- Perfil publico por `slug`
- Gestion de habilidades tecnicas y blandas
- Evidencias y certificados de habilidades
- Gestion de proyectos
- Gestion de experiencias academicas o laborales
- Panel administrativo
- Reportes y registro de actividad

## Endpoints principales

Publicos:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
GET  /api/auth/reset-password/{token}
POST /api/auth/reset-password
GET  /api/perfiles-publicos
GET  /api/perfiles-publicos/{slug}
```

Autenticados:

```text
GET    /api/auth/me
POST   /api/auth/logout
PUT    /api/auth/change-password
POST   /api/perfil
GET    /api/perfil
PUT    /api/perfil
GET    /api/habilidades
POST   /api/habilidades
PUT    /api/habilidades/{id}
PATCH  /api/habilidades/{id}/visibilidad
DELETE /api/habilidades/{id}
GET    /api/proyectos
POST   /api/proyectos
PUT    /api/proyectos/{id}
PATCH  /api/proyectos/{id}/visibilidad
DELETE /api/proyectos/{id}
GET    /api/experiencias
POST   /api/experiencias
PUT    /api/experiencias/{id}
PATCH  /api/experiencias/{id}/visibilidad
DELETE /api/experiencias/{id}
```

Administrador:

```text
GET   /api/admin/dashboard
GET   /api/admin/usuarios
PATCH /api/admin/usuarios/{id}/estado
GET   /api/admin/reportes
GET   /api/admin/reportes/exportar
```

## Esquema de base de datos

### usuarios

Almacena las cuentas del sistema.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| id | bigint | Identificador |
| nombre | varchar | Nombre del usuario |
| correo | varchar unique | Correo de acceso |
| contrasena | varchar | Contrasena cifrada |
| rol | varchar | `usuario` o `admin` |
| estado | varchar | Estado de la cuenta |
| debe_cambiar_contrasena | boolean | Indica si debe cambiar contrasena temporal |
| contrasena_temporal_expira_en | timestamp | Expiracion de contrasena temporal |
| recuperacion_solicitada_en | timestamp | Fecha de solicitud de recuperacion |
| token_recordar | varchar | Token recordatorio |
| correo_verificado_en | timestamp | Verificacion de correo |
| creado_en | timestamp | Creacion |
| actualizado_en | timestamp | Actualizacion |
| deleted_at | timestamp | Eliminacion logica |

### perfiles

Datos profesionales del usuario.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| id | bigint | Identificador |
| usuario_id | foreign unique | Usuario propietario |
| nombres | varchar | Nombres |
| apellidos | varchar | Apellidos |
| nombre_completo | varchar | Nombre completo |
| profesion | varchar | Profesion |
| titular_profesional | varchar | Titular o cargo |
| biografia | text | Biografia |
| telefono | varchar | Telefono |
| ubicacion | varchar | Ubicacion general |
| pais | varchar | Pais |
| ciudad | varchar | Ciudad |
| foto_perfil | varchar | Ruta de foto |
| archivo_cv | varchar | Ruta de CV |
| linkedin_url | varchar | URL de LinkedIn |
| github_url | varchar | URL de GitHub |
| sitio_web_url | varchar | Sitio web |
| visibilidad | json | Preferencias de visibilidad |
| es_publico | boolean | Perfil visible publicamente |
| slug | varchar unique | URL publica |
| creado_en | timestamp | Creacion |
| actualizado_en | timestamp | Actualizacion |
| eliminado_en | timestamp | Eliminacion logica |

### sesiones

Tokens de sesion activos.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| id | bigint | Identificador |
| usuario_id | foreign | Usuario |
| token | varchar unique | Token de acceso |
| ip_usuario | varchar | IP |
| dispositivo | varchar | Dispositivo |
| fecha_inicio | timestamp | Inicio de sesion |
| fecha_expiracion | timestamp | Expiracion |
| creado_en | timestamp | Creacion |
| actualizado_en | timestamp | Actualizacion |

### habilidades

Habilidades del perfil.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| id | bigint | Identificador |
| perfil_id | foreign | Perfil propietario |
| tipo | varchar | Tipo de habilidad |
| nombre | varchar | Nombre |
| categoria | varchar | Categoria |
| nivel_dominio | varchar | Nivel |
| visible_publico | boolean | Visible en perfil publico |
| certificado_pdf | varchar | Certificado asociado |
| creado_en | timestamp | Creacion |
| actualizado_en | timestamp | Actualizacion |

Indice unico:

```text
perfil_id, nombre, tipo, categoria
```

### evidencias_habilidad

Evidencias asociadas a habilidades.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| id | bigint | Identificador |
| habilidad_id | foreign | Habilidad |
| tipo | varchar | Tipo de evidencia |
| titulo | varchar | Titulo |
| descripcion | text | Descripcion |
| archivo | varchar | Archivo |
| url | varchar | URL externa |
| emisor | varchar | Emisor |
| fecha | date | Fecha |
| creado_en | timestamp | Creacion |
| actualizado_en | timestamp | Actualizacion |

### proyectos

Proyectos del portafolio.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| id | bigint | Identificador |
| perfil_id | foreign | Perfil propietario |
| titulo | varchar | Titulo |
| rol | varchar | Rol desempenado |
| descripcion | text | Descripcion |
| fecha_inicio | date | Fecha de inicio |
| fecha_fin | date nullable | Fecha de finalizacion |
| tecnologias | json | Tecnologias usadas |
| logros | json | Logros |
| enlace_proyecto | varchar | URL del proyecto |
| url_imagen | varchar | Imagen |
| visible_publico | boolean | Visible en perfil publico |
| creado_en | timestamp | Creacion |
| actualizado_en | timestamp | Actualizacion |

### experiencias

Experiencias laborales o academicas.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| id | bigint | Identificador |
| perfil_id | foreign | Perfil propietario |
| tipo | varchar | Tipo de experiencia |
| titulo | varchar | Titulo |
| institucion | varchar | Institucion |
| ubicacion | varchar | Ubicacion |
| descripcion | text | Descripcion |
| fecha_inicio | date | Fecha de inicio |
| fecha_fin | date nullable | Fecha de finalizacion |
| actualidad | boolean | Indica si continua actualmente |
| logros | json | Logros |
| enlace | varchar | Enlace |
| visible_publico | boolean | Visible en perfil publico |
| creado_en | timestamp | Creacion |
| actualizado_en | timestamp | Actualizacion |

### registros_actividad

Auditoria de acciones del sistema.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| id | bigint | Identificador |
| usuario_id | bigint nullable | Usuario relacionado |
| actor_nombre | varchar | Nombre del actor |
| actor_correo | varchar | Correo del actor |
| actor_rol | varchar | Rol del actor |
| categoria | varchar | Categoria |
| tipo | varchar | Tipo de accion |
| descripcion | varchar | Descripcion |
| ip_usuario | varchar | IP |
| entidad_tipo | varchar | Tipo de entidad afectada |
| entidad_id | bigint | ID de entidad afectada |
| meta | json | Datos adicionales |
| creado_en | timestamp | Fecha de registro |

## Relaciones principales

```text
usuarios 1 - 1 perfiles
usuarios 1 - N sesiones
perfiles 1 - N habilidades
habilidades 1 - N evidencias_habilidad
perfiles 1 - N proyectos
perfiles 1 - N experiencias
usuarios 1 - N registros_actividad
```

## Archivos no versionados

No se suben al repositorio:

- `backend/.env`
- `backend/vendor/`
- `frontend/node_modules/`
- `frontend/dist/`
- archivos de storage subidos por usuarios
- cache de Laravel y Composer
- datos locales de PostgreSQL

Cada entorno debe crear su propio `.env` desde `backend/.env.example`.

## Verificacion

Antes de subir cambios importantes:

```bash
cd backend
php artisan test
```

```bash
cd frontend
npm run build
```
