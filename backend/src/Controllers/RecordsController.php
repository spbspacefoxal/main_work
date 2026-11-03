<?php
/**
 * Контроллер записей приборов учёта
 */

namespace App\Controllers;

use App\Database;
use App\RedisCache;

class RecordsController
{
    private Database $db;
    private RedisCache $redis;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->redis = RedisCache::getInstance();
    }

    /**
     * GET /api/records — Получить все записи
     */
    public function index(): void
    {
        global $currentUser;

        // Кэширование запроса
        $cacheKey = 'records:' . md5(serialize($currentUser));
        
        $records = $this->redis->cacheQuery($cacheKey, function() use ($currentUser) {
            $regions = $currentUser['regions'];
            $placeholders = implode(',', array_fill(0, count($regions), '?'));
            
            return $this->db->query(
                "SELECT * FROM meter_records WHERE region_code IN ({$placeholders}) ORDER BY created_at DESC",
                $regions
            );
        }, 30); // Кэш на 30 секунд

        echo json_encode($records);
    }

    /**
     * POST /api/records — Создать новую запись
     */
    public function store(): void
    {
        global $currentUser;

        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
            return;
        }

        // Проверка региона
        if (!in_array($data['regionCode'], $currentUser['regions'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied to this region']);
            return;
        }

        // Валидация
        $errors = $this->validate($data);
        if (!empty($errors)) {
            http_response_code(400);
            echo json_encode(['errors' => $errors]);
            return;
        }

        // Проверка дубликатов
        $duplicates = $this->checkDuplicatesInDb(
            $data['meterNumber'],
            $data['modemType'],
            $data['simCardNumber']
        );

        if ($duplicates['meter_number_exists'] || $duplicates['modem_exists'] || $duplicates['sim_card_exists']) {
            http_response_code(409);
            echo json_encode(['error' => 'Duplicate found', 'duplicates' => $duplicates]);
            return;
        }

        // Вставка записи
        $this->db->execute(
            "INSERT INTO meter_records (
                region_code, bs_number, action_type, meter_type, meter_number,
                modem_type, sim_card_number, note, address, comment,
                registered_by, registration_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
            [
                $data['regionCode'],
                $data['bsNumber'],
                $data['actionType'],
                $data['meterType'],
                $data['meterNumber'],
                $data['modemType'],
                $data['simCardNumber'],
                $data['note'] ?? '',
                $data['address'],
                $data['comment'] ?? '',
                $currentUser['login']
            ]
        );

        // Очистка кэша
        $this->redis->clearCache('records:*');

        echo json_encode([
            'success' => true,
            'id' => $this->db->lastInsertId()
        ]);
    }

    /**
     * PUT /api/records/{id} — Обновить запись
     */
    public function update(string $id): void
    {
        global $currentUser;

        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
            return;
        }

        // Проверка прав
        if (!$currentUser['can_edit'] && !$currentUser['can_set_status']) {
            http_response_code(403);
            echo json_encode(['error' => 'Permission denied']);
            return;
        }

        // Получение текущей записи
        $record = $this->db->queryOne(
            "SELECT * FROM meter_records WHERE id = ?",
            [$id]
        );

        if (!$record) {
            http_response_code(404);
            echo json_encode(['error' => 'Record not found']);
            return;
        }

        // Проверка региона
        if (!in_array($record['region_code'], $currentUser['regions'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied to this region']);
            return;
        }

        // Обновление статуса (только для админов)
        if (isset($data['registrationStatus']) && $currentUser['can_set_status']) {
            $statusDate = $data['registrationStatus'] === 'Ok' ? date('Y-m-d H:i:s') : null;
            $statusAdmin = $data['registrationStatus'] === 'Ok' ? $currentUser['login'] : '';

            $this->db->execute(
                "UPDATE meter_records SET 
                    registration_status = ?,
                    status_date = ?,
                    status_admin = ?,
                    updated_at = NOW()
                WHERE id = ?",
                [$data['registrationStatus'], $statusDate, $statusAdmin, $id]
            );
        }

        // Очистка кэша
        $this->redis->clearCache('records:*');

        echo json_encode(['success' => true]);
    }

    /**
     * DELETE /api/records/{id} — Удалить запись
     */
    public function destroy(string $id): void
    {
        global $currentUser;

        // Проверка прав
        if (!$currentUser['can_delete']) {
            http_response_code(403);
            echo json_encode(['error' => 'Permission denied']);
            return;
        }

        // Получение записи
        $record = $this->db->queryOne(
            "SELECT * FROM meter_records WHERE id = ?",
            [$id]
        );

        if (!$record) {
            http_response_code(404);
            echo json_encode(['error' => 'Record not found']);
            return;
        }

        // Проверка региона
        if (!in_array($record['region_code'], $currentUser['regions'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied to this region']);
            return;
        }

        // Удаление
        $this->db->execute("DELETE FROM meter_records WHERE id = ?", [$id]);

        // Очистка кэша
        $this->redis->clearCache('records:*');

        echo json_encode(['success' => true]);
    }

    /**
     * GET /api/check — Проверка дубликатов
     */
    public function checkDuplicates(): void
    {
        $meterNumber = $_GET['meterNumber'] ?? null;
        $modemType = $_GET['modemType'] ?? null;
        $simCardNumber = $_GET['simCardNumber'] ?? null;
        $excludeId = $_GET['excludeId'] ?? null;

        $result = $this->checkDuplicatesInDb($meterNumber, $modemType, $simCardNumber, $excludeId);

        echo json_encode($result);
    }

    /**
     * GET /api/export — Экспорт данных
     */
    public function export(): void
    {
        global $currentUser;

        if (!$currentUser['can_export']) {
            http_response_code(403);
            echo json_encode(['error' => 'Permission denied']);
            return;
        }

        $regions = $currentUser['regions'];
        $placeholders = implode(',', array_fill(0, count($regions), '?'));

        $records = $this->db->query(
            "SELECT * FROM meter_records WHERE region_code IN ({$placeholders}) ORDER BY created_at DESC",
            $regions
        );

        echo json_encode($records);
    }

    /**
     * Валидация данных
     */
    private function validate(array $data): array
    {
        $errors = [];

        // Номер БС
        if (!preg_match('/^[A-Z]{2}\d{6}$/', $data['bsNumber'] ?? '')) {
            $errors['bsNumber'] = 'Номер БС = код региона + 6 цифр';
        }

        // Номер счётчика
        if (!preg_match('/^\d{1,16}$/', $data['meterNumber'] ?? '')) {
            $errors['meterNumber'] = 'Номер счётчика: до 16 цифр';
        }

        // Модем
        $modemType = $data['modemType'] ?? '';
        if ($modemType !== 'встроенный' && !preg_match('/^\d{4,20}$/', $modemType)) {
            $errors['modemType'] = 'Номер модема: от 4 до 20 цифр';
        }

        // SIM карта
        if (!preg_match('/^7\d{10}$/', $data['simCardNumber'] ?? '')) {
            $errors['simCardNumber'] = 'Номер SIM: 11 цифр, начиная с 7';
        }

        // Адрес
        if (empty($data['address'])) {
            $errors['address'] = 'Введите адрес';
        } elseif (strlen($data['address']) > 1000) {
            $errors['address'] = 'Адрес не более 1000 символов';
        }

        // Примечание
        if (strlen($data['comment'] ?? '') > 1000) {
            $errors['comment'] = 'Примечание не более 1000 символов';
        }

        return $errors;
    }

    /**
     * Проверка дубликатов в БД
     */
    private function checkDuplicatesInDb(
        ?string $meterNumber,
        ?string $modemType,
        ?string $simCardNumber,
        ?string $excludeId = null
    ): array {
        $result = [
            'meter_number_exists' => false,
            'modem_exists' => false,
            'sim_card_exists' => false,
        ];

        if ($meterNumber) {
            $sql = "SELECT COUNT(*) as count FROM meter_records WHERE meter_number = ?";
            $params = [$meterNumber];
            if ($excludeId) {
                $sql .= " AND id != ?";
                $params[] = $excludeId;
            }
            $row = $this->db->queryOne($sql, $params);
            $result['meter_number_exists'] = $row['count'] > 0;
        }

        if ($modemType && $modemType !== 'встроенный') {
            $sql = "SELECT COUNT(*) as count FROM meter_records WHERE modem_type = ? AND modem_type != 'встроенный'";
            $params = [$modemType];
            if ($excludeId) {
                $sql .= " AND id != ?";
                $params[] = $excludeId;
            }
            $row = $this->db->queryOne($sql, $params);
            $result['modem_exists'] = $row['count'] > 0;
        }

        if ($simCardNumber) {
            $sql = "SELECT COUNT(*) as count FROM meter_records WHERE sim_card_number = ?";
            $params = [$simCardNumber];
            if ($excludeId) {
                $sql .= " AND id != ?";
                $params[] = $excludeId;
            }
            $row = $this->db->queryOne($sql, $params);
            $result['sim_card_exists'] = $row['count'] > 0;
        }

        return $result;
    }
}
