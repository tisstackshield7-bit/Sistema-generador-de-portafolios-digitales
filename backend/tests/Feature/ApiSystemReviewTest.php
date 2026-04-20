<?php

namespace Tests\Feature;

use App\Models\Habilidad;
use App\Models\Perfil;
use App\Models\Sesion;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ApiSystemReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_requires_strong_password(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'correo' => 'debil@example.com',
            'contrasena' => 'abc123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['contrasena']);
    }

    public function test_forgot_password_does_not_reveal_if_email_exists(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/auth/forgot-password', [
            'correo' => 'desconocido@example.com',
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Si el correo existe, se envio una contrasena temporal.',
            ]);

        Mail::assertNothingSent();
    }

    public function test_forgot_password_sets_temporary_password_flags(): void
    {
        Mail::fake();

        $usuario = $this->createUsuario('recovery@example.com');

        $response = $this->postJson('/api/auth/forgot-password', [
            'correo' => $usuario->correo,
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Si el correo existe, se envio una contrasena temporal.');

        $usuario->refresh();

        $this->assertTrue((bool) $usuario->debe_cambiar_contrasena);
        $this->assertNotNull($usuario->contrasena_temporal_expira_en);
        $this->assertNotNull($usuario->recuperacion_solicitada_en);
        $this->assertNotEmpty($response->json('contrasena_temporal_prueba'));
    }

    public function test_login_with_temporary_password_requires_change(): void
    {
        Mail::fake();

        $usuario = $this->createUsuario('temporary-login@example.com');

        $response = $this->postJson('/api/auth/forgot-password', [
            'correo' => $usuario->correo,
        ]);

        $temporaryPassword = $response->json('contrasena_temporal_prueba');

        $this->postJson('/api/auth/login', [
            'correo' => $usuario->correo,
            'contrasena' => $temporaryPassword,
        ])->assertOk()
            ->assertJsonPath('requiere_cambio_contrasena', true)
            ->assertJsonPath('redirect_to', '/perfil/cambiar-contrasena')
            ->assertJsonPath('usuario.debe_cambiar_contrasena', true);
    }

    public function test_authenticated_user_can_change_temporary_password(): void
    {
        Mail::fake();

        $usuario = $this->createUsuario('change-pass@example.com');

        $response = $this->postJson('/api/auth/forgot-password', [
            'correo' => $usuario->correo,
        ]);

        $temporaryPassword = $response->json('contrasena_temporal_prueba');

        $login = $this->postJson('/api/auth/login', [
            'correo' => $usuario->correo,
            'contrasena' => $temporaryPassword,
        ]);

        $token = $login->json('token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/auth/change-password', [
                'contrasena_actual' => $temporaryPassword,
                'contrasena_nueva' => 'NuevaClave1!',
                'contrasena_nueva_confirmation' => 'NuevaClave1!',
            ])
            ->assertOk()
            ->assertJsonPath('usuario.debe_cambiar_contrasena', false);

        $usuario->refresh();

        $this->assertFalse((bool) $usuario->debe_cambiar_contrasena);
        $this->assertNull($usuario->contrasena_temporal_expira_en);
    }

    public function test_public_profile_can_be_loaded_by_slug_even_if_not_in_home_listing(): void
    {
        $this->seedPublicProfiles(25);

        $response = $this->getJson('/api/perfiles-publicos/perfil-25');

        $response->assertOk()
            ->assertJsonPath('perfil.slug', 'perfil-25');

        $this->getJson('/api/perfiles-publicos')
            ->assertOk()
            ->assertJsonCount(20, 'perfiles');
    }

    public function test_duplicate_profile_creation_returns_conflict(): void
    {
        $usuario = $this->createUsuario('perfil@example.com');
        $token = $this->createSession($usuario, str_repeat('a', 80));

        Perfil::create([
            'usuario_id' => $usuario->id,
            'nombres' => 'Juan',
            'apellidos' => 'Perez Gomez',
            'nombre_completo' => 'Juan Perez Gomez',
            'profesion' => 'Ingeniero de Sistemas',
            'titular_profesional' => 'Ingeniero de Sistemas',
            'biografia' => 'Biografia inicial suficientemente larga.',
            'es_publico' => true,
            'slug' => 'juan-perez-gomez',
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/perfil', [
                'nombres' => 'Juan',
                'apellidos' => 'Perez Gomez',
                'profesion' => 'Ingeniero de Sistemas',
                'biografia' => 'Otra biografia valida con longitud suficiente.',
            ]);

        $response->assertStatus(409)
            ->assertJson([
                'message' => 'Ya existe un perfil para esta cuenta.',
            ]);
    }

    public function test_profile_keeps_names_and_last_names_separately(): void
    {
        $usuario = $this->createUsuario('nombres@example.com');
        $token = $this->createSession($usuario, str_repeat('b', 80));

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/perfil', [
                'nombres' => 'Juan Carlos',
                'apellidos' => 'Perez de la Cruz',
                'profesion' => 'Arquitecto de Software',
                'biografia' => 'Biografia valida con suficientes caracteres para pasar la validacion.',
            ]);

        $response->assertCreated()
            ->assertJsonPath('perfil.nombres', 'Juan Carlos')
            ->assertJsonPath('perfil.apellidos', 'Perez de la Cruz')
            ->assertJsonPath('perfil.nombre_completo', 'Juan Carlos Perez de la Cruz');

        $this->assertTrue(Schema::hasColumns('perfiles', ['nombres', 'apellidos']));
    }

    public function test_can_create_technical_skill_with_category_level_and_visibility(): void
    {
        [$perfil, $token] = $this->createPerfilConSesion('skills@example.com', str_repeat('c', 80));

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/habilidades', [
                'tipo' => 'tecnica',
                'nombre' => 'React, TypeScript',
                'categoria' => 'Frontend',
                'nivel_dominio' => 'Avanzado',
                'visible_publico' => true,
            ]);

        $response->assertCreated()
            ->assertJsonPath('habilidad.perfil_id', $perfil->id)
            ->assertJsonPath('habilidad.nombre', 'React, TypeScript')
            ->assertJsonPath('habilidad.categoria', 'Frontend')
            ->assertJsonPath('habilidad.nivel_dominio', 'Avanzado')
            ->assertJsonPath('habilidad.visible_publico', true);
    }

    public function test_cannot_create_skill_without_required_fields(): void
    {
        [, $token] = $this->createPerfilConSesion('validation@example.com', str_repeat('d', 80));

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/habilidades', [
                'tipo' => 'tecnica',
                'nombre' => '',
                'nivel_dominio' => '',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nombre', 'categoria', 'nivel_dominio']);
    }

    public function test_cannot_create_soft_skill_without_valid_category(): void
    {
        [, $token] = $this->createPerfilConSesion('soft-validation@example.com', str_repeat('h', 80));

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/habilidades', [
                'tipo' => 'blanda',
                'nombre' => 'Escucha activa',
                'nivel_dominio' => 'Intermedio',
                'visible_publico' => true,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['categoria']);
    }

    public function test_can_update_visibility_and_delete_skill(): void
    {
        [$perfil, $token] = $this->createPerfilConSesion('manage@example.com', str_repeat('e', 80));

        $habilidad = Habilidad::create([
            'perfil_id' => $perfil->id,
            'tipo' => 'blanda',
            'nombre' => 'Comunicacion',
            'categoria' => 'Comunicacion',
            'nivel_dominio' => 'Intermedio',
            'visible_publico' => false,
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/habilidades/{$habilidad->id}/visibilidad", [
                'visible_publico' => true,
            ])
            ->assertOk()
            ->assertJsonPath('habilidad.visible_publico', true);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/habilidades/{$habilidad->id}", [
                'tipo' => 'blanda',
                'nombre' => 'Liderazgo',
                'categoria' => 'Liderazgo',
                'nivel_dominio' => 'Avanzado',
                'visible_publico' => true,
            ])
            ->assertOk()
            ->assertJsonPath('habilidad.nombre', 'Liderazgo')
            ->assertJsonPath('habilidad.categoria', 'Liderazgo')
            ->assertJsonPath('habilidad.nivel_dominio', 'Avanzado');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/habilidades/{$habilidad->id}")
            ->assertOk();

        $this->assertDatabaseMissing('habilidades', [
            'id' => $habilidad->id,
        ]);
    }

    public function test_public_profile_only_shows_visible_skills(): void
    {
        [$perfil] = $this->createPerfilConSesion('publicskills@example.com', str_repeat('f', 80), 'perfil-publico-skills');

        Habilidad::create([
            'perfil_id' => $perfil->id,
            'tipo' => 'tecnica',
            'nombre' => 'Laravel',
            'categoria' => 'Backend',
            'nivel_dominio' => 'Avanzado',
            'visible_publico' => true,
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);

        Habilidad::create([
            'perfil_id' => $perfil->id,
            'tipo' => 'blanda',
            'nombre' => 'Negociacion',
            'categoria' => 'Comunicacion',
            'nivel_dominio' => 'Intermedio',
            'visible_publico' => false,
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);

        $response = $this->getJson('/api/perfiles-publicos/perfil-publico-skills');

        $response->assertOk()
            ->assertJsonCount(1, 'perfil.habilidades')
            ->assertJsonPath('perfil.habilidades.0.nombre', 'Laravel');
    }

    private function createUsuario(string $correo): Usuario
    {
        return Usuario::create([
            'nombre' => null,
            'correo' => $correo,
            'contrasena' => bcrypt('Password1!'),
            'estado' => 'activo',
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);
    }

    private function createSession(Usuario $usuario, string $token): string
    {
        Sesion::create([
            'usuario_id' => $usuario->id,
            'token' => $token,
            'ip_usuario' => '127.0.0.1',
            'dispositivo' => 'PHPUnit',
            'fecha_inicio' => now(),
            'fecha_expiracion' => now()->addDay(),
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);

        return $token;
    }

    private function createPerfilConSesion(string $correo, string $token, string $slug = 'perfil-prueba'): array
    {
        $usuario = $this->createUsuario($correo);
        $sessionToken = $this->createSession($usuario, $token);

        $perfil = Perfil::create([
            'usuario_id' => $usuario->id,
            'nombres' => 'Maria',
            'apellidos' => 'Lopez Garcia',
            'nombre_completo' => 'Maria Lopez Garcia',
            'profesion' => 'Desarrolladora Backend',
            'titular_profesional' => 'Desarrolladora Backend',
            'biografia' => 'Perfil de prueba con informacion suficiente para las validaciones.',
            'es_publico' => true,
            'slug' => $slug,
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);

        return [$perfil, $sessionToken];
    }

    private function seedPublicProfiles(int $count): void
    {
        for ($index = 1; $index <= $count; $index++) {
            $usuario = $this->createUsuario("user{$index}@example.com");

            Perfil::create([
                'usuario_id' => $usuario->id,
                'nombres' => "Nombre {$index}",
                'apellidos' => "Apellido {$index}",
                'nombre_completo' => "Nombre {$index} Apellido {$index}",
                'profesion' => 'Desarrollador Full Stack',
                'titular_profesional' => 'Desarrollador Full Stack',
                'biografia' => "Biografia valida del perfil {$index}.",
                'es_publico' => true,
                'slug' => "perfil-{$index}",
                'creado_en' => now()->addSeconds($index),
                'actualizado_en' => now()->addSeconds($index),
            ]);
        }
    }
}
