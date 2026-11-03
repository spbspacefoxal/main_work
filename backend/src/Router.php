<?php
/**
 * Простой роутер
 */

namespace App;

class Router
{
    private array $routes = [];
    private array $authRoutes = [];

    public function get(string $path, callable|array $handler, bool $auth = false): void
    {
        $this->addRoute('GET', $path, $handler, $auth);
    }

    public function post(string $path, callable|array $handler, bool $auth = false): void
    {
        $this->addRoute('POST', $path, $handler, $auth);
    }

    public function put(string $path, callable|array $handler, bool $auth = false): void
    {
        $this->addRoute('PUT', $path, $handler, $auth);
    }

    public function delete(string $path, callable|array $handler, bool $auth = false): void
    {
        $this->addRoute('DELETE', $path, $handler, $auth);
    }

    private function addRoute(string $method, string $path, callable|array $handler, bool $auth): void
    {
        $route = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
            'auth' => $auth,
            'pattern' => $this->pathToPattern($path),
        ];

        if ($auth) {
            $this->authRoutes[] = $route;
        } else {
            $this->routes[] = $route;
        }
    }

    private function pathToPattern(string $path): string
    {
        $pattern = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $path);
        return '#^' . $pattern . '$#';
    }

    public function dispatch(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        // Поиск маршрута
        $allRoutes = array_merge($this->routes, $this->authRoutes);
        
        foreach ($allRoutes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (preg_match($route['pattern'], $uri, $matches)) {
                // Проверка авторизации
                if ($route['auth']) {
                    $authMiddleware = new Middleware\AuthMiddleware();
                    if (!$authMiddleware->handle()) {
                        return;
                    }
                }

                // Извлечение параметров
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);

                // Вызов обработчика
                $handler = $route['handler'];
                
                if (is_array($handler)) {
                    [$class, $method] = $handler;
                    $controller = new $class();
                    $controller->$method(...array_values($params));
                } else {
                    $handler(...array_values($params));
                }
                return;
            }
        }

        // Маршрут не найден
        http_response_code(404);
        echo json_encode(['error' => 'Not Found']);
    }
}
