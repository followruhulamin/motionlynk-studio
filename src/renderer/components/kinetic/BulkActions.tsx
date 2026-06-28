import { useState } from 'react'

interface BulkActionsProps {
  selectedCount: number
  categories: string[]
  onBulkDelete: () => void
  onBulkChangeCategory: (newCategory: string) => void
  onClearSelection: () => void
}

export default function BulkActions({
  selectedCount,
  categories,
  onBulkDelete,
  onBulkChangeCategory,
  onClearSelection,
}: BulkActionsProps) {
  const [selectedCategory, setSelectedCategory] = useState('')

  const handleApplyCategory = () => {
    if (!selectedCategory) return
    onBulkChangeCategory(selectedCategory)
    setSelectedCategory('')
  }

  return (
    <div
      className="animate-slide-up"
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '7px 14px',
        borderBottom: '1px solid rgba(79,142,255,0.2)',
        background: 'rgba(79,142,255,0.07)',
        fontSize: 12,
      }}
    >
      {/* Count badge */}
      <span style={{
        background: 'rgba(79,142,255,0.18)', color: '#4f8eff',
        padding: '2px 8px', borderRadius: 100, fontWeight: 600, fontSize: 11, flexShrink: 0,
      }}>
        {selectedCount} selected
      </span>

      <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

      {/* Move to category */}
      <span style={{ color: '#8e8ea8', fontSize: 11, flexShrink: 0 }}>Move to:</span>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        style={{
          height: 26, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 5, color: '#dddde9', fontSize: 11, padding: '0 8px', outline: 'none', cursor: 'pointer',
        }}
      >
        <option value="" disabled>Category…</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <button
        onClick={handleApplyCategory}
        disabled={!selectedCategory}
        style={{
          height: 26, padding: '0 10px', borderRadius: 5,
          background: selectedCategory ? '#4f8eff' : 'rgba(255,255,255,0.05)',
          border: 'none', color: '#fff', fontSize: 11, fontWeight: 500,
          cursor: selectedCategory ? 'pointer' : 'not-allowed',
          opacity: selectedCategory ? 1 : 0.5, flexShrink: 0,
        }}
      >
        Apply
      </button>

      <div style={{ flex: 1 }} />

      {/* Delete */}
      <button
        onClick={() => {
          if (confirm(`Delete ${selectedCount} presets and all their associated files?`)) {
            onBulkDelete()
          }
        }}
        style={{
          height: 26, padding: '0 10px', borderRadius: 5, flexShrink: 0,
          background: 'rgba(255,95,95,0.08)', border: '1px solid rgba(255,95,95,0.25)',
          color: '#ff5f5f', fontSize: 11, fontWeight: 500, cursor: 'pointer',
        }}
      >
        Delete Selected
      </button>

      {/* Cancel */}
      <button
        onClick={onClearSelection}
        style={{
          height: 26, padding: '0 10px', borderRadius: 5, flexShrink: 0,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          color: '#8e8ea8', fontSize: 11, cursor: 'pointer',
        }}
      >
        Cancel
      </button>
    </div>
  )
}
