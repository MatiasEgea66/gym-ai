import { useEffect, useState } from 'react'
import { Play, Calendar, Zap, ChevronRight } from 'lucide-react'
import { PLAN, type Day } from '../data/plan'
import { getStats, getActivePlan, customDayToDay, initPlanStartDateIfNeeded, shouldChangePlan, shouldWarnPlanChange, getPlanChangeNotifiedDate, setPlanChangeNotifiedDate } from '../lib/storage'

type Props = { onOpenDay: (day: Day) => void; onStart: (day: Day) => void }

const C = { bg: '#0C0E1A', card: '#1B2038', border: 'rgba(255,255,255,0.07)', accent: '#5B73FF', gradient: 'linear-gradient(135deg, #5B73FF, #8B5CF6)', text: '#fff', muted: 'rgba(255,255,255,0.55)', dim: 'rgba(255,255,255,0.28)' }

const DAY_EMOJIS = ['🦵', '💪', '🏋️']

function fireSystemNotification() {
  if (!('Notification' in window)) return
  const today = new Date().toISOString().slice(0, 10)
  if (getPlanChangeNotifiedDate() === today) return
  const send = () => {
    new Notification('Forge 💪', {
      body: '¡Es momento de cambiar tu plan de entrenamiento!',
      icon: '/icon-192.png',
    })
    setPlanChangeNotifiedDate(today)
  }
  if (Notification.permission === 'granted') {
    send()
  } else if (Notification.permission === 'default') {
    Notification.requestPermission().then(p => { if (p === 'granted') send() })
  }
}

export default function InicioScreen({ onOpenDay, onStart }: Props) {
  const today = new Date()
  const stats = getStats()
  const activePlan = getActivePlan()
  const isCustom = !!activePlan.customDays
  const [showAlert, setShowAlert] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  const dateStr = today.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const dateCapitalized = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)

  const planDays: Day[] = isCustom
    ? (activePlan.customDays ?? []).map(customDayToDay)
    : PLAN

  useEffect(() => {
    initPlanStartDateIfNeeded(activePlan.id)
    if (shouldChangePlan(activePlan.id, planDays.length)) {
      setShowAlert(true)
      fireSystemNotification()
    } else if (shouldWarnPlanChange(activePlan.id, planDays.length)) {
      setShowWarning(true)
    }
  }, [activePlan.id])

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 32px' }}>
      <header style={{ paddingTop: '56px', marginBottom: '28px' }}>
        <p style={{ fontSize: '13px', color: C.dim, marginBottom: '4px' }}>{dateCapitalized}</p>
        <h1 style={{ fontSize: '30px', fontWeight: '700', letterSpacing: '-0.8px', color: C.text }}>Hola 👋</h1>
      </header>

      {showAlert && (
        <div style={{ background: 'rgba(255,184,77,0.10)', border: '1px solid rgba(255,184,77,0.30)', borderRadius: '16px', padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ fontSize: '22px', lineHeight: 1, marginTop: '1px' }}>🔄</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#FFB84D', marginBottom: '3px' }}>Tiempo de cambiar el plan</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>Completaste las semanas de tu programa. ¡Es hora de progresar!</p>
          </div>
          <button onClick={() => setShowAlert(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.30)', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '0', marginTop: '-2px' }}>×</button>
        </div>
      )}

      {showWarning && (
        <div style={{ background: 'rgba(91,115,255,0.10)', border: '1px solid rgba(91,115,255,0.30)', borderRadius: '16px', padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ fontSize: '22px', lineHeight: 1, marginTop: '1px' }}>⏳</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#8B9FFF', marginBottom: '3px' }}>Pronto vas a necesitar cambiar el plan</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>Te quedan menos de una semana o 2 entrenamientos. Pensá en el próximo programa.</p>
          </div>
          <button onClick={() => setShowWarning(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.30)', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '0', marginTop: '-2px' }}>×</button>
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
