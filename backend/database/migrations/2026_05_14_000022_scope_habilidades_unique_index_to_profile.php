<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('habilidades')) {
            return;
        }

        DB::statement('ALTER TABLE habilidades DROP CONSTRAINT IF EXISTS habilidades_nombre_tipo_categoria_unique');
        DB::statement('DROP INDEX IF EXISTS habilidades_nombre_tipo_categoria_unique');
        DB::statement(
            'CREATE UNIQUE INDEX IF NOT EXISTS habilidades_perfil_nombre_tipo_categoria_unique
            ON habilidades (perfil_id, nombre, tipo, categoria)'
        );
    }

    public function down(): void
    {
        if (!Schema::hasTable('habilidades')) {
            return;
        }

        DB::statement('DROP INDEX IF EXISTS habilidades_perfil_nombre_tipo_categoria_unique');
        DB::statement('ALTER TABLE habilidades DROP CONSTRAINT IF EXISTS habilidades_perfil_nombre_tipo_categoria_unique');
        DB::statement(
            'ALTER TABLE habilidades
            ADD CONSTRAINT habilidades_nombre_tipo_categoria_unique UNIQUE (nombre, tipo, categoria)'
        );
    }
};
