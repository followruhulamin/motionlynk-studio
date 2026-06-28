interface KineticSettingsProps {
  currentPath: string
  onPathChange: (newPath: string) => void
  onClose: () => void
}

export default function KineticSettings({ currentPath, onPathChange, onClose }: KineticSettingsProps) {
  const handleBrowse = async () => {
    try {
      const result = await window.api.selectFolder()
      if (result) {
        onPathChange(result)
        onClose()
      }
    } catch (err) {
      console.error('Failed to select folder:', err)
    }
  }

  const handleClear = () => {
    localStorage.removeItem('extensionPath')
    onPathChange('')
    onClose()
  }

  const shortPath = currentPath
    ? currentPath.split('/').slice(-3).join('/')
    : ''

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.15s ease',
    }}>
      <div style={{
        width: 480, display: 'flex', flexDirection: 'column',
        background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
        overflow: 'hidden', animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(79,142,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg style={{ width: 16, height: 16, color: '#4f8eff' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#dddde9' }}>Kinetic Settings</div>
              <div style={{ fontSize: 11, color: '#55556a', marginTop: 1 }}>Configure extension folder path</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#55556a', padding: 4, display: 'flex',
              alignItems: 'center', borderRadius: 6,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#8e8ea8' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#55556a' }}
          >
            <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {/* Section label */}
          <div style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: '#55556a', marginBottom: 10,
          }}>
            MotionLynk Extension Folder
          </div>

          {/* Description */}
          <p style={{ fontSize: 12, color: '#8e8ea8', marginBottom: 16, lineHeight: 1.6 }}>
            Select the root folder of your MotionLynk extension. This is the folder that contains
            the <code style={{ fontFamily: 'monospace', color: '#4f8eff', background: 'rgba(79,142,255,0.1)', padding: '1px 5px', borderRadius: 3 }}>modules/</code> directory with your preset data.
          </p>

          {/* Current path display */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${currentPath ? 'rgba(79,142,255,0.25)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 8, marginBottom: 16,
          }}>
            <svg
              style={{ width: 16, height: 16, color: currentPath ? '#4f8eff' : '#55556a', flexShrink: 0 }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <div style={{ flex: 1, minWidth: 0 }}>
              {currentPath ? (
                <>
                  <div style={{ fontSize: 10, color: '#4fcc8a', fontWeight: 600, marginBottom: 1 }}>
                    Folder Connected
                  </div>
                  <div style={{
                    fontSize: 11, fontFamily: 'monospace', color: '#8e8ea8',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }} title={currentPath}>
                    …/{shortPath}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 10, color: '#f5a623', fontWeight: 600, marginBottom: 1 }}>
                    No Folder Selected
                  </div>
                  <div style={{ fontSize: 11, color: '#55556a' }}>
                    Click "Browse" to select your extension folder
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Browse button */}
          <button
            onClick={handleBrowse}
            style={{
              width: '100%', height: 40, borderRadius: 8,
              background: 'linear-gradient(135deg, #4f8eff, #3a7aff)',
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 16px rgba(79,142,255,0.3)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #6ba3ff, #4f8eff)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #4f8eff, #3a7aff)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
            }}
          >
            <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            Browse for Extension Folder
          </button>

          {/* Divider + hint */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
            <span style={{ fontSize: 10, color: '#55556a' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
          </div>

          {/* Full path input (manual entry) */}
          <div>
            <label style={{
              display: 'block', fontSize: 10, fontWeight: 600, color: '#55556a',
              textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
            }}>
              Manual Path Entry
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                defaultValue={currentPath}
                placeholder="/path/to/com.yourname.motionlynk"
                id="kinetic-manual-path"
                style={{
                  flex: 1, height: 34, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
                  color: '#dddde9', fontSize: 12, padding: '0 10px', outline: 'none',
                  fontFamily: 'monospace', boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(79,142,255,0.45)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById('kinetic-manual-path') as HTMLInputElement
                  const val = input?.value?.trim()
                  if (val) { onPathChange(val); onClose() }
                }}
                style={{
                  height: 34, padding: '0 14px', borderRadius: 6,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#dddde9', fontSize: 12, cursor: 'pointer', flexShrink: 0,
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          {currentPath ? (
            <button
              onClick={handleClear}
              style={{
                background: 'none', border: '1px solid rgba(255,95,95,0.2)',
                color: '#ff5f5f', fontSize: 11, cursor: 'pointer',
                padding: '5px 12px', borderRadius: 5,
              }}
            >
              Disconnect Folder
            </button>
          ) : <div />}
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              color: '#8e8ea8', fontSize: 12, cursor: 'pointer',
              padding: '6px 16px', borderRadius: 6,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
