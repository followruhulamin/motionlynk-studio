import { useState, useEffect } from 'react'

interface ExpoHealthDashboardProps {
  extensionPath: string
  onClose: () => void
}

interface ExpoValidationResult {
  totalExpressions: number
  totalCategories: number
  missingPreviews: string[]
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

export default function ExpoHealthDashboard({ extensionPath, onClose }: ExpoHealthDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [isRerunning, setIsRerunning] = useState(false)
  const [result, setResult] = useState<ExpoValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runValidation = async (quiet = false) => {
    if (!quiet) setIsLoading(true)
    else setIsRerunning(true)
    setError(null)
    try {
      // @ts-ignore
      const data = await window.api.validateExpoLibrary(extensionPath)
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
    ? result.missingPreviews.length + result.duplicateIds.length + result.invalidCategories.length + result.orphanedFiles.length
    : 0

  const missingBadge = result ? result.missingPreviews.length : 0
  const orphanBadge  = result?.orphanedFiles.length || 0
  const dupBadge     = result ? result.duplicateIds.length + result.invalidCategories.length : 0

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
              <span style={{ fontSize: 14, fontWeight: 700, color: '#dddde9' }}>Expo Health Dashboard</span>
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
              {result?.totalExpressions} expressions · {result?.totalCategories} categories checked
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
                  <div style={{ display: 'flex', gap: 10 }}>
                    <StatCard label="Total Expressions" value={result.totalExpressions} />
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

                  <div>
                    <div style={{
                      fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.08em', color: '#55556a', marginBottom: 8,
                    }}>
                      Asset Checklist
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <CheckRow
                        label="GIF Previews"
                        ok={result.missingPreviews.length === 0}
                        good="All accounted for"
                        bad={`${result.missingPreviews.length} missing`}
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

                  {result.lastModified && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 10, color: '#55556a', marginTop: 4,
                    }}>
                      <svg style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="6" x2="12" y2="12" /><line x1="12" y1="12" x2="16" y2="14" />
                      </svg>
                      Last modified <code style={{ color: '#8e8ea8', fontFamily: 'monospace' }}>expo_library.json</code> : {new Date(result.lastModified).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {/* ── MISSING ASSETS ───────────────────────── */}
              {activeTab === 'missing' && (
                <div>
                  {result.missingPreviews.length === 0 ? (
                    <div style={{ color: '#8e8ea8', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>All MP4s are present.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {result.missingPreviews.map(id => (
                        <div key={id} style={{
                          padding: '10px 14px', background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8,
                          display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                          <div style={{
                            padding: '4px 8px', background: 'rgba(255,95,95,0.1)',
                            color: '#ff5f5f', borderRadius: 4, fontSize: 10, fontWeight: 700,
                          }}>MP4</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, color: '#dddde9', fontWeight: 500 }}>{id}</div>
                            <div style={{ fontSize: 11, color: '#55556a', fontFamily: 'monospace' }}>Missing {id}.mp4</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── ORPHANED FILES ───────────────────────── */}
              {activeTab === 'orphans' && (
                <div>
                  {result.orphanedFiles.length === 0 ? (
                    <div style={{ color: '#8e8ea8', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>No orphaned files found.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {result.orphanedFiles.map((f, i) => (
                        <div key={i} style={{
                          padding: '10px 14px', background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8,
                          display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                          <div style={{
                            padding: '4px 8px', background: 'rgba(245,166,35,0.1)',
                            color: '#f5a623', borderRadius: 4, fontSize: 10, fontWeight: 700,
                          }}>previews</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, color: '#dddde9', fontWeight: 500 }}>{f.file}</div>
                            <div style={{ fontSize: 11, color: '#55556a' }}>This MP4 is in the previews folder but not linked to any expression.</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── DUPLICATES & INTEGRITY ───────────────── */}
              {activeTab === 'duplicates' && (
                <div>
                  {result.duplicateIds.length === 0 && result.invalidCategories.length === 0 ? (
                    <div style={{ color: '#8e8ea8', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>Data integrity is perfect.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {result.duplicateIds.length > 0 && (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#ff5f5f', marginBottom: 8, textTransform: 'uppercase' }}>Duplicate IDs</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {result.duplicateIds.map(id => (
                              <div key={id} style={{
                                padding: '10px 14px', background: 'rgba(255,95,95,0.05)',
                                border: '1px solid rgba(255,95,95,0.15)', borderRadius: 8,
                                color: '#dddde9', fontSize: 13,
                              }}>
                                ID <strong style={{ color: '#ff5f5f' }}>{id}</strong> is used by multiple expressions.
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {result.invalidCategories.length > 0 && (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#f5a623', marginBottom: 8, textTransform: 'uppercase' }}>Invalid Categories</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {result.invalidCategories.map((item, i) => (
                              <div key={i} style={{
                                padding: '10px 14px', background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8,
                                color: '#dddde9', fontSize: 13,
                              }}>
                                Expression <strong>{item.id}</strong> uses category <strong style={{ color: '#f5a623' }}>"{item.category}"</strong> which is not in the master list.
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>
        
        {/* ── Footer ─────────────────────────────────────────── */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0,
        }}>
          <button
            onClick={() => runValidation(true)}
            disabled={isRerunning}
            style={{
              padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: '#8e8ea8', fontSize: 12, fontWeight: 600,
              cursor: isRerunning ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <svg style={{
              width: 13, height: 13,
              animation: isRerunning ? 'spin 1s linear infinite' : 'none'
            }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            Re-run Checks
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '8px 24px', background: '#4f8eff', border: 'none',
              borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>

      </div>
    </div>
  )
}
