<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('recuperaciones_contrasena')) {
            Schema::create('recuperaciones_contrasena', function (Blueprint $table) {
                $table->id();
                $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
                $table->string('token', 100)->unique();
                $table->timestamp('expira_en')->nullable();
                $table->boolean('usado')->default(false);
                $table->timestamp('creado_en')->nullable();
                $table->timestamp('actualizado_en')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('recuperaciones_contrasena');
    }
};
