import { useState, useEffect } from 'react'

interface HealthDashboardProps {
  extensionPath: string
  onClose: () => void
}

interface ValidationResult {
  totalPresets: number
  totalCategories: number
  missingFfx: string[]
  missingPreviews: string[]
  missingThumbnails: string[]
  duplicateIds: string[]
  invalidCategories: { id: string; category: string }[]
  orphanedFiles: { dir: string; file: string }[]
  lastModified: string | null
}

type Tab = 'overview' | 'missing' | 'orphans' | 'duplicates'

const TAB_LABEL: Record<Tab, string> = {
  overview:   'Overview',
  missing:    'Missing Assets',
  orphans:    'Orphaned Files',
  duplicates: 'Integrity',
}

function TabButton({ id, active, label, badge, onClick }: {
  id: Tab; active: boolean; label: string; badge?: number; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '7px 14px', fontSize: 11, fontWeight: 600,
        cursor: 'pointer', border: 'none', background: 'none',
        borderBottom: active ? '2px solid #4f8eff' : '2px solid transparent',
        color: active ? '#4f8eff' : '#8e8ea8',
        transition: 'color 0.15s, border-color 0.15s',
        marginBottom: -1, flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLElement).style.color = '#c5c5d9'
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLElement).style.color = '#8e8ea8'
      }}
    >
      {label}
      {badge != null && badge > 0 && (
        <span style={{
          background: 'rgba(255,95,95,0.14)', color: '#ff5f5f',
          border: '1px solid rgba(255,95,95,0.28)',
          borderRadius: 10, fontSize: 9, padding: '0 5px',
          fontWeight: 700, lineHeight: 1.6,
        }}>
          {badge}
        </span>
      )}
    </button>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{
      flex: 1, padding: '12px 14px', borderRadius: 10,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#55556a', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'monospace', color: color || '#dddde9', lineHeight: 1 }}>
        {value}
      </div>
    </div>
  )
}

