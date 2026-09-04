const CRED_KEY = 'gymai:passkey:credId'
const REFRESH_KEY = 'gymai:passkey:refresh'

export function isPasskeySupported(): boolean {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential
}

export function hasPasskey(): boolean {
  return !!localStorage.getItem(CRED_KEY)
}

function b64encode(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function b64decode(str: string): Uint8Array {
  return Uint8Array.from(atob(str), c => c.charCodeAt(0))
}

export async function registerPasskey(userId: string, email: string): Promise<boolean> {
  if (!isPasskeySupported()) return false
  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: 'Forge', id: window.location.hostname },
        user: {
          id: new TextEncoder().encode(userId),
          name: email,
          displayName: email,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
      },
    }) as PublicKeyCredential | null
    if (!credential) return false
    localStorage.setItem(CRED_KEY, b64encode(credential.rawId))
    return true
  } catch {
    return false
  }
}

export async function authenticateWithPasskey(): Promise<boolean> {
  const stored = localStorage.getItem(CRED_KEY)
  if (!stored) return false
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rpId: window.location.hostname,
        allowCredentials: [{ id: b64decode(stored), type: 'public-key' }],
        userVerification: 'required',
        timeout: 60000,
      },
    }) as PublicKeyCredential | null
    return !!assertion
  } catch {
    return false
  }
}

export function storeRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_KEY, token)
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function clearPasskey(): void {
  localStorage.removeItem(CRED_KEY)
  localStorage.removeItem(REFRESH_KEY)
}
