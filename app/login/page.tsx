'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code.length < 4) {
      setError('Inserisci un codice valido (min. 4 caratteri)')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/clients/${code}`)
      if (res.ok) {
        router.push('/dashboard')
      } else if (res.status === 403) {
        setError('Subscription non attiva. Contattaci per rinnovarla.')
      } else {
        setError('Codice non valido. Verifica e riprova.')
      }
    } catch {
      setError('Errore di connessione. Riprova tra qualche istante.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0A0A0F]"
          style={{ background: 'linear-gradient(135deg, #0A0A0F 0%, #0D1B2A 50%, #0A0A0F 100%)' }}>
      <div className="w-full max-w-md px-6">
        {/* Card glassmorphism */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B2</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">B2B Finder</span>
            </div>
            <p className="text-[#A0A0B0] text-sm">Gare pubbliche personalizzate per la tua azienda</p>
          </div>

          <h1 className="text-white text-xl font-semibold mb-6 text-center">
            Accedi alla tua dashboard
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#A0A0B0] text-sm mb-2" htmlFor="code">
                Codice Cliente
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.trim())}
                placeholder="es. 2134"
                maxLength={10}
                autoFocus
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg tracking-widest"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || code.length < 4}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all
                         bg-gradient-to-r from-emerald-500 to-emerald-600
                         hover:from-emerald-400 hover:to-emerald-500
                         disabled:opacity-40 disabled:cursor-not-allowed
                         shadow-lg shadow-emerald-500/20"
            >
              {loading ? 'Verifica in corso…' : 'Accedi'}
            </button>
          </form>

          <p className="mt-6 text-center text-[#6B6B7B] text-sm">
            Non hai un codice?{' '}
            <a href="mailto:info@b2b-finder.it" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Contattaci
            </a>
          </p>
        </div>

        <p className="mt-6 text-center text-[#6B6B7B] text-xs">
          © 2026 B2B Finder | Powered by AI
        </p>
      </div>
    </main>
  )
}
