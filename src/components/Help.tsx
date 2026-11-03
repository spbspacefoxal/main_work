export default function Help() {
  return (
    <div className="p-4">
      <div className="border-2" style={{ 
        background: '#0000AA', 
        borderColor: '#FFFFFF',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div className="text-center py-1" style={{ background: '#AAAAAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#000000' }}>
            ═══ СПРАВКА ═══
          </span>
        </div>

        <div className="p-4" style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFFFF' }}>
          <h2 style={{ color: '#FFFF55', fontSize: '22px' }} className="mb-3">▌ Описание системы</h2>
          <p className="mb-4">
            ПУ-Регистратор — система учёта приборов учёта электроэнергии.
            Позволяет регистрировать новые приборы, редактировать и удалять записи.
          </p>

          <h2 style={{ color: '#FFFF55', fontSize: '22px' }} className="mb-3">▌ Регистрация прибора</h2>
          <ol className="list-decimal pl-6 mb-4" style={{ color: '#55FFFF' }}>
            <li>Выберите код региона из доступных вам</li>
            <li>Введите номер БС (код региона + 6 цифр)</li>
            <li>Выберите тип действия</li>
            <li>Выберите тип прибора учёта</li>
            <li>Введите номер счётчика (до 16 цифр)</li>
            <li>Укажите тип модема или введите его номер</li>
            <li>Введите номер SIM-карты (формат: 7XXXXXXXXXX)</li>
            <li>Укажите адрес объекта</li>
            <li>Нажмите «Отправить заявку на регистрацию»</li>
          </ol>

          <h2 style={{ color: '#FFFF55', fontSize: '22px' }} className="mb-3">▌ Проверки при регистрации</h2>
          <ul className="list-disc pl-6 mb-4" style={{ color: '#55FFFF' }}>
            <li>Номер счётчика не должен дублироваться в базе</li>
            <li>Номер модема (кроме «встроенный») не должен дублироваться</li>
            <li>Номер SIM-карты не должен дублироваться</li>
            <li>При ошибке поля подсвечиваются красным</li>
          </ul>

          <h2 style={{ color: '#FFFF55', fontSize: '22px' }} className="mb-3">▌ Статусы регистрации</h2>
          <p className="mb-4">
            Администратор может установить статус записи:<br/>
            <span style={{ color: '#55FF55' }}>■ Ok</span> — светло-зелёный фон, прибор одобрен<br/>
            <span style={{ color: '#FFFF55' }}>■ Error</span> — светло-жёлтый фон, есть замечания
          </p>

          <h2 style={{ color: '#FFFF55', fontSize: '22px' }} className="mb-3">▌ Горячие клавиши</h2>
          <p className="mb-4" style={{ color: '#55FFFF' }}>
            F1 — Справка<br/>
            F2 — Регистрация<br/>
            F3 — ХБ по ПУ<br/>
            F10 — Выход
          </p>

          <h2 style={{ color: '#FFFF55', fontSize: '22px' }} className="mb-3">▌ Таймаут сессии</h2>
          <p style={{ color: '#55FFFF' }}>
            При отсутствии активности в течение 10 минут сессия автоматически завершается.
            Требуется повторная авторизация.
          </p>
        </div>
      </div>
    </div>
  );
}
