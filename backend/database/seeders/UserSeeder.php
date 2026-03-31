<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Portfolio;
use App\Models\Experience;
use App\Models\Project;
use App\Models\Skill;
use App\Models\Education;
use App\Models\SocialLink;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear usuario de prueba
        $user = User::create([
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'password' => Hash::make('password123'),
            'professional_title' => 'Desarrollador Full Stack',
            'bio' => 'Apasionado por la tecnología y el desarrollo web. Con más de 5 años de experiencia en desarrollo full stack.',
            'location' => 'México, CDMX',
            'phone' => '+52 55 1234 5678',
            'website' => 'https://juanperez.dev',
            'is_active' => true,
        ]);

        // Crear portafolio
        $portfolio = Portfolio::create([
            'user_id' => $user->id,
            'title' => 'Mi Portafolio Profesional',
            'slug' => 'mi-portafolio-profesional',
            'description' => 'Portafolio profesional con mis mejores proyectos y experiencia.',
            'is_published' => true,
            'theme' => 'dark',
            'meta_description' => 'Portafolio profesional de Juan Pérez - Desarrollador Full Stack',
        ]);

        // Crear experiencias
        Experience::create([
            'user_id' => $user->id,
            'job_title' => 'Desarrollador Full Stack Senior',
            'company' => 'Tech Solutions Inc',
            'location' => 'México, CDMX',
            'start_date' => Carbon::parse('2021-01-15'),
            'is_current' => true,
            'description' => 'Liderando el desarrollo de aplicaciones web escalables usando Laravel y React.',
        ]);

        Experience::create([
            'user_id' => $user->id,
            'job_title' => 'Desarrollador Backend',
            'company' => 'Digital Innovations',
            'location' => 'México, Monterrey',
            'start_date' => Carbon::parse('2019-06-01'),
            'end_date' => Carbon::parse('2020-12-31'),
            'description' => 'Desarrollo de APIs REST con Laravel y optimización de bases de datos.',
        ]);

        // Crear proyectos
        $project1 = Project::create([
            'user_id' => $user->id,
            'portfolio_id' => $portfolio->id,
            'title' => 'E-Commerce Platform',
            'slug' => 'ecommerce-platform',
            'description' => 'Plataforma de comercio electrónico completa con carrito, pagos y admin panel.',
            'project_url' => 'https://ecommerce-demo.dev',
            'github_url' => 'https://github.com/juanperez/ecommerce',
            'start_date' => Carbon::parse('2023-01-01'),
            'end_date' => Carbon::parse('2023-06-30'),
            'featured' => true,
            'order' => 1,
        ]);

        $project2 = Project::create([
            'user_id' => $user->id,
            'portfolio_id' => $portfolio->id,
            'title' => 'Task Management App',
            'slug' => 'task-management-app',
            'description' => 'Aplicación de gestión de tareas con colaboración en tiempo real.',
            'project_url' => 'https://tasks-app.dev',
            'github_url' => 'https://github.com/juanperez/tasks',
            'start_date' => Carbon::parse('2023-07-01'),
            'end_date' => Carbon::parse('2023-10-31'),
            'featured' => true,
            'order' => 2,
        ]);

        // Asociar tecnologías a proyectos
        $project1->technologies()->attach([1, 2, 6, 9]); // PHP, Laravel, JavaScript, MySQL
        $project2->technologies()->attach([3, 7, 6, 10]); // React, TypeScript, JavaScript, PostgreSQL

        // Crear habilidades
        Skill::create([
            'user_id' => $user->id,
            'name' => 'PHP',
            'category' => 'Backend',
            'proficiency_level' => 'advanced',
            'order' => 1,
        ]);

        Skill::create([
            'user_id' => $user->id,
            'name' => 'Laravel',
            'category' => 'Backend',
            'proficiency_level' => 'advanced',
            'order' => 2,
        ]);

        Skill::create([
            'user_id' => $user->id,
            'name' => 'React',
            'category' => 'Frontend',
            'proficiency_level' => 'advanced',
            'order' => 3,
        ]);

        Skill::create([
            'user_id' => $user->id,
            'name' => 'JavaScript',
            'category' => 'Frontend',
            'proficiency_level' => 'advanced',
            'order' => 4,
        ]);

        Skill::create([
            'user_id' => $user->id,
            'name' => 'PostgreSQL',
            'category' => 'Databases',
            'proficiency_level' => 'intermediate',
            'order' => 5,
        ]);

        // Crear educación
        Education::create([
            'user_id' => $user->id,
            'institution' => 'Universidad Autónoma de México',
            'degree' => 'Licenciatura',
            'field_of_study' => 'Ingeniería en Computación',
            'start_date' => Carbon::parse('2015-09-01'),
            'end_date' => Carbon::parse('2019-05-30'),
            'description' => 'Formación en ciencias de la computación con enfoque en desarrollo de software.',
        ]);

        Education::create([
            'user_id' => $user->id,
            'institution' => 'Udemy',
            'degree' => 'Certificación',
            'field_of_study' => 'Full Stack Development Bootcamp',
            'start_date' => Carbon::parse('2020-01-01'),
            'end_date' => Carbon::parse('2020-06-30'),
            'is_current' => false,
        ]);

        // Crear enlaces sociales
        SocialLink::create([
            'user_id' => $user->id,
            'platform' => 'github',
            'url' => 'https://github.com/juanperez',
            'display_label' => 'GitHub',
        ]);

        SocialLink::create([
            'user_id' => $user->id,
            'platform' => 'linkedin',
            'url' => 'https://linkedin.com/in/juanperez',
            'display_label' => 'LinkedIn',
        ]);

        SocialLink::create([
            'user_id' => $user->id,
            'platform' => 'twitter',
            'url' => 'https://twitter.com/juanperez',
            'display_label' => 'Twitter',
        ]);
    }
}
