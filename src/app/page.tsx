'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GlrLogo from '@/components/GlrLogo'
import { createClient } from '@/lib/supabase'

const CARD: React.CSSProperties = {
  background: '#1a1b1d',
  border: '1px solid rgba(141,198,63,0.18)',
}
const INPUT_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
}

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-glr-green transition-all'
const labelCls =
  'block text-xs font-heading font-bold text-white/40 uppercase tracking-wider mb-1.5'

export default function HomePage() {
  const router = useRouter()

  // ── Broker ──
  const [bEmail, setBEmail] = useState('')
  const [bPass, setBPass]   = useState('')
  const [bErr, setBErr]     = useState('')
  const [bLoad, setBLoad]   = useState(false)

  // ── Agent ──
  const [agentMode, setAgentMode] = useState<'signin' | 'signup'>('signin')
  const [aEmail, setAEmail]       = useState('')
  const [aPass, setAPass]         = useState('')
  const [aName, setAName]         = useState('')
  const [aPhone, setAPhone]       = useState('')
  const [aErr, setAErr]           = useState('')
  const [aLoad, setALoad]         = useState(false)

  // ── Admin modal ──
  const [adminOpen, setAdminOpen] = useState(false)
  const [adEmail, setAdEmail]     = useState('')
  const [adPass, setAdPass]       = useState('')
  const [adErr, setAdErr]         = useState('')
  const [adLoad, setAdLoad]       = useState(false)

  function closeAdmin() {
    setAdminOpen(false)
    setAdEmail('')
    setAdPass('')
    setAdErr('')
  }

  // ── Broker handler ──
  async function handleBroker(e: React.FormEvent) {
    e.preventDefault()
    setBErr('')
    setBLoad(true)
    const sb = createClient()
    const { data, error } = await sb.auth.signInWithPassword({ email: bEmail, password: bPass })
    if (error) { setBErr(error.message); setBLoad(false); return }
    const brokerEmail = process.env.NEXT_PUBLIC_BROKER_EMAIL ?? 'broker@glrealty.com'
    if (data.user?.email !== brokerEmail) {
      await sb.auth.signOut()
      setBErr('Access denied.')
      setBLoad(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  // ── Agent sign in ──
  async function handleAgentSignIn(e: React.FormEvent) {
    e.preventDefault()
    setAErr('')
    setALoad(true)
    const sb = createClient()
    const { data, error } = await sb.auth.signInWithPassword({ email: aEmail, password: aPass })
    if (error) { setAErr(error.message); setALoad(false); return }
    const { data: rows } = await sb
      .from('agents')
      .select('id')
      .eq('email', data.user?.email ?? '')
      .limit(1)
    if (!rows || rows.length === 0) {
      await sb.auth.signOut()
      setAErr('No agent account found. Please sign up.')
      setALoad(false)
      return
    }
    router.push('/agent-dashboard')
    router.refresh()
  }

  // ── Agent sign up ──
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
    router.push('/agent-dashboard')
    router.refresh()
  }

  // ── Admin handler ──
  async function handleAdmin(e: React.FormEvent) {
    e.preventDefault()
    setAdErr('')
    setAdLoad(true)
    const sb = createClient()
    const { data, error } = await sb.auth.signInWithPassword({ email: adEmail, password: adPass })
    if (error) { setAdErr(error.message); setAdLoad(false); return }
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'admin@glrealty.com'
    if (data.user?.email !== adminEmail) {
      await sb.auth.signOut()
      setAdErr('Access denied.')
      setAdLoad(false)
      return
    }
    router.push('/glradmin')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: '#2d2e30' }}
    >
      <div className="h-1 w-full bg-glr-green flex-shrink-0" />

      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(141,198,63,0.06) 0%, transparent 70%)',
        }}
      />

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

        {/* Two cards */}
        <div
          className="flex flex-col md:flex-row gap-4 w-full max-w-2xl animate-fade-up"
          style={{ animationDelay: '100ms' }}
        >

          {/* ── BROKER LOGIN ── */}
          <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl" style={CARD}>
            <div className="px-7 pt-6 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-glr-green" />
                <p className="text-xs font-heading font-bold text-glr-green uppercase tracking-widest">
                  Broker Login
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
                <label className={labelCls}>Email</label>
                <input
                  type="email" required autoComplete="email"
                  placeholder="broker@glrealty.com"
                  value={bEmail} onChange={e => setBEmail(e.target.value)}
                  className={inputCls} style={INPUT_STYLE}
                />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input
                  type="password" required autoComplete="current-password"
                  placeholder="••••••••"
                  value={bPass} onChange={e => setBPass(e.target.value)}
                  className={inputCls} style={INPUT_STYLE}
                />
              </div>
              <button
                type="submit" disabled={bLoad}
                className="w-full font-heading font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-50 hover:brightness-110"
                style={{ background: '#8DC63F', color: '#2d2e30' }}
              >
                {bLoad ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* ── AGENT LOGIN ── */}
          <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl" style={CARD}>
            <div className="px-7 pt-6 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <p className="text-xs font-heading font-bold text-white/70 uppercase tracking-widest">
                  Agent Login
                </p>
              </div>
              <p className="text-white/30 text-xs pl-3.5">Agent access &amp; registration</p>
            </div>

            {agentMode === 'signin' ? (
              <form onSubmit={handleAgentSignIn} className="px-7 py-6 space-y-4">
                {aErr && (
                  <div className="bg-red-900/30 border border-red-500/25 text-red-300 text-xs px-3 py-2.5 rounded-lg">
                    {aErr}
                  </div>
                )}
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    type="email" required placeholder="agent@example.com"
                    value={aEmail} onChange={e => setAEmail(e.target.value)}
                    className={inputCls} style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <input
                    type="password" required placeholder="••••••••"
                    value={aPass} onChange={e => setAPass(e.target.value)}
                    className={inputCls} style={INPUT_STYLE}
                  />
                </div>
                <button
                  type="submit" disabled={aLoad}
                  className="w-full font-heading font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-50 hover:brightness-110"
                  style={{ background: '#8DC63F', color: '#ffffff' }}
                >
                  {aLoad ? 'Signing in...' : 'Sign In'}
                </button>
                <p className="text-center text-white/30 text-xs pt-1">
                  No account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAgentMode('signup'); setAErr('') }}
                    className="text-glr-green hover:underline font-medium"
                  >
                    Create one
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleAgentSignUp} className="px-7 py-5 space-y-3.5">
                {aErr && (
                  <div className="bg-red-900/30 border border-red-500/25 text-red-300 text-xs px-3 py-2.5 rounded-lg">
                    {aErr}
                  </div>
                )}
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input
                    required placeholder="Jane Smith"
                    value={aName} onChange={e => setAName(e.target.value)}
                    className={inputCls} style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    type="email" required placeholder="agent@example.com"
                    value={aEmail} onChange={e => setAEmail(e.target.value)}
                    className={inputCls} style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input
                    placeholder="+1 (555) 000-0000"
                    value={aPhone} onChange={e => setAPhone(e.target.value)}
                    className={inputCls} style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <input
                    type="password" required minLength={6} placeholder="••••••••"
                    value={aPass} onChange={e => setAPass(e.target.value)}
                    className={inputCls} style={INPUT_STYLE}
                  />
                </div>
                <button
                  type="submit" disabled={aLoad}
                  className="w-full font-heading font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-50 hover:brightness-110"
                  style={{ background: '#8DC63F', color: '#ffffff' }}
                >
                  {aLoad ? 'Creating account...' : 'Create Account'}
                </button>
                <p className="text-center text-white/30 text-xs pt-1">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAgentMode('signin'); setAErr('') }}
                    className="text-glr-green hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        <p
          className="text-white/15 text-xs mt-8 tracking-widest uppercase font-heading animate-fade-up"
          style={{ animationDelay: '200ms' }}
        >
          GreenLight Realty &copy; {new Date().getFullYear()}
        </p>
      </div>

      {/* ── Hidden admin dot — bottom right ── */}
      <button
        onClick={() => setAdminOpen(true)}
        className="fixed bottom-4 right-4 z-40 w-[5px] h-[5px] rounded-full transition-all duration-300"
        style={{ background: 'rgba(141,198,63,0.2)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(141,198,63,0.6)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(141,198,63,0.2)')}
        aria-hidden="true"
      />

      {/* ── Admin modal ── */}
      {adminOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeAdmin() }}
        >
          <div
            className="w-full max-w-sm rounded-2xl shadow-2xl animate-fade-up"
            style={{ background: '#1a1b1d', border: '1px solid rgba(141,198,63,0.25)' }}
          >
            <div className="px-7 pt-7 pb-5 text-center border-b border-white/[0.06]">
              <div className="flex justify-center mb-4">
                <GlrLogo size={36} color="#8DC63F" textColor="#ffffff" />
              </div>
              <h2 className="font-heading font-bold text-white text-lg">Admin</h2>
              <p className="text-white/30 text-xs mt-1">Restricted access</p>
            </div>
            <form onSubmit={handleAdmin} className="px-7 py-6 space-y-4">
              {adErr && (
                <div className="bg-red-900/30 border border-red-500/25 text-red-300 text-xs px-3 py-2.5 rounded-lg text-center">
                  {adErr}
                </div>
              )}
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email" required autoFocus
                  placeholder="admin@glrealty.com"
                  value={adEmail} onChange={e => setAdEmail(e.target.value)}
                  className={inputCls} style={INPUT_STYLE}
                />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input
                  type="password" required
                  placeholder="••••••••"
                  value={adPass} onChange={e => setAdPass(e.target.value)}
                  onKeyDown={e => e.key === 'Escape' && closeAdmin()}
                  className={inputCls} style={INPUT_STYLE}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit" disabled={adLoad}
                  className="flex-1 font-heading font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 hover:brightness-110"
                  style={{ background: '#8DC63F', color: '#2d2e30' }}
                >
                  {adLoad ? 'Signing in...' : 'Sign In'}
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
