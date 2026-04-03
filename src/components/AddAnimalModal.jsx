import { useState } from 'react'

const BREEDS = {
  cow:  ['Friesian', 'Ayrshire', 'Jersey', 'Guernsey', 'Sahiwal', 'Zebu', 'Brown Swiss', 'Simmental', 'Boran', 'Other'],
  bull: ['Friesian', 'Boran', 'Angus', 'Sahiwal', 'Simmental', 'Zebu', 'Other'],
  calf: ['Friesian cross', 'Ayrshire cross', 'Jersey cross', 'Sahiwal cross', 'Zebu cross', 'Other'],
}

const EMOJI_MAP = { cow: '🐄', bull: '🐂', calf: '🐮' }

export default function AddAnimalModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: '', type: 'cow', breed: '', age: '', sex: 'F', notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = (k, v) => {
    setForm(f => {
      const next = { ...f, [k]: v }
      // reset breed when type changes
      if (k === 'type') next.breed = ''
      return next
    })
  }

  const handleSave = async () => {
    if (!form.name || !form.breed || !form.age) {
      setError('Name, breed and age are required'); return
    }
    setSaving(true); setError('')
    try {
      await onSave({ ...form, emoji: EMOJI_MAP[form.type] })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 13px', borderRadius: '11px',
    border: '2px solid var(--green-pale)', fontFamily: 'Nunito, sans-serif',
    fontSize: '13px', color: 'var(--text)', outline: 'none', background: 'white',
  }

  const labelStyle = {
    fontFamily: 'Nunito, sans-serif', fontWeight: 700,
    fontSize: '11px', color: 'var(--text-muted)',
    display: 'block', marginBottom: '5px',
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100 }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '430px', background: 'white',
        borderRadius: '24px 24px 0 0', padding: '20px 20px 32px',
        zIndex: 101, maxHeight: '90svh', overflowY: 'auto',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Handle */}
        <div style={{ width: '40px', height: '4px', background: '#DDD', borderRadius: '999px', margin: '0 auto 16px' }} />

        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '20px', color: 'var(--green)', marginBottom: '16px' }}>
          ➕ Add Animal
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>

          {/* Name */}
          <div>
            <label style={labelStyle}>ANIMAL NAME *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Daisy" style={inputStyle}
              onFocus={e => e.target.style.border = '2px solid var(--green)'}
              onBlur={e  => e.target.style.border = '2px solid var(--green-pale)'} />
          </div>

          {/* Type */}
          <div>
            <label style={labelStyle}>TYPE *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[['cow','🐄 Cow'],['bull','🐂 Bull'],['calf','🐮 Calf']].map(([val, lbl]) => (
                <button key={val} onClick={() => set('type', val)} style={{
                  padding: '10px 6px', borderRadius: '11px',
                  border: `2px solid ${form.type === val ? 'var(--green)' : '#E0E0E0'}`,
                  background: form.type === val ? 'var(--green-pale)' : 'white',
                  fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '12px',
                  color: form.type === val ? 'var(--green)' : 'var(--text-muted)', cursor: 'pointer',
                }}>{lbl}</button>
              ))}
            </div>
          </div>

          {/* Breed */}
          <div>
            <label style={labelStyle}>BREED *</label>
            <select value={form.breed} onChange={e => set('breed', e.target.value)}
              style={{ ...inputStyle, appearance: 'none' }}>
              <option value="">Select breed…</option>
              {BREEDS[form.type].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Age + Sex */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>AGE *</label>
              <input value={form.age} onChange={e => set('age', e.target.value)}
                placeholder="e.g. 3 yrs / 6 mos" style={inputStyle}
                onFocus={e => e.target.style.border = '2px solid var(--green)'}
                onBlur={e  => e.target.style.border = '2px solid var(--green-pale)'} />
            </div>
            <div>
              <label style={labelStyle}>SEX *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[['F','♀ Female'],['M','♂ Male']].map(([val, lbl]) => (
                  <button key={val} onClick={() => set('sex', val)} style={{
                    flex: 1, padding: '11px 4px', borderRadius: '11px',
                    border: `2px solid ${form.sex === val ? 'var(--green)' : '#E0E0E0'}`,
                    background: form.sex === val ? 'var(--green-pale)' : 'white',
                    fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '11px',
                    color: form.sex === val ? 'var(--green)' : 'var(--text-muted)', cursor: 'pointer',
                  }}>{lbl}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>NOTES <span style={{ opacity: 0.5 }}>(optional)</span></label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Any health history, special diet, etc."
              rows={2}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
              onFocus={e => e.target.style.border = '2px solid var(--green)'}
              onBlur={e  => e.target.style.border = '2px solid var(--green-pale)'} />
          </div>

          {error && (
            <div style={{ background: '#FFEBEE', border: '2px solid var(--red)', borderRadius: '10px', padding: '10px 12px', fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--red)', fontWeight: 700 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: '13px', border: '2px solid #E0E0E0', background: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '14px', cursor: 'pointer', color: 'var(--text-muted)' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '13px', borderRadius: '13px', border: 'none', background: saving ? '#CCC' : 'var(--green)', color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(45,106,79,0.3)' }}>
              {saving ? '⏳ Saving…' : `${EMOJI_MAP[form.type]} Add ${form.type.charAt(0).toUpperCase() + form.type.slice(1)}`}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes slideUp { from{transform:translateX(-50%) translateY(100%)} to{transform:translateX(-50%) translateY(0)} }`}</style>
    </>
  )
}
