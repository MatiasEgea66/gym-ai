import { useEffect, useState } from 'react'
import { Play, Zap, Flame, Dumbbell } from 'lucide-react'
import { PLAN, type Day } from '../data/plan'
import {
  getStats, getActivePlan, customDayToDay,
  initPlanStartDateIfNeeded, shouldChangePlan, getPlanChangeWarning,
  getPlanChangeNotifiedDate, setPlanChangeNotifiedDate,
  getHistory, getTrainingStreak, getNextRecommendedDayIndex, getDaysSinceLastSession,
} from '../lib/storage'
import { C } from '../lib/colors'

type Props = { onOpenDay: (day: Day) => void; onStart: (day: Day) => void }

const DAY_EMOJIS = ['🦵', '💪', '🏋️', '🔥', '⚡', '🎯']

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function lastSessionLabel(days: number | null): string {
  if (days === null) return '¡Primer entrenamiento!'
  if (days === 0) return 'Entrenaste hoy ✓'
  if (days === 1) return 'Ayer'
  return `Hace ${days} días`
}

function fireSystemNotification() {
  if (!('Notification' in window)) return
  const today = new Date().toISOString().slice(0, 10)
  if (getPlanChangeNotifiedDate() === today) return
  const send = () => {
    new Notification('Forge 💪', { body: '¡Es momento de cambiar tu plan de entrenamiento!', icon: '/icon-192.png' })
    setPlanChangeNotifiedDate(today)
  }
  if (Notification.permission === 'granted') send()
  else if (Notification.permission === 'default') Notification.requestPermission().then(p => { if (p === 'granted') send() })
}

