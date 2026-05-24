<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('proyectos')) {
            Schema::create('proyectos', function (Blueprint $table) {
                $table->id();
                $table->foreignId('perfil_id')->constrained('perfiles')->cascadeOnDelete();
                $table->string('titulo', 180);
                $table->string('rol', 150);
                $table->text('descripcion');
                $table->date('fecha_inicio');
                $table->date('fecha_fin')->nullable();
                $table->json('tecnologias');
                $table->json('logros')->nullable();
                $table->string('enlace_proyecto')->nullable();
                $table->string('url_imagen')->nullable();
                $table->boolean('visible_publico')->default(false);
                $table->timestamp('creado_en')->nullable();
                $table->timestamp('actualizado_en')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('proyectos');
    }
};
