import { useState } from 'react'
import { feedApi } from '../services/api'

const CONCERNS = [
  { id: 'low_milk',    label: 'Low Milk',     emoji: '📉' },
  { id: 'stomach',     label: 'Stomach Upset',emoji: '🤢' },
  { id: 'weight',      label: 'Weight Loss',  emoji: '⚖️' },
  { id: 'mastitis',    label: 'Mastitis Risk', emoji: '🍼' },
  { id: 'normal',      label: 'All Good',      emoji: '✅' },
  { id: 'calf_growth', label: 'Calf Growth',  emoji: '🐮' },
]

export default function FeedPage() {
  const [foods,   setFoods]   = useState(['Napier grass', 'Maize stalks', 'Rhodes grass'])
  const [newFood, setNewFood] = useState('')
  const [concern, setConcern] = useState('')
  const [advice,  setAdvice]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const addFood = () => {
    if (newFood.trim()) { setFoods(f => [...f, newFood.trim()]); setNewFood('') }
  }

  const getAdvice = async () => {
    if (!concern) return
    setLoading(true); setAdvice(null); setError(null)
    try {
      const data = await feedApi.getAdvice(concern, foods)
      setAdvice(data)
    } catch (err) {
      setError('Could not reach server. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="scroll-y" style={{ flex: 1, padding: '14px 16px' }}>
      <div style={titleStyle}>Smart Menu</div>
      <div style={subtitleStyle}>Personalised feeding plan from what you have.</div>

      {/* Available feeds */}
      <div style={cardStyle}>
        <Label>🌾 AVAILABLE FEEDS</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '9px' }}>
          {foods.map((f, i) => (
            <span key={i} style={tagStyle}>
              {f}
              <span onClick={() => setFoods(foods.filter((_, j) => j !== i))} style={{ cursor: 'pointer', opacity: 0.6, fontWeight: 900, marginLeft: '3px' }}>×</span>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '7px' }}>
          <input
            value={newFood}
            onChange={e => setNewFood(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addFood()}
            placeholder="Add food (e.g. cow peas)…"
            style={inputStyle}
          />
          <button onClick={addFood} style={iconBtnStyle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Concern selector */}
      <Label style={{ marginBottom: '7px' }}>WHAT'S THE CONCERN?</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px', marginBottom: '12px' }}>
        {CONCERNS.map(c => (
          <button
            key={c.id}
            onClick={() => setConcern(c.id)}
            style={{
              padding: '9px 10px', borderRadius: '11px',
              border: `2px solid ${concern === c.id ? 'var(--green)' : '#E0E0E0'}`,
              background: concern === c.id ? 'var(--green-pale)' : 'var(--card-bg)',
              fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '11px',
              color: concern === c.id ? 'var(--green)' : 'var(--text)',
              display: 'flex', alignItems: 'center', gap: '5px',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: '17px' }}>{c.emoji}</span>{c.label}
          </button>
        ))}
      </div>

      <button
        onClick={getAdvice}
        disabled={!concern || loading}
        style={{
          width: '100%', padding: '13px', borderRadius: '14px', border: 'none',
          background: concern ? 'var(--green)' : '#CCC',
          color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '13px',
          boxShadow: concern ? '0 6px 16px rgba(45,106,79,0.35)' : 'none',
          marginBottom: '14px', transition: 'all 0.2s',
        }}
      >
        {loading ? '🌿 Generating plan…' : '🌿 Get Feeding Advice'}
      </button>

      {error && (
        <div style={{ background: '#FFEBEE', border: '2px solid var(--red)', borderRadius: '14px', padding: '12px', marginBottom: '12px', fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--red)' }}>
          ⚠️ {error}
        </div>
      )}

      {advice && (
        <div className="fade-in">
          {/* Summary */}
          <div style={{ background: 'var(--green)', borderRadius: '16px', padding: '13px', marginBottom: '9px', color: 'white' }}>
            <Label style={{ color: 'white', opacity: 0.85 }}>💡 Summary</Label>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', lineHeight: 1.6, opacity: 0.92 }}>{advice.summary}</div>
          </div>

          {/* Remove */}
          {advice.remove?.length > 0 && (
            <div style={{ background: '#FFF3ED', border: '2px solid var(--red-light)', borderRadius: '16px', padding: '13px', marginBottom: '9px' }}>
              <Label style={{ color: 'var(--red)' }}>🚫 REDUCE / REMOVE</Label>
              {advice.remove.map((r, i) => (
                <div key={i} style={{ marginBottom: '5px' }}>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '12px', color: 'var(--brown)' }}>{r.food}</div>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: 'var(--text-muted)' }}>{r.reason}</div>
                </div>
              ))}
            </div>
          )}

          {/* Add */}
          {advice.add?.length > 0 && (
            <div style={{ background: '#F0FFF4', border: '2px solid var(--green-mid)', borderRadius: '16px', padding: '13px', marginBottom: '9px' }}>
              <Label style={{ color: 'var(--green-light)' }}>✅ ADD / INCREASE</Label>
              {advice.add.map((a, i) => (
                <div key={i} style={{ marginBottom: '7px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '12px', color: 'var(--text)' }}>{a.food}</span>
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '10px', color: 'var(--green)', background: 'var(--green-pale)', padding: '1px 7px', borderRadius: '999px' }}>{a.amount}</span>
                  </div>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: 'var(--text-muted)' }}>{a.reason}</div>
                </div>
              ))}
            </div>
          )}

          {/* Water */}
          {advice.water && (
            <div style={{ background: 'var(--blue-light)', border: '2px solid rgba(21,101,192,0.25)', borderRadius: '16px', padding: '11px 13px', marginBottom: '9px' }}>
              <Label style={{ color: 'var(--blue)' }}>💧 WATER</Label>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--blue)' }}>{advice.water}</div>
            </div>
          )}

          {/* Local tip */}
          {advice.local_tip && (
            <div style={{ background: 'rgba(212,160,23,0.1)', border: '2px solid var(--gold)', borderRadius: '16px', padding: '11px 13px' }}>
              <Label style={{ color: 'var(--gold)' }}>💛 LOCAL FARMER'S TIP</Label>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--brown)' }}>{advice.local_tip}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Styles ───────────────────────────────────────────────────
const titleStyle    = { fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '22px', color: 'var(--green)', marginBottom: '2px' }
const subtitleStyle = { fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }
const cardStyle     = { background: 'var(--card-bg)', borderRadius: '16px', padding: '13px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
const tagStyle      = { background: 'var(--green-pale)', color: 'var(--green)', borderRadius: '999px', padding: '4px 9px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '11px', display: 'inline-flex', alignItems: 'center' }
const inputStyle    = { flex: 1, padding: '8px 11px', borderRadius: '9px', border: '2px solid var(--green-pale)', fontFamily: 'Nunito, sans-serif', fontSize: '12px', outline: 'none', color: 'var(--text)' }
const iconBtnStyle  = { background: 'var(--green)', color: 'white', border: 'none', borderRadius: '9px', padding: '8px 11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }

function Label({ children, style = {} }) {
  return (
    <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, color: 'var(--brown)', fontSize: '11px', marginBottom: '7px', ...style }}>
      {children}
    </div>
  )
}
