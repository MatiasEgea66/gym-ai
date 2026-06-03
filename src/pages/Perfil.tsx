import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { generarPlanMensual } from '../lib/gemini'
import type { Profile } from '../lib/supabase'
import { User, Sparkles, RefreshCw } from 'lucide-react'

export function Perfil() {
  const { user } = useAuth()
  const [perfil, setPerfil] = useState<Profile>({
    id: user?.id || '',
    objetivo: '',
    nivel: 'intermedio',
    restricciones: '',
    updated_at: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const now = new Date()
  const mes = now.getMonth() + 1
  const anio = now.getFullYear()

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setPerfil(data)
        setLoading(false)
      })
  }, [user])

  const handleGuardar = async () => {
    if (!user) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    const { error } = await supabase
      .from('profiles')
      .upsert({ ...perfil, id: user.id, updated_at: new Date().toISOString() })
    if (error) setError(error.message)
    else setSuccess('Perfil guardado')
    setSaving(false)
  }

  const handleGenerarPlan = async () => {
    if (!user) return
    setGenerando(true)
    setError(null)
    setSuccess(null)

    try {
      // Save profile first
      await supabase
        .from('profiles')
        .upsert({ ...perfil, id: user.id, updated_at: new Date().toISOString() })

      // Get previous plan (most recent, not current month)
      const { data: planes } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', user.id)
        .order('anio', { ascending: false })
        .order('mes', { ascending: false })
        .limit(2)

      // Find one that's NOT the current month
      const planAnterior = planes?.find(p => !(p.mes === mes && p.anio === anio)) || null
      const planActual = planes?.find(p => p.mes === mes && p.anio === anio) || null

      // Generate with Gemini
      const resultado = await generarPlanMensual(perfil, planAnterior?.dias || null)

      if (planActual) {
        // Update existing plan
        await supabase
          .from('plans')
          .update({ dias: resultado.plan, es_manual: false })
          .eq('id', planActual.id)

        // Update or insert diet
        await supabase
          .from('diets')
          .upsert({ plan_id: planActual.id, user_id: user.id, contenido: resultado.dieta })
      } else {
        // Insert new plan
        const { data: newPlan, error: planError } = await supabase
          .from('plans')
          .insert({ user_id: user.id, mes, anio, dias: resultado.plan, es_manual: false })
          .select()
          .single()

        if (planError) throw new Error(planError.message)

        // Insert diet
        await supabase
          .from('diets')
          .insert({ plan_id: newPlan.id, user_id: user.id, contenido: resultado.dieta })
      }

      setSuccess('Plan y dieta generados con IA. Revisá las secciones Plan y Dieta.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar el plan')
    }

    setGenerando(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm" style={{ color: '#475569' }}>Cargando perfil...</div>
      </div>
    )
  }

  const initials = (user?.email || 'U').slice(0, 2).toUpperCase()

  const nivelOptions = [
    { value: 'principiante', label: 'Principiante', desc: 'Menos de 1 año' },
    { value: 'intermedio', label: 'Intermedio', desc: '1–3 años' },
    { value: 'avanzado', label: 'Avanzado', desc: '3+ años' },
  ]

  return (
    <div>
      {/* Avatar header */}
      <div className="flex items-center gap-5 mb-8">
        <div
          className="flex items-center justify-center w-16 h-16 rounded-2xl text-lg font-bold flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #22c55e20, #16a34a10)',
            border: '1px solid #22c55e30',
            color: '#22c55e',
          }}
        >
          {initials}
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#f1f5f9' }}>Mi Perfil</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>{user?.email}</p>
        </div>
      </div>

      {/* Profile card */}
      <div
        className="rounded-2xl p-6 mb-4"
        style={{ backgroundColor: '#111111', border: '1px solid #222222' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <User size={16} color="#64748b" />
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
            Mi perfil
          </h2>
        </div>

        <div className="space-y-5">
          {/* Objetivo */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>
              Objetivo
            </label>
            <p className="text-xs mb-2" style={{ color: '#475569' }}>
              Describí tu meta: ganar músculo, perder peso, mejorar resistencia, etc.
            </p>
            <textarea
              value={perfil.objetivo || ''}
              onChange={e => setPerfil(prev => ({ ...prev, objetivo: e.target.value }))}
              rows={3}
              placeholder="Ej: Ganar masa muscular, perder grasa, mejorar resistencia..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all duration-200"
              style={{ backgroundColor: '#161616', border: '1px solid #222222', color: '#f1f5f9' }}
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

          {/* Nivel */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>
              Nivel de experiencia
            </label>
            <p className="text-xs mb-3" style={{ color: '#475569' }}>
              Tu nivel actual de entrenamiento
            </p>
            <div className="grid grid-cols-3 gap-3">
              {nivelOptions.map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPerfil(prev => ({ ...prev, nivel: value as Profile['nivel'] }))}
                  className="p-3 rounded-xl text-left transition-all duration-200"
                  style={perfil.nivel === value
                    ? { backgroundColor: '#22c55e15', border: '1px solid #22c55e40', color: '#22c55e' }
                    : { backgroundColor: '#161616', border: '1px solid #222222', color: '#64748b' }
                  }
                >
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="text-xs mt-0.5 opacity-60">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Restricciones */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>
              Restricciones o lesiones
            </label>
            <p className="text-xs mb-2" style={{ color: '#475569' }}>
              Indicá lesiones, limitaciones físicas o ejercicios a evitar.
            </p>
            <textarea
              value={perfil.restricciones || ''}
              onChange={e => setPerfil(prev => ({ ...prev, restricciones: e.target.value }))}
              rows={2}
              placeholder="Ej: Lesión en rodilla derecha, no puedo hacer sentadillas..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all duration-200"
              style={{ backgroundColor: '#161616', border: '1px solid #222222', color: '#f1f5f9' }}
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
        </div>

        <button
          onClick={handleGuardar}
          disabled={saving}
          className="mt-6 w-full py-3 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-50"
          style={{ backgroundColor: '#161616', color: '#94a3b8', border: '1px solid #222222' }}
        >
          {saving ? 'Guardando...' : 'Guardar perfil'}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px" style={{ backgroundColor: '#1e293b' }} />
        <span className="text-xs font-medium" style={{ color: '#475569' }}>Inteligencia Artificial</span>
        <div className="flex-1 h-px" style={{ backgroundColor: '#1e293b' }} />
      </div>

      {/* AI card */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, #22c55e08, #16a34a05)',
          border: '1px solid #22c55e20',
        }}
      >
        <div className="flex items-start gap-4 mb-5">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
            style={{ backgroundColor: '#22c55e15', border: '1px solid #22c55e30' }}
          >
            <Sparkles size={18} color="#22c55e" />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: '#f1f5f9' }}>Generar plan con IA</h3>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: '#64748b' }}>
              Gemini analizará tu perfil y creará un plan de entrenamiento semanal + dieta personalizada para este mes.
              Si ya tenés un plan anterior, lo tomará de referencia para progresar.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerarPlan}
          disabled={generando}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{
            background: generando ? '#1a2e1a' : 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: generando ? '#22c55e' : '#0a0a0a',
            boxShadow: generando ? 'none' : '0 4px 20px #22c55e30',
          }}
        >
          {generando ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Generando con IA...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generar plan del mes con IA
            </>
          )}
        </button>
      </div>

      {/* Feedback messages */}
      {error && (
        <div
          className="mt-4 px-4 py-3 rounded-xl text-sm"
          style={{ backgroundColor: '#7f1d1d20', color: '#f87171', border: '1px solid #7f1d1d40' }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="mt-4 px-4 py-3 rounded-xl text-sm"
          style={{ backgroundColor: '#14532d20', color: '#22c55e', border: '1px solid #22c55e30' }}
        >
          {success}
        </div>
      )}
    </div>
  )
}
