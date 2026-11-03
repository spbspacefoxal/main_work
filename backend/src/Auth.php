<?php
/**
 * Класс авторизации (JWT + Redis сессии)
 */

namespace App;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Auth
{
    private Database $db;
    private RedisCache $redis;
    private string $secret;
    private int $sessionTtl = 600; // 10 минут

    public function __construct(Database $db, RedisCache $redis)
    {
        $this->db = $db;
        $this->redis = $redis;
        $this->secret = getenv('APP_SECRET') ?: 'default_secret_change_me';
    }

    /**
     * Авторизация пользователя
     */
    public function login(string $login, string $password): ?array
    {
        // Поиск пользователя
        $user = $this->db->queryOne(
            "SELECT * FROM users WHERE login = ? AND is_active = TRUE",
            [$login]
        );

        if (!$user) {
            return null;
        }

        // Проверка пароля
        if (!password_verify($password, $user['password_hash'])) {
            return null;
        }

        // Генерация JWT токена
        $payload = [
            'iss' => 'pu-registrator',
            'sub' => $user['id'],
            'login' => $user['login'],
            'role' => $user['role'],
            'iat' => time(),
            'exp' => time() + $this->sessionTtl
        ];

        $token = JWT::encode($payload, $this->secret, 'HS256');

        // Сохранение сессии в Redis
        $sessionData = [
            'id' => $user['id'],
            'login' => $user['login'],
            'role' => $user['role'],
            'regions' => $user['regions'],
            'can_edit' => $user['can_edit'],
            'can_delete' => $user['can_delete'],
            'can_set_status' => $user['can_set_status'],
            'can_export' => $user['can_export'],
        ];

        $this->redis->setSession($token, $sessionData, $this->sessionTtl);

        return [
            'token' => $token,
            'user' => $sessionData
        ];
    }

    /**
     * Выход из системы
     */
    public function logout(string $token): bool
    {
        return $this->redis->deleteSession($token) > 0;
    }

    /**
     * Проверка токена и получение данных пользователя
     */
    public function check(string $token): ?array
    {
        // Проверка сессии в Redis
        $session = $this->redis->getSession($token);
        
        if ($session) {
            // Обновление TTL сессии
            $this->redis->refreshSession($token, $this->sessionTtl);
            return $session;
        }

        // Если сессии нет в Redis, проверяем JWT
        try {
            $decoded = JWT::decode($token, new Key($this->secret, 'HS256'));
            
            // Восстановление сессии из БД
            $user = $this->db->queryOne(
                "SELECT * FROM users WHERE id = ? AND is_active = TRUE",
                [$decoded->sub]
            );

            if (!$user) {
                return null;
            }

            $sessionData = [
                'id' => $user['id'],
                'login' => $user['login'],
                'role' => $user['role'],
                'regions' => $user['regions'],
                'can_edit' => $user['can_edit'],
                'can_delete' => $user['can_delete'],
                'can_set_status' => $user['can_set_status'],
                'can_export' => $user['can_export'],
            ];

            $this->redis->setSession($token, $sessionData, $this->sessionTtl);
            return $sessionData;

        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Получение токена из заголовка Authorization
     */
    public function getTokenFromHeader(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        
        if (preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Проверка прав пользователя
     */
    public function hasPermission(array $user, string $permission, ?string $region = null): bool
    {
        // Root имеет все права
        if ($user['role'] === 'root') {
            return true;
        }

        // Проверка региона
        if ($region && !in_array($region, $user['regions'])) {
            return false;
        }

        // Проверка конкретного права
        switch ($permission) {
            case 'edit':
                return $user['can_edit'];
            case 'delete':
                return $user['can_delete'];
            case 'set_status':
                return $user['can_set_status'];
            case 'export':
                return $user['can_export'];
            default:
                return false;
        }
    }
}
