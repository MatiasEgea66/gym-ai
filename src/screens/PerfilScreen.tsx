import { useState } from 'react'
import { LogOut, Dumbbell, BarChart2, Calendar } from 'lucide-react'
import { getStats, getHistory, getPlanChangeWeeks, setPlanChangeWeeks } from '../lib/storage'
import { C } from '../lib/colors'
import { supabase } from '../lib/supabase'
import { clearPasskey, hasPasskey, isPasskeySupported, registerPasskey } from '../lib/webauthn'

type Props = { onLogout: () => void }

export default function PerfilScreen({ onLogout }: Props) {
  const stats = getStats()
  const history = getHistory()
  const totalMin = history.reduce((s, h) => s + Math.floor(h.durationSec / 60), 0)
  const [weeks, setWeeks] = useState(getPlanChangeWeeks)
  const [passkeyActive, setPasskeyActive] = useState(hasPasskey)
  const [passkeyLoading, setPasskeyLoading] = useState(false)

  function handleWeeksChange(w: number) {
    setPlanChangeWeeks(w)
    setWeeks(w)
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
      if (sd.session?.refresh_token) {
        const { storeRefreshToken } = await import('../lib/webauthn')
        storeRefreshToken(sd.session.refresh_token)
      }
      setPasskeyActive(true)
    }
    setPasskeyLoading(false)
  }

  async function handleLogout() {
    clearPasskey()
    await supabase.auth.signOut()
    onLogout()
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 32px', background: C.bg, minHeight: '100dvh' }}>
      <header style={{ paddingTop: '56px', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: '700', letterSpacing: '-0.8px', color: C.text, marginBottom: '4px' }}>Perfil</h1>
        <p style={{ fontSize: '14px', color: C.muted }}>Tu actividad y configuración</p>
      </header>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: C.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Dumbbell size={28} color="#fff" />
        </div>
        <div>
          <p style={{ fontSize: '18px', fontWeight: '700', color: C.text, letterSpacing: '-0.4px' }}>Atleta</p>
          <p style={{ fontSize: '13px', color: C.muted, marginTop: '2px' }}>Miembro de Forge</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        {[
          { icon: BarChart2, label: 'Sesiones', value: stats.totalSessions },
          { icon: Calendar, label: 'Esta semana', value: stats.thisWeek },
          { icon: Dumbbell, label: 'Minutos', value: totalMin },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '16px 12px', textAlign: 'center' }}>
            <Icon size={18} color={C.accent} style={{ marginBottom: '6px' }} />
            <p style={{ fontSize: '20px', fontWeight: '700', color: C.text, letterSpacing: '-0.5px' }}>{value}</p>
            <p style={{ fontSize: '10px', fontWeight: '500', color: C.dim, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Plan change setting */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', marginBottom: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: '600', color: C.dim, letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: '10px' }}>Cambio de plan</p>
        <p style={{ fontSize: '13px', color: C.muted, marginBottom: '10px' }}>Avisarme después de completar</p>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[2, 4, 6, 8, 12].map(w => (
            <button key={w} onClick={() => handleWeeksChange(w)} style={{ flex: 1, padding: '9px 4px', background: weeks === w ? C.accentSubtle : 'rgba(255,255,255,0.04)', border: `1px solid ${weeks === w ? 'rgba(0,200,150,0.3)' : C.border}`, borderRadius: '10px', color: weeks === w ? C.accent : C.muted, fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              {w}s
            </button>
          ))}
        </div>
      </div>

      {/* Face ID */}
      {isPasskeySupported() && (
        <button
          onClick={handleTogglePasskey}
          disabled={passkeyLoading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '15px', background: passkeyActive ? 'rgba(91,115,255,0.10)' : C.card, border: `1px solid ${passkeyActive ? 'rgba(91,115,255,0.30)' : C.border}`, borderRadius: '14px', color: passkeyActive ? '#8B9FFF' : C.muted, fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '10px' }}
        >
          <span style={{ fontSize: '18px' }}>🔐</span>
          {passkeyLoading ? 'Activando…' : passkeyActive ? 'Face ID activado — toca para desactivar' : 'Activar Face ID'}
        </button>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '15px', background: C.redSubtle, border: `1px solid rgba(255,92,125,0.2)`, borderRadius: '14px', color: C.red, fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
      >
        <LogOut size={17} />
        Cerrar sesión
      </button>
    </div>
  )
}
