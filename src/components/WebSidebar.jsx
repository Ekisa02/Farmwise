const NAV = [
  { id:'camera',   label:'Health Scanner', emoji:'📸', desc:'AI vet scans' },
  { id:'feed',     label:'Smart Feed',     emoji:'🌿', desc:'Feeding advice' },
  { id:'diary',    label:'Milk Diary',     emoji:'🥛', desc:'Daily records' },
  { id:'progress', label:'Progress',       emoji:'📈', desc:'Charts & trends' },
]

export default function WebSidebar({ active, setPage, user, animalCount, onLogout, onAddAnimal, loc, online, pending }) {
  const initials = (user?.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside style={{
      width: '220px', flexShrink: 0,
      background: 'linear-gradient(180deg, #0f2d1e 0%, #1e4a35 50%, #2D6A4F 100%)',
      display: 'flex', flexDirection: 'column', height: '100vh',
      position: 'sticky', top: 0, userSelect: 'none',
    }}>

      {/* Logo */}
      <div style={{ padding: '24px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <span style={{ fontSize: '26px' }}>🐄</span>
          <span style={{ fontFamily:"'Playfair Display', serif", fontWeight: 900, fontSize: '20px', color: 'white', letterSpacing: '-0.3px' }}>
            FarmWise
          </span>
        </div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.45)', paddingLeft: '2px' }}>
          {user?.farm || 'My Farm'} · {animalCount} animals
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {NAV.map(item => {
          const isActive = active === item.id
          return (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '11px', border: 'none',
              background: isActive ? 'rgba(82,183,136,0.18)' : 'transparent',
              color: isActive ? '#74C69D' : 'rgba(255,255,255,0.55)',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: isActive ? 800 : 600,
              fontSize: '13px', cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all 0.15s',
              borderLeft: isActive ? '3px solid #52B788' : '3px solid transparent',
            }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: '17px', width: '22px', textAlign: 'center', flexShrink: 0 }}>{item.emoji}</span>
              <div>
                <div>{item.label}</div>
                {isActive && (
                  <div style={{ fontSize: '10px', color: 'rgba(82,183,136,0.7)', fontWeight: 600, marginTop: '1px' }}>{item.desc}</div>
                )}
              </div>
            </button>
          )
        })}

        {/* Add animal */}
        <button onClick={onAddAnimal} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', marginTop: '6px', borderRadius: '11px',
          border: '1.5px dashed rgba(82,183,136,0.4)', background: 'transparent',
          color: '#74C69D', fontFamily: 'Nunito, sans-serif',
          fontWeight: 700, fontSize: '13px', cursor: 'pointer', width: '100%', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(82,183,136,0.1)'; e.currentTarget.style.borderColor = 'rgba(82,183,136,0.7)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(82,183,136,0.4)' }}
        >
          <span style={{ fontSize: '17px', width: '22px', textAlign: 'center', flexShrink: 0 }}>➕</span>
          Add Animal
        </button>
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px 16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Status row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: online ? '#74C69D' : 'rgba(255,255,255,0.35)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: online ? '#52B788' : '#666', display: 'inline-block', flexShrink: 0 }} />
            {online ? 'Online' : 'Offline'}
          </div>
          {pending > 0 && (
            <span style={{ background: '#D4A017', color: '#3d2800', borderRadius: '999px', padding: '1px 7px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '10px' }}>
              {pending} unsynced
            </span>
          )}
        </div>
        {/* Location */}
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          📍 {loc?.label || 'Detecting…'}
        </div>
        {/* User row + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(82,183,136,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '12px', color: '#74C69D', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
          </div>
          <button onClick={onLogout} title="Logout" style={{
            background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)',
            cursor: 'pointer', padding: '4px', borderRadius: '6px', transition: 'color 0.15s',
            flexShrink: 0,
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#ff8080'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
