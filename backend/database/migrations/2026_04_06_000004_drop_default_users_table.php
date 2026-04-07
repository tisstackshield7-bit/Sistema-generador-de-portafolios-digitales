<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Drop the unused default Laravel users table.
     */
    public function up(): void
    {
        if (Schema::hasTable('users')) {
            Schema::drop('users');
        }
    }

    /**
     * Recreate the table with the minimal default columns
     * in case a rollback is needed.
     */
    public function down(): void
    {
        if (!Schema::hasTable('users')) {
            Schema::create('users', function ($table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->rememberToken();
                $table->timestamps();
            });
        }
    }
};
