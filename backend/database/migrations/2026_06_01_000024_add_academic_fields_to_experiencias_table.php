<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('experiencias')) {
            Schema::table('experiencias', function (Blueprint $table) {
                if (!Schema::hasColumn('experiencias', 'subtipo_academico')) {
                    $table->string('subtipo_academico', 120)->nullable()->after('actualidad');
                }

                if (!Schema::hasColumn('experiencias', 'estado_academico')) {
                    $table->string('estado_academico', 40)->nullable()->after('subtipo_academico');
                }

                if (!Schema::hasColumn('experiencias', 'area_especializacion')) {
                    $table->string('area_especializacion', 180)->nullable()->after('estado_academico');
                }

                if (!Schema::hasColumn('experiencias', 'tipo_acreditacion')) {
                    $table->string('tipo_acreditacion', 40)->nullable()->after('area_especializacion');
                }

                if (!Schema::hasColumn('experiencias', 'cantidad_acreditacion')) {
                    $table->unsignedInteger('cantidad_acreditacion')->nullable()->after('tipo_acreditacion');
                }

                if (!Schema::hasColumn('experiencias', 'url_credencial')) {
                    $table->string('url_credencial', 255)->nullable()->after('cantidad_acreditacion');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('experiencias')) {
            Schema::table('experiencias', function (Blueprint $table) {
                $table->dropColumn([
                    'subtipo_academico',
                    'estado_academico',
                    'area_especializacion',
                    'tipo_acreditacion',
                    'cantidad_acreditacion',
                    'url_credencial',
                ]);
            });
        }
    }
};
