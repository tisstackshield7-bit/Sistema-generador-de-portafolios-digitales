<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('social_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('platform', [
                'github',
                'linkedin',
                'twitter',
                'instagram',
                'facebook',
                'youtube',
                'codepen',
                'dribbble',
                'behance'
            ]);
            $table->string('url');
            $table->string('icon')->nullable();
            $table->string('display_label')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('platform');
            $table->unique(['user_id', 'platform']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_links');
    }
};
