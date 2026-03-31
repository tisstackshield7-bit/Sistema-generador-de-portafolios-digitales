# Guía de Configuración de Base de Datos

## 🗄️ Requisitos Previos

- PostgreSQL **12.0+** instalado
- pgAdmin 4 o terminal psql configurados
- Laravel 11 con Composer instalado

---

## 🔧 Configuración de PostgreSQL

### 1. Crear Base de Datos

```bash
# Conectar a PostgreSQL (Windows/Linux/Mac)
psql -U postgres

# Crear base de datos
CREATE DATABASE portfolio_db;

# Crear usuario dedicado (recomendado)
CREATE USER portfolio_user WITH PASSWORD 'tu_contraseña_segura';

# Asignar permisos
GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO portfolio_user;

# Conectar a la base de datos
\c portfolio_db

# Asignar permisos en schema público
GRANT ALL ON SCHEMA public TO portfolio_user;

# Salir
\q
```

### 2. Configurar Laravel (.env)

```env
# Base de Datos PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=portfolio_db
DB_USERNAME=portfolio_user
DB_PASSWORD=tu_contraseña_segura

# Configuración General
APP_NAME="Portfolio Generator"
APP_ENV=local
APP_KEY=base64:xxxxx (generar con php artisan key:generate)
APP_DEBUG=true
APP_TIMEZONE=America/Mexico_City

# CORS y URLs
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Sanctum (Autenticación)
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:5173
SANCTUM_ENCRYPT_COOKIES=false
```

---

## 🚀 Ejecutar Migraciones

### Opción 1: Migraciones + Seeders (Recomendado)
```bash
# Navega al directorio del backend
cd backend

# Ejecutar todas las migraciones y cargar datos de prueba
php artisan migrate --seed
```

### Opción 2: Solo Migraciones
```bash
# Ejecutar migraciones (crea estructura)
php artisan migrate

# Después, cargar seeders manualmente
php artisan db:seed
```

### Opción 3: Seeders Específicos
```bash
# Solo tecnologías
php artisan db:seed --class=TechnologySeeder

# Solo usuarios y datos relacionados
php artisan db:seed --class=UserSeeder
```

---

## 📋 Verificar Estructura

### Conectar a PostgreSQL
```bash
psql -U portfolio_user -d portfolio_db -h localhost
```

### Ver todas las tablas
```sql
\dt
```

### Ver estructura de tabla específica
```sql
\d users
\d portfolios
\d projects
```

### Contar registros
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM technologies;
SELECT COUNT(*) FROM projects;
```

### Salir
```sql
\q
```

---

## 🧪 Datos de Prueba Incluidos

Después de ejecutar `php artisan migrate --seed`:

### Usuario de Prueba
- **Email**: juan@example.com
- **Contraseña**: password123
- **Nombre**: Juan Pérez
- **Profesión**: Desarrollador Full Stack

### Datos Asociados
- ✅ 1 Portafolio con slug `mi-portafolio-profesional`
- ✅ 2 Experiencias laborales (1 actual, 1 anterior)
- ✅ 2 Proyectos destacados con tecnologías asociadas
- ✅ 5 Habilidades con diferentes niveles
- ✅ 2 Registros de educación
- ✅ 3 Enlaces sociales (GitHub, LinkedIn, Twitter)
- ✅ 20 Tecnologías disponibles (PHP, Laravel, React, etc.)

---

## 🔄 Operaciones Utiles

### Revertir última migración
```bash
php artisan migrate:rollback
```

### Revertir todas las migraciones
```bash
php artisan migrate:reset
```

### Reset completo con nuevos datos
```bash
php artisan migrate:refresh --seed
```

### Ver migraciones ejecutadas
```bash
php artisan migrate:status
```

### Ver información de conexión
```bash
php artisan tinker
>>> DB::connection()->getDatabaseName()
>>> DB::connection()->getConfig('host')
```

---

## 🐛 Solución de Problemas

### Error: "SQLSTATE[HY000]: General error: 7 base de datos está bloqueada"
**Solución:** Reiniciar PostgreSQL
```bash
# Windows (PowerShell como Admin)
Restart-Service postgresql-x64-14

# Linux
sudo systemctl restart postgresql

# macOS
brew services restart postgresql
```

### Error: "No such file or directory - /socket path"
**Solución:** Verificar HOST y PORT en .env
```env
DB_HOST=127.0.0.1  # No localhost
DB_PORT=5432
```

### Error: "SQLSTATE[08006]: Connection refused"
**Solución:** Verificar que PostgreSQL está corriendo
```bash
# Enable PostgreSQL en Windows Services
# o ejecutar: psql -U postgres -c "SELECT 1;"
```

### Error: "migration_exists does not exist"
**Solución:** Crear tabla de migraciones
```bash
php artisan migrate:install
php artisan migrate
```

---

## 📊 Resumen de Estructura

```
📁 backend/
├── database/
│   ├── migrations/
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 0001_01_01_000001_create_cache_table.php
│   │   ├── 2026_03_30_000001_create_portfolios_table.php
│   │   ├── 2026_03_30_000002_create_experiences_table.php
│   │   ├── 2026_03_30_000003_create_technologies_table.php
│   │   ├── 2026_03_30_000004_create_projects_table.php
│   │   ├── 2026_03_30_000005_create_project_technologies_table.php
│   │   ├── 2026_03_30_000006_create_skills_table.php
│   │   ├── 2026_03_30_000007_create_education_table.php
│   │   └── 2026_03_30_000008_create_social_links_table.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── TechnologySeeder.php
│       └── UserSeeder.php
└── app/models/
    ├── User.php
    ├── Portfolio.php
    ├── Project.php
    ├── Technology.php
    ├── Experience.php
    ├── Skill.php
    ├── Education.php
    └── SocialLink.php
```

---

## ✅ Checklist de Configuración

- [ ] PostgreSQL 12+ instalado y corriendo
- [ ] Base de datos `portfolio_db` creada
- [ ] Usuario `portfolio_user` con permisos
- [ ] Archivo `.env` configurado correctamente
- [ ] Clave de aplicación generada: `php artisan key:generate`
- [ ] Migraciones ejecutadas: `php artisan migrate --seed`
- [ ] Datos visibles en pgAdmin o psql
- [ ] API servidor iniciado: `php artisan serve`
- [ ] Frontend accesible: `npm run dev`
- [ ] Autenticación funcional con usuario de prueba