export default function InicioScreen({ onOpenDay, onStart }: Props) {
  const today = new Date()
  const stats = getStats()
  const activePlan = getActivePlan()
  const isCustom = !!activePlan.customDays
  const [showAlert, setShowAlert] = useState(false)
  const [warning, setWarning] = useState<{ sessionsLeft: number } | null>(null)

  const dateStr = today.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const dateCapitalized = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)

  const planDays: Day[] = isCustom
    ? (activePlan.customDays ?? []).map(customDayToDay)
    : PLAN

  const nextIdx = getNextRecommendedDayIndex(planDays.map(d => d.id))
  const nextDay = planDays[nextIdx]
  const daysSince = getDaysSinceLastSession()
  const streak = getTrainingStreak()

  // Weekly activity dots
  const history = getHistory()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - (today.getDay() + 6) % 7)
  startOfWeek.setHours(0, 0, 0, 0)
  const trainedDaysSet = new Set(
    history
      .filter(s => new Date(s.dateISO) >= startOfWeek)
      .map(s => (new Date(s.dateISO).getDay() + 6) % 7)
  )
  const weekLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const todayDotIndex = (today.getDay() + 6) % 7

  useEffect(() => {
    initPlanStartDateIfNeeded(activePlan.id)
    if (shouldChangePlan(activePlan.id, planDays.length)) {
      setShowAlert(true)
      fireSystemNotification()
    } else {
      const w = getPlanChangeWarning(activePlan.id, planDays.length)
      if (w) setWarning(w)
    }
  }, [activePlan.id])

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 32px', background: C.bg, minHeight: '100dvh' }}>

      {/* Header */}
      <header style={{ paddingTop: '56px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: C.dim, marginBottom: '2px' }}>{dateCapitalized}</p>
        <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.8px', color: C.text }}>{getGreeting()} 👋</h1>
      </header>

      {/* Alerts */}
      {showAlert && (
        <div style={{ background: 'rgba(255,184,77,0.10)', border: '1px solid rgba(255,184,77,0.30)', borderRadius: '16px', padding: '14px 16px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>🔄</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#FFB84D', marginBottom: '2px' }}>Tiempo de cambiar el plan</p>
            <p style={{ fontSize: '12px', color: C.muted, lineHeight: 1.4 }}>Completaste las semanas del programa. ¡Progresá!</p>
          </div>
          <button onClick={() => setShowAlert(false)} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}
      {warning && (
        <div style={{ background: 'rgba(91,115,255,0.10)', border: '1px solid rgba(91,115,255,0.30)', borderRadius: '16px', padding: '14px 16px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>⏳</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#8B9FFF', marginBottom: '2px' }}>Casi terminás el ciclo</p>
            <p style={{ fontSize: '12px', color: C.muted, lineHeight: 1.4 }}>
              {warning.sessionsLeft === 1 ? 'Queda 1 entrenamiento' : `Quedan ${warning.sessionsLeft} entrenamientos`} para terminar. Pensá en el próximo programa.
            </p>
          </div>
          <button onClick={() => setWarning(null)} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* Hero — next workout */}
      {nextDay && (
        <div style={{ background: C.gradient, borderRadius: '22px', padding: '22px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
          <p style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>PRÓXIMO ENTRENAMIENTO</p>
          <p style={{ fontSize: '22px', fontWeight: '800', color: '#fff', letterSpacing: '-0.6px', lineHeight: 1.1, marginBottom: '4px' }}>{nextDay.dayLabel}</p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '20px' }}>{nextDay.title}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', fontWeight: '500' }}>{lastSessionLabel(daysSince)}</span>
            <button
              onClick={() => onStart(nextDay)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
            >
              <Play size={14} fill="white" strokeWidth={0} /> Comenzar
            </button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[
          { icon: Zap, label: 'Esta semana', value: `${stats.thisWeek}/${planDays.length}`, grad: C.orange },
          { icon: Flame, label: 'Racha', value: `${streak} sem`, grad: 'linear-gradient(135deg,#FF6B9D,#C0392B)' },
          { icon: Dumbbell, label: 'Total', value: String(stats.totalSessions), grad: C.gradientBlue },
        ].map(({ icon: Icon, label, value, grad }) => (
          <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '14px 12px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <Icon size={15} color="#fff" />
            </div>
            <p style={{ fontSize: '18px', fontWeight: '800', color: C.text, letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '10px', color: C.dim, marginTop: '3px', fontWeight: '500' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Weekly activity dots */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '14px 16px', marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', color: C.dim, marginBottom: '12px' }}>Esta semana</p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {weekLabels.map((label, i) => {
            const trained = trainedDaysSet.has(i)
            const isToday = i === todayDotIndex
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: trained ? C.gradient : isToday ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: isToday && !trained ? `1.5px solid ${C.accent}` : trained ? 'none' : `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {trained && <span style={{ fontSize: '13px' }}>✓</span>}
                </div>
                <span style={{ fontSize: '10px', fontWeight: isToday ? '700' : '500', color: isToday ? C.accent : C.dim }}>{label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Plan days */}
      <p style={{ fontSize: '11px', fontWeight: '600', color: C.dim, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
        {isCustom ? activePlan.name : 'Todos los días'}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {planDays.map((day, i) => {
          const isNext = i === nextIdx
          const exerciseCount = day.blocks.reduce((s, b) => s + b.exercises.length, 0)
          return (
            <div key={day.id} style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onStart(day)}
                style={{ width: '48px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isNext ? C.gradient : 'rgba(255,255,255,0.06)', border: isNext ? 'none' : `1px solid ${C.border}`, borderRadius: '14px', cursor: 'pointer' }}
              >
                <Play size={15} fill={isNext ? 'white' : C.dim} strokeWidth={0} color={isNext ? 'white' : C.dim} />
              </button>
              <button onClick={() => onOpenDay(day)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 14px', background: isNext ? 'rgba(0,200,150,0.07)' : C.card, border: `1px solid ${isNext ? 'rgba(0,200,150,0.25)' : C.border}`, borderRadius: '14px', textAlign: 'left', cursor: 'pointer' }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{DAY_EMOJIS[i] ?? '🔥'}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: isNext ? C.accent : C.text, letterSpacing: '-0.2px' }}>{day.dayLabel}</p>
                  <p style={{ fontSize: '12px', color: C.dim, marginTop: '1px' }}>{day.title}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '12px', color: C.dim }}>{exerciseCount} ejerc.</p>
                  <p style={{ fontSize: '11px', color: C.dim }}>{day.blocks.length} bloques</p>
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
