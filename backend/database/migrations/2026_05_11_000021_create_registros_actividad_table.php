<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registros_actividad', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('usuario_id')->nullable();
            $table->string('actor_nombre', 160)->nullable();
            $table->string('actor_correo', 160)->nullable();
            $table->string('actor_rol', 20)->nullable();
            $table->string('categoria', 50);
            $table->string('tipo', 80);
            $table->string('descripcion', 255);
            $table->string('ip_usuario', 45)->nullable();
            $table->string('entidad_tipo', 80)->nullable();
            $table->unsignedBigInteger('entidad_id')->nullable();
            $table->json('meta')->nullable();
            $table->timestamp('creado_en')->useCurrent();

            $table->index('usuario_id');
            $table->index('categoria');
            $table->index('tipo');
            $table->index('creado_en');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registros_actividad');
    }
};
