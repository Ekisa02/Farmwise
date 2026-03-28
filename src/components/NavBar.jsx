const tabs = [
  { id: 'camera',   label: 'Health',   icon: CameraIcon },
  { id: 'feed',     label: 'Feed',     icon: FoodIcon },
  { id: 'diary',    label: 'Diary',    icon: MilkIcon },
  { id: 'progress', label: 'Progress', icon: GraphIcon },
]

export default function NavBar({ active, setPage }) {
  return (
    <div style={{
      display: 'flex',
      borderTop: '2px solid var(--green-pale)',
      background: 'var(--card-bg)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.09)',
      flexShrink: 0,
    }}>
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => setPage(id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '2px', padding: '9px 0',
              border: 'none', background: 'transparent',
              fontFamily: 'Nunito, sans-serif', fontWeight: 700,
              fontSize: '10px',
              color: isActive ? 'var(--green)' : 'var(--text-muted)',
              transition: 'color 0.2s',
            }}
          >
            <div style={{
              background: isActive ? 'var(--green-pale)' : 'transparent',
              borderRadius: '12px', padding: '5px 14px',
              color: isActive ? 'var(--green)' : 'var(--text-muted)',
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.2s',
            }}>
              <Icon />
            </div>
            {label}
          </button>
        )
      })}
    </div>
  )
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}
function FoodIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  )
}
function MilkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <path d="M8 2h8l1 5H7L8 2z"/>
      <path d="M7 7s-2 2-2 8a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5c0-6-2-8-2-8"/>
    </svg>
  )
}
function GraphIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  )
}
