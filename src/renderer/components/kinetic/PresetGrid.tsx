import type { PresetData } from './KineticManager'

interface PresetGridProps {
  presets: PresetData[]
  selectedPreset: PresetData | null
  selectedIds: Set<string>
  onSelect: (preset: PresetData, multi: boolean) => void
  extensionPath: string
}

export default function PresetGrid({
  presets,
  selectedPreset,
  selectedIds,
  onSelect,
}: PresetGridProps) {
  if (presets.length === 0) {
    return (
      <div className="kinetic-grid-scroll">
        <div className="empty-state animate-fade-in">
          <svg style={{ width: 48, height: 48 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <p style={{ fontWeight: 500 }}>No presets found</p>
          <p style={{ fontSize: 11, opacity: 0.6 }}>Add presets or adjust your filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="kinetic-grid-scroll">
      <div className="kinetic-grid">
        {presets.map((preset) => {
          const isSelected = selectedPreset?.id === preset.id
          const isMultiSelected = selectedIds.has(preset.id)

          let thumbSrc = ''
          if (preset.thumbnailPath) {
            thumbSrc = 'file://' + encodeURI(preset.thumbnailPath.replace(/\\/g, '/'))
          }
          let previewSrc = ''
          if (preset.previewPath) {
            previewSrc = 'file://' + encodeURI(preset.previewPath.replace(/\\/g, '/'))
          }

          return (
            <div
              key={preset.id}
              onClick={(e) => onSelect(preset, e.metaKey || e.ctrlKey)}
              className="preset-card animate-slide-up"
              style={{
                borderColor: isSelected
                  ? '#4f8eff'
                  : isMultiSelected
                  ? 'rgba(79,142,255,0.5)'
                  : undefined,
                boxShadow: isSelected
                  ? '0 0 0 2px rgba(79,142,255,0.35)'
                  : isMultiSelected
                  ? '0 0 0 1px rgba(79,142,255,0.3)'
                  : undefined,
              }}
            >
              {/* Thumbnail area — fixed 16:9 aspect ratio */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '56.25%',
                  background: '#111118',
                  overflow: 'hidden',
                }}
              >
                {thumbSrc ? (
                  <img
                    src={thumbSrc}
                    alt={preset.name}
                    draggable={false}
                    style={{
                      position: 'absolute', inset: 0,
                      width: '100%', height: '100%',
                      objectFit: 'cover', display: 'block',
                    }}
                  />
                ) : previewSrc ? (
                  <video
                    src={previewSrc}
                    style={{
                      position: 'absolute', inset: 0,
                      width: '100%', height: '100%',
                      objectFit: 'cover', display: 'block',
                    }}
                    muted loop autoPlay playsInline
                  />
                ) : (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#55556a',
                  }}>
                    <svg style={{ width: 24, height: 24, opacity: 0.3 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <path d="M16 8l-8 8M8 8l8 8" />
                    </svg>
                  </div>
                )}

                {/* Status dots */}
                <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 4 }}>
                  {!preset.hasFfx && (
                    <span
                      title="Missing FFX"
                      style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff5f5f', display: 'block' }}
                    />
                  )}
                  {!preset.hasPreview && (
                    <span
                      title="Missing Preview"
                      style={{ width: 7, height: 7, borderRadius: '50%', background: '#f5a623', display: 'block' }}
                    />
                  )}
                </div>

                {/* Multi-select check */}
                {isMultiSelected && (
                  <div style={{ position: 'absolute', top: 6, left: 6 }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 4,
                      background: '#4f8eff', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg style={{ width: 10, height: 10, color: '#fff' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div style={{
                padding: '7px 10px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span
                  title={preset.name}
                  style={{
                    fontSize: 11, fontWeight: 500, flex: 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    color: isSelected ? '#4f8eff' : '#c5c5d9',
                    transition: 'color 0.15s',
                  }}
                >
                  {preset.name}
                </span>
                <span
                  title={preset.categories && preset.categories.length > 0 ? preset.categories.join(', ') : preset.category}
                  style={{
                    fontSize: 9, padding: '2px 6px', borderRadius: 4,
                    background: 'rgba(255,255,255,0.06)', color: '#8e8ea8',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis',
                  }}
                >
                  {preset.categories && preset.categories.length > 0
                    ? (preset.categories.length > 2
                        ? `${preset.categories[0]} (+${preset.categories.length - 1})`
                        : preset.categories.join(', '))
                    : preset.category}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
