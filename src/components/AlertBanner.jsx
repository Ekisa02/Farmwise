export default function AlertBanner({ animal }) {
  if (!animal) return null
  return (
    <div style={{
      margin: '6px 12px 0',
      padding: '9px 12px',
      background: '#FFF3ED',
      border: '2px solid var(--red-light)',
      borderRadius: '12px',
      display: 'flex', gap: '9px', alignItems: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: '15px' }}>⚠️</span>
      <div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, color: 'var(--red)', fontSize: '11px' }}>
          Milk Drop Alert — {animal.name}
        </div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '10px', color: 'var(--brown)' }}>
          Significant drop detected. Check for fever or mastitis.
        </div>
      </div>
    </div>
  )
}
