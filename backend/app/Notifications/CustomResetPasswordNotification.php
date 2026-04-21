<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $token,
        private readonly string $correo
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = rtrim((string) env('FRONTEND_URL', config('app.url')), '/');
        $resetUrl = "{$frontendUrl}/restablecer-contrasena/{$this->token}?correo=" . urlencode($this->correo);
        $expireMinutes = (int) config('auth.passwords.users.expire', 30);

        return (new MailMessage)
            ->from((string) config('mail.from.address'), 'PortafolioPro')
            ->subject('PortafolioPro | Recuperacion de contrasena')
            ->view('emails.password-recovery', [
                'resetUrl' => $resetUrl,
                'expireMinutes' => $expireMinutes,
            ]);
    }
}
