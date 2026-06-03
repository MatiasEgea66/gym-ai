import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Plan, Dieta, Ejercicio } from '../lib/supabase'
import { History, ChevronDown, Timer, Trophy, Coffee, Sun, Moon, UtensilsCrossed, Flame, Zap, Droplets, TrendingUp } from 'lucide-react'

const DIAS_LABELS: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

interface PlanConDieta extends Plan {
  dieta?: Dieta
}

export function Historial() {
  const { user } = useAuth()
  const [planes, setPlanes] = useState<PlanConDieta[]>([])
  const [loading, setLoading] = useState(true)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [tabActiva, setTabActiva] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user) return
    const now = new Date()
    const mes = now.getMonth() + 1
    const anio = now.getFullYear()

    supabase
      .from('plans')
      .select('*')
      .eq('user_id', user.id)
      .order('anio', { ascending: false })
      .order('mes', { ascending: false })
      .then(async ({ data: plans }) => {
        if (!plans) { setLoading(false); return }
        // Exclude current month
        const historial = plans.filter(p => !(p.mes === mes && p.anio === anio))
        // Fetch diets for all plans
        const ids = historial.map(p => p.id)
        const { data: diets } = await supabase
          .from('diets')
          .select('*')
          .in('plan_id', ids)
        const dietMap = Object.fromEntries((diets || []).map(d => [d.plan_id, d]))
        setPlanes(historial.map(p => ({ ...p, dieta: dietMap[p.id] })))
        setLoading(false)
      })
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm" style={{ color: '#475569' }}>Cargando historial...</div>
      </div>
    )
  }

  if (planes.length === 0) {
    return (
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ backgroundColor: '#22c55e15', border: '1px solid #22c55e30' }}
          >
            <History size={18} color="#22c55e" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: '#f1f5f9' }}>Historial</h1>
        </div>

        {/* Empty state */}
        <div
          className="flex flex-col items-center py-16 rounded-2xl"
          style={{ backgroundColor: '#111111', border: '1px solid #222222' }}
        >
          <Trophy size={40} color="#333" className="mb-4" />
          <h3 className="font-semibold mb-2" style={{ color: '#f1f5f9' }}>Sin planes anteriores</h3>
          <p className="text-sm text-center max-w-xs" style={{ color: '#64748b' }}>
            Tu historial de planes aparecerá aquí una vez que completes tu primer mes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ backgroundColor: '#22c55e15', border: '1px solid #22c55e30' }}
          >
            <History size={18} color="#22c55e" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#f1f5f9' }}>Historial</h1>
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
              {planes.length} {planes.length === 1 ? 'plan' : 'planes'} anteriores
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {planes.map(plan => {
          const isOpen = expandido === plan.id
          const tab = tabActiva[plan.id] || 'plan'
          const dias = plan.dias as Record<string, Ejercicio[]>
          const diasConEjercicios = Object.entries(dias).filter(([, ejs]) => ejs && ejs.length > 0)

          return (
            <div
              key={plan.id}
              className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{ backgroundColor: '#111111', border: '1px solid #222222' }}
            >
              {/* Accordion header */}
              <button
                onClick={() => setExpandido(isOpen ? null : plan.id)}
                className="w-full flex items-center justify-between px-6 py-5 text-left transition-all duration-200 hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                    style={{ backgroundColor: '#161616', border: '1px solid #222222' }}
                  >
                    <span className="text-xs font-bold" style={{ color: '#22c55e' }}>
                      {String(plan.mes).padStart(2, '0')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#f1f5f9' }}>
                      {MESES[plan.mes - 1]} {plan.anio}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs" style={{ color: '#64748b' }}>
                        {diasConEjercicios.length} días
                      </span>
                      {plan.es_manual && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                          style={{ backgroundColor: '#1e293b', color: '#64748b' }}
                        >
                          Manual
                        </span>
                      )}
                      {plan.dieta && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                          style={{ backgroundColor: '#22c55e10', color: '#22c55e' }}
                        >
                          + Dieta
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  color="#475569"
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>

              {/* Accordion body */}
              {isOpen && (
                <div
                  className="px-6 pb-6"
                  style={{ borderTop: '1px solid #222222' }}
                >
                  {/* Tabs */}
                  <div className="flex gap-2 mt-5 mb-5">
                    <button
                      onClick={() => setTabActiva(prev => ({ ...prev, [plan.id]: 'plan' }))}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                      style={tab === 'plan'
                        ? { background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#0a0a0a', boxShadow: '0 4px 12px #22c55e30' }
                        : { backgroundColor: '#161616', color: '#64748b', border: '1px solid #222222' }}
                    >
                      Entrenamiento
                    </button>
                    {plan.dieta && (
                      <button
                        onClick={() => setTabActiva(prev => ({ ...prev, [plan.id]: 'dieta' }))}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                        style={tab === 'dieta'
                          ? { background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#0a0a0a', boxShadow: '0 4px 12px #22c55e30' }
                          : { backgroundColor: '#161616', color: '#64748b', border: '1px solid #222222' }}
                      >
                        Nutrición
                      </button>
                    )}
                  </div>

                  {/* Entrenamiento tab */}
                  {tab === 'plan' && (
                    <div className="space-y-4">
                      {diasConEjercicios.map(([dia, ejercicios]) => (
                        <div key={dia}>
                          <p
                            className="text-xs font-semibold uppercase tracking-wider mb-2"
                            style={{ color: '#22c55e' }}
                          >
                            {DIAS_LABELS[dia] || dia}
                          </p>
                          <div className="space-y-2">
                            {ejercicios.map((ej, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 p-3.5 rounded-xl"
                                style={{ backgroundColor: '#161616', border: '1px solid #222222' }}
                              >
                                <span
                                  className="flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold flex-shrink-0"
                                  style={{ backgroundColor: '#22c55e15', color: '#22c55e' }}
                                >
                                  {i + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="text-sm font-medium" style={{ color: '#f1f5f9' }}>{ej.ejercicio}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs" style={{ color: '#64748b' }}>
                                      {ej.series}×{ej.reps}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs" style={{ color: '#64748b' }}>
                                      <Timer size={10} />
                                      {ej.descanso}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Nutrición tab */}
                  {tab === 'dieta' && plan.dieta && (
                    <div className="space-y-3">
                      {[
                        { label: 'Desayuno', value: plan.dieta.contenido.desayuno, icon: Coffee, color: '#f59e0b' },
                        { label: 'Almuerzo', value: plan.dieta.contenido.almuerzo, icon: Sun, color: '#f97316' },
                        { label: 'Cena', value: plan.dieta.contenido.cena, icon: Moon, color: '#8b5cf6' },
                        { label: 'Snacks', value: plan.dieta.contenido.snacks, icon: UtensilsCrossed, color: '#22c55e' },
                      ].map(({ label, value, icon: Icon, color }) => (
                        <div
                          key={label}
                          className="p-4 rounded-xl"
                          style={{ backgroundColor: '#161616', border: '1px solid #222222' }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon size={13} color={color} />
                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                              {label}
                            </p>
                          </div>
                          <p className="text-sm" style={{ color: '#cbd5e1' }}>{value}</p>
                        </div>
                      ))}
                      {plan.dieta.contenido.macros && (
                        <div className="grid grid-cols-4 gap-2 mt-3">
                          {[
                            { label: 'Kcal', value: plan.dieta.contenido.macros.calorias, unit: '', icon: Flame, color: '#22c55e' },
                            { label: 'Prot', value: plan.dieta.contenido.macros.proteinas, unit: 'g', icon: Zap, color: '#3b82f6' },
                            { label: 'Carbos', value: plan.dieta.contenido.macros.carbos, unit: 'g', icon: TrendingUp, color: '#f97316' },
                            { label: 'Grasas', value: plan.dieta.contenido.macros.grasas, unit: 'g', icon: Droplets, color: '#eab308' },
                          ].map(({ label, value, unit, icon: Icon, color }) => (
                            <div
                              key={label}
                              className="p-3 rounded-xl text-center"
                              style={{ backgroundColor: '#0a0a0a', border: '1px solid #222222' }}
                            >
                              <Icon size={12} color={color} className="mx-auto mb-1.5" />
                              <p className="font-bold text-sm" style={{ color: '#f1f5f9' }}>
                                {value}{unit}
                              </p>
                              <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
