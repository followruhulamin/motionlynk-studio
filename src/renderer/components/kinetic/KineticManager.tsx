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
  onRefresh: () => void
  onGoToExtension: () => void
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
  onRefresh,
  onGoToExtension,
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

  // ── No folder selected — show setup screen ──────────────────────────────
  if (!extensionPath) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 20, padding: 40, height: '100%',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'rgba(79,142,255,0.1)', border: '1px solid rgba(79,142,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg style={{ width: 32, height: 32, color: '#4f8eff' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            <line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#dddde9', marginBottom: 8 }}>
            No Extension Connected
          </h2>
          <p style={{ fontSize: 13, color: '#8e8ea8', maxWidth: 320, lineHeight: 1.6 }}>
            Go to <strong style={{ color: '#dddde9' }}>Extension Settings</strong> in the sidebar
            to connect your MotionLynk extension folder.
          </p>
        </div>
        <button
          onClick={onGoToExtension}
          style={{
            height: 40, padding: '0 24px', borderRadius: 10,
            background: 'linear-gradient(135deg, #4f8eff, #3a7aff)',
            border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 20px rgba(79,142,255,0.35)', transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
            ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(79,142,255,0.45)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
            ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(79,142,255,0.35)'
          }}
        >
          <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
          </svg>
          Open Extension Settings
        </button>
      </div>
    )
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

      {/* Inspector */}
      {selectedPreset && (
        <PresetInspector
          preset={selectedPreset}
          categories={categories}
          extensionPath={extensionPath}
          onUpdate={handleUpdatePreset}
          onDelete={handleDeletePreset}
          onClose={() => setSelectedPreset(null)}
          onRefresh={loadData}
        />
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
