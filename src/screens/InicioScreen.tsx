import { Play, Calendar, Zap, ChevronRight } from 'lucide-react'
import { PLAN, type Day } from '../data/plan'
import { getStats, getActivePlan, customDayToDay } from '../lib/storage'

type Props = { onOpenDay: (day: Day) => void; onStart: (day: Day) => void }

const C = { bg: '#0C0E1A', card: '#1B2038', border: 'rgba(255,255,255,0.07)', accent: '#5B73FF', gradient: 'linear-gradient(135deg, #5B73FF, #8B5CF6)', text: '#fff', muted: 'rgba(255,255,255,0.55)', dim: 'rgba(255,255,255,0.28)' }

const DAY_EMOJIS = ['🦵', '💪', '🏋️']

export default function InicioScreen({ onOpenDay, onStart }: Props) {
  const today = new Date()
  const stats = getStats()
  const activePlan = getActivePlan()
  const isCustom = !!activePlan.customDays

  const dateStr = today.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const dateCapitalized = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)

  const planDays: Day[] = isCustom
    ? (activePlan.customDays ?? []).map(customDayToDay)
    : PLAN

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 32px' }}>
      <header style={{ paddingTop: '56px', marginBottom: '28px' }}>
        <p style={{ fontSize: '13px', color: C.dim, marginBottom: '4px' }}>{dateCapitalized}</p>
        <h1 style={{ fontSize: '30px', fontWeight: '700', letterSpacing: '-0.8px', color: C.text }}>Hola 👋</h1>
      </header>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '28px' }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '18px 16px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #FFB84D, #FF8C00)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Zap size={18} fill="white" stroke="none" color="white" />
          </div>
          <p style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-0.8px', color: C.text, lineHeight: 1 }}>
            {stats.thisWeek}<span style={{ fontSize: '16px', color: C.dim, fontWeight: '500' }}>/{planDays.length}</span>
          </p>
          <p style={{ fontSize: '12px', color: C.dim, marginTop: '4px' }}>esta semana</p>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '18px 16px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: C.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Calendar size={18} color="white" />
          </div>
          <p style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-0.8px', color: C.text, lineHeight: 1 }}>{stats.totalSessions}</p>
          <p style={{ fontSize: '12px', color: C.dim, marginTop: '4px' }}>sesiones totales</p>
        </div>
      </div>

      {/* Plan days */}
      <p style={{ fontSize: '11px', fontWeight: '600', color: C.dim, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
        {isCustom ? activePlan.name : 'Tu plan'}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {planDays.map((day, i) => (
          <div key={day.id} style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onStart(day)}
              style={{ width: '52px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.gradient, border: 'none', borderRadius: '14px', cursor: 'pointer' }}
            >
              <Play size={16} fill="white" strokeWidth={0} color="white" />
            </button>
            <button onClick={() => onOpenDay(day)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '16px' }}>
                {DAY_EMOJIS[i] ?? '🔥'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: C.text, letterSpacing: '-0.2px' }}>{day.dayLabel}</p>
                <p style={{ fontSize: '12px', color: C.dim, marginTop: '1px' }}>{day.title}</p>
              </div>
              <ChevronRight size={16} color={C.dim} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
