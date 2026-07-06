import { useState, useEffect, useCallback } from 'react'
import PresetGrid from './PresetGrid'
import PresetInspector from './PresetInspector'
import CategoryChips from './CategoryChips'
import SearchBar from './SearchBar'
import AddPresetModal from './AddPresetModal'
import CategoryManager from './CategoryManager'
import HealthDashboard from './HealthDashboard'
import BulkActions from './BulkActions'
import Toast from '../shared/Toast'

interface KineticManagerProps {
  extensionPath: string
  onExtensionPathChange: (newPath: string) => void
}

export interface PresetData {
  id: string
  name: string
  category: string
  categories?: string[]
  hasFfx: boolean
  hasPreview: boolean
  hasThumbnail: boolean
  thumbnailExt: string | null
  thumbnailPath: string | null
  previewPath: string | null
  ffxPath: string | null
}

export default function KineticManager({
  extensionPath,
}: KineticManagerProps) {
  const [presets, setPresets] = useState<PresetData[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<PresetData | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showHealthDashboard, setShowHealthDashboard] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const loadData = useCallback(async () => {
    if (!extensionPath) return
    try {
      const result = await window.api.getPresets(extensionPath)
      setPresets(result.presets)
      setCategories(result.categories)
    } catch (err) {
      showToast('Failed to load presets: ' + (err as Error).message, 'error')
    }
  }, [extensionPath])

  useEffect(() => { loadData() }, [loadData])

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = presets.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.categories && p.categories.some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase())))
    if (activeFilter === 'All') return matchesSearch
    
    // Check both standard category field and categories array
    if (p.categories && Array.isArray(p.categories)) {
      return matchesSearch && p.categories.includes(activeFilter)
    }
    return matchesSearch && p.category === activeFilter
  })

  const handleSelectPreset = (preset: PresetData, multi: boolean) => {
    if (multi) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (next.has(preset.id)) { next.delete(preset.id) } else { next.add(preset.id) }
        return next
      })
    } else {
      setSelectedPreset(preset)
      setSelectedIds(new Set())
    }
  }

  const handleDeletePreset = async (id: string) => {
    try {
      await window.api.deletePreset(extensionPath, id)
      showToast('Preset deleted', 'success')
      if (selectedPreset?.id === id) setSelectedPreset(null)
      await loadData()
    } catch (err) {
      showToast('Failed to delete: ' + (err as Error).message, 'error')
    }
  }

  const handleUpdatePreset = async (oldId: string, changes: { name?: string; category?: string; categories?: string[] }) => {
    try {
      const result = await window.api.updatePreset(extensionPath, oldId, changes)
      showToast('Preset updated', 'success')
      await loadData()
      const updatedPresets = await window.api.getPresets(extensionPath)
      const updated = updatedPresets.presets.find((p: PresetData) => p.id === result.id)
      if (updated) setSelectedPreset(updated)
    } catch (err) {
      showToast('Failed to update: ' + (err as Error).message, 'error')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    try {
      await window.api.bulkDeletePresets(extensionPath, Array.from(selectedIds))
      showToast(`${selectedIds.size} presets deleted`, 'success')
      setSelectedIds(new Set())
      setSelectedPreset(null)
      await loadData()
    } catch (err) {
      showToast('Bulk delete failed: ' + (err as Error).message, 'error')
    }
  }

  const handleBulkChangeCategory = async (newCategory: string) => {
    if (selectedIds.size === 0) return
    try {
      await window.api.bulkChangeCategory(extensionPath, Array.from(selectedIds), newCategory)
      showToast(`${selectedIds.size} presets updated`, 'success')
      setSelectedIds(new Set())
      await loadData()
    } catch (err) {
      showToast('Bulk update failed: ' + (err as Error).message, 'error')
    }
  }

  // ── No folder selected ──────────────────────────────
  if (!extensionPath) {
    return null
  }

  // ── Main Kinetic UI ──────────────────────────────────────────────────────
  return (
    <div className="kinetic-root">
      <div className="kinetic-content">
        {/* Toolbar */}
        <div className="kinetic-toolbar">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <div style={{ flex: 1 }} />

          {/* Health */}
          <button onClick={() => setShowHealthDashboard(true)} className="icon-btn" title="Health Dashboard">
            <svg style={{ width: 13, height: 13 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </button>

          {/* Categories */}
          <button onClick={() => setShowCategoryManager(true)} className="btn-ghost" style={{ height: 30, fontSize: 12, padding: '0 10px' }}>
            Categories
          </button>

          {/* Add preset */}
          <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ height: 30, fontSize: 12, padding: '0 12px' }}>
            <svg style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Preset
          </button>
        </div>

        {/* Category chips */}
        <div className="kinetic-chips-bar">
          <CategoryChips categories={categories} presets={presets} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <BulkActions
            selectedCount={selectedIds.size}
            categories={categories}
            onBulkDelete={handleBulkDelete}
            onBulkChangeCategory={handleBulkChangeCategory}
            onClearSelection={() => setSelectedIds(new Set())}
          />
        )}

        {/* Grid */}
        <PresetGrid
          presets={filtered}
          selectedPreset={selectedPreset}
          selectedIds={selectedIds}
          onSelect={handleSelectPreset}
          extensionPath={extensionPath}
        />
      </div>

      {/* Inspector (Always Visible) */}
      {selectedPreset ? (
        <PresetInspector
          preset={selectedPreset}
          categories={categories}
          extensionPath={extensionPath}
          onUpdate={handleUpdatePreset}
          onDelete={handleDeletePreset}
          onRefresh={loadData}
        />
      ) : (
        <div style={{
          width: 296, flexShrink: 0, display: 'flex', flexDirection: 'column',
          height: '100%', overflow: 'hidden', borderLeft: '1px solid rgba(255,255,255,0.07)',
          background: '#12121a'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0
          }}>
            <span style={{
              fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: '#55556a'
            }}>Inspector</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#55556a', fontSize: 11 }}>
            No preset selected
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddPresetModal categories={categories} presets={presets} extensionPath={extensionPath}
          onClose={() => setShowAddModal(false)}
          onAdded={() => { loadData(); showToast('Preset added successfully', 'success') }}
        />
      )}
      {showCategoryManager && (
        <CategoryManager extensionPath={extensionPath}
          onClose={() => setShowCategoryManager(false)} onChanged={loadData}
        />
      )}
      {showHealthDashboard && (
        <HealthDashboard extensionPath={extensionPath}
          onClose={() => setShowHealthDashboard(false)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
