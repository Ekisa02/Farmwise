export default function StatusBar({ loc, online, pending }) {
  return (
    <div style={{
      display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'6px 14px', background:'var(--green)',
      color:'white', fontFamily:'Nunito, sans-serif', fontWeight:700, fontSize:'11px',
      flexShrink: 0,
    }}>
      <span style={{ display:'flex', alignItems:'center', gap:'4px' }}>
        📍 {loc.label}
      </span>
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        {pending > 0 && (
          <span style={{ background:'var(--gold)', color:'var(--brown)', borderRadius:'999px', padding:'1px 8px', fontSize:'10px', fontWeight:800 }}>
            {pending} unsynced
          </span>
        )}
        <span style={{ display:'flex', alignItems:'center', gap:'4px', opacity: online ? 1 : 0.5 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
            <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
          </svg>
          {online ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  )
}
