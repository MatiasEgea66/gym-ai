import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronLeft, Minus, Plus, Timer, Trophy, X } from 'lucide-react'
import type { Day } from '../data/plan'
import { addSession, getActivePlan, getLastWeight, type ExerciseLog, type Session } from '../lib/storage'
import { C } from '../lib/colors'

type Props = { day: Day; onFinish: () => void; onExit: () => void }
type SetState = { done: boolean; flash?: boolean }

function setsForExercise(rounds: number | undefined) { return rounds ?? 1 }
function fmt(sec: number) { return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` }
function todayStr() { return new Date().toISOString().split('T')[0] }

const CONFETTI_COLORS = ['#00C896', '#00A060', '#5B73FF', '#8B5CF6', '#00E5B0', '#FFFFFF', '#3DFFD0', '#7BFFCE']

const CONFETTI_STYLE = `
@keyframes confetti-rise {
  0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
  80%  { opacity: 1; }
  100% { transform: translateY(-320px) rotate(720deg) scale(0.4); opacity: 0; }
}
@keyframes confetti-drift {
  0%   { margin-left: 0px; }
  50%  { margin-left: 30px; }
  100% { margin-left: -20px; }
}
.confetti-piece {
  position: absolute;
  bottom: 100px;
  animation: confetti-rise 1.6s ease-out forwards, confetti-drift 1.6s ease-in-out forwards;
}
`

export default function WorkoutSessionScreen({ day, onFinish, onExit }: Props) {
  const [startedAt] = useState(Date.now)
  const [elapsed, setElapsed] = useState(0)
  const [phase, setPhase] = useState<'active' | 'done'>('active')
  const [confirmExit, setConfirmExit] = useState(false)
  const [restLeft, setRestLeft] = useState<number | null>(null)
  const [sessionDate, setSessionDate] = useState(todayStr)

  const allExercises = useMemo(() =>
    day.blocks.flatMap((block) => block.exercises.map((ex) => ({ block, ex, totalSets: setsForExercise(block.rounds) }))),
    [day])

  const [sets, setSets] = useState<Record<string, SetState[]>>(() => {
    const init: Record<string, SetState[]> = {}
    for (const { ex, totalSets } of allExercises) init[ex.id] = Array.from({ length: totalSets }, () => ({ done: false }))
    return init
  })

  const [weights, setWeights] = useState<Record<string, number | undefined>>(() => {
    const init: Record<string, number | undefined> = {}
    for (const { ex } of allExercises) init[ex.id] = getLastWeight(ex.id)
    return init
  })

  // Capture initial last weights as baseline for PR detection
  const lastWeightsRef = useRef<Record<string, number | undefined>>({})
  useEffect(() => {
    const init: Record<string, number | undefined> = {}
    for (const { ex } of allExercises) init[ex.id] = getLastWeight(ex.id)
    lastWeightsRef.current = init
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase !== 'active') return
    const id = setInterval(() => setElapsed(Math.round((Date.now() - startedAt) / 1000)), 1000)
    return () => clearInterval(id)
  }, [phase, startedAt])

  useEffect(() => {
    if (restLeft === null || restLeft <= 0) return
    const id = setTimeout(() => setRestLeft((r) => (r !== null && r > 1 ? r - 1 : null)), 1000)
    return () => clearTimeout(id)
  }, [restLeft])

  const totalSets = allExercises.reduce((s, e) => s + e.totalSets, 0)
  const doneSets = Object.values(sets).reduce((s, arr) => s + arr.filter((x) => x.done).length, 0)
  const progress = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0

  function toggleSet(exerciseId: string, index: number) {
    setSets((prev) => {
      const next = { ...prev }
      const arr = [...next[exerciseId]]
      const wasDone = arr[index].done
      arr[index] = { done: !wasDone, flash: !wasDone }
      next[exerciseId] = arr
      if (!wasDone) {
        setRestLeft(60)
        navigator.vibrate?.(10)
        // Clear flash after animation
        setTimeout(() => {
          setSets((p) => {
            const n = { ...p }
            const a = [...n[exerciseId]]
            a[index] = { ...a[index], flash: false }
            n[exerciseId] = a
            return n
          })
        }, 400)
      }
      return next
    })
  }

  function changeWeight(exerciseId: string, delta: number) {
    setWeights((prev) => {
      const current = prev[exerciseId] ?? 0
      return { ...prev, [exerciseId]: Math.max(0, Math.round((current + delta) * 4) / 4) }
    })
  }

  function saveAndFinish() {
    const plan = getActivePlan()
    const exercises: ExerciseLog[] = allExercises.map(({ ex, totalSets: n }) => ({
      exerciseId: ex.id, name: ex.name,
      sets: Array.from({ length: n }, (_, i) => ({ setNumber: i + 1, done: sets[ex.id]?.[i]?.done ?? false, weightKg: weights[ex.id] })),
    }))
    const session: Session = { id: `${day.id}-${startedAt}`, dayId: day.id, dayTitle: `${day.dayLabel} — ${day.title}`, dateISO: new Date(sessionDate + 'T12:00:00').toISOString(), durationSec: elapsed, exercises, planId: plan.id }
    addSession(session)
    onFinish()
  }

  // ── Swipe handler factory ──────────────────────────────────────────────────
  function makeSwipeHandlers(exerciseId: string, index: number) {
    let startX = 0
    let startY = 0
    return {
      onTouchStart: (e: React.TouchEvent) => {
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
      },
      onTouchEnd: (e: React.TouchEvent) => {
        const dx = e.changedTouches[0].clientX - startX
        const dy = Math.abs(e.changedTouches[0].clientY - startY)
        if (dx > 60 && dy < 40) {
          toggleSet(exerciseId, index)
        }
      },
    }
  }

  // ── Done screen ────────────────────────────────────────────────────────────
  if (phase === 'done') {
    const confettiPieces = Array.from({ length: 20 }, (_, i) => {
      const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
      const size = 6 + Math.floor(Math.random() * 8)
      const left = 10 + Math.floor(Math.random() * 80)
      const delay = (i * 0.07).toFixed(2)
      const isCircle = i % 3 !== 0
      return (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            background: color,
            borderRadius: isCircle ? '50%' : '2px',
            animationDelay: `${delay}s`,
          }}
        />
      )
    })

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: '32px 24px', background: C.bg, position: 'relative', overflow: 'hidden' }}>
        <style>{CONFETTI_STYLE}</style>
        {confettiPieces}
        <div style={{ width: '88px', height: '88px', borderRadius: '26px', background: C.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 20px 60px rgba(0,200,150,0.25)', position: 'relative', zIndex: 1 }}>
          <Trophy size={40} color="white" />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: C.text, letterSpacing: '-0.8px', marginBottom: '6px', textAlign: 'center', position: 'relative', zIndex: 1 }}>¡Sesión completada!</h1>
        <p style={{ fontSize: '15px', color: C.muted, marginBottom: '36px', textAlign: 'center', position: 'relative', zIndex: 1 }}>{day.dayLabel} · {fmt(elapsed)} · {doneSets}/{totalSets} series</p>

        <div style={{ width: '100%', maxWidth: '320px', background: C.card, borderRadius: '16px', border: `1px solid ${C.border}`, padding: '18px 20px', marginBottom: '14px', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.4px', textTransform: 'uppercase', color: C.dim, marginBottom: '10px' }}>¿Cuándo fue?</p>
          <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} max={todayStr()}
            style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontSize: '17px', fontWeight: '600', color: C.text, fontFamily: 'inherit', cursor: 'pointer' }} />
        </div>

        <button onClick={saveAndFinish} style={{ width: '100%', maxWidth: '320px', padding: '15px', background: C.gradient, border: 'none', borderRadius: '14px', color: '#fff', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,200,150,0.25)', position: 'relative', zIndex: 1 }}>
          Guardar y volver
        </button>
      </div>
    )
  }

  // ── Active screen ──────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: C.bg }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(12,14,26,0.92)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}>
          <button onClick={() => setConfirmExit(true)} style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <ChevronLeft size={20} color={C.text} />
          </button>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', color: C.accent, marginBottom: '1px' }}>{day.dayLabel}</p>
            <h1 style={{ fontSize: '15px', fontWeight: '700', color: C.text }}>{day.title}</h1>
          </div>
          <p style={{ fontSize: '14px', fontWeight: '600', fontVariantNumeric: 'tabular-nums', color: C.muted }}>{fmt(elapsed)}</p>
        </div>
        <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ height: '100%', background: C.gradient, transition: 'width 0.4s ease', width: `${progress}%` }} />
        </div>
      </header>

      <div style={{ flex: 1, maxWidth: '480px', width: '100%', margin: '0 auto', padding: '20px 20px 120px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {day.blocks.map((block) => (
          <section key={block.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '700', color: C.text }}>{block.title}</h2>
              {block.rounds && <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.border}`, borderRadius: '20px', fontSize: '11px', fontWeight: '500', color: C.dim }}>{block.rounds} vueltas</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {block.exercises.map((ex) => {
                const exSets = sets[ex.id] ?? []
                const weight = weights[ex.id]
                const showWeight = Boolean(block.rounds) && ex.bodyweight !== true
                const lastWeight = lastWeightsRef.current[ex.id]
                const isPR = showWeight && weight !== undefined && lastWeight !== undefined && weight > lastWeight
                return (
                  <div key={ex.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: C.text }}>{ex.name}</p>
                      <span style={{ flexShrink: 0, padding: '3px 8px', background: C.accentSubtle, borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: C.accent }}>{ex.target}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: C.muted, lineHeight: '1.5', marginBottom: '14px' }}>{ex.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {exSets.map((s, i) => {
                          const swipeHandlers = makeSwipeHandlers(ex.id, i)
                          return (
                            <button
                              key={i}
                              onClick={() => toggleSet(ex.id, i)}
                              {...swipeHandlers}
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                border: s.done ? 'none' : `1.5px solid rgba(255,255,255,0.15)`,
                                background: s.flash ? 'rgba(0,200,150,0.6)' : s.done ? C.gradient : 'rgba(255,255,255,0.05)',
                                color: s.done ? '#fff' : C.dim,
                                fontSize: '13px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: s.flash ? 'background 0.05s' : 'all 0.15s',
                              }}
                            >
                              {s.done ? <Check size={16} strokeWidth={2.5} /> : i + 1}
                            </button>
                          )
                        })}
                      </div>
                      {showWeight && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button onClick={() => changeWeight(ex.id, -2.5)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.muted }}>
                            <Minus size={13} />
                          </button>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '54px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: weight ? C.text : C.dim, fontVariantNumeric: 'tabular-nums' }}>
                              {weight ? `${weight}kg` : '—'}
                            </span>
                            {isPR && (
                              <span style={{ padding: '1px 5px', background: C.accentSubtle, border: `1px solid ${C.accent}`, borderRadius: '6px', fontSize: '10px', fontWeight: '700', color: C.accent, letterSpacing: '0.3px' }}>PR</span>
                            )}
                          </div>
                          <button onClick={() => changeWeight(ex.id, 2.5)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.muted }}>
                            <Plus size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div style={{ position: 'sticky', bottom: 0, background: 'rgba(12,14,26,0.92)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderTop: `1px solid ${C.border}`, padding: '12px 20px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
        <button onClick={() => setPhase('done')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', maxWidth: '480px', margin: '0 auto', padding: '15px', background: C.gradient, border: 'none', borderRadius: '14px', color: '#fff', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,200,150,0.2)' }}>
          Finalizar · {doneSets}/{totalSets}
        </button>
      </div>

      {restLeft !== null && (
        <div style={{ position: 'fixed', insetInline: 0, bottom: '96px', zIndex: 40, display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', background: C.card, backdropFilter: 'blur(20px)', border: `1px solid ${C.borderStrong}`, borderRadius: '100px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <Timer size={16} color={C.accent} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: C.text, fontVariantNumeric: 'tabular-nums' }}>{fmt(restLeft)}</span>
            <button onClick={() => setRestLeft((r) => r === null ? null : r + 30)} style={{ fontSize: '13px', fontWeight: '600', color: C.dim, background: 'none', border: 'none', cursor: 'pointer' }}>+30s</button>
            <button onClick={() => setRestLeft(null)} style={{ fontSize: '13px', fontWeight: '600', color: C.accent, background: 'none', border: 'none', cursor: 'pointer' }}>Saltar</button>
          </div>
        </div>
      )}

      {confirmExit && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '0 20px 24px' }}>
          <div style={{ width: '100%', maxWidth: '480px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px' }}>
            <p style={{ fontSize: '16px', fontWeight: '700', color: C.text, marginBottom: '6px' }}>¿Salir del entrenamiento?</p>
            <p style={{ fontSize: '14px', color: C.muted, marginBottom: '20px' }}>El progreso no se va a guardar.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmExit(false)} style={{ flex: 1, padding: '13px', background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.border}`, borderRadius: '12px', color: C.text, fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>Seguir</button>
              <button onClick={onExit} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '13px', background: C.redSubtle, border: `1px solid rgba(255,92,125,0.2)`, borderRadius: '12px', color: C.red, fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                <X size={16} /> Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
