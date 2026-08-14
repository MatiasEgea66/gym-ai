import { Play, Calendar, Zap, ChevronRight } from 'lucide-react'
import { PLAN, getDayByWeekday, type Day } from '../data/plan'
import { getStats, getActivePlan, customDayToDay } from '../lib/storage'

type Props = { onOpenDay: (day: Day) => void; onStart: (day: Day) => void }

const C = { bg: '#0C0E1A', card: '#1B2038', border: 'rgba(255,255,255,0.07)', accent: '#5B73FF', gradient: 'linear-gradient(135deg, #5B73FF, #8B5CF6)', text: '#fff', muted: 'rgba(255,255,255,0.55)', dim: 'rgba(255,255,255,0.28)' }

const OTHER_DAY_MESSAGES: Record<number, string> = {
  0: 'Día de descanso. Mañana arranca la semana.',
  2: 'Hoy toca fútbol. Las piernas descansan del gym.',
  4: 'Hoy toca fútbol. Mañana es día de tirón.',
  6: 'Hoy es el partido. Suerte — nada de gym hoy.',
}

export default function InicioScreen({ onOpenDay, onStart }: Props) {
  const today = new Date()
  const weekday = today.getDay()
  const stats = getStats()
  const activePlan = getActivePlan()
  const isCustom = !!activePlan.customDays

  const todayBuiltIn = !isCustom ? getDayByWeekday(weekday) : undefined
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

      {/* Today card */}
      {!isCustom && todayBuiltIn ? (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: C.gradient }} />
          <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.6px', textTransform: 'uppercase', color: C.accent, marginBottom: '6px' }}>Entrenamiento de hoy</p>
          <h2 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px', color: C.text, marginBottom: '4px' }}>{todayBuiltIn.dayLabel}</h2>
          <p style={{ fontSize: '14px', color: C.muted, marginBottom: '20px' }}>{todayBuiltIn.title}</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => onStart(todayBuiltIn)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', background: C.gradient, border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
              <Play size={16} fill="white" strokeWidth={0} /> Comenzar
            </button>
            <button onClick={() => onOpenDay(todayBuiltIn)} style={{ padding: '13px 18px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: '12px', color: C.muted, fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
              Ver
            </button>
          </div>
        </div>
      ) : !isCustom ? (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.6px', textTransform: 'uppercase', color: C.dim, marginBottom: '8px' }}>Hoy</p>
          <p style={{ fontSize: '16px', fontWeight: '600', color: C.muted }}>{OTHER_DAY_MESSAGES[weekday]}</p>
        </div>
      ) : (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: C.gradient }} />
          <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.6px', textTransform: 'uppercase', color: C.accent, marginBottom: '8px' }}>Plan activo</p>
          <p style={{ fontSize: '18px', fontWeight: '700', color: C.text, marginBottom: '4px' }}>{activePlan.name}</p>
          <p style={{ fontSize: '13px', color: C.muted }}>Elegí el workout de hoy ↓</p>
        </div>
      )}

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
        {isCustom ? activePlan.name : 'Esta semana'}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {planDays.map((day) => {
          const isToday = !isCustom && day.id === todayBuiltIn?.id
          return (
            <button key={day.id} onClick={() => onOpenDay(day)} style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '14px 16px', background: isToday ? 'rgba(91,115,255,0.1)' : C.card, border: `1px solid ${isToday ? 'rgba(91,115,255,0.3)' : C.border}`, borderRadius: '14px', textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isToday ? 'rgba(91,115,255,0.18)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '16px' }}>
                {['🦵', '💪', '🏋️'][PLAN.indexOf(day as typeof PLAN[0])] ?? '🔥'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: isToday ? C.text : C.muted, letterSpacing: '-0.2px' }}>{day.dayLabel}</p>
                <p style={{ fontSize: '12px', color: C.dim, marginTop: '1px' }}>{day.title}</p>
              </div>
              <ChevronRight size={16} color={C.dim} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
