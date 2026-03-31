<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Experience extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'job_title',
        'company',
        'location',
        'start_date',
        'end_date',
        'is_current',
        'description',
        'company_logo_url',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_current' => 'boolean',
    ];

    /**
     * Get the user that owns the experience.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
