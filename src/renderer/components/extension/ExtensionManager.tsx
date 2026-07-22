import { useState, useEffect } from 'react'

interface ModuleInfo {
  id: string
  name: string
  version: string
}

interface ExtensionInfo {
  version: string
  bundleId: string
  bundleName: string
  modules: ModuleInfo[]
}

interface ExtensionManagerProps {
  extensionPath: string
  onExtensionPathChange?: (newPath: string) => void
}

interface ModuleVersionEditorProps {
  moduleId: string
  initialVersion: string
  extensionPath: string
  onSave: (newVer: string) => Promise<void>
}

function ModuleVersionEditor({
  moduleId,
  initialVersion,
  onSave
}: ModuleVersionEditorProps) {
  const [val, setVal] = useState(initialVersion)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setVal(initialVersion)
  }, [initialVersion])

  const hasChanged = val.trim() !== initialVersion && val.trim() !== ''

  const handleSave = async () => {
    if (!hasChanged || isSaving) return
    setIsSaving(true)
    try {
      await onSave(val.trim())
      setIsEditing(false)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') {
              setVal(initialVersion)
              setIsEditing(false)
            }
          }}
          style={{
            width: 64,
            height: 24,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(79,142,255,0.4)',
            borderRadius: 4,
            color: '#dddde9',
            fontSize: 10,
            fontFamily: 'monospace',
            padding: '0 6px',
            outline: 'none',
          }}
          autoFocus
        />
        <button
          onClick={handleSave}
          disabled={!hasChanged || isSaving}
          style={{
            background: hasChanged ? 'rgba(79,204,138,0.1)' : 'rgba(255,255,255,0.02)',
            border: '1px solid ' + (hasChanged ? 'rgba(79,204,138,0.3)' : 'rgba(255,255,255,0.06)'),
            borderRadius: 4,
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: hasChanged ? 'pointer' : 'not-allowed',
            opacity: hasChanged ? 1 : 0.5,
          }}
        >
          <svg style={{ width: 12, height: 12, color: '#4fcc8a' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
        <button
          onClick={() => {
            setVal(initialVersion)
            setIsEditing(false)
          }}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4,
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg style={{ width: 12, height: 12, color: '#8e8ea8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
        color: '#8e8ea8', background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.07)',
        padding: '2px 8px', borderRadius: 4,
      }}>
        v{initialVersion}
      </span>
      <button
        onClick={() => setIsEditing(true)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#55556a',
          padding: 4,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.color = '#8e8ea8'
          ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.color = '#55556a'
          ;(e.currentTarget as HTMLElement).style.background = 'none'
        }}
        title="Edit module version"
      >
        <svg style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </button>
    </div>
  )
}

