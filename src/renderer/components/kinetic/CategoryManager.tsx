import { useState, useEffect, useRef } from 'react'

interface CategoryItem {
  name: string
  count: number
}

interface CategoryManagerProps {
  extensionPath: string
  onClose: () => void
  onChanged: () => void
}

export default function CategoryManager({
  extensionPath,
  onClose,
  onChanged,
}: CategoryManagerProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null)
  const [deleteAction, setDeleteAction] = useState<'move' | 'delete'>('move')
  const [targetCategory, setTargetCategory] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  const loadCategories = async () => {
    try {
      const result = await window.api.getCategories(extensionPath)
      setCategories(result)
      if (result.length > 0) {
        const defaultTarget = result.find((c: CategoryItem) => c.name !== deletingCategory?.name)?.name || ''
        setTargetCategory(defaultTarget)
      }
    } catch (err) {
      setError((err as Error).message)
    }
  }

  useEffect(() => { loadCategories() }, [extensionPath])
  useEffect(() => { if (editingCategory && editInputRef.current) editInputRef.current.focus() }, [editingCategory])

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    setError(null)
    setIsLoading(true)
    try {
      await window.api.addCategory(extensionPath, newCategoryName.trim())
      setNewCategoryName('')
      await loadCategories()
      onChanged()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartRename = (catName: string) => {
    setEditingCategory(catName)
    setEditingName(catName)
  }

  const handleSaveRename = async () => {
    if (!editingCategory || !editingName.trim() || editingName === editingCategory) {
      setEditingCategory(null)
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      await window.api.renameCategory(extensionPath, editingCategory, editingName.trim())
      setEditingCategory(null)
      await loadCategories()
      onChanged()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (cat: CategoryItem) => {
    if (cat.count === 0) {
      confirmDeleteImmediately(cat.name)
    } else {
      setDeletingCategory(cat)
      const remaining = categories.filter((c) => c.name !== cat.name)
      if (remaining.length > 0) {
        setTargetCategory(remaining[0].name)
      } else {
        setDeleteAction('delete')
      }
    }
  }

  const confirmDeleteImmediately = async (catName: string) => {
    if (!confirm(`Delete category "${catName}"?`)) return
    setError(null)
    setIsLoading(true)
    try {
      await window.api.deleteCategory(extensionPath, catName, 'delete')
      await loadCategories()
      onChanged()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDeleteWithCascade = async () => {
    if (!deletingCategory) return
    setError(null)
    setIsLoading(true)
    try {
      await window.api.deleteCategory(
        extensionPath,
        deletingCategory.name,
        deleteAction,
        deleteAction === 'move' ? targetCategory : undefined
      )
      setDeletingCategory(null)
      await loadCategories()
      onChanged()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      animation: 'fadeIn 0.15s ease',
    }}>
      <div style={{
        width: 500, maxHeight: '82vh', display: 'flex', flexDirection: 'column',
        background: '#16161f',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 14,
        boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset',
        overflow: 'hidden',
        animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* ── Header ────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, rgba(79,142,255,0.2), rgba(79,142,255,0.06))',
            border: '1px solid rgba(79,142,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg style={{ width: 15, height: 15, color: '#4f8eff' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#dddde9' }}>Category Manager</div>
            <div style={{ fontSize: 11, color: '#55556a', marginTop: 1 }}>
              {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} · {categories.reduce((s, c) => s + c.count, 0)} total presets
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
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'
              ;(e.currentTarget as HTMLElement).style.color = '#dddde9'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
              ;(e.currentTarget as HTMLElement).style.color = '#55556a'
            }}
          >
            <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Add category form ─────────────────────── */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0, background: 'rgba(255,255,255,0.01)',
        }}>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#55556a', pointerEvents: 'none' }}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name…"
                style={{
                  width: '100%', height: 36, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8,
                  color: '#dddde9', fontSize: 12, padding: '0 10px 0 30px',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(79,142,255,0.45)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)' }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !newCategoryName.trim()}
              style={{
                height: 36, padding: '0 16px', borderRadius: 8, flexShrink: 0,
                background: newCategoryName.trim() ? '#4f8eff' : 'rgba(255,255,255,0.05)',
                border: '1px solid ' + (newCategoryName.trim() ? 'transparent' : 'rgba(255,255,255,0.09)'),
                color: newCategoryName.trim() ? '#fff' : '#55556a',
                fontSize: 12, fontWeight: 600, cursor: newCategoryName.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
            >
              Add
            </button>
          </form>

          {error && (
            <div style={{
              marginTop: 10, padding: '7px 12px', borderRadius: 6,
              background: 'rgba(255,95,95,0.08)', border: '1px solid rgba(255,95,95,0.2)',
              color: '#ff5f5f', fontSize: 11,
            }}>
              {error}
            </div>
          )}
        </div>

        {/* ── Category list ─────────────────────────── */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {/* Column headers */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 20px',
            background: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#55556a' }}>Category</span>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#55556a' }}>Presets</span>
          </div>

          {categories.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '40px 20px', gap: 10, color: '#55556a',
            }}>
              <svg style={{ width: 36, height: 36, opacity: 0.3 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
              </svg>
              <span style={{ fontSize: 12 }}>No categories yet. Add one above.</span>
            </div>
          ) : (
            categories.map((cat, index) => (
              <div
                key={cat.name}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '0 20px',
                  borderBottom: index < categories.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  minHeight: 48,
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {editingCategory === cat.name ? (
                  /* ── Edit mode ── */
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: '8px 0' }}>
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveRename(); if (e.key === 'Escape') setEditingCategory(null) }}
                      style={{
                        flex: 1, height: 32, background: 'rgba(79,142,255,0.08)',
                        border: '1px solid rgba(79,142,255,0.35)', borderRadius: 6,
                        color: '#dddde9', fontSize: 12, padding: '0 10px',
                        outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                    <button
                      onClick={handleSaveRename}
                      style={{
                        height: 30, padding: '0 12px', borderRadius: 6, flexShrink: 0,
                        background: '#4fcc8a', border: 'none', color: '#0a1a12',
                        fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      style={{
                        height: 30, padding: '0 10px', borderRadius: 6, flexShrink: 0,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                        color: '#8e8ea8', fontSize: 11, cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  /* ── Normal row ── */
                  <>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Color dot */}
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        background: cat.count > 0 ? '#4f8eff' : 'rgba(255,255,255,0.12)',
                      }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#c5c5d9' }}>
                        {cat.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Count badge */}
                      <span style={{
                        fontSize: 11, fontFamily: 'monospace', fontWeight: 600,
                        color: cat.count > 0 ? '#4f8eff' : '#55556a',
                        background: cat.count > 0 ? 'rgba(79,142,255,0.1)' : 'rgba(255,255,255,0.04)',
                        padding: '2px 8px', borderRadius: 4,
                        minWidth: 28, textAlign: 'center',
                      }}>
                        {cat.count}
                      </span>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => handleStartRename(cat.name)}
                          title="Rename"
                          style={{
                            width: 28, height: 28, borderRadius: 6, border: 'none',
                            background: 'transparent', color: '#55556a',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.12s',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(79,142,255,0.1)'
                            ;(e.currentTarget as HTMLElement).style.color = '#4f8eff'
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent'
                            ;(e.currentTarget as HTMLElement).style.color = '#55556a'
                          }}
                        >
                          <svg style={{ width: 13, height: 13 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cat)}
                          title="Delete"
                          style={{
                            width: 28, height: 28, borderRadius: 6, border: 'none',
                            background: 'transparent', color: '#55556a',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.12s',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,95,95,0.1)'
                            ;(e.currentTarget as HTMLElement).style.color = '#ff5f5f'
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent'
                            ;(e.currentTarget as HTMLElement).style.color = '#55556a'
                          }}
                        >
                          <svg style={{ width: 13, height: 13 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* ── Footer ────────────────────────────────── */}
        <div style={{
          padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'flex-end', flexShrink: 0,
          background: 'rgba(255,255,255,0.01)',
        }}>
          <button
            onClick={onClose}
            style={{
              height: 32, padding: '0 18px', borderRadius: 7,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#8e8ea8', fontSize: 12, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'
              ;(e.currentTarget as HTMLElement).style.color = '#dddde9'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
              ;(e.currentTarget as HTMLElement).style.color = '#8e8ea8'
            }}
          >
            Done
          </button>
        </div>
      </div>

      {/* ── Cascade delete sub-dialog ──────────────── */}
      {deletingCategory && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.15s ease',
        }}>
          <div style={{
            width: 420, background: '#18181f',
            border: '1px solid rgba(255,95,95,0.18)',
            borderRadius: 14, padding: 24,
            boxShadow: '0 32px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03) inset',
            display: 'flex', flexDirection: 'column', gap: 18,
            animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            {/* Warning header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                background: 'rgba(255,95,95,0.12)', border: '1px solid rgba(255,95,95,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg style={{ width: 16, height: 16, color: '#ff5f5f' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ff5f5f', marginBottom: 4 }}>Category has presets</div>
                <p style={{ fontSize: 12, color: '#8e8ea8', lineHeight: 1.6 }}>
                  <span style={{ color: '#dddde9', fontWeight: 500 }}>"{deletingCategory.name}"</span> contains{' '}
                  <span style={{ color: '#4f8eff', fontWeight: 700, fontFamily: 'monospace' }}>{deletingCategory.count}</span> preset{deletingCategory.count !== 1 ? 's' : ''}.
                  Choose what to do with them:
                </p>
              </div>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Move option */}
              <label style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 9, cursor: 'pointer',
                border: `1px solid ${deleteAction === 'move' ? 'rgba(79,142,255,0.4)' : 'rgba(255,255,255,0.07)'}`,
                background: deleteAction === 'move' ? 'rgba(79,142,255,0.07)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.15s',
              }}>
                <input
                  type="radio"
                  name="deleteAction"
                  checked={deleteAction === 'move'}
                  onChange={() => setDeleteAction('move')}
                  disabled={categories.filter((c) => c.name !== deletingCategory.name).length === 0}
                  style={{ accentColor: '#4f8eff', width: 14, height: 14, flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#dddde9', marginBottom: 6 }}>
                    Move presets to another category
                  </div>
                  <select
                    disabled={deleteAction !== 'move'}
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    style={{
                      width: '100%', height: 30, background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
                      color: '#dddde9', fontSize: 11, padding: '0 8px', outline: 'none',
                      cursor: 'pointer', opacity: deleteAction !== 'move' ? 0.4 : 1,
                    }}
                  >
                    {categories
                      .filter((c) => c.name !== deletingCategory.name)
                      .map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                  </select>
                </div>
              </label>

              {/* Delete option */}
              <label style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 9, cursor: 'pointer',
                border: `1px solid ${deleteAction === 'delete' ? 'rgba(255,95,95,0.35)' : 'rgba(255,255,255,0.07)'}`,
                background: deleteAction === 'delete' ? 'rgba(255,95,95,0.06)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.15s',
              }}>
                <input
                  type="radio"
                  name="deleteAction"
                  checked={deleteAction === 'delete'}
                  onChange={() => setDeleteAction('delete')}
                  style={{ accentColor: '#ff5f5f', width: 14, height: 14, flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#ff5f5f', marginBottom: 2 }}>
                    Delete presets &amp; all files permanently
                  </div>
                  <div style={{ fontSize: 11, color: '#55556a' }}>
                    Removes .ffx, preview, and thumbnail files from disk
                  </div>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => setDeletingCategory(null)}
                style={{
                  height: 34, padding: '0 16px', borderRadius: 7,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                  color: '#8e8ea8', fontSize: 12, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteWithCascade}
                style={{
                  height: 34, padding: '0 16px', borderRadius: 7,
                  background: '#ff5f5f', border: 'none',
                  color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
