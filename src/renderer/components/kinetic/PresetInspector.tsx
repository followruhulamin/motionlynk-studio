import { useState, useEffect } from 'react'
import type { PresetData } from './KineticManager'

interface PresetInspectorProps {
  preset: PresetData
  categories: string[]
  extensionPath: string
  onUpdate: (oldId: string, changes: any) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
  onRefresh: () => void
}

const S = {
  panel: {
    width: 296, flexShrink: 0, display: 'flex', flexDirection: 'column' as const,
    height: '100%', overflow: 'hidden', borderLeft: '1px solid rgba(255,255,255,0.07)',
    background: '#12121a', animation: 'fadeIn 0.18s ease',
  },
  panelHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '11px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
    flexShrink: 0,
  },
  panelTitle: {
    fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const,
    letterSpacing: '0.1em', color: '#55556a',
  },
  scrollArea: { flex: 1, minHeight: 0, overflowY: 'auto' as const },
  section: { padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  label: {
    display: 'block', fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const,
    letterSpacing: '0.07em', color: '#55556a', marginBottom: 5,
  },
  input: {
    width: '100%', height: 32, background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
    color: '#dddde9', fontSize: 12, padding: '0 10px', outline: 'none',
    boxSizing: 'border-box' as const,
  },
  select: {
    width: '100%', height: 32, background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
    color: '#dddde9', fontSize: 12, padding: '0 10px', outline: 'none',
    cursor: 'pointer', boxSizing: 'border-box' as const, appearance: 'none' as const,
  },
  idBox: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 5, padding: '5px 9px', fontFamily: 'monospace', fontSize: 10,
    color: '#8e8ea8', userSelect: 'all' as const, wordBreak: 'break-all' as const,
  },
  footer: {
    padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)',
    flexShrink: 0, background: '#0f0f16',
  },
}

function FileRow({
  label, filename, hasFile, type, onUpload, disabled,
}: {
  label: string; filename: string; hasFile: boolean;
  type: 'ffx' | 'preview' | 'thumbnail'; onUpload: (t: any) => void; disabled: boolean;
}) {
  const dot = hasFile ? '#4fcc8a' : type === 'ffx' ? '#ff5f5f' : '#f5a623'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 10px', background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6, marginBottom: 5,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0, display: 'block' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#c5c5d9', marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: 10, color: '#55556a', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {filename}
        </div>
      </div>
      <button
        onClick={() => onUpload(type)}
        disabled={disabled}
        style={{
          flexShrink: 0, padding: '3px 9px', borderRadius: 4, cursor: disabled ? 'not-allowed' : 'pointer',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
          color: '#8e8ea8', fontSize: 11, opacity: disabled ? 0.5 : 1,
        }}
      >
        {hasFile ? 'Replace' : 'Upload'}
      </button>
    </div>
  )
}

