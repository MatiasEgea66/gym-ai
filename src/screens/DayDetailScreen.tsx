import { ChevronLeft, Play } from 'lucide-react'
import type { Day } from '../data/plan'
import { getLastWeight } from '../lib/storage'
import { C } from '../lib/colors'

type Props = { day: Day; onBack: () => void; onStart: () => void }

export default function DayDetailScreen({ day, onBack, onStart }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: C.bg }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 30, display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(12,14,26,0.92)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onBack} style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <ChevronLeft size={20} color={C.text} />
        </button>
        <div>
          <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', color: C.accent, marginBottom: '1px' }}>{day.dayLabel}</p>
          <h1 style={{ fontSize: '15px', fontWeight: '700', color: C.text, letterSpacing: '-0.3px' }}>{day.title}</h1>
        </div>
      </header>

      <div style={{ flex: 1, maxWidth: '480px', width: '100%', margin: '0 auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {day.note && (
          <div style={{ background: 'rgba(255,184,77,0.1)', border: '1px solid rgba(255,184,77,0.2)', borderRadius: '14px', padding: '14px 16px', fontSize: '13px', color: '#FFB84D', lineHeight: '1.5' }}>
            ⚠️ {day.note}
          </div>
        )}

        {day.blocks.map((block) => (
          <section key={block.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '700', color: C.text }}>{block.title}</h2>
              {block.rounds && (
                <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.border}`, borderRadius: '20px', fontSize: '11px', fontWeight: '500', color: C.dim }}>
                  {block.rounds} vueltas
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {block.exercises.map((ex) => {
                const lastWeight = getLastWeight(ex.id)
                return (
                  <div key={ex.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: C.text }}>{ex.name}</p>
                      <span style={{ flexShrink: 0, padding: '3px 8px', background: C.accentSubtle, borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: C.accent }}>{ex.target}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: C.muted, lineHeight: '1.5' }}>{ex.description}</p>
                    {lastWeight && <p style={{ fontSize: '12px', color: C.dim, marginTop: '6px' }}>Último peso: {lastWeight} kg</p>}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div style={{ position: 'sticky', bottom: 0, background: 'rgba(12,14,26,0.92)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderTop: `1px solid ${C.border}`, padding: '12px 20px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
        <button onClick={onStart} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', maxWidth: '480px', margin: '0 auto', padding: '15px', background: C.gradient, border: 'none', borderRadius: '14px', color: '#fff', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,200,150,0.25)' }}>
          <Play size={17} fill="white" strokeWidth={0} /> Comenzar entrenamiento
        </button>
      </div>
    </div>
  )
}
