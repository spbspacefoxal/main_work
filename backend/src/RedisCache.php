<?php
/**
 * Класс для работы с Redis (кэш и сессии)
 */

namespace App;

use Redis;
use RedisException;

class RedisCache
{
    private Redis $redis;
    private static ?RedisCache $instance = null;

    public function __construct()
    {
        $this->connect();
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function connect(): void
    {
        $host = getenv('REDIS_HOST') ?: 'redis';
        $port = (int)(getenv('REDIS_PORT') ?: 6379);

        try {
            $this->redis = new Redis();
            $this->redis->connect($host, $port);
            $this->redis->setOption(Redis::OPT_SERIALIZER, Redis::SERIALIZER_JSON);
        } catch (RedisException $e) {
            throw new \Exception("Redis connection failed: " . $e->getMessage());
        }
    }

    public function getRedis(): Redis
    {
        return $this->redis;
    }

    // Кэширование
    public function get(string $key): mixed
    {
        return $this->redis->get($key);
    }

    public function set(string $key, mixed $value, int $ttl = 3600): bool
    {
        return $this->redis->setex($key, $ttl, $value);
    }

    public function delete(string $key): int
    {
        return $this->redis->del($key);
    }

    public function exists(string $key): bool
    {
        return (bool)$this->redis->exists($key);
    }

    // Сессии пользователей
    public function setSession(string $token, array $userData, int $ttl = 600): bool
    {
        return $this->redis->setex("session:{$token}", $ttl, $userData);
    }

    public function getSession(string $token): ?array
    {
        $data = $this->redis->get("session:{$token}");
        return $data ?: null;
    }

    public function deleteSession(string $token): int
    {
        return $this->redis->del("session:{$token}");
    }

    public function refreshSession(string $token, int $ttl = 600): bool
    {
        return $this->redis->expire("session:{$token}", $ttl);
    }

    // Кэш запросов
    public function cacheQuery(string $key, callable $callback, int $ttl = 60): mixed
    {
        $cached = $this->get("cache:{$key}");
        if ($cached !== false) {
            return $cached;
        }

        $result = $callback();
        $this->set("cache:{$key}", $result, $ttl);
        return $result;
    }

    // Очистка кэша
    public function clearCache(string $pattern = 'cache:*'): int
    {
        $keys = $this->redis->keys($pattern);
        if (empty($keys)) {
            return 0;
        }
        return $this->redis->del($keys);
    }

    // Статистика
    public function increment(string $key): int
    {
        return $this->redis->incr($key);
    }

    public function getStats(): array
    {
        return $this->redis->info();
    }
}
