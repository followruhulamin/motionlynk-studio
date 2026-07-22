import { JSX } from "react/jsx-runtime"

interface SidebarProps {
  activeModule: string
  onModuleChange: (id: string) => void
  hasExtensionPath: boolean
}

const modules = [
  {
    id: 'kinetic', name: 'Kinetic', enabled: true,
    icon: (
      <svg style={{ width: 14, height: 14 }} viewBox="0 0 200 200" fill="none">
        <path stroke="#60d1fa" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.61" d="M116.74,63.72h33.49" />
        <path stroke="#60d1fa" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.61" d="M116.74,102.79h33.49" />
        <path stroke="#60d1fa" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.61" d="M49.77,141.86h100.47" />
        <path stroke="#60d1fa" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.61" d="M49.77,102.79l19.83-43.11c.69-1.38,2.37-1.94,3.75-1.24.54.27.97.71,1.24,1.24l19.83,43.11" />
        <path stroke="#60d1fa" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.61" d="M54.9,91.63h34.38" />
      </svg>
    )
  },
  {
    id: 'expo', name: 'Expo', enabled: true,
    icon: (
      <svg style={{ width: 14, height: 14 }} viewBox="0 0 200 200" fill="none">
        <path stroke="#da5597" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.75" d="M134.44,122.29l22.29-22.29-22.29-22.29" />
        <path stroke="#da5597" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.75" d="M67.56,77.71l-22.29,22.29,22.29,22.29" />
        <path stroke="#da5597" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.75" d="M114.93,55.41l-27.87,89.18" />
      </svg>
    )
  },
  {
    id: 'vault', name: 'Vault', enabled: false,
    icon: (
      <svg style={{ width: 14, height: 14 }} viewBox="0 0 200 200" fill="none">
        <path stroke="#e9a23b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7.67" d="M103.44,61.72l13.24,17.34" />
        <path stroke="#e9a23b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7.67" d="M138.09,72.84l-75.4,21.92-3.95-10.52c-1.32-4.82,1.32-9.64,5.7-10.96l59.18-17.54c4.82-1.32,9.64,1.32,10.96,5.7l3.51,11.4Z" />
        <path stroke="#e9a23b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7.67" d="M62.69,94.76h78.91v35.07c0,4.84-3.93,8.77-8.77,8.77h-61.37c-4.84,0-8.77-3.93-8.77-8.77v-35.07Z" />
        <path stroke="#e9a23b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7.67" d="M76.63,69.67l13.59,17.09" />
      </svg>
    )
  },
  {
    id: 'numeris', name: 'Numeris', enabled: false,
    icon: (
      <svg style={{ width: 14, height: 14 }} viewBox="0 0 200 200" fill="none">
        <line stroke="#6466e9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.64" x1="55.95" y1="83.48" x2="144.05" y2="83.48" />
        <line stroke="#6466e9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.64" x1="55.95" y1="116.52" x2="144.05" y2="116.52" />
        <line stroke="#6466e9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.64" x1="88.99" y1="50.45" x2="77.98" y2="149.55" />
        <line stroke="#6466e9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9.64" x1="122.02" y1="50.45" x2="111.01" y2="149.55" />
      </svg>
    )
  },
  {
    id: 'spark', name: 'Spark', enabled: false,
    icon: (
      <svg style={{ width: 14, height: 14 }} viewBox="0 0 200 200" fill="none">
        <path stroke="#0ea5e9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9" d="M113.5,51.5l-35,60h31l-24,37" />
        <path stroke="#0ea5e9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9" d="M85.5,100h-20" />
        <path stroke="#0ea5e9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9" d="M134.5,100h-20" />
      </svg>
    )
  },
  {
    id: 'utility', name: 'Utility+', enabled: false,
    icon: (
      <svg style={{ width: 14, height: 14 }} viewBox="0 0 200 200" fill="none">
        <path stroke="#75fbb9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" d="M112.33,73.95c-1.74,1.78-1.74,4.62,0,6.4l7.31,7.31c1.78,1.74,4.62,1.74,6.4,0l14.2-14.2c1.46-1.47,3.95-1.01,4.49,1,4.02,14.61-4.57,29.71-19.18,33.72-6.17,1.7-12.75,1.18-18.58-1.46l-36.16,36.16c-3.79,3.79-9.93,3.79-13.71,0-3.79-3.79-3.79-9.93,0-13.71l36.16-36.16c-6.25-13.8-.12-30.05,13.68-36.3,5.83-2.64,12.41-3.16,18.58-1.46,2,.55,2.47,3.03,1,4.5l-14.2,14.2Z" />
      </svg>
    )
  },

  {
    id: 'supergif', name: 'SuperGIF', enabled: false,
    icon: (
      <svg style={{ width: 14, height: 14 }} viewBox="0 0 200 200" fill="none">
        <path stroke="#845eee" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.92" d="M114.74,112.76c0-2.82,2.27-5.11,5.08-5.11.93,0,1.85.25,2.65.73l25.48,15.28c2.42,1.44,3.21,4.57,1.77,6.99-.43.73-1.04,1.34-1.77,1.77l-25.48,15.28c-2.41,1.46-5.54.68-7-1.73-.48-.8-.74-1.72-.73-2.66v-30.56Z" />
        <path stroke="#845eee" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.92" d="M145.33,98.32v-36.56c0-5.63-4.57-10.2-10.2-10.2H63.76c-5.63,0-10.2,4.57-10.2,10.2v71.38c0,5.63,4.57,10.2,10.2,10.2h30.59" />
        <path stroke="#845eee" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.92" d="M68.85,143.34l25.49-25.49" />
        <circle stroke="#845eee" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.92" cx="84.15" cy="82.15" r="10.2" />
      </svg>
    )
  },
  {
    id: 'effector', name: 'Effector', enabled: false,
    icon: (
      <svg style={{ width: 14, height: 14 }} viewBox="0 0 200 200" fill="none">
        <path stroke="#e14f62" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.04" d="M91.27,54.9c5.76-1.12,11.69-1.12,17.45,0" />
        <path stroke="#e14f62" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.04" d="M125.72,61.93c4.88,3.3,9.07,7.51,12.35,12.4" />
        <path stroke="#e14f62" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.04" d="M145.1,91.27c1.12,5.76,1.12,11.69,0,17.45" />
        <path stroke="#e14f62" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.04" d="M138.07,125.72c-3.3,4.88-7.51,9.07-12.4,12.35" />
        <path stroke="#e14f62" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.04" d="M108.73,145.1c-5.76,1.12-11.69,1.12-17.45,0" />
        <path stroke="#e14f62" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.04" d="M74.28,138.07c-4.88-3.3-9.07-7.51-12.35-12.4" />
        <path stroke="#e14f62" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.04" d="M54.9,108.73c-1.12-5.76-1.12-11.69,0-17.45" />
        <path stroke="#e14f62" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.04" d="M61.93,74.28c3.3-4.88,7.51-9.07,12.4-12.35" />
        <circle stroke="#e14f62" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.04" cx="100" cy="100" r="4.59" />
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
            ; (e.currentTarget as HTMLElement).style.color = '#c5c5d9'
        }
      }}
      onMouseLeave={e => {
        if (!isActive && mod.enabled) {
          (e.currentTarget as HTMLElement).style.background = 'transparent'
            ; (e.currentTarget as HTMLElement).style.color = '#8e8ea8'
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

export default function Sidebar({ activeModule, onModuleChange, hasExtensionPath }: SidebarProps) {
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

      <div className="app-sidebar-scroll" style={{ padding: '4px 6px' }}>
        {modules.map((mod) => (
          <NavButton
            key={mod.id}
            mod={{ ...mod, enabled: mod.enabled && hasExtensionPath }}
            isActive={activeModule === mod.id && mod.enabled && hasExtensionPath}
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
