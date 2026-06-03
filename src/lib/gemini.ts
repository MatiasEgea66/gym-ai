import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Profile, DiasPlan, DietaContenido } from './supabase'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export interface PlanGenerado {
  plan: DiasPlan
  dieta: DietaContenido
}

export async function generarPlanMensual(
  perfil: Profile,
  planAnterior: DiasPlan | null
): Promise<PlanGenerado> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `Eres un entrenador personal y nutricionista experto. Genera un plan de entrenamiento semanal y una dieta mensual personalizados.

PERFIL DEL USUARIO:
- Objetivo: ${perfil.objetivo || 'No especificado'}
- Nivel: ${perfil.nivel}
- Restricciones: ${perfil.restricciones || 'Ninguna'}

${planAnterior ? `PLAN ANTERIOR (para continuar progresando y variar ejercicios):
${JSON.stringify(planAnterior, null, 2)}` : 'Este es el primer plan del usuario.'}

Devuelve ÚNICAMENTE un JSON válido (sin markdown, sin bloques de código, sin texto adicional) con esta estructura exacta:
{
  "plan": {
    "lunes": [{"ejercicio": "nombre", "series": 3, "reps": "12", "descanso": "60s"}],
    "martes": [...],
    "miercoles": [...],
    "jueves": [...],
    "viernes": [...],
    "sabado": [...],
    "domingo": []
  },
  "dieta": {
    "desayuno": "descripción del desayuno",
    "almuerzo": "descripción del almuerzo",
    "cena": "descripción de la cena",
    "snacks": "descripción de snacks",
    "macros": {
      "proteinas": 150,
      "carbos": 250,
      "grasas": 70,
      "calorias": 2200
    }
  }
}

Adapta el plan al nivel y objetivo. Varía respecto al plan anterior si existe. Los días de descanso pueden tener array vacío o ejercicios de movilidad suaves.`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  // Strip markdown code blocks if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()

  try {
    const parsed = JSON.parse(cleaned)
    return parsed as PlanGenerado
  } catch {
    // Try to extract JSON object from response
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      return JSON.parse(match[0]) as PlanGenerado
    }
    throw new Error('No se pudo parsear la respuesta de la IA')
  }
}
