export default function Header() {
  return (
    <header className="app-header">
      {/* Brand */}
      <div className="no-drag" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg
          style={{ width: 16, height: 16, color: '#4f8eff', flexShrink: 0 }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#8e8ea8', letterSpacing: '0.04em' }}>
          MotionLynk Studio
        </span>
      </div>

      {/* Center spacer */}
      <div style={{ flex: 1 }} />

      {/* Version badge */}
      <div className="no-drag" style={{
        fontSize: 10, color: '#55556a',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        padding: '2px 8px', borderRadius: 4,
      }}>
        v1.0.0
      </div>
    </header>
  )
}
