<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            if (!Schema::hasColumn('usuarios', 'debe_cambiar_contrasena')) {
                $table->boolean('debe_cambiar_contrasena')->default(false)->after('contrasena');
            }

            if (!Schema::hasColumn('usuarios', 'contrasena_temporal_expira_en')) {
                $table->timestamp('contrasena_temporal_expira_en')->nullable()->after('debe_cambiar_contrasena');
            }

            if (!Schema::hasColumn('usuarios', 'recuperacion_solicitada_en')) {
                $table->timestamp('recuperacion_solicitada_en')->nullable()->after('contrasena_temporal_expira_en');
            }
        });
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $columns = [
                'debe_cambiar_contrasena',
                'contrasena_temporal_expira_en',
                'recuperacion_solicitada_en',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('usuarios', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
