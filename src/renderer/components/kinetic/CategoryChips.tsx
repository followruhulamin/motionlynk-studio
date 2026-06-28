import type { PresetData } from './KineticManager'

interface CategoryChipsProps {
  categories: string[]
  presets: PresetData[]
  activeFilter: string
  onFilterChange: (filter: string) => void
}

export default function CategoryChips({
  categories,
  presets,
  activeFilter,
  onFilterChange
}: CategoryChipsProps) {
  const allCount = presets.length

  const categoryCounts: Record<string, number> = {}
  for (const cat of categories) {
    categoryCounts[cat] = presets.filter((p) => {
      if (p.categories && Array.isArray(p.categories)) {
        return p.categories.includes(cat)
      }
      return p.category === cat
    }).length
  }

  const chips = [
    { id: 'All', label: 'All', count: allCount },
    ...categories.map((cat) => ({ id: cat, label: cat, count: categoryCounts[cat] || 0 }))
  ]

  return (
    <>
      {chips.map((chip) => {
        const isActive = activeFilter === chip.id
        return (
          <button
            key={chip.id}
            onClick={() => onFilterChange(chip.id)}
            title={chip.id === 'All' ? 'Show all presets' : `Filter: ${chip.label}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 10px',
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 500,
              border: `1px solid ${isActive ? 'rgba(79,142,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
              background: isActive ? 'rgba(79,142,255,0.14)' : 'rgba(255,255,255,0.04)',
              color: isActive ? '#4f8eff' : '#8e8ea8',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'
                ;(e.currentTarget as HTMLElement).style.color = '#c5c5d9'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                ;(e.currentTarget as HTMLElement).style.color = '#8e8ea8'
              }
            }}
          >
            <span>{chip.label}</span>
            <span style={{
              fontSize: 10,
              padding: '0px 5px',
              borderRadius: 100,
              background: isActive ? 'rgba(79,142,255,0.2)' : 'rgba(255,255,255,0.06)',
              color: isActive ? '#6ba3ff' : '#55556a',
            }}>
              {chip.count}
            </span>
          </button>
        )
      })}
    </>
  )
}
