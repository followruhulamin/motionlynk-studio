import { useState, useEffect } from 'react'

interface ExpoInspectorProps {
  expression: any
  categories: string[]
  allTags: string[]
  extensionPath: string
  onUpdate: (expression: any, previewSourcePath?: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const S = {
  panel: {
    width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column' as const,
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
  textarea: {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
    color: '#dddde9', fontSize: 12, padding: '10px', outline: 'none',
    boxSizing: 'border-box' as const, resize: 'vertical' as const,
    fontFamily: 'monospace',
  },
  idBox: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 5, padding: '5px 9px', fontFamily: 'monospace', fontSize: 10,
    color: '#8e8ea8', userSelect: 'all' as const, wordBreak: 'break-all' as const,
  },
  footer: {
    padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)',
    flexShrink: 0, background: '#0f0f16', display: 'flex', gap: 8
  },
}

function FileRow({ label, filename, hasFile, onUpload, disabled }: any) {
  const dot = hasFile ? '#4fcc8a' : '#f5a623'
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
        onClick={onUpload}
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

export default function ExpoInspector({
  expression, categories, allTags, extensionPath, onUpdate, onDelete
}: ExpoInspectorProps) {
  if (!expression) {
    return (
      <div style={S.panel}>
        <div style={S.panelHeader}>
          <span style={S.panelTitle}>Inspector</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#55556a', fontSize: 11 }}>
          No expression selected
        </div>
      </div>
    )
  }

  const [name, setName] = useState(expression.name)
  const [description, setDescription] = useState(expression.description || '')
  const [tags, setTags] = useState((expression.tags || []).join(', '))
  const [selectedCategories, setSelectedCategories] = useState<string[]>(expression.categories || [expression.category])
  const [code, setCode] = useState(expression.expression || expression.code || '')
  
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [cacheBuster, setCacheBuster] = useState(Date.now())
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    setName(expression.name)
    setDescription(expression.description || '')
    setTags((expression.tags || []).join(', '))
    // Support either single category or array if it eventually supports multiple
    setSelectedCategories(expression.categories || [expression.category])
    setCode(expression.expression || expression.code || '')
    setCacheBuster(Date.now())
    setVideoError(false)
  }, [expression])

  useEffect(() => {
    setVideoError(false)
  }, [cacheBuster])

  const areArraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false
    const sortedA = [...a].sort()
    const sortedB = [...b].sort()
    return sortedA.every((val, index) => val === sortedB[index])
  }

  const originalCategories = expression.categories || [expression.category]
  const originalTags = (expression.tags || []).join(', ')

  const hasUnsavedChanges = 
    name !== expression.name || 
    description !== (expression.description || '') ||
    tags !== originalTags ||
    code !== (expression.expression || expression.code || '') ||
    !areArraysEqual(selectedCategories, originalCategories)

  // Try to load the MP4 by expression ID.
  const previewSrc = 'file://' + encodeURI(`${extensionPath}/modules/expo/starter/previews/${expression.id}.mp4`.replace(/\\/g, '/')) + `?t=${cacheBuster}`

  const handleSave = async () => {
    if (!name.trim() || !code.trim()) return
    setIsSaving(true)
    try {
      const updatedExpression = {
        ...expression,
        name: name.trim(),
        description: description.trim(),
        tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        category: selectedCategories[0] || 'Default',
        categories: selectedCategories,
        expression: code,
      }
      await onUpdate(updatedExpression)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUploadPreview = async () => {
    try {
      // @ts-ignore
      const selectedPath = await window.api.selectExpoFile()
      if (!selectedPath) return
      setIsSaving(true)
      
      const updatedExpression = {
        ...expression,
        name: name.trim(),
        description: description.trim(),
        tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        category: selectedCategories[0] || 'Default',
        categories: selectedCategories,
        expression: code,
      }
      
      // Remove preview property if it exists (now managed entirely by ID match)
      if ('preview' in updatedExpression) {
        delete updatedExpression.preview
      }
      
      await onUpdate(updatedExpression, selectedPath)
      
      // Minor delay to ensure OS file system write is finalized before we bust the cache
      setTimeout(() => {
        setCacheBuster(Date.now())
      }, 200)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(expression.id)
    } catch (err) {
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div style={S.panel}>
      <div style={S.panelHeader}>
        <span style={S.panelTitle}>Inspector</span>
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
            {previewSrc && !videoError ? (
              <video
                key={previewSrc}
                src={previewSrc}
                autoPlay
                loop
                muted
                playsInline
                onError={() => setVideoError(true)}
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
          <label style={S.label}>Expression ID</label>
          <div style={S.idBox}>{expression.id}</div>
        </div>

        {/* Name */}
        <div style={S.section}>
          <label style={S.label}>Name</label>
          <input
            type="text" value={name}
            onChange={(e) => setName(e.target.value)}
            style={S.input}
            onBlur={handleSave}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(218, 85, 151, 0.5)' }}
          />
        </div>

        {/* Description */}
        <div style={S.section}>
          <label style={S.label}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={200}
            style={{...S.textarea, fontFamily: 'inherit'}}
            onBlur={handleSave}
            onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(218, 85, 151, 0.5)' }}
          />
        </div>

        {/* Tags */}
        <div style={S.formGroup}>
          <label style={S.label}>Tags (comma separated)</label>
          <input 
            type="text" value={tags} 
            onChange={(e) => setTags(e.target.value)} 
            style={S.input} 
            onBlur={handleSave}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(218, 85, 151, 0.5)' }}
          />
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
                    let newCats = [...selectedCategories]
                    if (isSelected) {
                      if (newCats.length > 1) {
                        newCats = newCats.filter((c) => c !== cat)
                      }
                    } else {
                      newCats.push(cat)
                    }
                    setSelectedCategories(newCats)
                    // Auto-save categories immediately on click
                    setTimeout(() => {
                      onUpdate({
                        ...expression,
                        category: newCats[0] || 'Default',
                        categories: newCats
                      })
                    }, 0)
                  }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: isSelected ? 'rgba(218, 85, 151, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? 'rgba(218, 85, 151, 0.4)' : 'rgba(255,255,255,0.06)'}`,
                    color: isSelected ? '#da5597' : '#8e8ea8',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Asset pipeline */}
        <div style={S.section}>
          <label style={S.label}>Asset Pipeline</label>
          <FileRow 
            label="Video Preview" 
            filename={`${expression.id}.mp4`} 
            hasFile={true} 
            onUpload={handleUploadPreview} 
            disabled={isSaving} 
          />
        </div>

        {/* Code */}
        <div style={S.section}>
          <label style={S.label}>Expression Code</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={8}
            spellCheck={false}
            style={S.textarea}
            onBlur={handleSave}
            onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(218, 85, 151, 0.5)' }}
          />
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
          {isDeleting ? 'Deleting…' : '🗑 Delete Expression'}
        </button>
      </div>
    </div>
  )
}
