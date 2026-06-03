import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Dieta as DietaType } from '../lib/supabase'
import { Apple, Coffee, Sun, Moon, UtensilsCrossed, Flame, Zap, Droplets, TrendingUp } from 'lucide-react'

export function Dieta() {
  const { user } = useAuth()
  const [dieta, setDieta] = useState<DietaType | null>(null)
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const mes = now.getMonth() + 1
  const anio = now.getFullYear()

  useEffect(() => {
    if (!user) return
    // Get the current month's plan, then its diet
    supabase
      .from('plans')
      .select('id')
      .eq('user_id', user.id)
      .eq('mes', mes)
      .eq('anio', anio)
      .maybeSingle()
      .then(({ data: plan }) => {
        if (!plan) {
          setLoading(false)
          return
        }
        return supabase
          .from('diets')
          .select('*')
          .eq('plan_id', plan.id)
          .maybeSingle()
          .then(({ data }) => {
            setDieta(data)
            setLoading(false)
          })
      })
  }, [user, mes, anio])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm" style={{ color: '#475569' }}>Cargando dieta...</div>
      </div>
    )
  }

  const mesLabel = new Date(anio, mes - 1).toLocaleString('es', { month: 'long', year: 'numeric' })
  const mesCapitalized = mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1)

  if (!dieta) {
    return (
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ backgroundColor: '#22c55e15', border: '1px solid #22c55e30' }}
          >
            <Apple size={18} color="#22c55e" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: '#f1f5f9' }}>
            Dieta — {mesCapitalized}
          </h1>
        </div>

        {/* Empty state */}
        <div
          className="flex flex-col items-center py-16 rounded-2xl"
          style={{ backgroundColor: '#111111', border: '1px solid #222222' }}
        >
          <UtensilsCrossed size={40} color="#333" className="mb-4" />
          <h3 className="font-semibold mb-2" style={{ color: '#f1f5f9' }}>Sin dieta para este mes</h3>
          <p className="text-sm text-center max-w-xs" style={{ color: '#64748b' }}>
            Generá un plan completo con IA desde tu Perfil para obtener tu dieta personalizada.
          </p>
        </div>
      </div>
    )
  }

  const { contenido } = dieta

  const comidas = [
    { label: 'Desayuno', value: contenido.desayuno, icon: Coffee, color: '#f59e0b' },
    { label: 'Almuerzo', value: contenido.almuerzo, icon: Sun, color: '#f97316' },
    { label: 'Cena', value: contenido.cena, icon: Moon, color: '#8b5cf6' },
    { label: 'Snacks', value: contenido.snacks, icon: UtensilsCrossed, color: '#22c55e' },
  ]

  const macros = contenido.macros ? [
    { label: 'Calorías', value: contenido.macros.calorias, unit: 'kcal', icon: Flame, color: '#22c55e', progress: 100 },
    { label: 'Proteínas', value: contenido.macros.proteinas, unit: 'g', icon: Zap, color: '#3b82f6', progress: 75 },
    { label: 'Carbos', value: contenido.macros.carbos, unit: 'g', icon: TrendingUp, color: '#f97316', progress: 60 },
    { label: 'Grasas', value: contenido.macros.grasas, unit: 'g', icon: Droplets, color: '#eab308', progress: 40 },
  ] : null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ backgroundColor: '#22c55e15', border: '1px solid #22c55e30' }}
        >
          <Apple size={18} color="#22c55e" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#f1f5f9' }}>
            Dieta — {mesCapitalized}
          </h1>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: '#22c55e15', color: '#22c55e', border: '1px solid #22c55e30' }}
          >
            Activa
          </span>
        </div>
      </div>

      {/* Meals grid */}
      <div className="grid gap-4 mb-6">
        {comidas.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl p-5 transition-all duration-200"
            style={{ backgroundColor: '#111111', border: '1px solid #222222' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
              >
                <Icon size={16} color={color} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                {label}
              </p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Macros */}
      {macros && (
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: '#111111', border: '1px solid #222222' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-5" style={{ color: '#64748b' }}>
            Macros diarios
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {macros.map(({ label, value, unit, icon: Icon, color, progress }) => (
              <div
                key={label}
                className="p-4 rounded-xl"
                style={{ backgroundColor: '#161616', border: '1px solid #222222' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={14} color={color} />
                  <span className="text-xs font-medium" style={{ color: '#64748b' }}>{label}</span>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>{value}</span>
                  <span className="text-xs" style={{ color: '#475569' }}>{unit}</span>
                </div>
                {/* Progress bar */}
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: '#222222' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
