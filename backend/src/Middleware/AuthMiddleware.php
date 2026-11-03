<?php
/**
 * Middleware авторизации
 */

namespace App\Middleware;

use App\Auth;
use App\Database;
use App\RedisCache;

class AuthMiddleware
{
    public function handle(): bool
    {
        $auth = new Auth(Database::getInstance(), RedisCache::getInstance());
        $token = $auth->getTokenFromHeader();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized', 'message' => 'Token required']);
            return false;
        }

        $user = $auth->check($token);

        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized', 'message' => 'Invalid or expired token']);
            return false;
        }

        // Сохранение данных пользователя в глобальной области
        global $currentUser;
        $currentUser = $user;

        return true;
    }
}
