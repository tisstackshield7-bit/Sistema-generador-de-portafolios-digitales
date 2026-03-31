<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocialLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'platform',
        'url',
        'icon',
        'display_label',
    ];

    /**
     * Get the user that owns the social link.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Supported platforms: github, linkedin, twitter, instagram, facebook, youtube, codepen, dribbble, behance
     */
    const PLATFORMS = ['github', 'linkedin', 'twitter', 'instagram', 'facebook', 'youtube', 'codepen', 'dribbble', 'behance'];
}
