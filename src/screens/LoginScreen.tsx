import { useState } from 'react'

interface Props { onLogin: () => void }

const BG = '#0C0E1A'
const CARD = '#1B2038'
const BORDER = 'rgba(255,255,255,0.07)'
const ACCENT = '#5B73FF'
const GRADIENT = 'linear-gradient(135deg, #5B73FF, #8B5CF6)'

export default function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem('gymai:loggedIn', '1')
    onLogin()
  }

  return (
    <div style={{ minHeight: '100dvh', background: BG, display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '88px', paddingBottom: '52px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '22px', background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 20px 60px rgba(91,115,255,0.35)' }}>
          {/* Dumbbell icon */}
          <svg viewBox="0 0 100 100" width="48" height="48">
            <rect x="8" y="35" width="14" height="30" rx="4" fill="white" opacity="0.95"/>
            <rect x="22" y="40" width="8" height="20" rx="3" fill="white" opacity="0.85"/>
            <rect x="30" y="46" width="40" height="8" rx="4" fill="white" opacity="0.95"/>
            <rect x="70" y="40" width="8" height="20" rx="3" fill="white" opacity="0.85"/>
            <rect x="78" y="35" width="14" height="30" rx="4" fill="white" opacity="0.95"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '34px', fontWeight: '700', color: '#fff', letterSpacing: '-0.8px', marginBottom: '6px' }}>Forge</h1>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '15px' }}>Tu entrenamiento, tu camino</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px', maxWidth: '420px', width: '100%', margin: '0 auto' }}>
        <div style={{ background: CARD, borderRadius: '18px', border: `1px solid ${BORDER}`, overflow: 'hidden', marginBottom: '12px' }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
            style={{ display: 'block', width: '100%', padding: '16px 18px', background: 'transparent', border: 'none', borderBottom: `1px solid ${BORDER}`, color: '#fff', fontSize: '15px', outline: 'none', fontFamily: 'inherit' }} />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            style={{ display: 'block', width: '100%', padding: '16px 18px', background: 'transparent', border: 'none', color: '#fff', fontSize: '15px', outline: 'none', fontFamily: 'inherit' }} />
        </div>

        {mode === 'login' && (
          <button type="button" style={{ background: 'none', border: 'none', color: ACCENT, fontSize: '13px', fontWeight: '500', cursor: 'pointer', textAlign: 'right', marginBottom: '20px' }}>
            ¿Olvidaste tu contraseña?
          </button>
        )}

        <button type="submit" style={{ display: 'block', width: '100%', padding: '16px', background: GRADIENT, border: 'none', borderRadius: '16px', color: '#fff', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '16px', boxShadow: '0 10px 30px rgba(91,115,255,0.3)' }}>
          {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 16px' }}>
          <div style={{ flex: 1, height: '1px', background: BORDER }} />
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', fontWeight: '500' }}>O</span>
          <div style={{ flex: 1, height: '1px', background: BORDER }} />
        </div>

        <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.38)', fontSize: '14px', cursor: 'pointer', textAlign: 'center', width: '100%' }}>
          {mode === 'login' ? '¿Eres nuevo? ' : '¿Ya tienes cuenta? '}
          <span style={{ color: ACCENT, fontWeight: '600' }}>{mode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}</span>
        </button>
      </form>
      <div style={{ height: 'calc(40px + env(safe-area-inset-bottom, 0px))' }} />
    </div>
  )
}
