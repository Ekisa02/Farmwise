import { useState, useEffect } from 'react'

export default function DiaryPage({ animals, records, loadForAnimal, saveRecord, online }) {
  const cows = animals.filter(a => a.type === 'cow')
  const [sel,       setSel]       = useState(cows[0] || null)
  const [amVal,     setAmVal]     = useState('')
  const [pmVal,     setPmVal]     = useState('')
  const [saved,     setSaved]     = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [listening, setListening] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  // Load records whenever selected cow changes
  useEffect(() => {
    if (!sel) return
    loadForAnimal(sel._id)
  }, [sel?._id])

  // Pre-fill today's values if already recorded
  useEffect(() => {
    if (!sel) return
    const recs    = records[sel._id] || []
    const todayR  = recs.find(r => r.date === today)
    setAmVal(todayR ? String(todayR.am) : '')
    setPmVal(todayR ? String(todayR.pm) : '')
    setSaved(false)
  }, [sel?._id, records])

  const handleSave = async () => {
    if (!amVal || !pmVal || !sel) return
    setSaving(true)
    await saveRecord(sel._id, today, parseFloat(amVal), parseFloat(pmVal), online)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2400)
  }

  const handleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return alert('Voice input not supported on this browser.')
    const rec = new SR()
    rec.lang = 'en-US'
    rec.onstart  = () => setListening(true)
    rec.onend    = () => setListening(false)
    rec.onresult = e => {
      const match = e.results[0][0].transcript.match(/(\d+(?:\.\d+)?)/)
      if (match) setAmVal(match[1])
    }
    rec.start()
  }

  const last7 = (records[sel?._id] || []).slice(-7)

  if (!sel) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif', color: 'var(--text-muted)' }}>
      No cows found. Add animals first.
    </div>
  )

  return (
    <div className="scroll-y" style={{ flex: 1, padding: '14px 16px' }}>
      <div style={titleStyle}>Milk Diary</div>
      <div style={subtitleStyle}>Record daily milk. Spot drops instantly.</div>

      {/* Cow selector */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '5px', marginBottom: '12px' }}>
        {cows.map(c => (
          <button
            key={c._id}
            onClick={() => setSel(c)}
            style={{
              flex: '0 0 auto', padding: '6px 12px', borderRadius: '12px',
              border: `2px solid ${sel._id === c._id ? 'var(--green)' : '#E0E0E0'}`,
              background: sel._id === c._id ? 'var(--green-pale)' : 'var(--card-bg)',
              fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '11px',
              color: sel._id === c._id ? 'var(--green)' : 'var(--text)',
              whiteSpace: 'nowrap',
            }}
          >
            🐄 {c.name}
          </button>
        ))}
      </div>

      {/* Entry card */}
      <div style={cardStyle}>
        <div style={labelStyle}>
          📅 {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px', marginBottom: '10px' }}>
          {[['🌅 Morning AM', amVal, setAmVal], ['🌆 Evening PM', pmVal, setPmVal]].map(([label, val, setter]) => (
            <div key={label}>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <input
                  type="number" min="0" max="50" step="0.5"
                  value={val}
                  onChange={e => setter(e.target.value)}
                  placeholder="0"
                  style={{ width: '100%', padding: '9px', borderRadius: '9px', border: '2px solid var(--green-pale)', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '17px', textAlign: 'center', color: 'var(--text)', outline: 'none' }}
                />
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '10px', color: 'var(--text-muted)' }}>L</span>
              </div>
            </div>
          ))}
        </div>

        {/* Offline notice */}
        {!online && (
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '10px', color: 'var(--gold)', background: 'rgba(212,160,23,0.1)', borderRadius: '8px', padding: '5px 8px', marginBottom: '9px', textAlign: 'center' }}>
            📴 Offline — will sync when back online
          </div>
        )}

        <div style={{ display: 'flex', gap: '7px' }}>
          <button
            onClick={handleVoice}
            style={{
              flex: '0 0 auto', padding: '9px 12px',
              background: listening ? 'var(--red-light)' : 'var(--green-pale)',
              border: 'none', borderRadius: '10px',
              color: listening ? 'white' : 'var(--green)',
              display: 'flex', alignItems: 'center', gap: '4px',
              fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '11px',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            {listening ? 'Listening…' : 'Speak'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1, padding: '9px',
              background: saved ? 'var(--green-light)' : 'var(--green)',
              border: 'none', borderRadius: '10px', color: 'white',
              fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '13px',
              transition: 'background 0.3s',
            }}
          >
            {saving ? 'Saving…' : saved ? '✅ Saved!' : 'Save Record'}
          </button>
        </div>
      </div>

      {/* Last 7 days table */}
      <div style={cardStyle}>
        <div style={labelStyle}>📋 Last 7 Days — {sel.name}</div>
        {last7.length === 0 ? (
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
            No records yet. Start adding milk data!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Date', 'AM', 'PM', 'Total'].map(h => (
                  <th key={h} style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '10px', color: 'var(--text-muted)', padding: '3px 5px', textAlign: h === 'Date' ? 'left' : 'center' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {last7.map((r, i) => {
                const tot  = r.am + r.pm
                const prev = i > 0 ? last7[i - 1].am + last7[i - 1].pm : tot
                const drop = tot < prev * 0.8
                return (
                  <tr key={r.date || i} style={{ background: drop ? '#FFF3ED' : 'transparent' }}>
                    <td style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: 'var(--text)', padding: '5px' }}>
                      {new Date(r.date + 'T12:00').toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric' })}
                      {r._offline && <span style={{ color: 'var(--gold)', fontSize: '9px', marginLeft: '3px' }}>●</span>}
                    </td>
                    <td style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: 'var(--text)', padding: '5px', textAlign: 'center' }}>{r.am}L</td>
                    <td style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: 'var(--text)', padding: '5px', textAlign: 'center' }}>{r.pm}L</td>
                    <td style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '12px', padding: '5px', textAlign: 'center', color: drop ? 'var(--red)' : 'var(--green)' }}>
                      {tot}L {drop ? '⚠️' : ''}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const titleStyle    = { fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '22px', color: 'var(--green)', marginBottom: '2px' }
const subtitleStyle = { fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }
const cardStyle     = { background: 'var(--card-bg)', borderRadius: '16px', padding: '13px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
const labelStyle    = { fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '11px', color: 'var(--brown)', marginBottom: '10px' }
