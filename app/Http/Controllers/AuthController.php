<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users',
                'password' => 'required|min:6|confirmed',
                'username' => 'required|string|unique:users|alpha_dash'
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'username' => $validated['username'],
                'public_link' => Str::random(8)
            ]);

            return response()->json([
                'success' => true,
                'user' => $user,
                'message' => 'Registration successful'
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required'
            ]);

            // Ищем пользователя
            $user = User::where('email', $request->email)->first();
            
            // Отладочная информация
            $debug = [
                'email_provided' => $request->email,
                'user_found' => $user ? 'yes' : 'no',
                'user_id' => $user ? $user->id : null,
                'password_check' => $user ? (Hash::check($request->password, $user->password) ? 'true' : 'false') : 'n/a'
            ];
            
            Log::info('Login attempt', $debug);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                    'debug' => $debug
                ], 401);
            }

            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid password',
                    'debug' => $debug
                ], 401);
            }

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'username' => $user->username
                ],
                'message' => 'Login successful'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        return response()->json(['success' => true, 'message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
