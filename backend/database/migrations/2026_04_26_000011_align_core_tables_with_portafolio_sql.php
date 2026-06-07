<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $isPostgres = DB::connection()->getDriverName() === 'pgsql';

        if (Schema::hasTable('usuarios')) {
            if (Schema::hasColumn('usuarios', 'estado')) {
                DB::statement("UPDATE usuarios SET estado = 'activo' WHERE estado IS NULL");

                if ($isPostgres) {
                    DB::statement("ALTER TABLE usuarios ALTER COLUMN estado SET DEFAULT 'activo'");
                    DB::statement('ALTER TABLE usuarios ALTER COLUMN estado SET NOT NULL');
                }
            }
        }

        if (Schema::hasTable('perfiles')) {
            if (Schema::hasColumn('perfiles', 'profesion')) {
                DB::statement("UPDATE perfiles SET profesion = COALESCE(titular_profesional, 'Sin profesion') WHERE profesion IS NULL");

                if ($isPostgres) {
                    DB::statement('ALTER TABLE perfiles ALTER COLUMN profesion SET NOT NULL');
                }
            }

            if (Schema::hasColumn('perfiles', 'biografia')) {
                DB::statement("UPDATE perfiles SET biografia = 'Sin biografia' WHERE biografia IS NULL");

                if ($isPostgres) {
                    DB::statement('ALTER TABLE perfiles ALTER COLUMN biografia SET NOT NULL');
                }
            }

            if (Schema::hasColumn('perfiles', 'es_publico')) {
                DB::statement('UPDATE perfiles SET es_publico = true WHERE es_publico IS NULL');

                if ($isPostgres) {
                    DB::statement('ALTER TABLE perfiles ALTER COLUMN es_publico SET DEFAULT true');
                    DB::statement('ALTER TABLE perfiles ALTER COLUMN es_publico SET NOT NULL');
                }
            }
        }

        if (Schema::hasTable('habilidades')) {
            if (Schema::hasColumn('habilidades', 'perfil_id')) {
                if ($isPostgres) {
                    DB::table('habilidades')->whereNull('perfil_id')->delete();
                    DB::statement('ALTER TABLE habilidades ALTER COLUMN perfil_id SET NOT NULL');
                }
            }

            if (Schema::hasColumn('habilidades', 'visible_publico')) {
                DB::statement('UPDATE habilidades SET visible_publico = false WHERE visible_publico IS NULL');

                if ($isPostgres) {
                    DB::statement('ALTER TABLE habilidades ALTER COLUMN visible_publico SET DEFAULT false');
                    DB::statement('ALTER TABLE habilidades ALTER COLUMN visible_publico SET NOT NULL');
                }
            }
        }

        if (Schema::hasTable('recuperaciones_contraseña') && Schema::hasColumn('recuperaciones_contraseña', 'usado')) {
            DB::statement('UPDATE recuperaciones_contraseña SET usado = false WHERE usado IS NULL');

            if ($isPostgres) {
                DB::statement('ALTER TABLE recuperaciones_contraseña ALTER COLUMN usado SET DEFAULT false');
                DB::statement('ALTER TABLE recuperaciones_contraseña ALTER COLUMN usado SET NOT NULL');
            }
        }
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'pgsql') {
            return;
        }

        if (Schema::hasTable('recuperaciones_contraseña') && Schema::hasColumn('recuperaciones_contraseña', 'usado')) {
            DB::statement('ALTER TABLE recuperaciones_contraseña ALTER COLUMN usado DROP NOT NULL');
        }

        if (Schema::hasTable('habilidades')) {
            if (Schema::hasColumn('habilidades', 'visible_publico')) {
                DB::statement('ALTER TABLE habilidades ALTER COLUMN visible_publico DROP NOT NULL');
            }

            if (Schema::hasColumn('habilidades', 'perfil_id')) {
                DB::statement('ALTER TABLE habilidades ALTER COLUMN perfil_id DROP NOT NULL');
            }
        }

        if (Schema::hasTable('perfiles')) {
            if (Schema::hasColumn('perfiles', 'es_publico')) {
                DB::statement('ALTER TABLE perfiles ALTER COLUMN es_publico DROP NOT NULL');
            }

            if (Schema::hasColumn('perfiles', 'biografia')) {
                DB::statement('ALTER TABLE perfiles ALTER COLUMN biografia DROP NOT NULL');
            }

            if (Schema::hasColumn('perfiles', 'profesion')) {
                DB::statement('ALTER TABLE perfiles ALTER COLUMN profesion DROP NOT NULL');
            }
        }

        if (Schema::hasTable('usuarios') && Schema::hasColumn('usuarios', 'estado')) {
            DB::statement('ALTER TABLE usuarios ALTER COLUMN estado DROP NOT NULL');
        }
    }
};
