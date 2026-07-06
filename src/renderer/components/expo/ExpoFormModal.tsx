import { useState } from 'react'

interface ExpoFormModalProps {
  categories: string[]
  allTags: string[]
  initialData?: any
  onClose: () => void
  onSave: (expression: any, previewSourcePath?: string) => Promise<void>
}

export default function ExpoFormModal({ categories, allTags, initialData, onClose, onSave }: ExpoFormModalProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '')
  const [category, setCategory] = useState(initialData?.category || (categories[0] || 'Wiggle'))
  const [code, setCode] = useState(initialData?.expression || initialData?.code || '')
  const [previewPath, setPreviewPath] = useState<string | undefined>(undefined)
  
  const [isSaving, setIsSaving] = useState(false)

  const handleBrowse = async () => {
    // @ts-ignore
    const result = await window.api.selectExpoFile()
    if (result) {
      setPreviewPath(result)
    }
  }

  const handleSave = async () => {
    if (!name || !code) return
    setIsSaving(true)
    
    const id = initialData?.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
    
    const expression = {
      id,
      name,
      description,
      tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      category,
      expression: code,
    }

    try {
      await onSave(expression, previewPath)
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        background: '#12121a', width: 500, borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ margin: 0, fontSize: 14, color: '#fff' }}>{initialData ? 'Edit Expression' : 'Save Expression'}</h2>
        </div>
        
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#8e8ea8', marginBottom: 6 }}>Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Smooth Wiggle" style={{
              width: '100%', height: 34, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, color: '#fff', padding: '0 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box'
            }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#8e8ea8', marginBottom: 6 }}>Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} maxLength={100} placeholder="Short description (max 100 chars)" style={{
              width: '100%', height: 34, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, color: '#fff', padding: '0 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box'
            }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#8e8ea8', marginBottom: 6 }}>Tags (comma separated)</label>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="wiggle, position, smooth" style={{
              width: '100%', height: 34, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, color: '#fff', padding: '0 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box'
            }} />
            {allTags && allTags.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {allTags.map(tag => (
                  <span 
                    key={tag}
                    onClick={() => {
                      const currentTags = tags.split(',').map(t => t.trim()).filter(Boolean)
                      if (!currentTags.includes(tag)) {
                        setTags(currentTags.length ? `${currentTags.join(', ')}, ${tag}` : tag)
                      }
                    }}
                    style={{
                      fontSize: 10, padding: '2px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 4, color: '#c5c5d9', cursor: 'pointer'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#8e8ea8', marginBottom: 6 }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{
              width: '100%', height: 34, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, color: '#fff', padding: '0 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box', appearance: 'none'
            }}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#8e8ea8', marginBottom: 6 }}>Preview Image (optional, ideal size: 160x90)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" readOnly value={previewPath || initialData?.preview || ''} placeholder="Path to image" style={{
                flex: 1, height: 34, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6, color: '#fff', padding: '0 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box'
              }} />
              <button onClick={handleBrowse} style={{
                height: 34, padding: '0 16px', background: 'rgba(255,255,255,0.1)', color: '#fff',
                border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600
              }}>Browse...</button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#8e8ea8', marginBottom: 6 }}>Expression Code *</label>
            <textarea value={code} onChange={e => setCode(e.target.value)} rows={6} style={{
              width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, color: '#fff', padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
              resize: 'vertical', fontFamily: 'monospace'
            }} />
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', background: 'transparent', color: '#8e8ea8',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600
          }}>Cancel</button>
          <button onClick={handleSave} disabled={!name || !code || isSaving} style={{
            padding: '8px 16px', background: '#da5597', color: '#fff',
            border: 'none', borderRadius: 6, cursor: (!name || !code || isSaving) ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 600, opacity: (!name || !code || isSaving) ? 0.5 : 1
          }}>{isSaving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
