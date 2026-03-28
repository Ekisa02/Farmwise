export default function Header({ animalCount }) {
  return (
    <div style={{
      background:'var(--cream)', padding:'9px 14px 7px',
      borderBottom:'2px solid var(--green-pale)',
      display:'flex', alignItems:'center', gap:'9px', flexShrink:0,
    }}>
      <span style={{ fontSize:'22px' }}>🐄</span>
      <div>
        <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'16px', color:'var(--green)', lineHeight:1 }}>FarmWise</div>
        <div style={{ fontFamily:'Nunito, sans-serif', fontSize:'9px', color:'var(--text-muted)' }}>
          AI Farm Assistant · {animalCount} animals in herd
        </div>
      </div>
      <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'4px', background:'var(--green-pale)', borderRadius:'999px', padding:'3px 9px' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" width="11" height="11">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        <span style={{ fontFamily:'Nunito, sans-serif', fontWeight:700, fontSize:'9px', color:'var(--green)' }}>Auto-sync ON</span>
      </div>
    </div>
  )
}
