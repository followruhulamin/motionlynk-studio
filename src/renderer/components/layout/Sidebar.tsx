interface SidebarProps {
  activeModule: string
  onModuleChange: (id: string) => void
}

const modules = [
  {
    id: 'kinetic', name: 'Kinetic', enabled: true,
    icon: (
      <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    )
  },
  {
    id: 'vault', name: 'Vault', enabled: false,
    icon: (
      <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    )
  },
  {
    id: 'numeris', name: 'Numeris', enabled: false,
    icon: (
      <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
      </svg>
    )
  },
  {
    id: 'utility', name: 'Utility Tools', enabled: false,
    icon: (
      <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
      </svg>
    )
  },
  {
    id: 'export', name: 'Export Tools', enabled: false,
    icon: (
      <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    )
  },
  {
    id: 'assets', name: 'Asset Manager', enabled: false,
    icon: (
      <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </svg>
    )
  },
  {
    id: 'release', name: 'Release Manager', enabled: false,
    icon: (
      <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    )
  },
]

// Extension-level items — separated by a border
const extensionItems = [
  {
    id: 'extension', name: 'Extension', enabled: true,
    icon: (
      <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
      </svg>
    )
  },
]

function NavButton({
  mod, isActive, onClick
}: {
  mod: { id: string; name: string; enabled: boolean; icon: JSX.Element }
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={() => mod.enabled && onClick()}
      disabled={!mod.enabled}
      title={mod.enabled ? mod.name : `${mod.name} (Coming Soon)`}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', padding: '7px 10px',
        borderRadius: 6, marginBottom: 1, border: 'none',
        cursor: mod.enabled ? 'pointer' : 'not-allowed',
        opacity: mod.enabled ? 1 : 0.3,
        background: isActive ? 'rgba(79,142,255,0.12)' : 'transparent',
        color: isActive ? '#4f8eff' : '#8e8ea8',
        fontSize: 12, fontWeight: isActive ? 600 : 400,
        textAlign: 'left', transition: 'background 0.15s, color 0.15s',
      }}
      onMouseEnter={e => {
        if (!isActive && mod.enabled) {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
          ;(e.currentTarget as HTMLElement).style.color = '#c5c5d9'
        }
      }}
      onMouseLeave={e => {
        if (!isActive && mod.enabled) {
          (e.currentTarget as HTMLElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLElement).style.color = '#8e8ea8'
        }
      }}
    >
      <span style={{ flexShrink: 0, color: isActive ? '#4f8eff' : '#55556a', transition: 'color 0.15s' }}>
        {mod.icon}
      </span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
        {mod.name}
      </span>
      {!mod.enabled && (
        <span style={{
          fontSize: 8, color: '#55556a',
          background: 'rgba(255,255,255,0.05)',
          padding: '1px 5px', borderRadius: 4, flexShrink: 0,
        }}>
          Soon
        </span>
      )}
    </button>
  )
}

export default function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <aside className="app-sidebar">
      {/* ── MODULES section ──────────────────── */}
      <div style={{ padding: '12px 14px 6px', flexShrink: 0 }}>
        <span style={{
          fontSize: 9, fontWeight: 700, color: '#55556a',
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          Modules
        </span>
      </div>

      <div className="app-sidebar-scroll" style={{ padding: '4px 6px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {modules.map((mod) => (
          <NavButton
            key={mod.id}
            mod={mod}
            isActive={activeModule === mod.id && mod.enabled}
            onClick={() => onModuleChange(mod.id)}
          />
        ))}
      </div>

      {/* ── EXTENSION section — separated by border ──────────────── */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingTop: 8, flexShrink: 0,
      }}>
        <div style={{ padding: '4px 14px 6px' }}>
          <span style={{
            fontSize: 9, fontWeight: 700, color: '#55556a',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            Extension
          </span>
        </div>
        <div style={{ padding: '0 6px 6px' }}>
          {extensionItems.map((item) => (
            <NavButton
              key={item.id}
              mod={item}
              isActive={activeModule === item.id}
              onClick={() => onModuleChange(item.id)}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}
