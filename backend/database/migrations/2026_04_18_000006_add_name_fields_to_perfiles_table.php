<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('perfiles', function (Blueprint $table) {
            if (!Schema::hasColumn('perfiles', 'nombres')) {
                $table->string('nombres', 120)->nullable()->after('usuario_id');
            }

            if (!Schema::hasColumn('perfiles', 'apellidos')) {
                $table->string('apellidos', 120)->nullable()->after('nombres');
            }
        });
    }

    public function down(): void
    {
        Schema::table('perfiles', function (Blueprint $table) {
            if (Schema::hasColumn('perfiles', 'apellidos')) {
                $table->dropColumn('apellidos');
            }

            if (Schema::hasColumn('perfiles', 'nombres')) {
                $table->dropColumn('nombres');
            }
        });
    }
};
