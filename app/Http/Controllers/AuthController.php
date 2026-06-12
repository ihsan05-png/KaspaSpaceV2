<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'phone'    => ['required', 'string', 'regex:/^0[0-9]{8,13}$/'],
            'password' => ['required', Password::min(8)],
        ], [
            'name.required'     => 'Nama lengkap wajib diisi.',
            'email.required'    => 'Email wajib diisi.',
            'email.unique'      => 'Email ini sudah terdaftar.',
            'phone.required'    => 'Nomor WhatsApp wajib diisi.',
            'phone.regex'       => 'Format nomor tidak valid. Gunakan format 08xxxxxxxxxx.',
            'password.required' => 'Kata sandi wajib diisi.',
        ]);

        $user = User::create([...$data, 'role' => 'user']);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['user' => $user], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ], [
            'email.required'    => 'Email wajib diisi.',
            'password.required' => 'Kata sandi wajib diisi.',
        ]);

        $remember = $request->boolean('remember');

        if (! Auth::attempt($credentials, $remember)) {
            return response()->json([
                'message' => 'Email atau kata sandi salah.',
                'errors'  => ['email' => ['Email atau kata sandi salah.']],
            ], 422);
        }

        $request->session()->regenerate();

        return response()->json(['user' => Auth::user()]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Berhasil keluar.']);
    }

    public function user(): JsonResponse
    {
        return response()->json(['user' => Auth::user()]);
    }
}
