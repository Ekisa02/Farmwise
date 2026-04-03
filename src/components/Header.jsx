export default function Header({ user, animalCount, onLogout, onAddAnimal }) {
  return (
    <div style={{
      background: 'var(--cream)',
      padding: '9px 14px 7px',
      borderBottom: '2px solid var(--green-pale)',
      display: 'flex', alignItems: 'center', gap: '9px',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: '22px' }}>🐄</span>
      <div>
        <div style={{ fontFamily:"'Playfair Display', serif", fontWeight: 900, fontSize: '16px', color: 'var(--green)', lineHeight: 1 }}>
          FarmWise
        </div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '9px', color: 'var(--text-muted)' }}>
          {user?.farm || user?.name} · {animalCount} animals
        </div>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '7px', alignItems: 'center' }}>
        <button
          onClick={onAddAnimal}
          style={{
            background: 'var(--green)', color: 'white', border: 'none',
            borderRadius: '999px', padding: '5px 12px',
            fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '11px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
            boxShadow: '0 2px 8px rgba(45,106,79,0.3)',
          }}
        >
          ➕ Add Animal
        </button>
        <button
          onClick={onLogout}
          title={`Logout ${user?.name}`}
          style={{
            background: 'transparent', color: 'var(--text-muted)',
            border: '2px solid #E0E0E0', borderRadius: '999px',
            padding: '4px 10px', fontFamily: 'Nunito, sans-serif',
            fontWeight: 700, fontSize: '10px', cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
