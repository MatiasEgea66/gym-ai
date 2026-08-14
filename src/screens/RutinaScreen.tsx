import { useState } from 'react'
import { ChevronRight, Plus, Check, Pencil } from 'lucide-react'
import { PLAN, PLAN_INTRO, type Day } from '../data/plan'
import { getActivePlan, setActivePlan, getPlans, getHistory, customDayToDay } from '../lib/storage'
import type { Plan } from '../lib/storage'
import { C } from '../lib/colors'

type Props = {
  onOpenDay: (day: Day) => void
  onNewPlan: () => void
  onEditPlan: (plan: Plan) => void
}

const EMOJIS = ['🦵', '💪', '🏋️', '🔥', '⚡', '🎯']
const DAY_GRADIENTS = [
  'linear-gradient(135deg, #00C896, #00A060)',
  'linear-gradient(135deg, #5B73FF, #8B5CF6)',
  'linear-gradient(135deg, #FFB84D, #FF6B00)',
  'linear-gradient(135deg, #FF5C7D, #C0392B)',
  'linear-gradient(135deg, #00C896, #5B73FF)',
  'linear-gradient(135deg, #FFB84D, #FF5C7D)',
]

export default function RutinaScreen({ onOpenDay, onNewPlan, onEditPlan }: Props) {
  const [activePlan, setActive] = useState(getActivePlan)
  const [showPlans, setShowPlans] = useState(false)
  const plans = getPlans()
  const history = getHistory()
  const isCustom = !!activePlan.customDays

  const planDays: Day[] = isCustom
    ? (activePlan.customDays ?? []).map(customDayToDay)
    : PLAN

  function switchPlan(plan: Plan) {
    setActivePlan(plan.id)
    setActive(plan)
    setShowPlans(false)
  }

  function sessionCount(planId: string) {
    return history.filter((s) => (s.planId ?? 'plan-1') === planId).length
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px 32px', background: C.bg, minHeight: '100dvh' }}>
      <header style={{ paddingTop: '56px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: '700', letterSpacing: '-0.8px', color: C.text, marginBottom: '4px' }}>
          {isCustom ? activePlan.name : PLAN_INTRO.title}
        </h1>
        <p style={{ fontSize: '14px', color: C.muted }}>{isCustom ? `${planDays.length} días de entrenamiento` : PLAN_INTRO.subtitle}</p>
      </header>

      {/* Plan switcher */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '14px 16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.4px', textTransform: 'uppercase', color: C.dim, marginBottom: '2px' }}>Plan activo</p>
            <p style={{ fontSize: '15px', fontWeight: '700', color: C.text }}>{activePlan.name}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isCustom && (
              <button onClick={() => onEditPlan(activePlan)} style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.border}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Pencil size={14} color={C.muted} />
              </button>
            )}
            {plans.length > 1 && (
              <button onClick={() => setShowPlans(!showPlans)} style={{ padding: '7px 12px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '12px', fontWeight: '600', color: C.muted, cursor: 'pointer' }}>
                Cambiar
              </button>
            )}
            <button onClick={onNewPlan} style={{ width: '32px', height: '32px', background: C.accentSubtle, border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Plus size={16} color={C.accent} />
            </button>
          </div>
        </div>

        {showPlans && (
          <div style={{ marginTop: '12px', borderTop: `1px solid ${C.border}`, paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {plans.map((plan) => {
              const isActive = plan.id === activePlan.id
              return (
                <button key={plan.id} onClick={() => switchPlan(plan)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: isActive ? C.accentSubtle : 'rgba(255,255,255,0.04)', border: `1px solid ${isActive ? `rgba(0,200,150,0.25)` : C.border}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'left' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: C.text }}>{plan.name}</p>
                    <p style={{ fontSize: '11px', color: C.dim, marginTop: '1px' }}>{sessionCount(plan.id)} sesiones</p>
                  </div>
                  {isActive && <Check size={16} color={C.accent} />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Day cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        {planDays.map((day, i) => (
          <button key={day.id} onClick={() => onOpenDay(day)} style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '18px', textAlign: 'left', cursor: 'pointer' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: DAY_GRADIENTS[i % DAY_GRADIENTS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px' }}>
              {EMOJIS[i % EMOJIS.length]}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', color: C.accent, marginBottom: '3px' }}>{day.dayLabel}</p>
              <p style={{ fontSize: '15px', fontWeight: '600', color: C.text, letterSpacing: '-0.3px', marginBottom: '2px' }}>{day.title}</p>
              <p style={{ fontSize: '12px', color: C.dim }}>{day.blocks.length} bloques</p>
            </div>
            <ChevronRight size={18} color={C.dim} />
          </button>
        ))}
      </div>

      {!isCustom && (
        <details style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', overflow: 'hidden' }}>
          <summary style={{ padding: '16px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: C.text, listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            ¿Por qué esta estructura?
            <ChevronRight size={16} color={C.dim} />
          </summary>
          <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${C.border}` }}>
            <p style={{ fontSize: '14px', color: C.muted, lineHeight: '1.6', paddingTop: '12px' }}>{PLAN_INTRO.why}</p>
            <p style={{ fontSize: '14px', color: C.muted, lineHeight: '1.6', marginTop: '10px' }}>{PLAN_INTRO.goal}</p>
          </div>
        </details>
      )}
    </div>
  )
}
