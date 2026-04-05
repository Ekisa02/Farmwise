import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

const TIMEOUT_MS = 60_000

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode,    setMode]   = useState('login')
  const [form,    setForm]   = useState({ name: '', email: '', password: '', farm: '' })
  const [showPwd, setShowPwd]= useState(false)
  const [error,   setError]  = useState('')
  const [loading, setLoading]= useState(false)
  const timerRef = useRef(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleSubmit = async () => {
    if (!form.email || !form.password) return
    setError(''); setLoading(true)

    timerRef.current = setTimeout(() => {
      setLoading(false)
      setError('The server is taking too long to respond. Please check your internet connection and try again.')
    }, TIMEOUT_MS)

    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        if (!form.name.trim()) {
          clearTimeout(timerRef.current)
          setError('Full name is required')
          setLoading(false); return
        }
        await register(form.name, form.email, form.password, form.farm)
      }
      clearTimeout(timerRef.current)
    } catch (err) {
      clearTimeout(timerRef.current)
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const isDesktop = window.innerWidth >= 768

  // ── INPUT STYLE HELPERS ───────────────────────────────────
  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '11px',
    border: '2px solid var(--green-pale)', fontFamily: 'Nunito, sans-serif',
    fontSize: '14px', color: 'var(--text)', outline: 'none',
    background: 'white', transition: 'border 0.15s', boxSizing: 'border-box',
  }
  const labelStyle = {
    fontFamily: 'Nunito, sans-serif', fontWeight: 700,
    fontSize: '11px', color: 'var(--text-muted)',
    display: 'block', marginBottom: '5px', letterSpacing: '0.5px',
  }
  const focus = e => e.target.style.border = '2px solid var(--green)'
  const blur  = e => e.target.style.border = '2px solid var(--green-pale)'

  const formFields = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Tab switcher */}
      <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '11px', padding: '3px', marginBottom: '4px' }}>
        {['login', 'register'].map(m => (
          <button key={m} onClick={() => { setMode(m); setError('') }} style={{
            flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
            background: mode === m ? 'var(--green)' : 'transparent',
            color: mode === m ? 'white' : 'var(--text-muted)',
            fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '13px',
            cursor: 'pointer', transition: 'all 0.18s',
          }}>
            {m === 'login' ? '🔑 Sign In' : '✨ Register'}
          </button>
        ))}
      </div>

      {/* Name — register only */}
      {mode === 'register' && (
        <div>
          <label style={labelStyle}>FULL NAME</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="e.g. Joseph Ekisa" style={inputStyle}
            onFocus={focus} onBlur={blur} autoComplete="name" />
        </div>
      )}

      {/* Email */}
      <div>
        <label style={labelStyle}>EMAIL ADDRESS</label>
        <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
          placeholder="you@email.com" style={inputStyle}
          onFocus={focus} onBlur={blur} autoComplete="email" />
      </div>

      {/* Password with eye toggle */}
      <div>
        <label style={labelStyle}>PASSWORD</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPwd ? 'text' : 'password'}
            value={form.password}
            onChange={e => set('password', e.target.value)}
            placeholder={mode === 'login' ? 'Your password' : 'Min 6 characters'}
            style={{ ...inputStyle, paddingRight: '44px' }}
            onFocus={focus} onBlur={blur}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          <button
            type="button"
            onClick={() => setShowPwd(p => !p)}
            aria-label={showPwd ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute', right: '10px', top: '50%',
              transform: 'translateY(-50%)', background: 'none',
              border: 'none', cursor: 'pointer', padding: '4px',
              color: showPwd ? 'var(--green)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center',
              transition: 'color 0.15s',
            }}
          >
            {showPwd ? (
              /* eye-off */
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              /* eye */
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Farm name — register only */}
      {mode === 'register' && (
        <div>
          <label style={labelStyle}>FARM NAME <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label>
          <input value={form.farm} onChange={e => set('farm', e.target.value)}
            placeholder="e.g. Green Valley Farm" style={inputStyle}
            onFocus={focus} onBlur={blur} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: '#FFEBEE', border: '2px solid var(--red)', borderRadius: '10px',
          padding: '10px 12px', fontFamily: 'Nunito, sans-serif', fontSize: '12px',
          color: 'var(--red)', fontWeight: 700, display: 'flex', alignItems: 'flex-start', gap: '6px',
          animation: 'fadeIn 0.2s ease',
        }}>
          <span style={{ flexShrink: 0 }}>⚠️</span> {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !form.email || !form.password}
        style={{
          padding: '13px', borderRadius: '12px', border: 'none', marginTop: '2px',
          background: loading || !form.email || !form.password
            ? '#D1D5DB'
            : 'linear-gradient(135deg, var(--green), var(--green-light))',
          color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 800,
          fontSize: '14px',
          cursor: loading || !form.email || !form.password ? 'not-allowed' : 'pointer',
          boxShadow: !loading && form.email && form.password
            ? '0 4px 14px rgba(45,106,79,0.35)' : 'none',
          transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        {loading ? (
          <>
            <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
            {mode === 'login' ? 'Signing in…' : 'Creating account…'}
          </>
        ) : mode === 'login' ? '🔑 Sign In' : '🌱 Create Account'}
      </button>
    </div>
  )

  // ── MOBILE ────────────────────────────────────────────────
  if (!isDesktop) return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '54px', marginBottom: '6px' }}>🐄</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '28px', color: 'var(--green)' }}>FarmWise</div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          AI Farm Assistant for Kenyan Farmers
        </div>
      </div>
      <div style={{ width: '100%', maxWidth: '390px', background: 'white', borderRadius: '22px', padding: '24px 20px', boxShadow: '0 8px 32px rgba(45,106,79,0.13)' }}>
        {formFields}
      </div>
    </div>
  )

  // ── DESKTOP two-column ────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f2d1e 0%, #1a3d2e 50%, #2D6A4F 100%)', padding: '40px 20px' }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: '960px', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.4)', minHeight: '560px' }}>

        {/* Left — branding panel */}
        <div style={{ flex: 1, background: 'linear-gradient(160deg, #2D6A4F 0%, #1a3d2e 100%)', padding: '52px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)', top: '-80px', right: '-80px' }} />
          <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', bottom: '40px', left: '-60px' }} />

          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🐄</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '38px', color: 'white', lineHeight: 1.1, marginBottom: '14px' }}>
              FarmWise
            </div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: '280px' }}>
              AI-powered farm assistant for Kenyan dairy farmers. Manage your herd smarter, healthier and more profitably.
            </div>
          </div>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { icon: '📸', text: 'AI Health Scanning — point, snap, get a vet report' },
              { icon: '🌿', text: 'Smart Feeding Advice — local feeds, best results' },
              { icon: '🥛', text: 'Milk Diary & Drop Alerts — never miss a change' },
              { icon: '📈', text: 'Progress Tracking — spot your star cow' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(82,183,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0 }}>{f.icon}</div>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.4 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form panel */}
        <div style={{ width: '420px', background: 'white', padding: '52px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '26px', color: 'var(--green)', marginBottom: '6px' }}>
            {mode === 'login' ? 'Welcome back 👋' : 'Join FarmWise 🌱'}
          </div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '26px' }}>
            {mode === 'login' ? 'Sign in to manage your herd' : 'Create your free account today'}
          </div>
          {formFields}
        </div>
      </div>
    </div>
  )
}
