import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Plan, Ejercicio } from '../lib/supabase'
import { Calendar, Timer, Plus, Trash2, Target, Dumbbell } from 'lucide-react'

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'] as const
const DIAS_LABELS: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
}

interface EjercicioForm {
  ejercicio: string
  series: string
  reps: string
  descanso: string
}

const emptyEjercicio = (): EjercicioForm => ({ ejercicio: '', series: '3', reps: '12', descanso: '60s' })

export function PlanActual() {
  const { user } = useAuth()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeDia, setActiveDia] = useState<string>('lunes')

  // Form state for manual input
  const [diasForm, setDiasForm] = useState<Record<string, EjercicioForm[]>>(
    Object.fromEntries(DIAS.map(d => [d, [emptyEjercicio()]]))
  )

  const now = new Date()
  const mes = now.getMonth() + 1
  const anio = now.getFullYear()

  useEffect(() => {
    if (!user) return
    supabase
      .from('plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('mes', mes)
      .eq('anio', anio)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setPlan(data)
        setLoading(false)
      })
  }, [user, mes, anio])

  const addEjercicio = (dia: string) => {
    setDiasForm(prev => ({ ...prev, [dia]: [...prev[dia], emptyEjercicio()] }))
  }

  const removeEjercicio = (dia: string, idx: number) => {
    setDiasForm(prev => ({ ...prev, [dia]: prev[dia].filter((_, i) => i !== idx) }))
  }

  const updateEjercicio = (dia: string, idx: number, field: keyof EjercicioForm, value: string) => {
    setDiasForm(prev => {
      const copy = [...prev[dia]]
      copy[idx] = { ...copy[idx], [field]: value }
      return { ...prev, [dia]: copy }
    })
  }

  const handleGuardar = async () => {
    if (!user) return
    setSaving(true)
    setError(null)
    const dias: Record<string, Ejercicio[]> = {}
    for (const dia of DIAS) {
      const ejercicios = diasForm[dia]
        .filter(e => e.ejercicio.trim())
        .map(e => ({ ejercicio: e.ejercicio, series: parseInt(e.series) || 3, reps: e.reps, descanso: e.descanso }))
      if (ejercicios.length > 0) dias[dia] = ejercicios
    }
    const { data, error } = await supabase
      .from('plans')
      .insert({ user_id: user.id, mes, anio, dias, es_manual: true })
      .select()
      .single()
    if (error) setError(error.message)
    else setPlan(data)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm" style={{ color: '#475569' }}>Cargando plan...</div>
      </div>
    )
  }

  const mesLabel = new Date(anio, mes - 1).toLocaleString('es', { month: 'long', year: 'numeric' })
  const mesCapitalized = mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1)

  if (plan) {
    const dias = plan.dias as Record<string, Ejercicio[]>
    const diasConEjercicios = DIAS.filter(d => dias[d] && dias[d].length > 0)

    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ backgroundColor: '#22c55e15', border: '1px solid #22c55e30' }}
            >
              <Calendar size={18} color="#22c55e" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#f1f5f9' }}>
                Plan — {mesCapitalized}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: '#22c55e15', color: '#22c55e', border: '1px solid #22c55e30' }}
                >
                  Activo
                </span>
                {plan.es_manual && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}
                  >
                    Manual
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Day tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {(diasConEjercicios.length > 0 ? diasConEjercicios : DIAS as unknown as string[]).map(dia => (
            <button
              key={dia}
              onClick={() => setActiveDia(dia)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={activeDia === dia
                ? { background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#0a0a0a', boxShadow: '0 4px 12px #22c55e30' }
                : { backgroundColor: '#161616', color: '#64748b', border: '1px solid #222222' }}
            >
              {DIAS_LABELS[dia].slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Exercises card */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: '#111111', border: '1px solid #222222' }}
        >
          <h2 className="font-semibold text-base mb-5" style={{ color: '#f1f5f9' }}>
            {DIAS_LABELS[activeDia]}
          </h2>
          {!dias[activeDia] || dias[activeDia].length === 0 ? (
            <div className="flex flex-col items-center py-8" style={{ color: '#475569' }}>
              <Target size={32} className="mb-3 opacity-40" />
              <p className="text-sm">Día de descanso</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dias[activeDia].map((ej, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
                  style={{ backgroundColor: '#161616', border: '1px solid #222222' }}
                >
                  <span
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#22c55e15', color: '#22c55e' }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: '#f1f5f9' }}>{ej.ejercicio}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span
                        className="text-xs px-2 py-0.5 rounded-lg font-medium"
                        style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}
                      >
                        {ej.series} × {ej.reps}
                      </span>
                      <span
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg font-medium"
                        style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}
                      >
                        <Timer size={10} />
                        {ej.descanso}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // No plan: show manual form
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ backgroundColor: '#22c55e15', border: '1px solid #22c55e30' }}
        >
          <Calendar size={18} color="#22c55e" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#f1f5f9' }}>Plan — {mesCapitalized}</h1>
        </div>
      </div>

      {/* Empty state notice */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl mb-6"
        style={{ backgroundColor: '#161616', border: '1px solid #222222' }}
      >
        <Dumbbell size={18} color="#475569" className="flex-shrink-0 mt-0.5" />
        <p className="text-sm" style={{ color: '#64748b' }}>
          No tenés plan para este mes. Cargalo manualmente o generalo con IA desde tu Perfil.
        </p>
      </div>

      <div
        className="rounded-2xl p-6 mb-4"
        style={{ backgroundColor: '#111111', border: '1px solid #222222' }}
      >
        {/* Day tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {DIAS.map(dia => (
            <button
              key={dia}
              onClick={() => setActiveDia(dia)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={activeDia === dia
                ? { background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#0a0a0a', boxShadow: '0 4px 12px #22c55e30' }
                : { backgroundColor: '#161616', color: '#64748b', border: '1px solid #222222' }}
            >
              {DIAS_LABELS[dia].slice(0, 3)}
            </button>
          ))}
        </div>

        <h2 className="font-semibold text-base mb-4" style={{ color: '#f1f5f9' }}>
          {DIAS_LABELS[activeDia]}
        </h2>

        <div className="space-y-3 mb-4">
          {diasForm[activeDia].map((ej, i) => (
            <div
              key={i}
              className="p-4 rounded-xl space-y-3"
              style={{ backgroundColor: '#161616', border: '1px solid #222222' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>
                  Ejercicio {i + 1}
                </span>
                {diasForm[activeDia].length > 1 && (
                  <button
                    onClick={() => removeEjercicio(activeDia, i)}
                    className="p-1 rounded-lg transition-all duration-200 hover:bg-red-500/10"
                    style={{ color: '#475569' }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <input
                placeholder="Nombre del ejercicio"
                value={ej.ejercicio}
                onChange={e => updateEjercicio(activeDia, i, 'ejercicio', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                style={{ backgroundColor: '#0a0a0a', border: '1px solid #222222', color: '#f1f5f9' }}
                onFocus={e => {
                  e.target.style.border = '1px solid #22c55e'
                  e.target.style.boxShadow = '0 0 0 3px #22c55e10'
                }}
                onBlur={e => {
                  e.target.style.border = '1px solid #222222'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Series', field: 'series' as keyof EjercicioForm, type: 'number', min: '1', value: ej.series },
                  { label: 'Reps', field: 'reps' as keyof EjercicioForm, type: 'text', value: ej.reps },
                  { label: 'Descanso', field: 'descanso' as keyof EjercicioForm, type: 'text', value: ej.descanso },
                ].map(({ label, field, type, min, value }) => (
                  <div key={field}>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: '#64748b' }}>{label}</label>
                    <input
                      type={type}
                      min={min}
                      value={value}
                      onChange={e => updateEjercicio(activeDia, i, field, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all duration-200"
                      style={{ backgroundColor: '#0a0a0a', border: '1px solid #222222', color: '#f1f5f9' }}
                      onFocus={e => {
                        e.target.style.border = '1px solid #22c55e'
                        e.target.style.boxShadow = '0 0 0 3px #22c55e10'
                      }}
                      onBlur={e => {
                        e.target.style.border = '1px solid #222222'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => addEjercicio(activeDia)}
          className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl transition-all duration-200 hover:bg-green-500/10"
          style={{ color: '#22c55e', border: '1px solid #22c55e20', backgroundColor: '#22c55e08' }}
        >
          <Plus size={15} />
          Agregar ejercicio
        </button>
      </div>

      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm mb-4"
          style={{ backgroundColor: '#7f1d1d20', color: '#f87171', border: '1px solid #7f1d1d40' }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleGuardar}
        disabled={saving}
        className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          color: '#0a0a0a',
          boxShadow: '0 4px 20px #22c55e30',
        }}
      >
        {saving ? 'Guardando...' : 'Guardar plan manualmente'}
      </button>
    </div>
  )
}