export default function PresetInspector({
  preset, categories, onUpdate, onDelete, onClose,
}: PresetInspectorProps) {
  const [name, setName] = useState(preset.name)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(preset.categories || [preset.category])
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setName(preset.name)
    setSelectedCategories(preset.categories || [preset.category])
  }, [preset])

  const areArraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false
    const sortedA = [...a].sort()
    const sortedB = [...b].sort()
    return sortedA.every((val, index) => val === sortedB[index])
  }

  const originalCategories = preset.categories || [preset.category]
  const hasUnsavedChanges = name !== preset.name || !areArraysEqual(selectedCategories, originalCategories)

  const handleSave = async () => {
    if (!name.trim()) return
    setIsSaving(true)
    try {
      await onUpdate(preset.id, {
        name: name.trim(),
        categories: selectedCategories,
        category: selectedCategories[0] || 'Default'
      })
    }
    catch (err) { console.error(err) }
    finally { setIsSaving(false) }
  }

  const handleUploadFile = async (type: 'ffx' | 'preview' | 'thumbnail') => {
    try {
      const selectedPath = await window.api.selectFile(type)
      if (!selectedPath) return
      setIsSaving(true)
      await onUpdate(preset.id, { [`${type}SourcePath`]: selectedPath })
    } catch (err) { console.error('File upload failed', err) }
    finally { setIsSaving(false) }
  }

  const handleDelete = async () => {
    if (confirm(`Delete "${preset.name}"? This will remove the preset entry and all associated files.`)) {
      setIsDeleting(true)
      try { await onDelete(preset.id) }
      catch (err) { console.error(err) }
      finally { setIsDeleting(false) }
    }
  }

  const thumbSrc = preset.thumbnailPath ? 'file://' + encodeURI(preset.thumbnailPath.replace(/\\/g, '/')) : ''
  const previewSrc = preset.previewPath ? 'file://' + encodeURI(preset.previewPath.replace(/\\/g, '/')) : ''

  return (
    <div style={S.panel}>
      {/* Header */}
      <div style={S.panelHeader}>
        <span style={S.panelTitle}>Inspector</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#55556a', padding: 2, display: 'flex', alignItems: 'center', borderRadius: 4 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#8e8ea8' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#55556a' }}
        >
          <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scroll area */}
      <div style={S.scrollArea}>
        {/* Preview */}
        <div style={{ ...S.section, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            position: 'relative', width: '100%', paddingTop: '56.25%',
            background: '#0a0a12', borderRadius: 7, overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            {previewSrc ? (
              <video
                key={previewSrc}
                src={previewSrc}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                controls muted playsInline
              />
            ) : thumbSrc ? (
              <img
                src={thumbSrc}
                alt={preset.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', color: '#55556a',
              }}>
                <svg style={{ width: 28, height: 28, opacity: 0.25, marginBottom: 4 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <path d="M16 8l-8 8M8 8l8 8" />
                </svg>
                <span style={{ fontSize: 10 }}>No media</span>
              </div>
            )}
          </div>
        </div>

        {/* ID */}
        <div style={S.section}>
          <label style={S.label}>Preset ID</label>
          <div style={S.idBox}>{preset.id}</div>
        </div>

        {/* Name */}
        <div style={S.section}>
          <label style={S.label}>Name</label>
          <input
            type="text" value={name}
            onChange={(e) => setName(e.target.value)}
            style={S.input}
            onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(79,142,255,0.5)' }}
            onBlur={e => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
          />
        </div>

        {/* Categories */}
        <div style={S.section}>
          <label style={S.label}>Categories</label>
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

        {/* Save Changes */}
        {hasUnsavedChanges && (
          <div style={{ padding: '0 14px 12px' }}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                width: '100%', height: 32, borderRadius: 6, background: '#4f8eff',
                border: 'none', color: '#fff', fontWeight: 600, fontSize: 12,
                cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.6 : 1,
                transition: 'background 0.15s',
              }}
            >
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Asset pipeline */}
        <div style={S.section}>
          <label style={S.label}>Asset Pipeline</label>
          <FileRow label="FFX Preset" filename={`${preset.id}.ffx`} hasFile={preset.hasFfx} type="ffx" onUpload={handleUploadFile} disabled={isSaving} />
          <FileRow label="Video Preview" filename={`${preset.id}.mp4`} hasFile={preset.hasPreview} type="preview" onUpload={handleUploadFile} disabled={isSaving} />
          <FileRow label="Thumbnail" filename={`${preset.id}${preset.thumbnailExt || '.png'}`} hasFile={preset.hasThumbnail} type="thumbnail" onUpload={handleUploadFile} disabled={isSaving} />
        </div>
      </div>

      {/* Footer: Delete */}
      <div style={S.footer}>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          style={{
            width: '100%', height: 30, borderRadius: 6,
            background: 'rgba(255,95,95,0.07)', border: '1px solid rgba(255,95,95,0.22)',
            color: '#ff5f5f', fontWeight: 600, fontSize: 11,
            cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.6 : 1,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (!isDeleting) (e.currentTarget as HTMLElement).style.background = 'rgba(255,95,95,0.13)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,95,95,0.07)' }}
        >
          {isDeleting ? 'Deleting…' : '🗑 Delete Preset'}
        </button>
      </div>
    </div>
  )
}
