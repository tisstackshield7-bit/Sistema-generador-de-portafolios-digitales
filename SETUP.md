# Configuración del Proyecto

## Backend - Instalación y Ejecución

1. Navega a la carpeta backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
composer install
```

3. Copia el archivo de configuración:
```bash
cp .env.example .env
```

4. Genera la clave de la aplicación:
```bash
php artisan key:generate
```

5. Configura tu base de datos en el archivo `.env`

6. Ejecuta las migraciones:
```bash
php artisan migrate
```

7. Inicia el servidor:
```bash
php artisan serve
```

El backend estará disponible en: `http://localhost:8000`

---

## Frontend - Instalación y Ejecución

1. Navega a la carpeta frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Copia el archivo de configuración:
```bash
cp .env.example .env
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

---

## Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/user` - Obtener usuario autenticado

### Portafolios
- `GET /api/portfolios` - Listar mis portafolios
- `POST /api/portfolios` - Crear portafolio
- `GET /api/portfolios/{id}` - Obtener portafolio específico
- `PUT /api/portfolios/{id}` - Actualizar portafolio
- `DELETE /api/portfolios/{id}` - Eliminar portafolio

### Proyectos
- `GET /api/projects` - Listar mis proyectos
- `POST /api/projects` - Crear proyecto
- `GET /api/projects/{id}` - Obtener proyecto específico
- `PUT /api/projects/{id}` - Actualizar proyecto
- `DELETE /api/projects/{id}` - Eliminar proyecto

### Experiencias
- `GET /api/experiences` - Listar experiencias
- `POST /api/experiences` - Crear experiencia
- `PUT /api/experiences/{id}` - Actualizar experiencia
- `DELETE /api/experiences/{id}` - Eliminar experiencia

### Habilidades
- `GET /api/skills` - Listar habilidades
- `POST /api/skills` - Crear habilidad
- `PUT /api/skills/{id}` - Actualizar habilidad
- `DELETE /api/skills/{id}` - Eliminar habilidad

### Educación
- `GET /api/education` - Listar educación
- `POST /api/education` - Crear educación
- `PUT /api/education/{id}` - Actualizar educación
- `DELETE /api/education/{id}` - Eliminar educación

### Enlaces Sociales
- `GET /api/social-links` - Listar enlaces sociales
- `POST /api/social-links` - Crear enlace social
- `PUT /api/social-links/{id}` - Actualizar enlace social
- `DELETE /api/social-links/{id}` - Eliminar enlace social

---

## Estructura de Carpetas

### Backend
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── UserController.php
│   │   │   ├── PortfolioController.php
│   │   │   ├── ProjectController.php
│   │   │   ├── ExperienceController.php
│   │   │   ├── SkillController.php
│   │   │   ├── EducationController.php
│   │   │   └── SocialLinkController.php
│   │   └── Middleware/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Portfolio.php
│   │   ├── Project.php
│   │   ├── Experience.php
│   │   ├── Skill.php
│   │   ├── Education.php
│   │   ├── SocialLink.php
│   │   └── Technology.php
│   ├── Policies/
│   ├── Providers/
│   └── Services/
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
├── routes/
│   └── api.php
├── bootstrap/
├── config/
├── storage/
├── public/
├── tests/
├── composer.json
├── .env.example
└── README.md
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.jsx
│   │   ├── Navbar.jsx
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Toast.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── index.js
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── index.js
│   ├── services/
│   │   ├── api.js
│   │   └── index.js
│   ├── context/
│   │   ├── authStore.js
│   │   └── portfolioStore.js
│   ├── hooks/
│   ├── utils/
│   │   ├── helpers.js
│   │   ├── storage.js
│   │   └── index.js
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── .gitignore
└── README.md
```

---

## Variables de Entorno

### Backend (.env)
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

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## Tecnologías Principales

### Backend
- PHP 8.2+
- Laravel 11
- Laravel Sanctum
- MySQL 8.0+
- Eloquent ORM

### Frontend
- React 18
- Vite
- TailwindCSS
- Zustand
- React Router DOM
- Axios
- Lucide React

---

## Funcionalidades Implementadas

✅ Autenticación y autorización
✅ Gestión de perfiles de usuario
✅ Creación de portafolios
✅ Gestión de proyectos
✅ Gestión de experiencias
✅ Gestión de habilidades
✅ Gestión de educación
✅ Gestión de enlaces sociales
✅ API RESTful
✅ Interfaz responsiva
✅ Validaciones de datos
✅ Protección de rutas

---

## Próximas Características

- Carga de imágenes y archivos
- Temas personalizables para portafolios
- URLs personalizadas
- Sistema de análitica
- Exportación a PDF
- Sistema de comentarios
- Integración con redes sociales

---

¡El proyecto está listo para usar! Si tienes algúna pregunta, consulta la documentación del backend o frontend.
