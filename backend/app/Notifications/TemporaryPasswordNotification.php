<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TemporaryPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $temporaryPassword,
        private readonly int $expireMinutes
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->from((string) config('mail.from.address'), 'PortafolioPro')
            ->subject('PortafolioPro | Contrasena temporal de acceso')
            ->view('emails.temporary-password', [
                'temporaryPassword' => $this->temporaryPassword,
                'expireMinutes' => $this->expireMinutes,
            ]);
    }
}
