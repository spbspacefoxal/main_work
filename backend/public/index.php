<?php
/**
 * ПУ-РЕГИСТРАТОР 2.0 — Точка входа API
 * 
 * Nginx + PHP-FPM + PostgreSQL + Redis
 */

declare(strict_types=1);

// Заголовки CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Обработка preflight запросов
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Автозагрузка
require_once __DIR__ . '/../vendor/autoload.php';

// Загрузка конфигурации
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/redis.php';
require_once __DIR__ . '/../config/app.php';

// Подключение классов
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/RedisCache.php';
require_once __DIR__ . '/../src/Auth.php';
require_once __DIR__ . '/../src/Router.php';
require_once __DIR__ . '/../src/Controllers/AuthController.php';
require_once __DIR__ . '/../src/Controllers/RecordsController.php';
require_once __DIR__ . '/../src/Middleware/AuthMiddleware.php';

// Инициализация
$db = new App\Database();
$redis = new App\RedisCache();
$auth = new App\Auth($db, $redis);
$router = new App\Router();

// Маршруты API
$router->post('/api/auth/login', [App\Controllers\AuthController::class, 'login']);
$router->post('/api/auth/logout', [App\Controllers\AuthController::class, 'logout']);
$router->get('/api/auth/check', [App\Controllers\AuthController::class, 'check']);

// Защищённые маршруты (требуют авторизации)
$router->get('/api/records', [App\Controllers\RecordsController::class, 'index'], true);
$router->post('/api/records', [App\Controllers\RecordsController::class, 'store'], true);
$router->put('/api/records/{id}', [App\Controllers\RecordsController::class, 'update'], true);
$router->delete('/api/records/{id}', [App\Controllers\RecordsController::class, 'destroy'], true);
$router->get('/api/check', [App\Controllers\RecordsController::class, 'checkDuplicates'], true);
$router->get('/api/export', [App\Controllers\RecordsController::class, 'export'], true);

// Обработка запроса
try {
    $router->dispatch();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal Server Error',
        'message' => $e->getMessage()
    ]);
}
