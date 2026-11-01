const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Database helpers
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { records: [], version: '1.0', created: new Date().toISOString(), lastModified: '' };
  }
}

function writeDB(db) {
  db.lastModified = new Date().toISOString();
  if (!db.created) db.created = new Date().toISOString();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

// ========== API Routes ==========

// GET all records
app.get('/api/records', (req, res) => {
  const db = readDB();
  res.json(db.records);
});

// POST new record
app.post('/api/records', (req, res) => {
  const db = readDB();
  const record = req.body;
  db.records.push(record);
  writeDB(db);
  res.json({ success: true, id: record.id });
});

// PUT update record
app.put('/api/records/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const idx = db.records.findIndex(r => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Запись не найдена' });
  }
  db.records[idx] = { ...db.records[idx], ...req.body };
  writeDB(db);
  res.json({ success: true });
});

// DELETE record
app.delete('/api/records/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.records = db.records.filter(r => r.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// GET check duplicates
app.get('/api/check', (req, res) => {
  const db = readDB();
  const { meterNumber, modemType, simCardNumber, excludeId } = req.query;
  
  const result = {
    meterNumberExists: false,
    modemExists: false,
    simCardExists: false,
  };

  if (meterNumber) {
    result.meterNumberExists = db.records.some(
      r => r.meterNumber === meterNumber && r.id !== excludeId
    );
  }

  if (modemType && modemType !== 'встроенный') {
    result.modemExists = db.records.some(
      r => r.modemType === modemType && r.id !== excludeId
    );
  }

  if (simCardNumber) {
    result.simCardExists = db.records.some(
      r => r.simCardNumber === simCardNumber && r.id !== excludeId
    );
  }

  res.json(result);
});

// GET export all records (for xlsx export)
app.get('/api/export', (req, res) => {
  const db = readDB();
  res.json(db.records);
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║       ПУ-РЕГИСТРАТОР v1.0 — СЕРВЕР          ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Сервер запущен на порту: ${PORT}                ║`);
  console.log(`║  Откройте браузер: http://localhost:${PORT}     ║`);
  console.log('║                                              ║');
  console.log('║  Файл базы данных: database.json             ║');
  console.log('║  Для остановки: Ctrl+C                       ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
});
