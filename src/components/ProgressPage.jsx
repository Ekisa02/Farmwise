import { useState, useEffect, useRef } from 'react'

export default function ProgressPage({ animals, records, loadForAnimal }) {
  const cows = animals.filter(a => a.type === 'cow')
  const [sel, setSel] = useState(cows[0] || null)
  const canvasRef = useRef()

  useEffect(() => {
    if (sel) loadForAnimal(sel._id)
  }, [sel?._id])

  const recs   = records[sel?._id] || []
  const last7  = recs.slice(-7)
  const totals = last7.map(r => r.am + r.pm)
  const avg    = totals.length ? (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1) : 0
  const trend  = totals.length >= 2 ? (totals[totals.length - 1] - totals[0]).toFixed(1) : 0

  // Star cow = highest average across all cows
  const best = cows.reduce((acc, cow) => {
    const cr  = records[cow._id] || []
    const avg = cr.length ? cr.reduce((s, r) => s + r.am + r.pm, 0) / cr.length : 0
    return avg > acc.avg ? { cow, avg } : acc
  }, { cow: cows[0], avg: 0 })

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || totals.length < 2) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const pad = { l: 36, r: 12, t: 14, b: 26 }
    const gW = W - pad.l - pad.r
    const gH = H - pad.t - pad.b
    ctx.clearRect(0, 0, W, H)

    const minV = Math.max(0, Math.min(...totals) - 2)
    const maxV = Math.max(...totals) + 2
    const xS   = gW / (totals.length - 1)
    const yS   = v => pad.t + gH - ((v - minV) / (maxV - minV)) * gH

    // Grid lines
    ctx.strokeStyle = '#E8E8E0'; ctx.lineWidth = 1
    ;[0.25, 0.5, 0.75, 1].forEach(f => {
      const y = pad.t + gH * (1 - f)
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + gW, y); ctx.stroke()
      ctx.fillStyle = '#6B7B6B'; ctx.font = '9px Nunito'; ctx.textAlign = 'right'
      ctx.fillText(Math.round(minV + (maxV - minV) * f), pad.l - 3, y + 3)
    })

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + gH)
    grad.addColorStop(0, 'rgba(64,145,108,0.35)')
    grad.addColorStop(1, 'rgba(64,145,108,0)')
    ctx.beginPath()
    ctx.moveTo(pad.l, yS(totals[0]))
    totals.forEach((v, i) => ctx.lineTo(pad.l + i * xS, yS(v)))
    ctx.lineTo(pad.l + (totals.length - 1) * xS, pad.t + gH)
    ctx.lineTo(pad.l, pad.t + gH)
    ctx.closePath(); ctx.fillStyle = grad; ctx.fill()

    // Line
    ctx.beginPath()
    totals.forEach((v, i) => i === 0 ? ctx.moveTo(pad.l, yS(v)) : ctx.lineTo(pad.l + i * xS, yS(v)))
    ctx.strokeStyle = '#40916C'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke()

    // Dots
    totals.forEach((v, i) => {
      const x = pad.l + i * xS, y = yS(v)
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = 'white'; ctx.fill()
      ctx.strokeStyle = '#2D6A4F'; ctx.lineWidth = 2; ctx.stroke()
      ctx.fillStyle = '#1A2E1A'; ctx.font = 'bold 9px Nunito'; ctx.textAlign = 'center'
      ctx.fillText(v, x, y - 9)
      if (last7[i]) {
        ctx.fillStyle = '#6B7B6B'; ctx.font = '8px Nunito'
        ctx.fillText(
          new Date(last7[i].date + 'T12:00').toLocaleDateString('en-KE', { weekday: 'short' }),
          x, pad.t + gH + 14
        )
      }
    })
  }, [totals, last7])

  if (!sel) return null

  return (
    <div className="scroll-y" style={{ flex: 1, padding: '14px 16px' }}>
      <div style={titleStyle}>Progress</div>
      <div style={subtitleStyle}>Track success. Spot your stars.</div>

      {/* Cow tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '5px', marginBottom: '12px' }}>
        {cows.map(c => (
          <button
            key={c._id}
            onClick={() => setSel(c)}
            style={{
              flex: '0 0 auto', padding: '6px 11px', borderRadius: '11px',
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

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        {[
          { label: 'Avg Daily', value: `${avg}L`, icon: '📊' },
          {
            label: '7-Day Trend',
            value: trend >= 0 ? `+${trend}L ↑` : `${trend}L ↓`,
            icon: trend >= 0 ? '📈' : '📉',
            color: trend >= 0 ? 'var(--green)' : 'var(--red)',
          },
          { label: 'Last Entry', value: totals.length ? `${totals[totals.length - 1]}L` : '--', icon: '🕐' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card-bg)', borderRadius: '13px', padding: '10px 7px', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '17px', marginBottom: '2px' }}>{s.icon}</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '14px', color: s.color || 'var(--text)' }}>{s.value}</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '9px', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={cardStyle}>
        <div style={labelStyle}>📈 7-Day Chart — {sel.name}</div>
        {totals.length >= 2
          ? <canvas ref={canvasRef} width={320} height={140} style={{ width: '100%', height: 'auto' }} />
          : <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Add at least 2 days of records.</div>
        }
      </div>

      {/* Star cow */}
      {best?.cow && (
        <div style={{ background: 'linear-gradient(135deg, rgba(212,160,23,0.15), rgba(212,160,23,0.3))', border: '2px solid var(--gold)', borderRadius: '16px', padding: '12px', marginBottom: '12px' }}>
          <div style={labelStyle}>⭐ Your Star Cow</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '30px' }}>🐄</span>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '17px', color: 'var(--brown)' }}>{best.cow.name}</div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '10px', color: 'var(--text-muted)' }}>
                {best.avg.toFixed(1)}L/day · {best.cow.breed}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All cows bar comparison */}
      <div style={cardStyle}>
        <div style={labelStyle}>🐄 All Cows Comparison</div>
        {cows.map(cow => {
          const cr     = records[cow._id] || []
          const cowAvg = cr.length ? cr.reduce((s, r) => s + r.am + r.pm, 0) / cr.length : 0
          const pct    = best.avg ? (cowAvg / best.avg) * 100 : 0
          return (
            <div key={cow._id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '11px', color: 'var(--text)' }}>
                  🐄 {cow.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '9px' }}>({cow.breed})</span>
                </span>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '11px', color: 'var(--green)' }}>{cowAvg.toFixed(1)}L/day</span>
              </div>
              <div style={{ background: 'var(--green-pale)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green)', borderRadius: '999px', transition: 'width 0.8s ease' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const titleStyle    = { fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '22px', color: 'var(--green)', marginBottom: '2px' }
const subtitleStyle = { fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }
const cardStyle     = { background: 'var(--card-bg)', borderRadius: '16px', padding: '12px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
const labelStyle    = { fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '11px', color: 'var(--brown)', marginBottom: '8px' }
