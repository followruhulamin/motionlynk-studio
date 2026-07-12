import { useState, useEffect, useCallback } from 'react'
import ExpoFormModal from './ExpoFormModal'
import ExpoInspector from './ExpoInspector'
import ExpoCategoryManager from './ExpoCategoryManager'
import ExpoHealthDashboard from './ExpoHealthDashboard'
import SearchBar from '../kinetic/SearchBar'
import CategoryChips from '../kinetic/CategoryChips'

interface ExpoManagerProps {
  extensionPath: string
}

export default function ExpoManager({ extensionPath }: ExpoManagerProps) {
  const [library, setLibrary] = useState<{ version: string, categories: string[], categoryColors: Record<string, string>, expressions: any[] }>({
    version: '1.0.0', categories: [], categoryColors: {}, expressions: []
  })
  
  const [selectedExpression, setSelectedExpression] = useState<any | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showHealthDashboard, setShowHealthDashboard] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [globalCacheBuster, setGlobalCacheBuster] = useState(Date.now())

  const loadLibrary = useCallback(async () => {
    if (!extensionPath) return
    try {
      // @ts-ignore
      const data = await window.api.getExpoLibrary(extensionPath)
      setLibrary(data)
      
      setSelectedExpression((prev: any) => {
        if (!prev) return prev
        const updated = data.expressions.find((e: any) => e.id === prev.id)
        return updated || prev
      })
      setGlobalCacheBuster(Date.now())
    } catch (e) {
      console.error('Failed to load expo library', e)
    }
  }, [extensionPath])

  useEffect(() => { loadLibrary() }, [loadLibrary])

  const handleSave = async (expression: any, previewSourcePath?: string) => {
    // @ts-ignore
    await window.api.saveExpoExpression(extensionPath, expression, previewSourcePath)
    await loadLibrary()
  }

  const handleSaveCategories = async (newCategories: string[], newColors: Record<string, string>) => {
    const updatedLibrary = {
      ...library,
      categories: newCategories,
      categoryColors: newColors
    }
    // @ts-ignore
    await window.api.saveExpoLibrary(extensionPath, updatedLibrary)
    await loadLibrary()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expression?')) return
    // @ts-ignore
    await window.api.deleteExpoExpression(extensionPath, id)
    if (selectedExpression?.id === id) setSelectedExpression(null)
    await loadLibrary()
  }

  const filtered = (library.expressions || []).filter(e => {
    if (activeFilter !== 'All') {
      if (e.categories && Array.isArray(e.categories)) {
        if (!e.categories.includes(activeFilter)) return false
      } else {
        if (e.category !== activeFilter) return false
      }
    }
    if (searchQuery) {
      if (!((e.name && e.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (e.category && e.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (e.tags && e.tags.some((t: string) => t && t.toLowerCase().includes(searchQuery.toLowerCase()))))) {
        return false
      }
    }
    return true
  })

  return (
    <div className="kinetic-root">
      
      {/* Main Content Area */}
      <div className="kinetic-content">
        
        {/* Toolbar */}
        <div className="kinetic-toolbar">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          
          <div style={{ flex: 1 }} />
          
          <button 
            onClick={() => setShowHealthDashboard(true)} 
            className="icon-btn"
            title="System Health Report"
          >
            <svg style={{ width: 13, height: 13 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </button>

          <button 
            onClick={() => setShowCategoryManager(true)}
            className="btn-ghost" 
            style={{ height: 30, fontSize: 12, padding: '0 10px' }}
          >
            Categories
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary" 
            style={{ height: 30, fontSize: 12, padding: '0 12px' }}
          >
            <svg style={{ width: 12, height: 12, marginRight: 6 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Expression
          </button>
        </div>

        {/* Category chips */}
        <div className="kinetic-chips-bar">
          <CategoryChips 
            categories={library.categories || []} 
            presets={library.expressions as any || []} 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter} 
          />
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {filtered.map(exp => {
              const isSelected = selectedExpression?.id === exp.id
              const previewUrl = 'file://' + encodeURI(`${extensionPath}/modules/expo/starter/previews/${exp.id}.mp4`.replace(/\\/g, '/')) + `?t=${globalCacheBuster}`
              
              return (
                <div 
                  key={exp.id}
                  onClick={() => setSelectedExpression(exp)}
                  style={{
                    background: isSelected ? 'rgba(218, 85, 151, 0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isSelected ? '#da5597' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ width: '100%', paddingTop: '56.25%', position: 'relative', background: '#0a0a12' }}>
                    <video 
                      src={previewUrl} 
                      autoPlay
                      loop
                      muted
                      playsInline
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{exp.name}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(exp.categories && exp.categories.length > 0 ? exp.categories : [exp.category]).map((c: string) => (
                        <span key={c} style={{ fontSize: 10, padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: 4, color: '#c5c5d9' }}>{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Inspector Panel */}
      <ExpoInspector 
        expression={selectedExpression}
        categories={library.categories}
        allTags={Array.from(new Set(library.expressions.flatMap((e: any) => e.tags || [])))}
        extensionPath={extensionPath}
        onUpdate={handleSave}
        onDelete={handleDelete}
      />

      {showAddModal && (
        <ExpoFormModal 
          categories={library.categories}
          allTags={Array.from(new Set(library.expressions.flatMap((e: any) => e.tags || [])))}
          onClose={() => setShowAddModal(false)}
          onSave={handleSave}
        />
      )}

      {showCategoryManager && (
        <ExpoCategoryManager
          categories={library.categories}
          categoryColors={library.categoryColors}
          onClose={() => setShowCategoryManager(false)}
          onSave={handleSaveCategories}
        />
      )}

      {showHealthDashboard && (
        <ExpoHealthDashboard
          extensionPath={extensionPath}
          onClose={() => setShowHealthDashboard(false)}
        />
      )}
    </div>
  )
}
