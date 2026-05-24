<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('habilidades')) {
            Schema::create('habilidades', function (Blueprint $table) {
                $table->id();
                $table->foreignId('perfil_id')->constrained('perfiles')->cascadeOnDelete();
                $table->string('tipo', 20);
                $table->string('nombre', 150);
                $table->string('categoria', 100)->nullable();
                $table->string('nivel_dominio', 20);
                $table->boolean('visible_publico')->default(false);
                $table->timestamp('creado_en')->nullable();
                $table->timestamp('actualizado_en')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('habilidades');
    }
};
