import { useState, useEffect } from 'react'

interface AddPresetModalProps {
  categories: string[]
  extensionPath: string
  onClose: () => void
  onAdded: () => void
}

const inp: React.CSSProperties = {
  width: '100%', height: 34, background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)', borderRadius: 6,
  color: '#dddde9', fontSize: 12, padding: '0 10px', outline: 'none',
  boxSizing: 'border-box',
}

function FilePickerRow({ label, value, type, onSelect }: {
  label: string; value: string; type: string; onSelect: () => void
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 11, color: '#8e8ea8', marginBottom: 5 }}>{label}</label>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="text" readOnly value={value}
          placeholder="Not selected…"
          style={{ ...inp, flex: 1, fontFamily: 'monospace', fontSize: 10, color: value ? '#dddde9' : '#55556a' }}
        />
        <button
          type="button"
          onClick={onSelect}
          style={{
            padding: '0 12px', height: 34, borderRadius: 6, flexShrink: 0,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
            color: '#8e8ea8', fontSize: 12, cursor: 'pointer',
          }}
        >
          Browse
        </button>
      </div>
    </div>
  )
}

export default function AddPresetModal({
  categories, extensionPath, onClose, onAdded,
}: AddPresetModalProps) {
  const [name, setName] = useState('')
  const [idPreview, setIdPreview] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([categories[0] || 'Default'])
  const [ffxPath, setFfxPath] = useState('')
  const [previewPath, setPreviewPath] = useState('')
  const [thumbnailPath, setThumbnailPath] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!name.trim()) { setIdPreview(''); return }
    window.api.generateId(name).then((id: string) => setIdPreview(id))
  }, [name])

  const handleSelectFile = async (type: 'ffx' | 'preview' | 'thumbnail') => {
    try {
      const path = await window.api.selectFile(type)
      if (path) {
        if (type === 'ffx') setFfxPath(path)
        if (type === 'preview') setPreviewPath(path)
        if (type === 'thumbnail') setThumbnailPath(path)
      }
    } catch (err) { console.error(err) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    setIsSubmitting(true)
    try {
      await window.api.addPreset(extensionPath, {
        name: name.trim(),
        category: selectedCategories[0] || 'Default',
        categories: selectedCategories,
        ffxSourcePath: ffxPath || undefined,
        previewSourcePath: previewPath || undefined,
        thumbnailSourcePath: thumbnailPath || undefined,
      })
      onAdded()
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.15s ease',
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: 440, maxHeight: '85vh', display: 'flex', flexDirection: 'column',
          background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          overflow: 'hidden', animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#dddde9' }}>Add New Preset</span>
          <button type="button" onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#55556a',
            padding: 2, display: 'flex', alignItems: 'center', borderRadius: 4,
          }}>
            <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 18px' }}>
          {error && (
            <div style={{
              background: 'rgba(255,95,95,0.08)', border: '1px solid rgba(255,95,95,0.2)',
              color: '#ff5f5f', padding: '8px 12px', borderRadius: 6, fontSize: 12, marginBottom: 14,
            }}>
              {error}
            </div>
          )}

          {/* Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8e8ea8', marginBottom: 5 }}>
              Preset Name <span style={{ color: '#ff5f5f' }}>*</span>
            </label>
            <input
              type="text" required value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Slide Up Bounce"
              style={inp}
              autoFocus
            />
            {idPreview && (
              <p style={{ marginTop: 5, fontSize: 10, color: '#55556a' }}>
                System ID: <span style={{ fontFamily: 'monospace', color: '#4f8eff' }}>{idPreview}</span>
              </p>
            )}
          </div>

          {/* Categories */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8e8ea8', marginBottom: 5 }}>
              Categories <span style={{ fontSize: 10, fontWeight: 400, color: '#55556a', marginLeft: 4 }}>(Select one or more)</span>
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {categories.map((cat) => {
                const isSelected = selectedCategories.includes(cat)
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        if (selectedCategories.length > 1) {
                          setSelectedCategories(selectedCategories.filter((c) => c !== cat))
                        }
                      } else {
                        setSelectedCategories([...selectedCategories, cat])
                      }
                    }}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      background: isSelected ? 'rgba(79,142,255,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? 'rgba(79,142,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      color: isSelected ? '#4f8eff' : '#8e8ea8',
                    }}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 0 14px' }} />

          {/* Source files */}
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#55556a', marginBottom: 10 }}>
            Source Files (optional)
          </div>
          <FilePickerRow label="FFX Preset File (.ffx)" value={ffxPath} type="ffx" onSelect={() => handleSelectFile('ffx')} />
          <FilePickerRow label="Video Preview (.mp4)" value={previewPath} type="preview" onSelect={() => handleSelectFile('preview')} />
          <FilePickerRow label="Thumbnail (.png, .jpg, .webp)" value={thumbnailPath} type="thumbnail" onSelect={() => handleSelectFile('thumbnail')} />
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
          padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)', flexShrink: 0,
        }}>
          <button type="button" onClick={onClose} style={{
            height: 32, padding: '0 14px', borderRadius: 6, cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
            color: '#8e8ea8', fontSize: 12, fontWeight: 500,
          }}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting || !name.trim()} style={{
            height: 32, padding: '0 16px', borderRadius: 6, cursor: (isSubmitting || !name.trim()) ? 'not-allowed' : 'pointer',
            background: '#4f8eff', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600,
            opacity: (isSubmitting || !name.trim()) ? 0.5 : 1,
          }}>
            {isSubmitting ? 'Creating…' : 'Create Preset'}
          </button>
        </div>
      </form>
    </div>
  )
}
