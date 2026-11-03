export default function About() {
  return (
    <div className="p-4">
      <div className="border-2" style={{ 
        background: '#0000AA', 
        borderColor: '#FFFFFF',
        maxWidth: '700px',
        margin: '0 auto'
      }}>
        <div className="text-center py-1" style={{ background: '#AAAAAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#000000' }}>
            ═══ О ПРОГРАММЕ ═══
          </span>
        </div>

        <div className="p-6 text-center" style={{ fontFamily: 'VT323, monospace' }}>
          <pre style={{ color: '#55FFFF', fontSize: '16px', lineHeight: '1.2' }}>
{`
 ██████╗ ██╗   ██╗    ██████╗ ███████╗██╗ ██████╗ 
 ██╔══██╗╚██╗ ██╔╝    ██╔══██╗██╔════╝██║██╔════╝ 
 ██████╔╝ ╚████╔╝     ██████╔╝█████╗  ██║██║  ███╗
 ██╔═══╝   ╚██╔╝      ██╔══██╗██╔══╝  ██║██║   ██║
 ██║        ██║       ██║  ██║███████╗██║╚██████╔╝
 ╚═╝        ╚═╝       ╚═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ 
`}
          </pre>

          <div className="mt-4" style={{ color: '#FFFFFF', fontSize: '22px' }}>
            ПУ-РЕГИСТРАТОР
          </div>
          <div style={{ color: '#FFFF55', fontSize: '18px' }}>
            Версия 1.0
          </div>

          <div className="mt-6 border-t-2 pt-4" style={{ borderColor: '#555555', color: '#55FFFF', fontSize: '16px' }}>
            <p>Система учёта приборов учёта электроэнергии</p>
            <p className="mt-2">Разработано для автоматизации регистрации</p>
            <p>и мониторинга приборов учёта</p>
          </div>

          <div className="mt-6" style={{ color: '#AAAAAA', fontSize: '14px' }}>
            <p>© 2024-2026 Все права защищены</p>
            <p className="mt-2">Дизайн: Norton Commander Style</p>
            <p>Шрифт: VT323 (8-bit retro)</p>
          </div>

          <div className="mt-6 border-t-2 pt-4" style={{ borderColor: '#555555' }}>
            <pre style={{ color: '#55FF55', fontSize: '14px' }}>
{`
  ┌─────────────────────────────────┐
  │  Made with ♥ in DOS style       │
  │  React + Vite + Tailwind CSS    │
  │  LocalStorage Database Engine   │
  └─────────────────────────────────┘
`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
