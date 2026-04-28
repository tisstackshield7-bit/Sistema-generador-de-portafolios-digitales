<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('habilidades')) {
            return;
        }

        Schema::table('habilidades', function (Blueprint $table) {
            if (!Schema::hasColumn('habilidades', 'perfil_id')) {
                $table->foreignId('perfil_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('perfiles')
                    ->cascadeOnDelete();
            }

            if (!Schema::hasColumn('habilidades', 'categoria')) {
                $table->string('categoria', 100)->nullable()->after('nombre');
            }

            if (!Schema::hasColumn('habilidades', 'nivel_dominio')) {
                $table->string('nivel_dominio', 20)->default('basico')->after('categoria');
            }

            if (!Schema::hasColumn('habilidades', 'visible_publico')) {
                $table->boolean('visible_publico')->default(false)->after('nivel_dominio');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('habilidades')) {
            return;
        }

        Schema::table('habilidades', function (Blueprint $table) {
            if (Schema::hasColumn('habilidades', 'visible_publico')) {
                $table->dropColumn('visible_publico');
            }

            if (Schema::hasColumn('habilidades', 'nivel_dominio')) {
                $table->dropColumn('nivel_dominio');
            }

            if (Schema::hasColumn('habilidades', 'categoria')) {
                $table->dropColumn('categoria');
            }

            if (Schema::hasColumn('habilidades', 'perfil_id')) {
                $table->dropConstrainedForeignId('perfil_id');
            }
        });
    }
};
