<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Sesion;
use App\Models\Usuario;
use App\Support\ActivityLogger;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $usuario = Usuario::create([
            'nombre' => null,
            'correo' => $request->correo,
            'contrasena' => Hash::make($request->contrasena),
            'rol' => 'usuario',
            'estado' => 'activo',
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);

        $sesion = $this->createSession($usuario, $request);

        return response()->json([
            'message' => 'Registro exitoso.',
            'usuario_id' => $usuario->id,
            'redirect_to' => '/perfil/crear',
            'token' => $sesion->token,
            'usuario' => [
                'id' => $usuario->id,
                'nombre' => $usuario->nombre,
                'correo' => $usuario->correo,
                'rol' => $usuario->rol,
                'estado' => $usuario->estado,
            ],
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $usuario = Usuario::with('perfil')->where('correo', $request->correo)->first();

        if (!$usuario || !Hash::check($request->contrasena, $usuario->contrasena)) {
            return response()->json([
                'message' => 'Credenciales incorrectas.'
            ], 422);
        }

        if ($usuario->estado !== 'activo') {
            return response()->json([
                'message' => 'La cuenta se encuentra bloqueada. Contacte al administrador.',
            ], 403);
        }

        if ($usuario->debe_cambiar_contrasena && $usuario->contrasena_temporal_expira_en && Carbon::parse($usuario->contrasena_temporal_expira_en)->isPast()) {
            return response()->json([
                'message' => 'La contrasena temporal expiro. Solicita una nueva recuperacion.',
            ], 403);
        }

        $sesion = $this->createSession($usuario, $request);

        $requiereCambio = (bool) $usuario->debe_cambiar_contrasena;
        $redirectTo = null;

        if ($requiereCambio) {
            $redirectTo = '/perfil/cambiar-contrasena';
        } elseif ($usuario->rol === 'admin') {
            $redirectTo = '/admin/dashboard';
        } elseif ($usuario->rol !== 'admin' && !$usuario->perfil) {
            $redirectTo = '/perfil/crear';
        }

        ActivityLogger::log(
            $request,
            $usuario,
            'autenticacion',
            'inicio_sesion',
            $usuario->rol === 'admin' ? 'Inicio de sesion como administrador.' : 'Inicio de sesion exitoso.'
        );

        return response()->json([
            'message' => 'Inicio de sesion exitoso.',
            'token' => $sesion->token,
            'requiere_cambio_contrasena' => $requiereCambio,
            'redirect_to' => $redirectTo,
            'usuario' => [
                'id' => $usuario->id,
                'nombre' => $usuario->nombre,
                'correo' => $usuario->correo,
                'rol' => $usuario->rol,
                'estado' => $usuario->estado,
                'debe_cambiar_contrasena' => $requiereCambio,
            ],
        ]);
    }

    public function redirectToGoogle(Request $request)
    {
        $clientId = env('GOOGLE_CLIENT_ID');
        $clientSecret = env('GOOGLE_CLIENT_SECRET');

        if (!$clientId || !$clientSecret) {
            return $this->redirectWithFrontendError('/login', 'Google no esta configurado en el servidor.');
        }

        $intent = $request->query('intent') === 'register' ? 'register' : 'login';
        $state = Crypt::encryptString(json_encode([
            'intent' => $intent,
            'issued_at' => now()->timestamp,
        ]));

        $query = http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $this->googleRedirectUri(),
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'online',
            'prompt' => 'select_account',
            'state' => $state,
        ]);

        return redirect()->away('https://accounts.google.com/o/oauth2/v2/auth?' . $query);
    }

    public function handleGoogleCallback(Request $request)
    {
        $statePath = $this->resolveFrontendPathFromState((string) $request->query('state'));

        if ($request->filled('error')) {
            return $this->redirectWithFrontendError($statePath, 'No se pudo completar el acceso con Google.');
        }

        $clientId = env('GOOGLE_CLIENT_ID');
        $clientSecret = env('GOOGLE_CLIENT_SECRET');

        if (!$clientId || !$clientSecret) {
            return $this->redirectWithFrontendError($statePath, 'Google no esta configurado en el servidor.');
        }

        try {
            $statePayload = json_decode(Crypt::decryptString((string) $request->query('state')), true, 512, JSON_THROW_ON_ERROR);
        } catch (Throwable) {
            return $this->redirectWithFrontendError('/login', 'La solicitud de Google no es valida.');
        }

        if (!$request->filled('code')) {
            return $this->redirectWithFrontendError($statePath, 'Google no devolvio un codigo de acceso valido.');
        }

        $tokenResponse = $this->googleHttpClient()->asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => (string) $request->query('code'),
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'redirect_uri' => $this->googleRedirectUri(),
            'grant_type' => 'authorization_code',
        ]);

        if (!$tokenResponse->successful() || !$tokenResponse->json('access_token')) {
            return $this->redirectWithFrontendError($statePath, 'No se pudo validar la cuenta de Google.');
        }

        $googleUserResponse = $this->googleHttpClient()
            ->withToken($tokenResponse->json('access_token'))
            ->get('https://openidconnect.googleapis.com/v1/userinfo');

        if (!$googleUserResponse->successful()) {
            return $this->redirectWithFrontendError($statePath, 'No se pudieron obtener los datos de Google.');
        }

        $googleUser = $googleUserResponse->json();
        $correo = trim((string) ($googleUser['email'] ?? ''));
        $nombre = trim((string) ($googleUser['name'] ?? ''));
        $emailVerified = (bool) ($googleUser['email_verified'] ?? false);

        if ($correo === '' || !$emailVerified) {
            return $this->redirectWithFrontendError($statePath, 'Tu cuenta de Google debe tener un correo verificado.');
        }

        $usuario = Usuario::with('perfil')->where('correo', $correo)->first();

        if (!$usuario) {
            $usuario = Usuario::create([
                'nombre' => $nombre !== '' ? $nombre : null,
                'correo' => $correo,
                'contrasena' => Hash::make(Str::random(40)),
                'rol' => 'usuario',
                'estado' => 'activo',
                'correo_verificado_en' => now(),
                'creado_en' => now(),
                'actualizado_en' => now(),
            ]);

            $usuario->load('perfil');
        } else {
            if ($usuario->nombre === null && $nombre !== '') {
                $usuario->nombre = $nombre;
            }

            if (!$usuario->correo_verificado_en) {
                $usuario->correo_verificado_en = now();
            }

            $usuario->actualizado_en = now();
            $usuario->save();
        }

        if ($usuario->estado !== 'activo') {
            return $this->redirectWithFrontendError($statePath, 'La cuenta se encuentra bloqueada. Contacte al administrador.');
        }

        $sesion = $this->createSession($usuario, $request);
        $redirectTo = $this->resolveRedirectAfterSocialAuth($usuario);
        $intent = $statePayload['intent'] ?? 'login';

        ActivityLogger::log(
            $request,
            $usuario,
            'autenticacion',
            'inicio_sesion_google',
            $intent === 'register' ? 'Registro e inicio de sesion con Google.' : 'Inicio de sesion con Google.'
        );

        return redirect()->away($this->frontendUrl() . '/auth/google/callback?' . http_build_query([
            'token' => $sesion->token,
            'redirect_to' => $redirectTo,
            'message' => $intent === 'register' ? 'Registro exitoso con Google.' : 'Inicio de sesion exitoso con Google.',
        ]));
    }

    public function redirectToGithub(Request $request)
    {
        $clientId = env('GITHUB_CLIENT_ID');
        $clientSecret = env('GITHUB_CLIENT_SECRET');

        if (!$clientId || !$clientSecret) {
            return $this->redirectWithFrontendProviderError('/login', 'github', 'GitHub no esta configurado en el servidor.');
        }

        $intent = $request->query('intent') === 'register' ? 'register' : 'login';
        $state = Crypt::encryptString(json_encode([
            'intent' => $intent,
            'issued_at' => now()->timestamp,
        ]));

        $query = http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $this->githubRedirectUri(),
            'scope' => 'read:user user:email',
            'state' => $state,
        ]);

        return redirect()->away('https://github.com/login/oauth/authorize?' . $query);
    }

    public function handleGithubCallback(Request $request)
    {
        $statePath = $this->resolveFrontendPathFromState((string) $request->query('state'));

        if ($request->filled('error')) {
            return $this->redirectWithFrontendProviderError($statePath, 'github', 'No se pudo completar el acceso con GitHub.');
        }

        $clientId = env('GITHUB_CLIENT_ID');
        $clientSecret = env('GITHUB_CLIENT_SECRET');

        if (!$clientId || !$clientSecret) {
            return $this->redirectWithFrontendProviderError($statePath, 'github', 'GitHub no esta configurado en el servidor.');
        }

        try {
            $statePayload = json_decode(Crypt::decryptString((string) $request->query('state')), true, 512, JSON_THROW_ON_ERROR);
        } catch (Throwable) {
            return $this->redirectWithFrontendProviderError('/login', 'github', 'La solicitud de GitHub no es valida.');
        }

        if (!$request->filled('code')) {
            return $this->redirectWithFrontendProviderError($statePath, 'github', 'GitHub no devolvio un codigo de acceso valido.');
        }

        $tokenResponse = $this->githubHttpClient()->asForm()->post('https://github.com/login/oauth/access_token', [
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'code' => (string) $request->query('code'),
            'redirect_uri' => $this->githubRedirectUri(),
            'state' => (string) $request->query('state'),
        ]);

        if (!$tokenResponse->successful() || !$tokenResponse->json('access_token')) {
            return $this->redirectWithFrontendProviderError($statePath, 'github', 'No se pudo validar la cuenta de GitHub.');
        }

        $accessToken = (string) $tokenResponse->json('access_token');

        $githubUserResponse = $this->githubHttpClient()
            ->withToken($accessToken)
            ->get('https://api.github.com/user');

        if (!$githubUserResponse->successful()) {
            return $this->redirectWithFrontendProviderError($statePath, 'github', 'No se pudieron obtener los datos de GitHub.');
        }

        $githubUser = $githubUserResponse->json();
        $correo = trim((string) ($githubUser['email'] ?? ''));
        $nombre = trim((string) ($githubUser['name'] ?? $githubUser['login'] ?? ''));

        if ($correo === '') {
            $emailsResponse = $this->githubHttpClient()
                ->withToken($accessToken)
                ->get('https://api.github.com/user/emails');

            if ($emailsResponse->successful()) {
                $primaryEmail = collect($emailsResponse->json())
                    ->first(fn ($email) => ($email['primary'] ?? false) && ($email['verified'] ?? false));

                if (!$primaryEmail) {
                    $primaryEmail = collect($emailsResponse->json())
                        ->first(fn ($email) => ($email['verified'] ?? false));
                }

                $correo = trim((string) ($primaryEmail['email'] ?? ''));
            }
        }

        if ($correo === '') {
            return $this->redirectWithFrontendProviderError($statePath, 'github', 'Tu cuenta de GitHub debe exponer un correo verificado.');
        }

        $usuario = Usuario::with('perfil')->where('correo', $correo)->first();

        if (!$usuario) {
            $usuario = Usuario::create([
                'nombre' => $nombre !== '' ? $nombre : null,
                'correo' => $correo,
                'contrasena' => Hash::make(Str::random(40)),
                'rol' => 'usuario',
                'estado' => 'activo',
                'correo_verificado_en' => now(),
                'creado_en' => now(),
                'actualizado_en' => now(),
            ]);

            $usuario->load('perfil');
        } else {
            if ($usuario->nombre === null && $nombre !== '') {
                $usuario->nombre = $nombre;
            }

            if (!$usuario->correo_verificado_en) {
                $usuario->correo_verificado_en = now();
            }

            $usuario->actualizado_en = now();
            $usuario->save();
        }

        if ($usuario->estado !== 'activo') {
            return $this->redirectWithFrontendProviderError($statePath, 'github', 'La cuenta se encuentra bloqueada. Contacte al administrador.');
        }

        $sesion = $this->createSession($usuario, $request);
        $redirectTo = $this->resolveRedirectAfterSocialAuth($usuario);
        $intent = $statePayload['intent'] ?? 'login';

        ActivityLogger::log(
            $request,
            $usuario,
            'autenticacion',
            'inicio_sesion_github',
            $intent === 'register' ? 'Registro e inicio de sesion con GitHub.' : 'Inicio de sesion con GitHub.'
        );

        return redirect()->away($this->frontendUrl() . '/auth/github/callback?' . http_build_query([
            'token' => $sesion->token,
            'redirect_to' => $redirectTo,
            'message' => $intent === 'register' ? 'Registro exitoso con GitHub.' : 'Inicio de sesion exitoso con GitHub.',
        ]));
    }

    public function me(Request $request)
    {
        $usuario = $request->attributes->get('auth_usuario');

        return response()->json([
            'usuario' => $usuario,
        ]);
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        /** @var Usuario $usuario */
        $usuario = $request->attributes->get('auth_usuario');

        if (!Hash::check($request->contrasena_actual, $usuario->contrasena)) {
            return response()->json([
                'message' => 'La contrasena actual no es correcta.',
            ], 422);
        }

        $usuario->contrasena = Hash::make($request->contrasena_nueva);
        $usuario->debe_cambiar_contrasena = false;
        $usuario->contrasena_temporal_expira_en = null;
        $usuario->recuperacion_solicitada_en = null;
        $usuario->actualizado_en = now();
        $usuario->save();

        $sesionActual = $request->attributes->get('auth_sesion');

        $this->invalidateUserSessions($usuario->id, $sesionActual?->id);

        ActivityLogger::log(
            $request,
            $usuario,
            'autenticacion',
            'cambio_contrasena',
            'Cambio de contrasena realizado correctamente.'
        );

        return response()->json([
            'message' => 'Contrasena actualizada correctamente.',
            'usuario' => [
                'id' => $usuario->id,
                'nombre' => $usuario->nombre,
                'correo' => $usuario->correo,
                'rol' => $usuario->rol,
                'estado' => $usuario->estado,
                'debe_cambiar_contrasena' => false,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $sesion = $request->attributes->get('auth_sesion');
        $usuario = $request->attributes->get('auth_usuario');

        ActivityLogger::log(
            $request,
            $usuario,
            'autenticacion',
            'cierre_sesion',
            'Cierre de sesion realizado.'
        );

        if ($sesion) {
            $sesion->delete();
        }

        return response()->json([
            'message' => 'Sesion cerrada correctamente.'
        ]);
    }

    private function createSession(Usuario $usuario, Request $request): Sesion
    {
        return Sesion::create([
            'usuario_id' => $usuario->id,
            'token' => Str::random(80),
            'ip_usuario' => $request->ip(),
            'dispositivo' => substr((string) $request->userAgent(), 0, 255),
            'fecha_inicio' => now(),
            'fecha_expiracion' => Carbon::now()->addDays(7),
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);
    }

    private function invalidateUserSessions(int $usuarioId, ?int $exceptSessionId = null): void
    {
        $query = Sesion::where('usuario_id', $usuarioId);

        if ($exceptSessionId) {
            $query->where('id', '!=', $exceptSessionId);
        }

        $query->delete();
    }

    private function frontendUrl(): string
    {
        return rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/');
    }

    private function googleRedirectUri(): string
    {
        return rtrim((string) env('APP_URL', 'http://127.0.0.1:8000'), '/') . '/api/auth/google/callback';
    }

    private function githubRedirectUri(): string
    {
        return rtrim((string) env('APP_URL', 'http://127.0.0.1:8000'), '/') . '/api/auth/github/callback';
    }

    private function redirectWithFrontendError(string $path, string $message)
    {
        return redirect()->away($this->frontendUrl() . $path . '?' . http_build_query([
            'google_error' => $message,
        ]));
    }

    private function redirectWithFrontendProviderError(string $path, string $provider, string $message)
    {
        return redirect()->away($this->frontendUrl() . $path . '?' . http_build_query([
            "{$provider}_error" => $message,
        ]));
    }

    private function resolveRedirectAfterSocialAuth(Usuario $usuario): string
    {
        if ($usuario->rol === 'admin') {
            return '/admin/dashboard';
        }

        if (!$usuario->perfil) {
            return '/perfil/crear';
        }

        return '/dashboard';
    }

    private function googleHttpClient()
    {
        $client = Http::acceptJson();

        // En algunos entornos locales de Windows falta la cadena CA del PHP y
        // Google devuelve cURL error 60. Solo relajamos SSL en local para pruebas.
        if (app()->environment('local')) {
            $client = $client->withoutVerifying();
        }

        return $client;
    }

    private function githubHttpClient()
    {
        $client = Http::acceptJson()->withHeaders([
            'Accept' => 'application/json',
            'User-Agent' => 'PortaFolioPro',
        ]);

        if (app()->environment('local')) {
            $client = $client->withoutVerifying();
        }

        return $client;
    }

    private function resolveFrontendPathFromState(string $state): string
    {
        if ($state === '') {
            return '/login';
        }

        try {
            $payload = json_decode(Crypt::decryptString($state), true, 512, JSON_THROW_ON_ERROR);
        } catch (Throwable) {
            return '/login';
        }

        return ($payload['intent'] ?? 'login') === 'register' ? '/register' : '/login';
    }
}
