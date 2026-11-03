<?php
/**
 * Конфигурация Redis
 */

return [
    'host' => getenv('REDIS_HOST') ?: 'redis',
    'port' => (int)(getenv('REDIS_PORT') ?: 6379),
    'password' => getenv('REDIS_PASSWORD') ?: null,
    'database' => 0,
    'options' => [
        Redis::OPT_SERIALIZER => Redis::SERIALIZER_JSON,
    ],
    'session_ttl' => 600, // 10 минут
    'cache_ttl' => 60,    // 1 минута
];
