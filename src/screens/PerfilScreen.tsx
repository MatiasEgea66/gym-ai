import { useState, useEffect } from 'react'
import { LogOut, Flame, Dumbbell, Clock, ChevronRight, Shield, ShieldCheck, Trophy } from 'lucide-react'
import { getStats, getHistory, getTotalVolume, getMaxWeightPerExercise, getTrainingStreak } from '../lib/storage'
import { C } from '../lib/colors'
import { supabase } from '../lib/supabase'
import { clearPasskey, hasPasskey, isPasskeySupported, registerPasskey, storeRefreshToken } from '../lib/webauthn'
import { uploadProgress } from '../lib/sync'

type Props = { onLogout: () => void }

export default function PerfilScreen({ onLogout }: Props) {
  const stats = getStats()
  const history = getHistory()
  const totalMin = history.reduce((s, h) => s + Math.floor(h.durationSec / 60), 0)
  const totalHours = Math.floor(totalMin / 60)
  const totalVolume = getTotalVolume()
  const prs = getMaxWeightPerExercise()
  const trainingStreak = getTrainingStreak()
  const [passkeyActive, setPasskeyActive] = useState(hasPasskey)
  const [passkeyLoading, setPasskeyLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email)
    })
  }, [])

  async function handleSync() {
    setSyncing(true)
    setSyncMsg('')
    const { data } = await supabase.auth.getUser()
    if (!data.user) { setSyncMsg('Necesitás una cuenta para sincronizar'); setSyncing(false); return }
    await uploadProgress(data.user.id)
    setSyncMsg('¡Progreso guardado en la nube!')
    setSyncing(false)
    setTimeout(() => setSyncMsg(''), 3000)
  }

  async function handleTogglePasskey() {
    if (passkeyActive) {
      clearPasskey()
      setPasskeyActive(false)
      return
    }
    setPasskeyLoading(true)
    const { data } = await supabase.auth.getUser()
    const user = data.user
    if (!user) { setPasskeyLoading(false); return }
    const ok = await registerPasskey(user.id, user.email ?? '')
    if (ok) {
      const { data: sd } = await supabase.auth.getSession()
      if (sd.session?.refresh_token) storeRefreshToken(sd.session.refresh_token)
      setPasskeyActive(true)
    }
    setPasskeyLoading(false)
  }

  async function handleLogout() {
    clearPasskey()
    await supabase.auth.signOut()
    onLogout()
  }

  const initials = email ? email[0].toUpperCase() : '?'
  const streak = stats.thisWeek
  const totalVolumeDisplay = totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : String(Math.round(totalVolume))

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', background: C.bg, minHeight: '100dvh', fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>

      {/* Hero */}
      <div style={{ padding: '64px 20px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,115,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '68px', height: '68px', borderRadius: '22px', background: C.gradientBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '26px', fontWeight: '700', color: '#fff', boxShadow: '0 8px 24px rgba(91,115,255,0.35)' }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '22px', fontWeight: '700', color: C.text, letterSpacing: '-0.5px', marginBottom: '3px' }}>Mi perfil</p>
            <p style={{ fontSize: '13px', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email || '…'}</p>
          </div>
          {streak > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,184,77,0.12)', border: '1px solid rgba(255,184,77,0.25)', borderRadius: '10px', padding: '6px 10px' }}>
              <Flame size={14} color="#FFB84D" fill="#FFB84D" />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#FFB84D' }}>{streak}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '0 20px 100px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { icon: Dumbbell, label: 'Sesiones', value: String(stats.totalSessions), color: '#5B73FF', bg: 'rgba(91,115,255,0.15)' },
            { icon: Flame, label: 'Esta semana', value: String(stats.thisWeek), color: '#FFB84D', bg: 'rgba(255,184,77,0.15)' },
            { icon: Clock, label: 'Horas totales', value: String(totalHours), color: '#00C896', bg: 'rgba(0,200,150,0.15)' },
            { icon: Trophy, label: 'Kg totales', value: totalVolumeDisplay, color: '#FF6B9D', bg: 'rgba(255,107,157,0.15)' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={19} color={color} />
              </div>
              <div>
                <p style={{ fontSize: '22px', fontWeight: '800', color: C.text, letterSpacing: '-0.8px', lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: '10px', fontWeight: '500', color: C.dim, marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Records personales */}
        {prs.length > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 18px 8px' }}>
              <Trophy size={13} color={C.accent} />
              <p style={{ fontSize: '11px', fontWeight: '600', color: C.dim, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Records personales</p>
            </div>
            {prs.map((pr, i) => (
              <div key={pr.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderTop: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: C.dim, fontWeight: '600', width: '16px', textAlign: 'right' }}>{i + 1}</span>
                  <span style={{ fontSize: '13px', color: C.text }}>{pr.name}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: C.accent }}>{pr.weightKg} kg</span>
              </div>
            ))}
          </div>
        )}

        {/* Racha semanal */}
        {trainingStreak > 0 && (
          <div style={{ background: 'rgba(255,107,157,0.08)', border: '1px solid rgba(255,107,157,0.2)', borderRadius: '16px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,107,157,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Flame size={20} color="#FF6B9D" fill="#FF6B9D" />
            </div>
            <div>
              <p style={{ fontSize: '18px', fontWeight: '800', color: '#FF6B9D', letterSpacing: '-0.5px', lineHeight: 1 }}>{trainingStreak} {trainingStreak === 1 ? 'semana' : 'semanas'} seguidas</p>
              <p style={{ fontSize: '12px', color: C.dim, marginTop: '2px' }}>Racha de entrenamiento activa</p>
            </div>
          </div>
        )}

        {/* Seguridad */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', color: C.dim, letterSpacing: '0.5px', textTransform: 'uppercase', padding: '16px 18px 8px' }}>Seguridad</p>

          {isPasskeySupported() && (
            <button
              onClick={handleTogglePasskey}
              disabled={passkeyLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '14px 18px', background: 'none', border: 'none', borderTop: `1px solid ${C.border}`, cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: passkeyActive ? 'rgba(91,115,255,0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {passkeyActive
                  ? <ShieldCheck size={18} color="#8B9FFF" />
                  : <Shield size={18} color={C.muted} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: passkeyActive ? '#8B9FFF' : C.text }}>
                  {passkeyLoading ? 'Activando…' : 'Face ID'}
                </p>
                <p style={{ fontSize: '12px', color: C.dim, marginTop: '1px' }}>
                  {passkeyActive ? 'Activado — toca para desactivar' : 'Toca para activar'}
                </p>
              </div>
              {/* Toggle */}
              <div style={{ width: '44px', height: '26px', borderRadius: '13px', background: passkeyActive ? '#5B73FF' : 'rgba(255,255,255,0.12)', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: '3px', left: passkeyActive ? '21px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
              </div>
            </button>
          )}
        </div>

        {/* Cuenta */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', color: C.dim, letterSpacing: '0.5px', textTransform: 'uppercase', padding: '16px 18px 8px' }}>Cuenta</p>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '14px 18px', background: 'none', border: 'none', borderTop: `1px solid ${C.border}`, cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,200,150,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>
              ☁️
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: C.text }}>{syncing ? 'Guardando…' : 'Guardar progreso en la nube'}</p>
              {syncMsg && <p style={{ fontSize: '12px', color: C.accent, marginTop: '2px' }}>{syncMsg}</p>}
            </div>
            <ChevronRight size={16} color={C.dim} />
          </button>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '14px 18px', background: 'none', border: 'none', borderTop: `1px solid ${C.border}`, cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,92,125,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LogOut size={17} color={C.red} />
            </div>
            <p style={{ flex: 1, fontSize: '14px', fontWeight: '600', color: C.red }}>Cerrar sesión</p>
            <ChevronRight size={16} color={C.dim} />
          </button>
        </div>

      </div>
    </div>
  )
}
