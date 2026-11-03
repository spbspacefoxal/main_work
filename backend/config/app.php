<?php
/**
 * Конфигурация приложения
 */

return [
    'name' => 'ПУ-Регистратор 2.0',
    'version' => '2.0.0',
    'env' => getenv('APP_ENV') ?: 'production',
    'debug' => getenv('APP_DEBUG') === 'true',
    'secret' => getenv('APP_SECRET') ?: 'change_this_to_random_string_in_production',
    'timezone' => 'Europe/Moscow',
    'locale' => 'ru_RU',
    'session_ttl' => 600, // 10 минут
    'cache_ttl' => 60,    // 1 минута
    'allowed_regions' => ['AR', 'MU', 'PZ', 'PS', 'KN', 'VN', 'SC', 'SP', 'LE', 'VG'],
    'meter_types' => [
        'Меркурий 234 G7',
        'Ротек РТМ-03',
        'Ротек РТМ-01',
        'Нева 314',
        'Нева 412',
        'Энергомера CE-303',
    ],
];
