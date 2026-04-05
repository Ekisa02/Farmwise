const TITLES = {
  camera:   { label: 'Health Scanner', sub: 'Scan animals for health issues using AI', emoji: '📸' },
  feed:     { label: 'Smart Feed Advisor', sub: 'Get feeding plans from your available crops', emoji: '🌿' },
  diary:    { label: 'Milk Diary', sub: 'Record and track daily milk production', emoji: '🥛' },
  progress: { label: 'Progress Tracker', sub: 'Charts, trends and your star performers', emoji: '📈' },
}

export default function WebTopBar({ page, user, onAddAnimal, online, pending }) {
  const info = TITLES[page] || TITLES.camera
  const initials = (user?.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{
      height: '64px', background: 'white',
      borderBottom: '1px solid #EAECEF',
      display: 'flex', alignItems: 'center',
      padding: '0 28px', flexShrink: 0, gap: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* Title */}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '18px', color: 'var(--green)', lineHeight: 1 }}>
          {info.emoji} {info.label}
        </div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {info.sub}
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Sync badge */}
        {pending > 0 && (
          <span className="badge badge-yellow">
            🔄 {pending} unsynced
          </span>
        )}

        {/* Online dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: online ? 'var(--green)' : 'var(--text-muted)', background: online ? 'rgba(45,106,79,0.07)' : '#F5F5F5', borderRadius: '999px', padding: '4px 10px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: online ? 'var(--green)' : '#CCC', display: 'inline-block', flexShrink: 0 }} />
          {online ? 'Online' : 'Offline'}
        </div>

        {/* Add animal */}
        <button onClick={onAddAnimal} className="btn-primary">
          ➕ Add Animal
        </button>

        {/* Avatar */}
        <div title={user?.name} style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'var(--green-pale)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Nunito, sans-serif', fontWeight: 900,
          fontSize: '13px', color: 'var(--green)', flexShrink: 0,
          border: '2px solid var(--green-pale)',
          cursor: 'default',
        }}>
          {initials}
        </div>
      </div>
    </div>
  )
}
