import { useState } from 'react'
import { X, Share } from 'lucide-react'
import { C } from '../lib/colors'

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  return (navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches
}

export default function InstallPrompt() {
  const [dismissed, setDismissed] = useState(() => !!sessionStorage.getItem('install-dismissed'))

  if (!isIOS() || isStandalone() || dismissed) return null

  function dismiss() {
    sessionStorage.setItem('install-dismissed', '1')
    setDismissed(true)
  }

  return (
    <div style={{ position: 'fixed', bottom: '80px', left: '16px', right: '16px', zIndex: 50, maxWidth: '448px', margin: '0 auto' }}>
      <div style={{ background: C.card, border: `1px solid ${C.borderStrong}`, borderRadius: '18px', padding: '16px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #7BBF7B, #4A8A4A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Share size={18} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '14px', fontWeight: '700', color: C.text, marginBottom: '3px' }}>Instalá Forge</p>
          <p style={{ fontSize: '12px', color: C.muted, lineHeight: '1.5' }}>
            Tocá <strong style={{ color: C.text }}>Compartir</strong> <Share size={11} color={C.text} style={{ display: 'inline', verticalAlign: 'middle' }} /> y después <strong style={{ color: C.text }}>"Agregar a pantalla de inicio"</strong> para usar sin el navegador.
          </p>
        </div>
        <button onClick={dismiss} style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={14} color={C.dim} />
        </button>
      </div>
    </div>
  )
}