export default function ExtensionManager({ extensionPath, onExtensionPathChange }: ExtensionManagerProps) {
  const [info, setInfo] = useState<ExtensionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editingVersion, setEditingVersion] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const loadInfo = async () => {
    if (!extensionPath) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await window.api.getExtensionInfo(extensionPath)
      setInfo(data)
      setEditingVersion(data.version)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadInfo() }, [extensionPath])

  // Keep editingVersion in sync whenever info.version changes (e.g. after a successful save)
  useEffect(() => {
    if (info?.version) setEditingVersion(info.version)
  }, [info?.version])

  const handleSaveVersion = async () => {
    if (!editingVersion.trim() || !info) return
    setSaveError(null)
    setSaveSuccess(false)
    setIsSaving(true)
    try {
      const updated = await window.api.setExtensionVersion(extensionPath, editingVersion.trim())
      // Explicitly re-read and update both info and editingVersion so badge + input always reflect saved state
      setInfo(updated)
      setEditingVersion(updated.version)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError((err as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const hasChange = info && editingVersion !== info.version && editingVersion.trim() !== ''

  // ── No folder connected ──────────────────────────────────────────────────
  if (!extensionPath) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 14, color: '#55556a', padding: 40,
      }}>
        <svg style={{ width: 40, height: 40, opacity: 0.25 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
        </svg>
        <p style={{ fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
          Connect an extension folder first.
        </p>
        <button
          onClick={async () => {
            if (onExtensionPathChange) {
              try {
                const result = await window.api.selectFolder()
                if (result) onExtensionPathChange(result)
              } catch (err) {
                console.error('Failed to select folder:', err)
              }
            }
          }}
          style={{
            height: 36, padding: '0 20px', borderRadius: 8,
            background: 'linear-gradient(135deg, #4f8eff, #3a7aff)',
            border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 12px rgba(79,142,255,0.3)', transition: 'all 0.2s',
          }}
        >
          <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Select Extension Folder
        </button>
      </div>
    )
  }

  return (
    <div style={{
      flex: 1, minHeight: 0, overflowY: 'auto',
      padding: '24px 24px 60px 24px', display: 'flex', flexDirection: 'column', gap: 20,
      boxSizing: 'border-box',
    }}>
      {/* Page header */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#dddde9', marginBottom: 4 }}>
          Extension Settings
        </h2>
        <p style={{ fontSize: 12, color: '#55556a', lineHeight: 1.6 }}>
          Manage core properties of your MotionLynk CEP extension.
          Changes are written directly to extension files.
        </p>
      </div>

      {/* Loading / error */}
      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#55556a', fontSize: 12 }}>
          <div style={{
            width: 14, height: 14, border: '2px solid rgba(255,255,255,0.1)',
            borderTopColor: '#4f8eff', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          Loading extension info…
        </div>
      )}

      {error && (
        <div style={{
          padding: '10px 14px', background: 'rgba(255,95,95,0.08)',
          border: '1px solid rgba(255,95,95,0.2)', borderRadius: 8,
          color: '#ff5f5f', fontSize: 12,
        }}>
          {error}
        </div>
      )}

      {!isLoading && info && (
        <>
          {/* ── Extension identity card ────────────────────────────── */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            {/* Card header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'linear-gradient(135deg, rgba(79,142,255,0.2), rgba(79,142,255,0.06))',
                border: '1px solid rgba(79,142,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg style={{ width: 14, height: 14, color: '#4f8eff' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#dddde9' }}>{info.bundleName}</div>
                <div style={{ fontSize: 10, color: '#55556a', fontFamily: 'monospace' }}>{info.bundleId}</div>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{
                fontSize: 10, fontWeight: 700, fontFamily: 'monospace',
                color: '#4fcc8a', background: 'rgba(79,204,138,0.1)',
                border: '1px solid rgba(79,204,138,0.2)',
                padding: '3px 10px', borderRadius: 100,
              }}>
                v{info.version}
              </div>
              {/* Reload from disk */}
              <button
                onClick={loadInfo}
                title="Reload info from disk"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#55556a', padding: 4, borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#8e8ea8'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#55556a'}
              >
                <svg style={{ width: 13, height: 13 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </button>
            </div>

            {/* Identity fields */}
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Row label="Bundle ID" value={info.bundleId} mono />
              <Row label="Bundle Name" value={info.bundleName} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 11, color: '#55556a', flexShrink: 0 }}>Extension Path</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', minWidth: 0 }}>
                  <span style={{
                    fontSize: 10, fontFamily: 'monospace', color: '#8e8ea8',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    direction: 'rtl', textAlign: 'right',
                  }} title={extensionPath}>
                    {extensionPath}
                  </span>
                  <button
                    onClick={async () => {
                      if (onExtensionPathChange) {
                        try {
                          const result = await window.api.selectFolder()
                          if (result) onExtensionPathChange(result)
                        } catch (err) {
                          console.error('Failed to select folder:', err)
                        }
                      }
                    }}
                    title="Relink extension folder"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 6,
                      background: 'rgba(79,142,255,0.1)',
                      border: '1px solid rgba(79,142,255,0.25)',
                      color: '#4f8eff', fontSize: 11, fontWeight: 600,
                      cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(79,142,255,0.2)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(79,142,255,0.1)'
                    }}
                  >
                    <svg style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Relink Folder
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Version control card ───────────────────────────────── */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'linear-gradient(135deg, rgba(245,166,35,0.18), rgba(245,166,35,0.06))',
                border: '1px solid rgba(245,166,35,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg style={{ width: 14, height: 14, color: '#f5a623' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#dddde9' }}>Core Extension Version</div>
                <div style={{ fontSize: 10, color: '#55556a' }}>Updates manifest.xml and host/index.html</div>
              </div>
            </div>

            <div style={{ padding: '16px' }}>
              {/* Files that will be updated */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14,
              }}>
                {[
                  'CSXS/manifest.xml',
                  'host/index.html',
                ].map(f => (
                  <span key={f} style={{
                    fontSize: 10, fontFamily: 'monospace', color: '#8e8ea8',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                    padding: '2px 8px', borderRadius: 4,
                  }}>
                    {f}
                  </span>
                ))}
              </div>

              {/* Version input */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    value={editingVersion}
                    onChange={e => setEditingVersion(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && hasChange) handleSaveVersion() }}
                    placeholder="e.g. 1.2.3"
                    style={{
                      width: '100%', height: 38, boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${hasChange ? 'rgba(245,166,35,0.45)' : 'rgba(255,255,255,0.09)'}`,
                      borderRadius: 8, color: '#dddde9', fontSize: 16,
                      fontFamily: 'monospace', fontWeight: 600,
                      padding: '0 12px', outline: 'none',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={e => { if (!hasChange) e.target.style.borderColor = 'rgba(79,142,255,0.45)' }}
                    onBlur={e => { if (!hasChange) e.target.style.borderColor = 'rgba(255,255,255,0.09)' }}
                  />
                </div>

                <button
                  onClick={handleSaveVersion}
                  disabled={!hasChange || isSaving}
                  style={{
                    height: 38, padding: '0 18px', borderRadius: 8, flexShrink: 0,
                    background: hasChange ? '#f5a623' : 'rgba(255,255,255,0.04)',
                    border: '1px solid ' + (hasChange ? 'transparent' : 'rgba(255,255,255,0.07)'),
                    color: hasChange ? '#1a1000' : '#55556a',
                    fontSize: 12, fontWeight: 700,
                    cursor: hasChange && !isSaving ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                  }}
                >
                  {isSaving ? 'Saving…' : 'Update Core Version'}
                </button>
              </div>

              {/* Feedback */}
              {saveSuccess && (
                <div style={{
                  marginTop: 10, padding: '7px 12px', borderRadius: 6,
                  background: 'rgba(79,204,138,0.08)', border: '1px solid rgba(79,204,138,0.2)',
                  color: '#4fcc8a', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <svg style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Core Extension Version updated successfully.
                </div>
              )}
              {saveError && (
                <div style={{
                  marginTop: 10, padding: '7px 12px', borderRadius: 6,
                  background: 'rgba(255,95,95,0.08)', border: '1px solid rgba(255,95,95,0.2)',
                  color: '#ff5f5f', fontSize: 11,
                }}>
                  {saveError}
                </div>
              )}

              <p style={{ marginTop: 10, fontSize: 10, color: '#55556a', lineHeight: 1.6 }}>
                Format: <span style={{ fontFamily: 'monospace', color: '#8e8ea8' }}>X</span>,{' '}
                <span style={{ fontFamily: 'monospace', color: '#8e8ea8' }}>X.X</span>, or{' '}
                <span style={{ fontFamily: 'monospace', color: '#8e8ea8' }}>X.X.X</span>
              </p>
            </div>
          </div>

          {/* ── Modules list ───────────────────────────────────────── */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'linear-gradient(135deg, rgba(79,204,138,0.18), rgba(79,204,138,0.06))',
                border: '1px solid rgba(79,204,138,0.2)',
                display: 'flex', alignItems: 'center', justifyItems: 'center',
                justifyContent: 'center',
              }}>
                <svg style={{ width: 14, height: 14, color: '#4fcc8a' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#dddde9' }}>Modules</div>
                <div style={{ fontSize: 10, color: '#55556a' }}>{info.modules.length} modules detected. Edit module version individually.</div>
              </div>
            </div>
            <div>
              {info.modules.map((mod, i) => (
                <div key={mod.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 16px',
                  borderBottom: i < info.modules.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4fcc8a', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#c5c5d9' }}>{mod.name}</div>
                      <div style={{ fontSize: 10, color: '#55556a', fontFamily: 'monospace' }}>{mod.id}</div>
                    </div>
                  </div>
                  <ModuleVersionEditor
                    moduleId={mod.id}
                    initialVersion={mod.version}
                    extensionPath={extensionPath}
                    onSave={async (newVer) => {
                      const updated = await window.api.setModuleVersion(extensionPath, mod.id, newVer)
                      setInfo(updated)
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function Row({ label, value, mono, small }: { label: string; value: string; mono?: boolean; small?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: 11, color: '#55556a', flexShrink: 0 }}>{label}</span>
      <span style={{
        fontSize: small ? 10 : 12, fontFamily: mono ? 'monospace' : 'inherit',
        color: '#8e8ea8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        direction: 'rtl', textAlign: 'right',
      }} title={value}>
        {value}
      </span>
    </div>
  )
}
