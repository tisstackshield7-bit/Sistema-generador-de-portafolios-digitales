<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('usuarios')) {
            Schema::create('usuarios', function (Blueprint $table) {
                $table->id();
                $table->string('nombre', 180)->nullable();
                $table->string('correo')->unique();
                $table->string('contrasena');
                $table->string('estado', 20)->default('activo');
                $table->string('token_recordar', 100)->nullable();
                $table->timestamp('correo_verificado_en')->nullable();
                $table->timestamp('creado_en')->nullable();
                $table->timestamp('actualizado_en')->nullable();
            });
        }

        if (!Schema::hasTable('perfiles')) {
            Schema::create('perfiles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('usuario_id')->unique()->constrained('usuarios')->cascadeOnDelete();
                $table->string('nombre_completo', 240);
                $table->string('profesion', 160)->nullable();
                $table->string('titular_profesional', 160)->nullable();
                $table->text('biografia')->nullable();
                $table->string('telefono', 40)->nullable();
                $table->string('pais', 100)->nullable();
                $table->string('ciudad', 100)->nullable();
                $table->string('foto_perfil')->nullable();
                $table->string('archivo_cv')->nullable();
                $table->boolean('es_publico')->default(true);
                $table->string('slug')->unique();
                $table->timestamp('creado_en')->nullable();
                $table->timestamp('actualizado_en')->nullable();
                $table->timestamp('eliminado_en')->nullable();
            });
        }

        if (!Schema::hasTable('sesiones')) {
            Schema::create('sesiones', function (Blueprint $table) {
                $table->id();
                $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
                $table->string('token', 100)->unique();
                $table->string('ip_usuario', 45)->nullable();
                $table->string('dispositivo')->nullable();
                $table->timestamp('fecha_inicio')->nullable();
                $table->timestamp('fecha_expiracion')->nullable();
                $table->timestamp('creado_en')->nullable();
                $table->timestamp('actualizado_en')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sesiones');
        Schema::dropIfExists('perfiles');
        Schema::dropIfExists('usuarios');
    }
};
