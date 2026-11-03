<?php
/**
 * Контроллер авторизации
 */

namespace App\Controllers;

use App\Auth;
use App\Database;
use App\RedisCache;

class AuthController
{
    private Auth $auth;

    public function __construct()
    {
        $this->auth = new Auth(Database::getInstance(), RedisCache::getInstance());
    }

    /**
     * POST /api/auth/login
     */
    public function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data || !isset($data['login']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Login and password required']);
            return;
        }

        $result = $this->auth->login($data['login'], $data['password']);

        if (!$result) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }

        echo json_encode([
            'success' => true,
            'token' => $result['token'],
            'user' => $result['user']
        ]);
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(): void
    {
        $token = $this->auth->getTokenFromHeader();
        
        if ($token) {
            $this->auth->logout($token);
        }

        echo json_encode(['success' => true]);
    }

    /**
     * GET /api/auth/check
     */
    public function check(): void
    {
        $token = $this->auth->getTokenFromHeader();

        if (!$token) {
            echo json_encode(['authenticated' => false]);
            return;
        }

        $user = $this->auth->check($token);

        if (!$user) {
            echo json_encode(['authenticated' => false]);
            return;
        }

        echo json_encode([
            'authenticated' => true,
            'user' => $user
        ]);
    }
}
