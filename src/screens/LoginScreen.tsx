import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  hasPasskey, isPasskeySupported, registerPasskey,
  authenticateWithPasskey, storeRefreshToken, getStoredRefreshToken, clearPasskey,
} from '../lib/webauthn'

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false)
  const [pendingUser, setPendingUser] = useState<{ id: string; email: string; refresh: string } | null>(null)
  const [canPasskey, setCanPasskey] = useState(false)

  useEffect(() => {
    setCanPasskey(hasPasskey() && isPasskeySupported())
  }, [])

  async function handleFaceId() {
    setLoading(true)
    setError('')
    try {
      const ok = await authenticateWithPasskey()
      if (!ok) { setError('Face ID no reconocido'); return }
      const refresh = getStoredRefreshToken()
      if (!refresh) { setError('Sesión expirada, iniciá sesión con contraseña'); clearPasskey(); setCanPasskey(false); return }
      const { error: err } = await supabase.auth.refreshSession({ refresh_token: refresh })
      if (err) { setError('Sesión expirada, iniciá sesión con contraseña'); clearPasskey(); setCanPasskey(false); return }
      onLogin()
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({ email, password })
        if (err) { setError(err.message); return }
        setError('Revisá tu email para confirmar la cuenta')
        return
      }
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError(err.message); return }
      const session = data.session
      if (!session) { setError('No se pudo iniciar sesión'); return }
      if (isPasskeySupported() && !hasPasskey()) {
        setPendingUser({ id: data.user.id, email: data.user.email ?? email, refresh: session.refresh_token })
        setShowPasskeyPrompt(true)
      } else {
        if (session.refresh_token) storeRefreshToken(session.refresh_token)
        onLogin()
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleRegisterPasskey() {
    if (!pendingUser) return
    setLoading(true)
    const ok = await registerPasskey(pendingUser.id, pendingUser.email)
    if (ok) storeRefreshToken(pendingUser.refresh)
    setLoading(false)
    onLogin()
  }

  if (showPasskeyPrompt) {
    return (
      <div style={{ minHeight: '100dvh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', fontSize: '36px' }}>
          🔐
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', letterSpacing: '-0.5px', marginBottom: '10px', textAlign: 'center' }}>Activar Face ID</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', textAlign: 'center', lineHeight: 1.5, marginBottom: '36px', maxWidth: '300px' }}>
          La próxima vez que abras la app podés entrar directo con Face ID, sin escribir tu contraseña.
        </p>
        <button
          onClick={handleRegisterPasskey}
          disabled={loading}
          style={{ width: '100%', maxWidth: '360px', padding: '16px', background: GRADIENT, border: 'none', borderRadius: '16px', color: '#fff', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Registrando…' : 'Activar Face ID'}
        </button>
        <button
          onClick={onLogin}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '14px', cursor: 'pointer' }}
        >
          Ahora no
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: BG, display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '88px', paddingBottom: '52px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '22px', background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 20px 60px rgba(91,115,255,0.35)' }}>
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px', maxWidth: '420px', width: '100%', margin: '0 auto' }}>
        {canPasskey && (
          <>
            <button
              onClick={handleFaceId}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '16px', background: GRADIENT, border: 'none', borderRadius: '16px', color: '#fff', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '16px', boxShadow: '0 10px 30px rgba(91,115,255,0.3)', opacity: loading ? 0.7 : 1 }}
            >
              <span style={{ fontSize: '20px' }}>🔐</span>
              {loading ? 'Verificando…' : 'Entrar con Face ID'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 20px' }}>
              <div style={{ flex: 1, height: '1px', background: BORDER }} />
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', fontWeight: '500' }}>o usá tu contraseña</span>
              <div style={{ flex: 1, height: '1px', background: BORDER }} />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: CARD, borderRadius: '18px', border: `1px solid ${BORDER}`, overflow: 'hidden', marginBottom: '12px' }}>
            <input
              type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              autoComplete="email" required
              style={{ display: 'block', width: '100%', padding: '16px 18px', background: 'transparent', border: 'none', borderBottom: `1px solid ${BORDER}`, color: '#fff', fontSize: '15px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <input
              type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required
              style={{ display: 'block', width: '100%', padding: '16px 18px', background: 'transparent', border: 'none', color: '#fff', fontSize: '15px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: error.includes('Revisá') ? '#4ADE80' : '#FF6B6B', marginBottom: '12px', textAlign: 'center' }}>{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            style={{ display: 'block', width: '100%', padding: '16px', background: canPasskey ? CARD : GRADIENT, border: canPasskey ? `1px solid ${BORDER}` : 'none', borderRadius: '16px', color: '#fff', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '16px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>

          <button
            type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.38)', fontSize: '14px', cursor: 'pointer', textAlign: 'center' }}
          >
            {mode === 'login' ? '¿Eres nuevo? ' : '¿Ya tienes cuenta? '}
            <span style={{ color: ACCENT, fontWeight: '600' }}>{mode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}</span>
          </button>
        </form>
      </div>
      <div style={{ height: 'calc(40px + env(safe-area-inset-bottom, 0px))' }} />
    </div>
  )
}
