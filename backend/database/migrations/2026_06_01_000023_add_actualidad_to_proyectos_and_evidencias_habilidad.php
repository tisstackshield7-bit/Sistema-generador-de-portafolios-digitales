<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('proyectos') && !Schema::hasColumn('proyectos', 'actualidad')) {
            Schema::table('proyectos', function (Blueprint $table) {
                $table->boolean('actualidad')->default(false)->after('fecha_fin');
            });

            DB::table('proyectos')
                ->whereNull('fecha_fin')
                ->update(['actualidad' => true]);
        }

        if (Schema::hasTable('evidencias_habilidad') && !Schema::hasColumn('evidencias_habilidad', 'actualidad')) {
            Schema::table('evidencias_habilidad', function (Blueprint $table) {
                $table->boolean('actualidad')->default(false)->after('fecha');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('evidencias_habilidad') && Schema::hasColumn('evidencias_habilidad', 'actualidad')) {
            Schema::table('evidencias_habilidad', function (Blueprint $table) {
                $table->dropColumn('actualidad');
            });
        }

        if (Schema::hasTable('proyectos') && Schema::hasColumn('proyectos', 'actualidad')) {
            Schema::table('proyectos', function (Blueprint $table) {
                $table->dropColumn('actualidad');
            });
        }
    }
};
