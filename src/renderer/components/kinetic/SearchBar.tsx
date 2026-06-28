interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div style={{ position: 'relative', width: 220, flexShrink: 0 }}>
      <svg
        style={{
          position: 'absolute', left: 9, top: '50%',
          transform: 'translateY(-50%)', width: 13, height: 13,
          color: '#55556a', pointerEvents: 'none',
        }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search presets..."
        className="search-input"
        style={{ paddingRight: value ? 28 : 10 }}
      />

      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute', right: 8, top: '50%',
            transform: 'translateY(-50%)',
            background: 'none', border: 'none',
            color: '#55556a', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#8e8ea8' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#55556a' }}
        >
          <svg style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}
