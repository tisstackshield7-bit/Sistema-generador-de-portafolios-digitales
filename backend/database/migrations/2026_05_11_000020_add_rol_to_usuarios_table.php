<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            if (!Schema::hasColumn('usuarios', 'rol')) {
                $table->string('rol', 20)->default('usuario')->after('contrasena');
            }
        });

        DB::table('usuarios')
            ->whereNull('rol')
            ->update(['rol' => 'usuario']);
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            if (Schema::hasColumn('usuarios', 'rol')) {
                $table->dropColumn('rol');
            }
        });
    }
};
