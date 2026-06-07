<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Usuario::updateOrCreate(
            ['correo' => env('ADMIN_INITIAL_EMAIL', 'admin@portfoliopro.local')],
            [
                'nombre' => 'Administrador del Sistema',
                'contraseña' => Hash::make(env('ADMIN_INITIAL_PASSWORD', 'Admin12345!')),
                'rol' => 'admin',
                'estado' => 'activo',
                'debe_cambiar_contraseña' => false,
                'contraseña_temporal_expira_en' => null,
                'recuperacion_solicitada_en' => null,
                'correo_verificado_en' => now(),
                'creado_en' => now(),
                'actualizado_en' => now(),
            ]
        );
    }
}
