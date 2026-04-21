<?php

namespace App\Models;

use App\Notifications\CustomResetPasswordNotification;
use Illuminate\Auth\Authenticatable;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Notifications\Notifiable;

class Usuario extends Model implements AuthenticatableContract, CanResetPasswordContract
{
    use Authenticatable;
    use Authorizable;
    use CanResetPassword;
    use Notifiable;
    use SoftDeletes;

    protected $table = 'usuarios';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'correo',
        'contrasena',
        'debe_cambiar_contrasena',
        'contrasena_temporal_expira_en',
        'recuperacion_solicitada_en',
        'correo_verificado_en',
        'estado',
        'token_recordar',
    ];

    protected $hidden = [
        'contrasena',
        'token_recordar',
    ];

    public function perfil()
    {
        return $this->hasOne(Perfil::class, 'usuario_id');
    }

    public function getAuthPassword()
    {
        return $this->contrasena;
    }

    public function getEmailForPasswordReset()
    {
        return $this->correo;
    }

    public function routeNotificationForMail($notification = null): string
    {
        return $this->correo;
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new CustomResetPasswordNotification($token, $this->correo));
    }
}
