<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            if (!Schema::hasColumn('usuarios', 'debe_cambiar_contraseña')) {
                $table->boolean('debe_cambiar_contraseña')->default(false)->after('contraseña');
            }

            if (!Schema::hasColumn('usuarios', 'contraseña_temporal_expira_en')) {
                $table->timestamp('contraseña_temporal_expira_en')->nullable()->after('debe_cambiar_contraseña');
            }

            if (!Schema::hasColumn('usuarios', 'recuperacion_solicitada_en')) {
                $table->timestamp('recuperacion_solicitada_en')->nullable()->after('contraseña_temporal_expira_en');
            }
        });
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $columns = [
                'debe_cambiar_contraseña',
                'contraseña_temporal_expira_en',
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
