<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'category',
        'proficiency_level',
        'order',
    ];

    /**
     * Get the user that owns the skill.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Proficiency levels: beginner, intermediate, advanced, expert
     */
    const PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
}
