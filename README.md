# 🚀 ПУ-РЕГИСТРАТОР 2.0

**Промышленный стек:** Nginx + PHP-FPM 8.2 + PostgreSQL 16 + Redis 7

---

## 📊 Архитектура

```
┌──────────┐     ┌────────┐     ┌──────────┐     ┌──────────┐
│  Браузер  │ ──→ │ Nginx  │ ──→ │ PHP-FPM  │ ──→ │PostgreSQL│
│  (React)  │ ←── │  :80   │ ←── │  :9000   │ ←── │  :5432   │
└──────────┘     └────────┘     └────┬─────┘     └──────────┘
                                     │
                                ┌────┴─────┐
                                │  Redis   │
                                │  :6379   │
                                └──────────┘
```

---

## 🚀 Быстрый старт

### Требования
- Docker Desktop (Windows/Mac) или Docker Engine (Linux)
- Docker Compose v2+

### Установка

```bash
# Windows — двойной клик
install.bat

# Linux/Mac
chmod +x install.sh
./install.sh
```

### Управление

```bash
# Запуск
start.bat          # Windows
./start.sh         # Linux/Mac

# Остановка
stop.bat
./stop.sh

# Перезапуск
restart.bat
./restart.sh

# Логи
docker compose logs -f

# Статус
docker compose ps
```

---

## 📁 Структура проекта

```
registrator-2.0/
├── docker-compose.yml          # Оркестрация контейнеров
├── install.bat / install.sh    # Установка
├── start.bat / start.sh        # Запуск
├── stop.bat / stop.sh          # Остановка
├── restart.bat / restart.sh    # Перезапуск
│
├── database/
│   └── init.sql                # Схема PostgreSQL
│
├── docker/
│   ├── nginx/
│   │   ├── nginx.conf          # Конфиг Nginx
│   │   └── sites/
│   │       └── default.conf    # Виртуальный хост
│   └── php-fpm/
│       ├── Dockerfile          # Образ PHP
│       └── www.conf            # Конфиг PHP-FPM
│
├── backend/                    # PHP API
│   ├── composer.json
│   ├── public/
│   │   └── index.php           # Точка входа
│   ├── src/
│   │   ├── Auth.php            # Авторизация (JWT + Redis)
│   │   ├── Database.php        # PostgreSQL
│   │   ├── RedisCache.php      # Redis кэш
│   │   ├── Router.php          # Маршрутизация
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   └── RecordsController.php
│   │   └── Middleware/
│   │       └── AuthMiddleware.php
│   └── config/
│       ├── app.php
│       ├── database.php
│       └── redis.php
│
└── frontend/                   # React SPA
    ├── src/
    └── dist/                   # Собранный фронтенд
```

---

## 🔐 Учётные записи

| Роль | Логин | Пароль | Права |
|------|-------|--------|-------|
| 👤 Пользователь | AR-user | qwerty | Просмотр и регистрация (AR) |
| 👤 Пользователь | SP-East | qwerty | Просмотр и регистрация (SP, LE, SC) |
| 🔑 Администратор | SP-admin | 12345 | Полный доступ + выгрузка |
| 👑 Root | SP-root | a413401L | Полные права |

---

## 📡 API Endpoints

### Авторизация
| Метод | URL | Описание |
|-------|-----|----------|
| POST | /api/auth/login | Вход |
| POST | /api/auth/logout | Выход |
| GET | /api/auth/check | Проверка токена |

### Приборы учёта
| Метод | URL | Описание |
|-------|-----|----------|
| GET | /api/records | Список записей |
| POST | /api/records | Создать запись |
| PUT | /api/records/:id | Обновить запись |
| DELETE | /api/records/:id | Удалить запись |
| GET | /api/check | Проверка дубликатов |
| GET | /api/export | Экспорт данных |

---

## 🗄️ База данных

### Таблицы

**users** — пользователи системы
- id, login, password_hash, role, regions, permissions

**meter_records** — приборы учёта
- id, region_code, bs_number, action_type, meter_type
- meter_number, modem_type, sim_card_number
- note, registration_date, address, comment
- registered_by, registration_status, status_date, status_admin

**audit_log** — лог действий
- id, user_login, action, table_name, record_id
- old_data (JSONB), new_data (JSONB), ip_address, created_at

### Индексы
- UNIQUE: meter_number, sim_card_number
- INDEX: region_code, registration_status, created_at, modem_type

---

## ⚡ Производительность

### Кэширование (Redis)
- Сессии пользователей (TTL: 10 минут)
- Кэш запросов (TTL: 30 секунд)
- Автоматическая инвалидация при изменениях

### Оптимизации
- OPcache для PHP
- Gzip сжатие в Nginx
- Keep-alive соединения
- Пул PHP-FPM воркеров (до 50)
- Индексы PostgreSQL

### Ожидаемая производительность
| Метрика | Значение |
|---------|----------|
| RPS | 3000-5000 |
| Время ответа | 5-20 мс |
| Макс. записей | 10 000 000+ |
| RAM (минимум) | 2 ГБ |

---

## 🔧 Утилиты

### Redis Commander (UI для Redis)
```bash
docker compose --profile tools up -d
# Откройте: http://localhost:8081
```

### Подключение к БД
```bash
docker compose exec postgres psql -U registrator
```

### Очистка кэша
```bash
docker compose exec redis redis-cli FLUSHDB
```

---

## 🛡️ Безопасность

- JWT токены с коротким TTL
- Сессии в Redis с автопродлением
- Password hashing (bcrypt)
- CORS заголовки
- SQL injection protection (PDO prepared statements)
- XSS protection (React)
- HTTP security headers

---

## 📝 Лицензия

© 2024-2026 Все права защищены
