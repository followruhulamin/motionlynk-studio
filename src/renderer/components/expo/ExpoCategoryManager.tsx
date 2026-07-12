import { useState } from 'react'

const PRESET_COLORS = [
  '#f97316', '#ea580c', '#8b5cf6', '#a855f7',
  '#10b981', '#3b82f6', '#ef4444', '#06b6d4',
  '#f59e0b', '#ec4899', '#84cc16', '#a1a1aa'
]

interface ExpoCategoryManagerProps {
  categories: string[]
  categoryColors: Record<string, string>
  onSave: (categories: string[], categoryColors: Record<string, string>) => Promise<void>
  onClose: () => void
}

export default function ExpoCategoryManager({
  categories: initialCategories,
  categoryColors: initialColors,
  onSave,
  onClose
}: ExpoCategoryManagerProps) {
  const [categories, setCategories] = useState<string[]>(initialCategories)
  const [colors, setColors] = useState<Record<string, string>>(initialColors)
  const [isSaving, setIsSaving] = useState(false)

  // Add new
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0])
  const [pickerOpenCat, setPickerOpenCat] = useState<string | null>(null)

  const handleAdd = () => {
    if (!newCatName.trim()) return
    const name = newCatName.trim()
    if (categories.includes(name)) return

    setCategories([...categories, name])
    setColors({ ...colors, [name]: newCatColor })
    setNewCatName('')
  }

  const handleDelete = (cat: string) => {
    if (!confirm(`Are you sure you want to delete the category "${cat}"? Expressions in this category will keep the category tag but it won't show in the main list.`)) return
    
    setCategories(categories.filter(c => c !== cat))
    const newColors = { ...colors }
    delete newColors[cat]
    setColors(newColors)
  }

  const handleColorChange = (cat: string, color: string) => {
    setColors({ ...colors, [cat]: color })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(categories, colors)
      onClose() // Auto-close the dialog on success
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100000, display: 'flex',
      alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)', animation: 'fadeIn 0.15s ease'
    }}>
      <div style={{
        width: 420, background: '#12121a', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column', maxHeight: '80vh',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg style={{ width: 16, height: 16, color: '#da5597' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#dddde9' }}>Category Manager</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', color: '#8e8ea8', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4
          }}>
            <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: 12, marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#8e8ea8', marginBottom: 12 }}>ADD NEW CATEGORY</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input 
                type="text" 
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="Category name"
                style={{
                  flex: 1, height: 32, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 6, padding: '0 10px', color: '#fff', fontSize: 12, outline: 'none'
                }}
              />
              <button 
                onClick={handleAdd}
                disabled={!newCatName.trim()}
                style={{
                  background: '#da5597', color: '#fff', border: 'none', borderRadius: 6,
                  padding: '0 16px', fontSize: 12, fontWeight: 600, cursor: newCatName.trim() ? 'pointer' : 'not-allowed',
                  opacity: newCatName.trim() ? 1 : 0.5
                }}
              >
                Add
              </button>
            </div>
            
            <div style={{ fontSize: 10, color: '#55556a', marginBottom: 6 }}>COLOR PRESET</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewCatColor(c)}
                  style={{
                    width: 20, height: 20, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                    boxShadow: newCatColor === c ? `0 0 0 2px #12121a, 0 0 0 4px ${c}` : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: '#8e8ea8', marginBottom: 12 }}>EXISTING CATEGORIES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {categories.map(cat => {
              const color = colors[cat] || '#8e8ea8'
              return (
                <div key={cat} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 6
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ position: 'relative' }}>
                      <button 
                        onClick={() => setPickerOpenCat(pickerOpenCat === cat ? null : cat)}
                        style={{ 
                          width: 20, height: 20, padding: 0, border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '50%', background: 'rgba(255,255,255,0.05)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none'
                        }}
                      >
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
                      </button>
                      
                      {pickerOpenCat === cat && (
                        <>
                          <div 
                            onClick={() => setPickerOpenCat(null)}
                            style={{ position: 'fixed', inset: 0, zIndex: 99999 }}
                          />
                          <div style={{
                            position: 'absolute', top: 26, left: 0, zIndex: 100000,
                            background: '#181824', border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 8, padding: 10, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', width: 112
                          }}>
                            {PRESET_COLORS.map(presetColor => (
                              <button
                                key={presetColor}
                                onClick={() => {
                                  handleColorChange(cat, presetColor)
                                  setPickerOpenCat(null)
                                }}
                                style={{
                                  width: 18, height: 18, borderRadius: '50%', background: presetColor,
                                  border: 'none', cursor: 'pointer', outline: 'none',
                                  boxShadow: color === presetColor ? '0 0 0 2px #fff' : 'none'
                                }}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <span style={{ color: '#dddde9', fontSize: 13, fontWeight: 500 }}>{cat}</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(cat)}
                    style={{ background: 'transparent', border: 'none', color: '#ff5f5f', cursor: 'pointer', opacity: 0.7 }}
                  >
                    <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>

        </div>

        <div style={{
          padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#0a0a0f'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: '#dddde9', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '8px 24px', background: '#da5597', border: 'none',
              color: '#fff', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.5 : 1
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
