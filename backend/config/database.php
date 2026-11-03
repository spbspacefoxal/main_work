<?php
/**
 * Конфигурация базы данных PostgreSQL
 */

return [
    'driver' => 'pgsql',
    'host' => getenv('DB_HOST') ?: 'postgres',
    'port' => getenv('DB_PORT') ?: '5432',
    'database' => getenv('DB_NAME') ?: 'registrator',
    'username' => getenv('DB_USER') ?: 'registrator',
    'password' => getenv('DB_PASSWORD') ?: 'registrator_secret_2026',
    'charset' => 'utf8',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ],
];
