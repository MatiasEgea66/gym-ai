import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Profile {
  id: string
  objetivo: string | null
  nivel: 'principiante' | 'intermedio' | 'avanzado'
  restricciones: string | null
  updated_at: string
}

export interface Ejercicio {
  ejercicio: string
  series: number
  reps: string
  descanso: string
}

export interface DiasPlan {
  lunes?: Ejercicio[]
  martes?: Ejercicio[]
  miercoles?: Ejercicio[]
  jueves?: Ejercicio[]
  viernes?: Ejercicio[]
  sabado?: Ejercicio[]
  domingo?: Ejercicio[]
}

export interface Plan {
  id: string
  user_id: string
  mes: number
  anio: number
  dias: DiasPlan
  es_manual: boolean
  created_at: string
}

export interface Macros {
  proteinas: number
  carbos: number
  grasas: number
  calorias: number
}

export interface DietaContenido {
  desayuno: string
  almuerzo: string
  cena: string
  snacks: string
  macros: Macros
}

export interface Dieta {
  id: string
  user_id: string
  plan_id: string
  contenido: DietaContenido
  created_at: string
}
