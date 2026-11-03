-- ============================================================================
-- ПУ-РЕГИСТРАТОР 2.0 — Схема базы данных PostgreSQL
-- ============================================================================

-- Удаление старых таблиц (если есть)
DROP TABLE IF EXISTS meter_records CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;

-- ============================================================================
-- Таблица пользователей
-- ============================================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'admin', 'root')),
    regions TEXT[] NOT NULL DEFAULT '{}',
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    can_set_status BOOLEAN DEFAULT FALSE,
    can_export BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Таблица приборов учёта
-- ============================================================================
CREATE TABLE meter_records (
    id SERIAL PRIMARY KEY,
    region_code VARCHAR(2) NOT NULL CHECK (region_code IN ('AR', 'MU', 'PZ', 'PS', 'KN', 'VN', 'SC', 'SP', 'LE', 'VG')),
    bs_number VARCHAR(20) NOT NULL,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('Регистрация', 'Редактирование', 'Удаление')),
    meter_type VARCHAR(50) NOT NULL,
    meter_number VARCHAR(16) NOT NULL,
    modem_type VARCHAR(50) NOT NULL,
    sim_card_number VARCHAR(11) NOT NULL,
    note TEXT DEFAULT '',
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    address TEXT DEFAULT '',
    comment TEXT DEFAULT '',
    registered_by VARCHAR(50) NOT NULL,
    registration_status VARCHAR(10) DEFAULT '' CHECK (registration_status IN ('', 'Ok', 'Error')),
    status_date TIMESTAMP,
    status_admin VARCHAR(50) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Таблица аудита (лог действий)
-- ============================================================================
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_login VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Индексы для быстрого поиска
-- ============================================================================

-- Уникальные индексы для проверки дубликатов
CREATE UNIQUE INDEX idx_meter_records_meter_number ON meter_records(meter_number);
CREATE UNIQUE INDEX idx_meter_records_sim_card ON meter_records(sim_card_number);
CREATE INDEX idx_meter_records_modem ON meter_records(modem_type) WHERE modem_type != 'встроенный';

-- Индексы для фильтрации
CREATE INDEX idx_meter_records_region ON meter_records(region_code);
CREATE INDEX idx_meter_records_status ON meter_records(registration_status);
CREATE INDEX idx_meter_records_created ON meter_records(created_at DESC);
CREATE INDEX idx_meter_records_bs_number ON meter_records(bs_number);
CREATE INDEX idx_meter_records_meter_type ON meter_records(meter_type);

-- Индексы для аудита
CREATE INDEX idx_audit_log_user ON audit_log(user_login);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- ============================================================================
-- Функция автоматического обновления updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meter_records_updated_at BEFORE UPDATE ON meter_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Начальные данные: пользователи
-- ============================================================================
INSERT INTO users (login, password_hash, role, regions, can_edit, can_delete, can_set_status, can_export) VALUES
-- Пользователи (пароль: qwerty)
('AR-user', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u85W4cd3i6', 'user', ARRAY['AR'], FALSE, FALSE, FALSE, FALSE),
('MU-user', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u85W4cd3i6', 'user', ARRAY['MU'], FALSE, FALSE, FALSE, FALSE),
('PZ-user', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u85W4cd3i6', 'user', ARRAY['PZ'], FALSE, FALSE, FALSE, FALSE),
('PS-user', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u85W4cd3i6', 'user', ARRAY['PS'], FALSE, FALSE, FALSE, FALSE),
('KN-user', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u85W4cd3i6', 'user', ARRAY['KN'], FALSE, FALSE, FALSE, FALSE),
('VG-user', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u85W4cd3i6', 'user', ARRAY['VG'], FALSE, FALSE, FALSE, FALSE),
('VN-user', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u85W4cd3i6', 'user', ARRAY['VN'], FALSE, FALSE, FALSE, FALSE),
('SP-East', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u85W4cd3i6', 'user', ARRAY['SP', 'LE', 'SC'], FALSE, FALSE, FALSE, FALSE),
('SP-Nord', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u85W4cd3i6', 'user', ARRAY['SP', 'LE', 'SC'], FALSE, FALSE, FALSE, FALSE),
('SP-West', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u85W4cd3i6', 'user', ARRAY['SP', 'LE', 'SC'], FALSE, FALSE, FALSE, FALSE),
('SP-South', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u85W4cd3i6', 'user', ARRAY['SP', 'LE', 'SC'], FALSE, FALSE, FALSE, FALSE),
-- Администраторы
('SP-admin', '$2y$10$YourHashHere', 'admin', ARRAY['AR', 'MU', 'PZ', 'PS', 'KN', 'VN', 'SC', 'SP', 'LE', 'VG'], TRUE, TRUE, TRUE, TRUE),
('SP-root', '$2y$10$YourHashHere', 'root', ARRAY['AR', 'MU', 'PZ', 'PS', 'KN', 'VN', 'SC', 'SP', 'LE', 'VG'], TRUE, TRUE, TRUE, TRUE);

-- ============================================================================
-- Представления для удобных запросов
-- ============================================================================

-- Все приборы без статуса Ok (для сортировки)
CREATE VIEW v_pending_records AS
SELECT * FROM meter_records
WHERE registration_status != 'Ok' OR registration_status IS NULL
ORDER BY created_at DESC;

-- Статистика по регионам
CREATE VIEW v_region_stats AS
SELECT 
    region_code,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE registration_status = 'Ok') as approved,
    COUNT(*) FILTER (WHERE registration_status = 'Error') as errors,
    COUNT(*) FILTER (WHERE registration_status = '' OR registration_status IS NULL) as pending
FROM meter_records
GROUP BY region_code;

-- ============================================================================
-- Функции для проверки дубликатов
-- ============================================================================
CREATE OR REPLACE FUNCTION check_duplicates(
    p_meter_number VARCHAR,
    p_modem_type VARCHAR,
    p_sim_card VARCHAR,
    p_exclude_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
    meter_number_exists BOOLEAN,
    modem_exists BOOLEAN,
    sim_card_exists BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXISTS(SELECT 1 FROM meter_records WHERE meter_number = p_meter_number AND id != COALESCE(p_exclude_id, 0)),
        EXISTS(SELECT 1 FROM meter_records WHERE modem_type = p_modem_type AND modem_type != 'встроенный' AND id != COALESCE(p_exclude_id, 0)),
        EXISTS(SELECT 1 FROM meter_records WHERE sim_card_number = p_sim_card AND id != COALESCE(p_exclude_id, 0));
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Конец схемы
-- ============================================================================
