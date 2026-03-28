'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GlrLogo from '@/components/GlrLogo'
import { createClient } from '@/lib/supabase'

type AgentTab = 'signin' | 'signup'

// ── Shared dark card style ──
const CARD: React.CSSProperties = {
  background: '#1a1b1d',
  border: '1px solid rgba(141,198,63,0.2)',
}
const DARK_INPUT: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
}

const darkInput =
  'w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-glr-green transition-all'

const lbl = 'block text-xs font-heading font-bold text-white/40 uppercase tracking-wider mb-1.5'

export default function HomePage() {
  const router = useRouter()

  // ── Broker ──
  const [bEmail, setBEmail] = useState('')
  const [bPass, setBPass]   = useState('')
  const [bErr, setBErr]     = useState('')
  const [bLoad, setBLoad]   = useState(false)

  // ── Agent ──
  const [tab, setTab]             = useState<AgentTab>('signin')
  const [aName, setAName]         = useState('')
  const [aPhone, setAPhone]       = useState('')
  const [aEmail, setAEmail]       = useState('')
  const [aPass, setAPass]         = useState('')
  const [aErr, setAErr]           = useState('')
  const [aLoad, setALoad]         = useState(false)
  const [aSuccess, setASuccess]   = useState('')

  // ── Admin modal ──
  const [adminOpen, setAdminOpen]   = useState(false)
  const [adEmail, setAdEmail]       = useState('')
  const [adPass, setAdPass]         = useState('')
  const [adErr, setAdErr]           = useState('')
  const [adLoad, setAdLoad]         = useState(false)

  function closeAdmin() {
    setAdminOpen(false)
    setAdEmail('')
    setAdPass('')
    setAdErr('')
  }

  // ── Handlers ──
  async function handleBroker(e: React.FormEvent) {
    e.preventDefault()
    setBErr('')
    setBLoad(true)
    const sb = createClient()
    const { error } = await sb.auth.signInWithPassword({ email: bEmail, password: bPass })
    if (error) { setBErr(error.message); setBLoad(false) }
    else { router.push('/dashboard'); router.refresh() }
  }

  async function handleAgentSignIn(e: React.FormEvent) {
    e.preventDefault()
    setAErr('')
    setALoad(true)
    const sb = createClient()
    const { error } = await sb.auth.signInWithPassword({ email: aEmail, password: aPass })
    if (error) { setAErr(error.message); setALoad(false) }
    else { router.push('/agent-dashboard'); router.refresh() }
  }

  async function handleAgentSignUp(e: React.FormEvent) {
    e.preventDefault()
    setAErr('')
    setALoad(true)
    const sb = createClient()
    const { data, error } = await sb.auth.signUp({ email: aEmail, password: aPass })
    if (error) { setAErr(error.message); setALoad(false); return }
    if (data.user) {
      await sb.from('agents').insert({
        name: aName, email: aEmail, phone: aPhone,
        active: false, access_leads: false, access_docs: false, access_msgs: false,
      })
    }
    setALoad(false)
    setASuccess('Account created! Check your email to confirm, then sign in.')
    setTab('signin')
    setAName(''); setAPhone(''); setAEmail(''); setAPass('')
  }

  async function handleAdmin(e: React.FormEvent) {
    e.preventDefault()
    setAdErr('')
    setAdLoad(true)
    const sb = createClient()
    const { error } = await sb.auth.signInWithPassword({ email: adEmail, password: adPass })
    if (error) {
      setAdErr(error.message)
      setAdLoad(false)
    } else {
      // Proxy enforces ADMIN_EMAIL → if wrong account, proxy redirects away from /glradmin
      router.push('/glradmin')
      router.refresh()
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: '#2d2e30' }}
    >
      {/* Top green accent bar */}
      <div className="h-1 w-full bg-glr-green flex-shrink-0" />

      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(141,198,63,0.07) 0%, transparent 70%)' }}
      />

      {/* ── Main ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">

        {/* Logo + tagline */}
        <div className="text-center mb-10 animate-fade-up">
          <div className="flex justify-center mb-5">
            <GlrLogo size={54} color="#8DC63F" textColor="#ffffff" />
          </div>
          <p className="font-heading font-bold text-glr-green tracking-[0.3em] uppercase text-sm mb-1">
            Forward. Moving.
          </p>
          <p className="text-white/25 text-xs tracking-widest uppercase font-heading">
            Real Estate Management Portal
          </p>
        </div>

        {/* Two dark cards */}
        <div
          className="flex flex-col md:flex-row gap-4 w-full max-w-2xl animate-fade-up"
          style={{ animationDelay: '100ms' }}
        >

          {/* ══ BROKER PORTAL ══ */}
          <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl" style={CARD}>
            <div className="px-7 pt-6 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-glr-green" />
                <p className="text-xs font-heading font-bold text-glr-green uppercase tracking-widest">
                  Broker Portal
                </p>
              </div>
              <p className="text-white/30 text-xs pl-3.5">Full management access</p>
            </div>

            <form onSubmit={handleBroker} className="px-7 py-6 space-y-4">
              {bErr && (
                <div className="bg-red-900/30 border border-red-500/25 text-red-300 text-xs px-3 py-2.5 rounded-lg">
                  {bErr}
                </div>
              )}
              <div>
                <label className={lbl}>Email</label>
                <input type="email" required autoComplete="email"
                  value={bEmail} onChange={e => setBEmail(e.target.value)}
                  placeholder="broker@glrealty.com"
                  className={darkInput} style={DARK_INPUT} />
              </div>
              <div>
                <label className={lbl}>Password</label>
                <input type="password" required autoComplete="current-password"
                  value={bPass} onChange={e => setBPass(e.target.value)}
                  placeholder="••••••••"
                  className={darkInput} style={DARK_INPUT} />
              </div>
              <button
                type="submit" disabled={bLoad}
                className="w-full font-heading font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-50 hover:brightness-110 mt-1"
                style={{ background: '#8DC63F', color: '#2d2e30' }}
              >
                {bLoad ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>
          </div>

          {/* ══ AGENT PORTAL ══ */}
          <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl" style={CARD}>
            <div className="px-7 pt-6 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <p className="text-xs font-heading font-bold text-white/70 uppercase tracking-widest">
                  Agent Portal
                </p>
              </div>
              <p className="text-white/30 text-xs pl-3.5">Agent access & registration</p>
            </div>

            {/* Tabs */}
            <div className="px-7 pt-5">
              <div className="flex border-b border-white/10">
                {(['signin', 'signup'] as AgentTab[]).map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => { setTab(t); setAErr(''); setASuccess('') }}
                    className={`flex-1 pb-2.5 text-xs font-heading font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
                      tab === t
                        ? 'text-glr-green border-glr-green'
                        : 'text-white/35 border-transparent hover:text-white/60'
                    }`}
                  >
                    {t === 'signin' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>
            </div>

            <form
              key={tab}
              onSubmit={tab === 'signin' ? handleAgentSignIn : handleAgentSignUp}
              className="px-7 py-5 space-y-4"
            >
              {aErr && (
                <div className="bg-red-900/30 border border-red-500/25 text-red-300 text-xs px-3 py-2.5 rounded-lg">
                  {aErr}
                </div>
              )}
              {aSuccess && (
                <div className="bg-glr-green/15 border border-glr-green/30 text-glr-green text-xs px-3 py-2.5 rounded-lg">
                  {aSuccess}
                </div>
              )}

              {tab === 'signup' && (
                <>
                  <div>
                    <label className={lbl}>Full Name</label>
                    <input required placeholder="Jane Smith"
                      value={aName} onChange={e => setAName(e.target.value)}
                      className={darkInput} style={DARK_INPUT} />
                  </div>
                  <div>
                    <label className={lbl}>Phone</label>
                    <input placeholder="+1 (555) 000-0000"
                      value={aPhone} onChange={e => setAPhone(e.target.value)}
                      className={darkInput} style={DARK_INPUT} />
                  </div>
                </>
              )}

              <div>
                <label className={lbl}>Email</label>
                <input type="email" required placeholder="agent@example.com"
                  value={aEmail} onChange={e => setAEmail(e.target.value)}
                  className={darkInput} style={DARK_INPUT} />
              </div>
              <div>
                <label className={lbl}>Password</label>
                <input type="password" required minLength={6} placeholder="••••••••"
                  value={aPass} onChange={e => setAPass(e.target.value)}
                  className={darkInput} style={DARK_INPUT} />
              </div>

              <button
                type="submit" disabled={aLoad}
                className="w-full font-heading font-bold py-3 rounded-xl text-sm text-white/90 transition-all disabled:opacity-50 hover:brightness-125 mt-1"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                {aLoad
                  ? (tab === 'signin' ? 'Signing in…' : 'Creating account…')
                  : (tab === 'signin' ? 'Sign In →' : 'Create Account →')}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/15 text-xs mt-8 tracking-widest uppercase font-heading animate-fade-up" style={{ animationDelay: '200ms' }}>
          GreenLight Realty &copy; {new Date().getFullYear()}
        </p>
      </div>

      {/* ══ Hidden admin dot — bottom right ══ */}
      <button
        onClick={() => setAdminOpen(true)}
        className="fixed bottom-4 right-4 z-40 w-[6px] h-[6px] rounded-full transition-all duration-300"
        style={{ background: 'rgba(255,255,255,0.25)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(141,198,63,0.6)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
        aria-hidden="true"
      />

      {/* ══ Admin modal overlay ══ */}
      {adminOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeAdmin() }}
        >
          <div
            className="w-full max-w-sm rounded-2xl shadow-2xl animate-fade-in"
            style={{ background: '#1a1b1d', border: '1px solid rgba(141,198,63,0.25)' }}
          >
            {/* Modal header */}
            <div className="px-7 pt-7 pb-5 text-center border-b border-white/[0.06]">
              <div className="flex justify-center mb-4">
                <GlrLogo size={36} color="#8DC63F" textColor="#ffffff" />
              </div>
              <h2 className="font-heading font-bold text-white text-lg">Admin Access</h2>
              <p className="text-white/30 text-xs mt-1">Restricted area</p>
            </div>

            <form onSubmit={handleAdmin} className="px-7 py-6 space-y-4">
              {adErr && (
                <div className="bg-red-900/30 border border-red-500/25 text-red-300 text-xs px-3 py-2.5 rounded-lg text-center">
                  {adErr}
                </div>
              )}
              <div>
                <label className={lbl}>Email</label>
                <input type="email" required autoFocus
                  placeholder="admin@glrealty.com"
                  value={adEmail} onChange={e => setAdEmail(e.target.value)}
                  className={darkInput} style={DARK_INPUT} />
              </div>
              <div>
                <label className={lbl}>Password</label>
                <input type="password" required
                  placeholder="••••••••"
                  value={adPass} onChange={e => setAdPass(e.target.value)}
                  onKeyDown={e => e.key === 'Escape' && closeAdmin()}
                  className={darkInput} style={DARK_INPUT} />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit" disabled={adLoad}
                  className="flex-1 font-heading font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 hover:brightness-110"
                  style={{ background: '#8DC63F', color: '#2d2e30' }}
                >
                  {adLoad ? 'Signing in…' : 'Sign In →'}
                </button>
                <button
                  type="button" onClick={closeAdmin}
                  className="px-4 py-2.5 rounded-xl text-sm text-white/35 hover:text-white/60 transition-colors font-heading"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