function CheckRow({ label, ok, good, bad }: { label: string; ok: boolean; good: string; bad: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 12px', borderRadius: 7,
      background: ok ? 'rgba(79,204,138,0.04)' : 'rgba(255,95,95,0.04)',
      border: `1px solid ${ok ? 'rgba(79,204,138,0.1)' : 'rgba(255,95,95,0.12)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: ok ? '#4fcc8a' : '#ff5f5f',
          boxShadow: ok ? '0 0 6px rgba(79,204,138,0.5)' : '0 0 6px rgba(255,95,95,0.5)',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 11, color: '#c5c5d9', fontWeight: 500 }}>{label}</span>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: ok ? '#4fcc8a' : '#ff5f5f' }}>
        {ok ? good : bad}
      </span>
    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#dddde9' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 10, color: '#55556a', marginTop: 2 }}>{subtitle}</div>}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 12px', borderRadius: 7,
      background: 'rgba(79,204,138,0.05)',
      border: '1px solid rgba(79,204,138,0.12)',
    }}>
      <svg style={{ width: 13, height: 13, color: '#4fcc8a', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span style={{ fontSize: 11, color: '#4fcc8a', fontWeight: 500 }}>{message}</span>
    </div>
  )
}

function FileList({ items, renderItem }: { items: React.ReactNode[] }) {
  return (
    <div style={{
      borderRadius: 8, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.07)',
      maxHeight: 160, overflowY: 'auto',
    }}>
      {items}
    </div>
  )
}

export default function HealthDashboard({ extensionPath, onClose }: HealthDashboardProps) {
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [isRerunning, setIsRerunning] = useState(false)

  const runValidation = async (quiet = false) => {
    if (!quiet) setIsLoading(true)
    else setIsRerunning(true)
    setError(null)
    try {
      const data = await window.api.validatePresets(extensionPath)
      setResult(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
      setIsRerunning(false)
    }
  }

  useEffect(() => { runValidation() }, [extensionPath])

  const issueCount = result
    ? result.missingFfx.length + result.missingPreviews.length + result.missingThumbnails.length
      + result.duplicateIds.length + result.invalidCategories.length + result.orphanedFiles.length
    : 0

  const missingBadge = result
    ? result.missingFfx.length + result.missingPreviews.length + result.missingThumbnails.length
    : 0
  const orphanBadge  = result?.orphanedFiles.length || 0
  const dupBadge     = result ? result.duplicateIds.length + result.invalidCategories.length : 0

  // ── Loading screen ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          padding: '28px 40px', background: '#16161f',
          border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14,
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        }}>
          <div style={{
            width: 28, height: 28, border: '3px solid rgba(79,142,255,0.2)',
            borderTopColor: '#4f8eff', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontSize: 12, color: '#8e8ea8', fontWeight: 500 }}>Running health checks…</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      animation: 'fadeIn 0.15s ease',
    }}>
      <div style={{
        width: 640, maxHeight: '86vh', display: 'flex', flexDirection: 'column',
        background: '#16161f',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 14,
        boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset',
        overflow: 'hidden',
        animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: issueCount > 0
              ? 'linear-gradient(135deg, rgba(255,95,95,0.18), rgba(255,95,95,0.06))'
              : 'linear-gradient(135deg, rgba(79,204,138,0.18), rgba(79,204,138,0.06))',
            border: `1px solid ${issueCount > 0 ? 'rgba(255,95,95,0.2)' : 'rgba(79,204,138,0.2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {issueCount > 0 ? (
              <svg style={{ width: 16, height: 16, color: '#ff5f5f' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : (
              <svg style={{ width: 16, height: 16, color: '#4fcc8a' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#dddde9' }}>System Health Dashboard</span>
              {issueCount > 0 ? (
                <span style={{
                  background: 'rgba(255,95,95,0.1)', border: '1px solid rgba(255,95,95,0.25)',
                  color: '#ff5f5f', padding: '2px 8px', borderRadius: 20,
                  fontSize: 10, fontWeight: 700,
                }}>
                  {issueCount} Issue{issueCount !== 1 ? 's' : ''}
                </span>
              ) : (
                <span style={{
                  background: 'rgba(79,204,138,0.1)', border: '1px solid rgba(79,204,138,0.25)',
                  color: '#4fcc8a', padding: '2px 8px', borderRadius: 20,
                  fontSize: 10, fontWeight: 700,
                }}>
                  All Healthy
                </span>
              )}
            </div>
            <div style={{ fontSize: 10, color: '#55556a', marginTop: 1 }}>
              {result?.totalPresets} presets · {result?.totalCategories} categories checked
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#55556a',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'
              ;(e.currentTarget as HTMLElement).style.color = '#dddde9'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
              ;(e.currentTarget as HTMLElement).style.color = '#55556a'
            }}
          >
            <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Tabs ───────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '0 12px', flexShrink: 0,
          background: 'rgba(255,255,255,0.01)',
          overflowX: 'auto',
        }}>
          {(['overview', 'missing', 'orphans', 'duplicates'] as Tab[]).map(tab => (
            <TabButton
              key={tab} id={tab} active={activeTab === tab}
              label={TAB_LABEL[tab]}
              badge={
                tab === 'missing' ? (missingBadge > 0 ? missingBadge : undefined)
                : tab === 'orphans' ? (orphanBadge > 0 ? orphanBadge : undefined)
                : tab === 'duplicates' ? (dupBadge > 0 ? dupBadge : undefined)
                : undefined
              }
              onClick={() => setActiveTab(tab)}
            />
          ))}
        </div>

        {/* ── Content ────────────────────────────────────────── */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '18px 20px' }}>

          {error && (
            <div style={{
              padding: '10px 14px', background: 'rgba(255,95,95,0.07)',
              border: '1px solid rgba(255,95,95,0.2)', borderRadius: 8,
              color: '#ff5f5f', fontSize: 11, marginBottom: 14,
            }}>
              {error}
            </div>
          )}

          {result && (
            <>
              {/* ── OVERVIEW ─────────────────────────────── */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Stat row */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <StatCard label="Total Presets" value={result.totalPresets} />
                    <StatCard label="Categories" value={result.totalCategories} />
                    <StatCard
                      label="Orphaned Files"
                      value={result.orphanedFiles.length}
                      color={result.orphanedFiles.length > 0 ? '#f5a623' : '#4fcc8a'}
                    />
                    <StatCard
                      label="Issues Found"
                      value={issueCount}
                      color={issueCount > 0 ? '#ff5f5f' : '#4fcc8a'}
                    />
                  </div>

                  {/* Health checks */}
                  <div>
                    <div style={{
                      fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.08em', color: '#55556a', marginBottom: 8,
                    }}>
                      Asset Checklist
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <CheckRow
                        label="FFX Preset Files"
                        ok={result.missingFfx.length === 0}
                        good="All accounted for"
                        bad={`${result.missingFfx.length} missing`}
                      />
                      <CheckRow
                        label="Video Previews (.mp4)"
                        ok={result.missingPreviews.length === 0}
                        good="All accounted for"
                        bad={`${result.missingPreviews.length} missing`}
                      />
                      <CheckRow
                        label="Thumbnails"
                        ok={result.missingThumbnails.length === 0}
                        good="All accounted for"
                        bad={`${result.missingThumbnails.length} missing`}
                      />
                      <CheckRow
                        label="Duplicate IDs"
                        ok={result.duplicateIds.length === 0}
                        good="No duplicates"
                        bad={`${result.duplicateIds.length} conflicts`}
                      />
                      <CheckRow
                        label="Invalid Categories"
                        ok={result.invalidCategories.length === 0}
                        good="All categories valid"
                        bad={`${result.invalidCategories.length} invalid`}
                      />
                      <CheckRow
                        label="Orphaned Files"
                        ok={result.orphanedFiles.length === 0}
                        good="No orphans"
                        bad={`${result.orphanedFiles.length} orphaned`}
                      />
                    </div>
                  </div>

                  {/* Meta */}
                  {result.lastModified && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 10, color: '#55556a',
                    }}>
                      <svg style={{ width: 11, height: 11, flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      Last modified <code style={{ fontFamily: 'monospace', color: '#8e8ea8' }}>presets.json</code>:&nbsp;
                      <span style={{ color: '#8e8ea8' }}>{new Date(result.lastModified).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ── MISSING ASSETS ───────────────────────── */}
              {activeTab === 'missing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                  {/* FFX */}
                  <div>
                    <SectionHeader
                      title="Missing FFX Presets"
                      subtitle="Presets lacking their essential .ffx rendering file — they cannot be applied in After Effects."
                    />
                    {result.missingFfx.length === 0 ? (
                      <EmptyState message="No missing FFX files — all presets have their backend file." />
                    ) : (
                      <FileList items={result.missingFfx.map((id) => (
                        <div key={id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: 'rgba(255,95,95,0.03)',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff5f5f', flexShrink: 0 }} />
                            <code style={{ fontSize: 10, fontFamily: 'monospace', color: '#ff5f5f' }}>{id}.ffx</code>
                          </div>
                          <span style={{ fontSize: 9, color: '#55556a', fontStyle: 'italic' }}>Upload via Inspector Panel</span>
                        </div>
                      ))} />
                    )}
                  </div>

                  {/* Previews */}
                  <div>
                    <SectionHeader
                      title="Missing Video Previews"
                      subtitle="Presets without a live hover video preview (.mp4) — the preview area will be empty."
                    />
                    {result.missingPreviews.length === 0 ? (
                      <EmptyState message="No missing preview files — all presets have a video preview." />
                    ) : (
                      <FileList items={result.missingPreviews.map((id) => (
                        <div key={id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: 'rgba(245,166,35,0.03)',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f5a623', flexShrink: 0 }} />
                            <code style={{ fontSize: 10, fontFamily: 'monospace', color: '#f5a623' }}>{id}.mp4</code>
                          </div>
                          <span style={{ fontSize: 9, color: '#55556a', fontStyle: 'italic' }}>Upload via Inspector Panel</span>
                        </div>
                      ))} />
                    )}
                  </div>

                  {/* Thumbnails */}
                  <div>
                    <SectionHeader
                      title="Missing Thumbnails"
                      subtitle="Presets without a static thumbnail image (.png / .jpg) — the card will show a blank preview."
                    />
                    {result.missingThumbnails.length === 0 ? (
                      <EmptyState message="No missing thumbnails — all presets have an image." />
                    ) : (
                      <FileList items={result.missingThumbnails.map((id) => (
                        <div key={id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: 'rgba(255,255,255,0.02)',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#8e8ea8', flexShrink: 0 }} />
                            <code style={{ fontSize: 10, fontFamily: 'monospace', color: '#8e8ea8' }}>{id}.png</code>
                          </div>
                          <span style={{ fontSize: 9, color: '#55556a', fontStyle: 'italic' }}>Upload via Inspector Panel</span>
                        </div>
                      ))} />
                    )}
                  </div>
                </div>
              )}

              {/* ── ORPHANED FILES ───────────────────────── */}
              {activeTab === 'orphans' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <SectionHeader
                    title="Orphaned Files"
                    subtitle="Files present in extension folders that are NOT referenced in presets.json. These are wasting disk space and can be safely removed."
                  />
                  {result.orphanedFiles.length === 0 ? (
                    <EmptyState message="All files in the extension directories are correctly referenced." />
                  ) : (
                    <div style={{
                      borderRadius: 8, overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.07)',
                      maxHeight: 320, overflowY: 'auto',
                    }}>
                      {result.orphanedFiles.map((orph, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '9px 12px',
                          background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                          borderBottom: i < result.orphanedFiles.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <svg style={{ width: 11, height: 11, color: '#f5a623', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" />
                            </svg>
                            <div>
                              <code style={{ fontSize: 10, fontFamily: 'monospace', color: '#f5a623' }}>{orph.file}</code>
                              <div style={{ fontSize: 9, color: '#55556a', marginTop: 1 }}>dir: <span style={{ color: '#8e8ea8' }}>{orph.dir}</span></div>
                            </div>
                          </div>
                          <span style={{ fontSize: 9, color: '#55556a', flexShrink: 0, fontStyle: 'italic' }}>Manual cleanup recommended</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── DUPLICATES & INTEGRITY ───────────────── */}
              {activeTab === 'duplicates' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                  {/* Duplicate IDs */}
                  <div>
                    <SectionHeader
                      title="Duplicate Preset IDs"
                      subtitle="Critical — two or more preset entries share the same filesystem ID, causing conflicts."
                    />
                    {result.duplicateIds.length === 0 ? (
                      <EmptyState message="No duplicate IDs detected." />
                    ) : (
                      <FileList items={result.duplicateIds.map((id) => (
                        <div key={id} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px',
                          background: 'rgba(255,95,95,0.04)',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}>
                          <svg style={{ width: 11, height: 11, color: '#ff5f5f', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          <code style={{ fontSize: 10, fontFamily: 'monospace', color: '#ff5f5f' }}>ID Conflict: {id}</code>
                        </div>
                      ))} />
                    )}
                  </div>

                  {/* Invalid categories */}
                  <div>
                    <SectionHeader
                      title="Invalid Categories"
                      subtitle="Presets assigned to a category that does not exist in the categories list."
                    />
                    {result.invalidCategories.length === 0 ? (
                      <EmptyState message="All preset categories are valid." />
                    ) : (
                      <FileList items={result.invalidCategories.map((inv, idx) => (
                        <div key={idx} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: 'rgba(255,95,95,0.03)',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}>
                          <code style={{ fontSize: 10, fontFamily: 'monospace', color: '#c5c5d9' }}>{inv.id}</code>
                          <span style={{
                            fontSize: 10, color: '#ff5f5f',
                            background: 'rgba(255,95,95,0.1)', border: '1px solid rgba(255,95,95,0.2)',
                            padding: '1px 7px', borderRadius: 4,
                          }}>
                            "{inv.category}"
                          </span>
                        </div>
                      ))} />
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0, background: 'rgba(255,255,255,0.01)',
        }}>
          <button
            onClick={() => runValidation(true)}
            disabled={isRerunning}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 32, padding: '0 14px', borderRadius: 7,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: isRerunning ? '#55556a' : '#8e8ea8',
              fontSize: 11, fontWeight: 500, cursor: isRerunning ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              if (!isRerunning) {
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'
                ;(e.currentTarget as HTMLElement).style.color = '#dddde9'
              }
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
              ;(e.currentTarget as HTMLElement).style.color = '#8e8ea8'
            }}
          >
            <svg
              style={{
                width: 12, height: 12,
                animation: isRerunning ? 'spin 0.8s linear infinite' : 'none',
              }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {isRerunning ? 'Checking…' : 'Re-run Checks'}
          </button>
          <button
            onClick={onClose}
            style={{
              height: 32, padding: '0 20px', borderRadius: 7,
              background: 'linear-gradient(135deg, #4f8eff, #6ba3ff)',
              border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
          >
            Done
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
