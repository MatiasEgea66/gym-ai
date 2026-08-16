import { useRef, useState } from 'react'
import { ChevronLeft, Plus, Trash2, GripVertical, Minus } from 'lucide-react'
import { createPlan, savePlan, type CustomDay, type CustomExercise, type Plan } from '../lib/storage'

type Props = {
  plan?: Plan
  onBack: () => void
  onSaved: () => void
}

const C = {
  bg: '#0C0E1A',
  card: '#1B2038',
  card2: '#222640',
  border: 'rgba(255,255,255,0.07)',
  accent: '#5B73FF',
  accentSubtle: 'rgba(91,115,255,0.13)',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.55)',
  dim: 'rgba(255,255,255,0.28)',
  red: '#FF5C7D',
  redSubtle: 'rgba(255,92,125,0.12)',
  gradient: 'linear-gradient(135deg, #5B73FF, #8B5CF6)',
}

function newExercise(): CustomExercise {
  return { id: `ex-${Date.now()}-${Math.random()}`, name: '', target: '', description: '', sets: 3 }
}

function newDay(index: number): CustomDay {
  return { id: `day-${Date.now()}-${index}`, label: `Día ${String.fromCharCode(65 + index)}`, title: '', exercises: [] }
}

export default function PlanEditorScreen({ plan, onBack, onSaved }: Props) {
  const isEdit = !!plan
  const [name, setName] = useState(plan?.name ?? '')
  const [days, setDays] = useState<CustomDay[]>(plan?.customDays ?? [newDay(0)])
  const [addingExFor, setAddingExFor] = useState<string | null>(null)
  const [newEx, setNewEx] = useState<CustomExercise>(newExercise)

  // Drag & drop state
  const dragIndexRef = useRef<number | null>(null)
  const dragStartYRef = useRef<number>(0)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOffsetY, setDragOffsetY] = useState(0)
  const dayCardRefs = useRef<(HTMLDivElement | null)[]>([])

  function addDay() {
    setDays((d) => [...d, newDay(d.length)])
  }

  function removeDay(dayId: string) {
    setDays((d) => d.filter((x) => x.id !== dayId))
  }

  function updateDayField(dayId: string, field: keyof CustomDay, value: string) {
    setDays((d) => d.map((x) => (x.id === dayId ? { ...x, [field]: value } : x)))
  }

  function startAddEx(dayId: string) {
    setAddingExFor(dayId)
    setNewEx(newExercise())
  }

  function confirmAddEx(dayId: string) {
    if (!newEx.name.trim()) return
    setDays((d) =>
      d.map((day) =>
        day.id === dayId
          ? { ...day, exercises: [...day.exercises, { ...newEx, id: `ex-${Date.now()}` }] }
          : day,
      ),
    )
    setAddingExFor(null)
  }

  function removeExercise(dayId: string, exId: string) {
    setDays((d) => d.map((day) => (day.id === dayId ? { ...day, exercises: day.exercises.filter((e) => e.id !== exId) } : day)))
  }

  function updateExSets(dayId: string, exId: string, delta: number) {
    setDays((d) =>
      d.map((day) =>
        day.id === dayId
          ? { ...day, exercises: day.exercises.map((e) => (e.id === exId ? { ...e, sets: Math.max(1, Math.min(10, e.sets + delta)) } : e)) }
          : day,
      ),
    )
  }

  function toggleBodyweight(dayId: string, exId: string) {
    setDays((d) =>
      d.map((day) =>
        day.id === dayId
          ? { ...day, exercises: day.exercises.map((e) => (e.id === exId ? { ...e, bodyweight: !e.bodyweight } : e)) }
          : day,
      ),
    )
  }

  // Drag handlers
  function onGripTouchStart(e: React.TouchEvent, index: number) {
    e.stopPropagation()
    dragIndexRef.current = index
    dragStartYRef.current = e.touches[0].clientY
    setDragIndex(index)
    setDragOffsetY(0)
  }

  function onGripTouchMove(e: React.TouchEvent) {
    if (dragIndexRef.current === null) return
    const dy = e.touches[0].clientY - dragStartYRef.current
    setDragOffsetY(dy)
  }

  function onGripTouchEnd(e: React.TouchEvent) {
    if (dragIndexRef.current === null) return
    const fromIndex = dragIndexRef.current
    const touchY = e.changedTouches[0].clientY
    // Find target index by comparing touch Y with card centers
    let targetIndex = fromIndex
    dayCardRefs.current.forEach((ref, i) => {
      if (!ref) return
      const rect = ref.getBoundingClientRect()
      const center = rect.top + rect.height / 2
      if (touchY > center && i > targetIndex) targetIndex = i
      if (touchY < center && i < targetIndex) targetIndex = i
    })
    if (targetIndex !== fromIndex) {
      setDays((prev) => {
        const next = [...prev]
        const [moved] = next.splice(fromIndex, 1)
        next.splice(targetIndex, 0, moved)
        return next
      })
    }
    dragIndexRef.current = null
    setDragIndex(null)
    setDragOffsetY(0)
  }

  function handleSave() {
    if (!name.trim()) return
    if (isEdit && plan) {
      savePlan({ ...plan, name: name.trim(), customDays: days })
    } else {
      createPlan(name.trim(), days)
    }
    onSaved()
  }

  const canSave = name.trim().length > 0 && days.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 30, display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(12,14,26,0.9)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onBack} style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <ChevronLeft size={20} color={C.text} />
        </button>
        <h1 style={{ fontSize: '17px', fontWeight: '700', color: C.text, letterSpacing: '-0.3px', flex: 1 }}>
          {isEdit ? 'Editar plan' : 'Nuevo plan'}
        </h1>
      </header>

      <div style={{ flex: 1, maxWidth: '480px', width: '100%', margin: '0 auto', padding: '20px 20px 120px' }}>
        {/* Plan name */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', color: C.dim, marginBottom: '8px' }}>
            Nombre del plan
          </p>
          <input
            placeholder="Ej: Fuerza 4 días"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '14px 16px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', color: C.text, fontSize: '16px', fontWeight: '600', outline: 'none', fontFamily: 'inherit', letterSpacing: '-0.2px' }}
          />
        </div>

        {/* Days */}
        <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', color: C.dim, marginBottom: '12px' }}>
          Días de entrenamiento
        </p>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          onTouchMove={onGripTouchMove}
          onTouchEnd={onGripTouchEnd}
        >
          {days.map((day, dayIdx) => (
            <div
              key={day.id}
              ref={(el) => { dayCardRefs.current[dayIdx] = el }}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: '18px',
                overflow: 'hidden',
                transform: dragIndex === dayIdx ? `translateY(${dragOffsetY}px)` : 'none',
                transition: dragIndex === dayIdx ? 'none' : 'transform 0.2s ease',
                zIndex: dragIndex === dayIdx ? 10 : 1,
                position: 'relative',
                opacity: dragIndex !== null && dragIndex !== dayIdx ? 0.6 : 1,
              }}
            >
              {/* Day header */}
              <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <div
                    onTouchStart={(e) => onGripTouchStart(e, dayIdx)}
                    style={{ display: 'flex', alignItems: 'center', cursor: 'grab', padding: '4px 2px', flexShrink: 0 }}
                  >
                    <GripVertical size={16} color={C.dim} />
                  </div>
                  <input
                    placeholder="Día A"
                    value={day.label}
                    onChange={(e) => updateDayField(day.id, 'label', e.target.value)}
                    style={{ width: '70px', padding: '8px 10px', background: C.card2, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.accent, fontSize: '13px', fontWeight: '700', outline: 'none', fontFamily: 'inherit', letterSpacing: '-0.1px' }}
                  />
                  <input
                    placeholder="Pecho y Tríceps"
                    value={day.title}
                    onChange={(e) => updateDayField(day.id, 'title', e.target.value)}
                    style={{ flex: 1, padding: '8px 10px', background: C.card2, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', fontWeight: '600', outline: 'none', fontFamily: 'inherit' }}
                  />
                  {days.length > 1 && (
                    <button onClick={() => removeDay(day.id)} style={{ width: '34px', height: '34px', borderRadius: '10px', background: C.redSubtle, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                      <Trash2 size={14} color={C.red} />
                    </button>
                  )}
                </div>
              </div>

              {/* Exercises */}
              <div style={{ padding: '0' }}>
                {day.exercises.map((ex) => (
                  <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', borderBottom: `1px solid ${C.border}` }}>
                    <GripVertical size={14} color={C.dim} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: C.text, letterSpacing: '-0.2px' }}>{ex.name}</p>
                      <p style={{ fontSize: '11px', color: C.dim, marginTop: '1px' }}>{ex.target}{ex.description ? ` · ${ex.description}` : ''}</p>
                    </div>
                    {/* Bodyweight toggle */}
                    <button
                      onClick={() => toggleBodyweight(day.id, ex.id)}
                      style={{
                        flexShrink: 0,
                        padding: '3px 7px',
                        background: ex.bodyweight ? C.accentSubtle : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${ex.bodyweight ? C.accent : C.border}`,
                        borderRadius: '8px',
                        color: ex.bodyweight ? C.accent : C.dim,
                        fontSize: '10px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ex.bodyweight ? 'Sin peso' : 'Con peso'}
                    </button>
                    {/* Sets stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      <button onClick={() => updateExSets(day.id, ex.id, -1)} style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Minus size={10} color={C.muted} />
                      </button>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: C.accent, width: '20px', textAlign: 'center' }}>{ex.sets}</span>
                      <button onClick={() => updateExSets(day.id, ex.id, 1)} style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Plus size={10} color={C.muted} />
                      </button>
                    </div>
                    <button onClick={() => removeExercise(day.id, ex.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}>
                      <Trash2 size={13} color={C.red} opacity={0.7} />
                    </button>
                  </div>
                ))}

                {/* Add exercise form */}
                {addingExFor === day.id ? (
                  <div style={{ padding: '14px 16px', background: C.card2, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      autoFocus
                      placeholder="Nombre del ejercicio *"
                      value={newEx.name}
                      onChange={(e) => setNewEx((x) => ({ ...x, name: e.target.value }))}
                      style={{ padding: '10px 12px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        placeholder="Músculo objetivo"
                        value={newEx.target}
                        onChange={(e) => setNewEx((x) => ({ ...x, target: e.target.value }))}
                        style={{ flex: 1, padding: '10px 12px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                      />
                      <input
                        placeholder="Reps / tiempo"
                        value={newEx.description}
                        onChange={(e) => setNewEx((x) => ({ ...x, description: e.target.value }))}
                        style={{ flex: 1, padding: '10px 12px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                      />
                    </div>
                    {/* Sets */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', color: C.muted }}>Series:</span>
                      <button onClick={() => setNewEx((x) => ({ ...x, sets: Math.max(1, x.sets - 1) }))} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Minus size={12} color={C.muted} />
                      </button>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: C.text, width: '20px', textAlign: 'center' }}>{newEx.sets}</span>
                      <button onClick={() => setNewEx((x) => ({ ...x, sets: Math.min(10, x.sets + 1) }))} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Plus size={12} color={C.muted} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setAddingExFor(null)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.muted, fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                        Cancelar
                      </button>
                      <button onClick={() => confirmAddEx(day.id)} disabled={!newEx.name.trim()} style={{ flex: 2, padding: '10px', background: newEx.name.trim() ? C.gradient : 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '10px', color: newEx.name.trim() ? C.text : C.dim, fontSize: '13px', fontWeight: '600', cursor: newEx.name.trim() ? 'pointer' : 'default' }}>
                        Agregar ejercicio
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startAddEx(day.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: C.accent, fontSize: '13px', fontWeight: '600', cursor: 'pointer', letterSpacing: '-0.1px' }}
                  >
                    <Plus size={14} /> Agregar ejercicio
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add day */}
          <button
            onClick={addDay}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', background: C.accentSubtle, border: `1px dashed rgba(91,115,255,0.3)`, borderRadius: '14px', color: C.accent, fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
          >
            <Plus size={16} /> Agregar día
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'sticky', bottom: 0, background: 'rgba(12,14,26,0.9)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderTop: `1px solid ${C.border}`, padding: '12px 20px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'block', padding: '15px', background: canSave ? C.gradient : 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '14px', color: canSave ? C.text : C.dim, fontSize: '16px', fontWeight: '600', cursor: canSave ? 'pointer' : 'default', letterSpacing: '-0.2px' }}
        >
          {isEdit ? 'Guardar cambios' : 'Crear plan'}
        </button>
      </div>
    </div>
  )
}
