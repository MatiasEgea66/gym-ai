import { useState } from 'react'
import { ChevronDown, Dumbbell, Trash2, TrendingUp } from 'lucide-react'
import { deleteSession, getHistory, getPlans, getStats, getWeeklySessionCounts, sessionVolume, type Session } from '../lib/storage'
import { C } from '../lib/colors'

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  if (m < 60) return `${m} min`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

function formatVolume(kg: number): string {
  if (kg === 0) return ''
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k kg`
  return `${kg} kg`
}

function getWeekLabel(isoDate: string, index: number): string {
  if (index === 0) return 'Esta semana'
  if (index === 1) return 'Semana pasada'
  const d = new Date(isoDate)
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

function groupByWeek(sessions: Session[]): { weekKey: string; weekStartISO: string; sessions: Session[] }[] {
  const map = new Map<string, { weekStartISO: string; sessions: Session[] }>()
  for (const s of sessions) {
    const d = new Date(s.dateISO)
    const day = (d.getDay() + 6) % 7
    d.setDate(d.getDate() - day)
    d.setHours(0, 0, 0, 0)
    const key = d.toISOString().slice(0, 10)
    if (!map.has(key)) map.set(key, { weekStartISO: d.toISOString(), sessions: [] })
    map.get(key)!.sessions.push(s)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([weekKey, v]) => ({ weekKey, ...v }))
}

const WEEKS = 8

export default function HistorialScreen() {
  const [history, setHistory] = useState<Session[]>(() => getHistory())
  const [expanded, setExpanded] = useState<string | null>(null)
  const stats = getStats()
  const plans = getPlans()
  const showPlanBadge = plans.length > 1
  const weeklyCounts = getWeeklySessionCounts(WEEKS)
  const maxCount = Math.max(...weeklyCounts, 1)
  const groups = groupByWeek(history)

  function planName(planId?: string): string {
    if (!planId) return 'Programa 1'
    return plans.find(p => p.id === planId)?.name ?? 'Programa 1'
  }

  function handleDelete(id: string) {
    deleteSession(id)
    setHistory(getHistory())
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 32px', background: C.bg, minHeight: '100dvh' }}>
      <header style={{ paddingTop: '56px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: '700', letterSpacing: '-0.8px', color: C.text, marginBottom: '4px' }}>Historial</h1>
        <p style={{ fontSize: '14px', color: C.muted }}>{stats.totalSessions} sesiones · {stats.thisWeek} esta semana</p>
      </header>

      {/* Weekly bar chart */}
      {history.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '18px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <TrendingUp size={15} color={C.accent} />
            <p style={{ fontSize: '13px', fontWeight: '600', color: C.text }}>Últimas 8 semanas</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '64px' }}>
            {weeklyCounts.map((count, i) => {
              const isCurrentWeek = i === WEEKS - 1
              const heightPct = count > 0 ? Math.max(0.15, count / maxCount) : 0
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: '4px' }}>
                  <div style={{
                    width: '100%', borderRadius: '5px',
                    height: count > 0 ? `${heightPct * 52}px` : '3px',
                    background: isCurrentWeek ? C.gradient : count > 0 ? 'rgba(0,200,150,0.35)' : 'rgba(255,255,255,0.06)',
                    transition: 'height 0.3s ease',
                    minHeight: '3px',
                  }} />
                  {count > 0 && (
                    <span style={{ fontSize: '9px', fontWeight: '600', color: isCurrentWeek ? C.accent : C.dim }}>{count}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Sessions */}
      {history.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '60px 24px', textAlign: 'center', background: C.card, border: `1px dashed ${C.borderStrong}`, borderRadius: '20px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Dumbbell size={24} color={C.dim} />
          </div>
          <p style={{ fontSize: '15px', fontWeight: '600', color: C.text }}>Sin entrenamientos</p>
          <p style={{ fontSize: '13px', color: C.muted }}>Completá tu primer sesión para ver el historial aquí.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {groups.map((group, gi) => (
            <div key={group.weekKey}>
              <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: gi === 0 ? C.accent : C.dim, marginBottom: '8px' }}>
                {getWeekLabel(group.weekStartISO, gi)}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {group.sessions.map(session => {
                  const isOpen = expanded === session.id
                  const totalSets = session.exercises.reduce((s, e) => s + e.sets.length, 0)
                  const doneSets = session.exercises.reduce((s, e) => s + e.sets.filter(x => x.done).length, 0)
                  const vol = sessionVolume(session)
                  return (
                    <div key={session.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '18px', overflow: 'hidden' }}>
                      <button onClick={() => setExpanded(isOpen ? null : session.id)} style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '16px 18px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
                        {/* Date badge */}
                        <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: C.accentSubtle, border: `1px solid rgba(0,200,150,0.2)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: '16px', fontWeight: '800', color: C.accent, lineHeight: 1 }}>
                            {new Date(session.dateISO).getDate()}
                          </span>
                          <span style={{ fontSize: '9px', fontWeight: '600', color: C.accent, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                            {new Date(session.dateISO).toLocaleDateString('es-AR', { month: 'short' })}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: C.text, letterSpacing: '-0.2px' }}>
                              {session.dayTitle.split(' — ')[0]}
                            </p>
                            {showPlanBadge && (
                              <span style={{ fontSize: '10px', fontWeight: '600', padding: '1px 6px', background: C.accentSubtle, color: C.accent, borderRadius: '20px' }}>
                                {planName(session.planId)}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '12px', color: C.muted, marginBottom: '4px' }}>
                            {session.dayTitle.includes(' — ') ? session.dayTitle.split(' — ').slice(1).join(' — ') : session.dayTitle}
                          </p>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11px', color: C.dim }}>{formatDuration(session.durationSec)}</span>
                            <span style={{ fontSize: '11px', color: C.dim }}>·</span>
                            <span style={{ fontSize: '11px', color: C.dim }}>{doneSets}/{totalSets} series</span>
                            {vol > 0 && <>
                              <span style={{ fontSize: '11px', color: C.dim }}>·</span>
                              <span style={{ fontSize: '11px', color: C.accent, fontWeight: '600' }}>{formatVolume(vol)}</span>
                            </>}
                          </div>
                        </div>
                        <ChevronDown size={16} color={C.dim} style={{ flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
                      </button>

                      {isOpen && (
                        <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 18px 16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                            {session.exercises.map(ex => {
                              const doneS = ex.sets.filter(s => s.done).length
                              const w = ex.sets.find(s => s.weightKg)?.weightKg
                              return (
                                <div key={ex.exerciseId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                  <span style={{ fontSize: '13px', color: C.muted, flex: 1 }}>{ex.name}</span>
                                  <span style={{ fontSize: '13px', fontWeight: '600', color: C.text, flexShrink: 0 }}>
                                    {doneS}/{ex.sets.length} series{w ? ` · ${w}kg` : ''}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                          <button onClick={() => handleDelete(session.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: C.red, fontSize: '13px', fontWeight: '500', cursor: 'pointer', opacity: 0.7 }}>
                            <Trash2 size={13} /> Eliminar registro
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
