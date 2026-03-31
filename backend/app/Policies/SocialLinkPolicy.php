<?php

namespace App\Policies;

use App\Models\SocialLink;
use App\Models\User;

class SocialLinkPolicy
{
    /**
     * Determine if the user can update the social link.
     */
    public function update(User $user, SocialLink $socialLink): bool
    {
        return $user->id === $socialLink->user_id;
    }

    /**
     * Determine if the user can delete the social link.
     */
    public function delete(User $user, SocialLink $socialLink): bool
    {
        return $user->id === $socialLink->user_id;
    }
}
