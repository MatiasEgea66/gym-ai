import { useState } from 'react'
import { ChevronDown, Dumbbell, Trash2 } from 'lucide-react'
import { deleteSession, getHistory, getPlans, getStats, type Session } from '../lib/storage'
import { C } from '../lib/colors'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const str = d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' })
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function formatDuration(sec: number): string {
  return `${Math.floor(sec / 60)} min`
}

export default function HistorialScreen() {
  const [history, setHistory] = useState<Session[]>(() => getHistory())
  const [expanded, setExpanded] = useState<string | null>(null)
  const stats = getStats()
  const plans = getPlans()
  const showPlanBadge = plans.length > 1

  function planName(planId?: string): string {
    if (!planId) return 'Programa 1'
    return plans.find((p) => p.id === planId)?.name ?? 'Programa 1'
  }

  function handleDelete(id: string) {
    deleteSession(id)
    setHistory(getHistory())
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 32px', background: C.bg, minHeight: '100dvh' }}>
      <header style={{ paddingTop: '56px', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: '700', letterSpacing: '-0.8px', color: C.text, marginBottom: '4px' }}>Historial</h1>
        <p style={{ fontSize: '14px', color: C.muted }}>{stats.totalSessions} sesiones · {stats.thisWeek}/3 esta semana</p>
      </header>

      {history.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '60px 24px', textAlign: 'center', background: C.card, border: `1px dashed ${C.borderStrong}`, borderRadius: '20px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Dumbbell size={24} color={C.dim} />
          </div>
          <p style={{ fontSize: '14px', color: C.muted }}>Todavía no completaste ningún entrenamiento.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {history.map((session) => {
            const isOpen = expanded === session.id
            const totalSets = session.exercises.reduce((s, e) => s + e.sets.length, 0)
            const doneSets = session.exercises.reduce((s, e) => s + e.sets.filter((x) => x.done).length, 0)
            return (
              <div key={session.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '18px', overflow: 'hidden' }}>
                <button onClick={() => setExpanded(isOpen ? null : session.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', width: '100%', padding: '16px 18px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '15px', fontWeight: '600', color: C.text, letterSpacing: '-0.3px' }}>
                        {formatDate(session.dateISO)}
                      </p>
                      {showPlanBadge && (
                        <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 7px', background: C.accentSubtle, color: C.accent, borderRadius: '20px', letterSpacing: '0.1px', flexShrink: 0 }}>
                          {planName(session.planId)}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: C.muted, marginBottom: '2px' }}>{session.dayTitle}</p>
                    <p style={{ fontSize: '12px', color: C.dim }}>{formatDuration(session.durationSec)} · {doneSets}/{totalSets} series</p>
                  </div>
                  <ChevronDown size={18} color={C.dim} style={{ flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {isOpen && (
                  <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 18px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                      {session.exercises.map((ex) => (
                        <div key={ex.exerciseId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', color: C.muted }}>{ex.name}</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: C.text }}>
                            {ex.sets.filter((s) => s.done).length}/{ex.sets.length}
                            {ex.sets[0]?.weightKg ? ` · ${ex.sets[0].weightKg}kg` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => handleDelete(session.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: C.red, fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                      <Trash2 size={13} /> Eliminar registro
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
