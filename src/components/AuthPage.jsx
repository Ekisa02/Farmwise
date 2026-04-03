import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode,    setMode]   = useState('login')   // 'login' | 'register'
  const [form,    setForm]   = useState({ name: '', email: '', password: '', farm: '' })
  const [error,   setError]  = useState('')
  const [loading, setLoading]= useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        if (!form.name) { setError('Name is required'); setLoading(false); return }
        await register(form.name, form.email, form.password, form.farm)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '13px 14px', borderRadius: '12px',
    border: '2px solid var(--green-pale)', fontFamily: 'Nunito, sans-serif',
    fontSize: '14px', color: 'var(--text)', outline: 'none',
    background: 'white', transition: 'border 0.2s',
  }

  return (
    <div style={{
      height: '100svh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '24px',
      maxWidth: '430px', margin: '0 auto',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '56px', marginBottom: '8px' }}>🐄</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '28px', color: 'var(--green)' }}>
          FarmWise
        </div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          AI Farm Assistant for Kenyan Farmers
        </div>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', background: 'white', borderRadius: '24px',
        padding: '24px', boxShadow: '0 8px 32px rgba(45,106,79,0.12)',
      }}>
        {/* Tab switcher */}
        <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: '12px', padding: '4px', marginBottom: '20px' }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '9px', borderRadius: '9px', border: 'none',
              background: mode === m ? 'var(--green)' : 'transparent',
              color: mode === m ? 'white' : 'var(--text-muted)',
              fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '13px',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {m === 'login' ? '🔑 Login' : '✨ Register'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mode === 'register' && (
            <div>
              <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>FULL NAME</label>
              <input
                value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Joseph Ekisa" style={inputStyle}
                onFocus={e => e.target.style.border = '2px solid var(--green)'}
                onBlur={e  => e.target.style.border = '2px solid var(--green-pale)'}
              />
            </div>
          )}

          <div>
            <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>EMAIL</label>
            <input
              type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="you@email.com" style={inputStyle}
              onFocus={e => e.target.style.border = '2px solid var(--green)'}
              onBlur={e  => e.target.style.border = '2px solid var(--green-pale)'}
            />
          </div>

          <div>
            <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>PASSWORD</label>
            <input
              type="password" value={form.password} onChange={e => set('password', e.target.value)}
              placeholder="Min 6 characters" style={inputStyle}
              onFocus={e => e.target.style.border = '2px solid var(--green)'}
              onBlur={e  => e.target.style.border = '2px solid var(--green-pale)'}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>FARM NAME <span style={{ opacity: 0.5 }}>(optional)</span></label>
              <input
                value={form.farm} onChange={e => set('farm', e.target.value)}
                placeholder="e.g. Green Valley Farm" style={inputStyle}
                onFocus={e => e.target.style.border = '2px solid var(--green)'}
                onBlur={e  => e.target.style.border = '2px solid var(--green-pale)'}
              />
            </div>
          )}

          {error && (
            <div style={{ background: '#FFEBEE', border: '2px solid var(--red)', borderRadius: '10px', padding: '10px 12px', fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--red)', fontWeight: 700 }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !form.email || !form.password}
            style={{
              padding: '14px', borderRadius: '14px', border: 'none',
              background: loading || !form.email || !form.password ? '#CCC' : 'var(--green)',
              color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 800,
              fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(45,106,79,0.3)', marginTop: '4px',
              transition: 'all 0.2s',
            }}>
            {loading ? '⏳ Please wait…' : mode === 'login' ? '🔑 Login to FarmWise' : '🌱 Create Account'}
          </button>
        </div>
      </div>

      {/* Demo hint */}
      <div style={{ marginTop: '20px', textAlign: 'center', fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)' }}>
        Demo account: <b>demo@farmwise.app</b> / <b>farmwise123</b>
      </div>
    </div>
  )
}
