<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperacion de contrasena - PortafolioPro</title>
</head>
<body style="margin:0;padding:0;background:#eef3fb;font-family:Arial,Helvetica,sans-serif;color:#1f2a44;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
        PortafolioPro - Usa este enlace para recuperar tu contrasena. Estara disponible durante {{ $expireMinutes }} minutos.
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#eef3fb;padding:24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(31,42,68,.08);">
                    <tr>
                        <td align="center" style="padding:28px 24px 12px;background:linear-gradient(180deg,#f7fbff 0%,#eef3fb 100%);">
                            <div style="display:inline-block;width:88px;height:88px;line-height:88px;border-radius:24px;background:linear-gradient(135deg,#67cdf4 0%,#2e57c8 100%);color:#ffffff;font-size:34px;font-weight:800;text-align:center;letter-spacing:-1px;">
                                PP
                            </div>
                            <div style="margin-top:12px;font-size:24px;line-height:1.2;font-weight:700;color:#0d1f4f;">PortafolioPro</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px 36px 36px;">
                            <div style="font-size:28px;line-height:1.25;font-weight:700;color:#0d1f4f;margin-bottom:16px;">Recuperacion de contrasena</div>
                            <div style="font-size:16px;line-height:1.7;color:#42526f;margin-bottom:14px;">
                                Hola,
                            </div>
                            <div style="font-size:16px;line-height:1.7;color:#42526f;margin-bottom:14px;">
                                Recibimos una solicitud para recuperar el acceso a tu cuenta en PortafolioPro.
                            </div>
                            <div style="font-size:16px;line-height:1.7;color:#42526f;margin-bottom:22px;">
                                Para continuar, usa el siguiente enlace de recuperacion:
                            </div>
                            <div style="margin-bottom:24px;">
                                <a href="{{ $resetUrl }}" style="display:inline-block;background:#1f4690;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 24px;border-radius:12px;">
                                    Ir al enlace de recuperacion
                                </a>
                            </div>
                            <div style="font-size:15px;line-height:1.7;color:#42526f;margin-bottom:10px;">
                                Este enlace estara disponible durante {{ $expireMinutes }} minutos.
                            </div>
                            <div style="font-size:15px;line-height:1.7;color:#42526f;margin-bottom:24px;">
                                Si no solicitaste este cambio, puedes ignorar este mensaje con seguridad.
                            </div>
                            <div style="padding-top:18px;border-top:1px solid #dfe7f4;font-size:13px;line-height:1.7;color:#66758f;word-break:break-all;">
                                Si el boton no funciona, copia y pega este enlace en tu navegador:<br>
                                <a href="{{ $resetUrl }}" style="color:#1f4690;text-decoration:none;">{{ $resetUrl }}</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
