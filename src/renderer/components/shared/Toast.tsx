import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
}

export default function Toast({ message, type = 'info' }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2800)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  const colors = {
    success: { bg: 'rgba(79,204,138,0.12)', border: 'rgba(79,204,138,0.28)', color: '#4fcc8a', icon: '✓' },
    error:   { bg: 'rgba(255,95,95,0.12)',  border: 'rgba(255,95,95,0.28)',  color: '#ff5f5f', icon: '✕' },
    info:    { bg: 'rgba(79,142,255,0.12)', border: 'rgba(79,142,255,0.28)', color: '#4f8eff', icon: 'i' },
  }[type]

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 200, animation: 'slideUp 0.25s ease',
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 16px',
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: 8,
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      minWidth: 240, maxWidth: 420,
    }}>
      <span style={{
        width: 18, height: 18, borderRadius: '50%',
        background: colors.color, color: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700, flexShrink: 0,
      }}>
        {colors.icon}
      </span>
      <span style={{ fontSize: 12, color: '#dddde9', flex: 1 }}>{message}</span>
    </div>
  )
}
