<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('perfiles') && !Schema::hasColumn('perfiles', 'ubicacion')) {
            Schema::table('perfiles', function (Blueprint $table) {
                $table->string('ubicacion', 180)->nullable()->after('telefono');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('perfiles') && Schema::hasColumn('perfiles', 'ubicacion')) {
            Schema::table('perfiles', function (Blueprint $table) {
                $table->dropColumn('ubicacion');
            });
        }
    }
};
