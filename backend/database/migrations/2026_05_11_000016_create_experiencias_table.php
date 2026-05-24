<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('experiencias')) {
            Schema::create('experiencias', function (Blueprint $table) {
                $table->id();
                $table->foreignId('perfil_id')->constrained('perfiles')->cascadeOnDelete();
                $table->string('tipo', 20);
                $table->string('titulo', 180);
                $table->string('institucion', 180);
                $table->string('ubicacion', 180)->nullable();
                $table->text('descripcion')->nullable();
                $table->date('fecha_inicio');
                $table->date('fecha_fin')->nullable();
                $table->boolean('actualidad')->default(false);
                $table->json('logros')->nullable();
                $table->string('enlace')->nullable();
                $table->boolean('visible_publico')->default(false);
                $table->timestamp('creado_en')->nullable();
                $table->timestamp('actualizado_en')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('experiencias');
    }
};
