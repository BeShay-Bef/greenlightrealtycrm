'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import GlrLogo from '@/components/GlrLogo'

const supabase = createClient()

const card: React.CSSProperties = { background: '#1a1b1d', border: '1px solid rgba(141,198,63,0.18)' }
const inp: React.CSSProperties  = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-glr-green'
const labelCls = 'block text-xs font-heading font-bold text-white/40 uppercase tracking-wider mb-1.5'
const btnGreen = 'w-full font-heading font-bold py-3 rounded-xl text-sm hover:brightness-110 disabled:opacity-50'

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

export default function HomePage() {

  // ── Broker ──
  const [bEmail,   setBEmail]   = useState('')
  const [bPass,    setBPass]    = useState('')
  const [bErr,     setBErr]     = useState('')
  const [bBusy,    setBBusy]    = useState(false)
  const [bShowPw,  setBShowPw]  = useState(false)

  const brokerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setBErr(''); setBBusy(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email: bEmail, password: bPass })
    if (error) { setBErr('Invalid credentials'); setBBusy(false); return }
    if (data.user.email !== 'broker@glrealty.com') {
      await supabase.auth.signOut()
      setBErr('Access denied'); setBBusy(false); return
    }
    await delay(500)
    window.location.href = '/dashboard'
  }

  // ── Agent ──
  const [aMode,   setAMode]   = useState<'in' | 'up'>('in')
  const [aName,   setAName]   = useState('')
  const [aPhone,  setAPhone]  = useState('')
  const [aEmail,  setAEmail]  = useState('')
  const [aPass,   setAPass]   = useState('')
  const [aErr,    setAErr]    = useState('')
  const [aInfo,   setAInfo]   = useState('')
  const [aBusy,   setABusy]   = useState(false)
  const [aShowPw, setAShowPw] = useState(false)

  const agentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAErr(''); setABusy(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email: aEmail, password: aPass })
    if (error) { setAErr('Invalid credentials'); setABusy(false); return }
    // Check approval status
    const { data: row } = await supabase
      .from('agents').select('active').eq('email', data.user?.email ?? '').single()
    if (row && row.active === false) {
      await supabase.auth.signOut()
      setAErr('Your account is pending broker approval.'); setABusy(false); return
    }
    await delay(500)
    window.location.href = '/agent-dashboard'
  }

  const agentSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setAErr(''); setABusy(true)
    const { data, error } = await supabase.auth.signUp({ email: aEmail, password: aPass, options: { data: { name: aName, phone: aPhone } } })
    if (error) { setAErr(error.message); setABusy(false); return }
    if (data.user) {
      await supabase.from('agents').insert({
        name: aName, email: aEmail, phone: aPhone,
        active: false, access_leads: false, access_docs: false, access_msgs: false,
      })
    }
    setABusy(false)
    setAMode('in')
    setAEmail(''); setAPass(''); setAName(''); setAPhone('')
    setAInfo('Account created! Awaiting broker approval before you can sign in.')
  }

  // ── Admin ──
  const [adOpen,   setAdOpen]   = useState(false)
  const [adEmail,  setAdEmail]  = useState('')
  const [adPass,   setAdPass]   = useState('')
  const [adErr,    setAdErr]    = useState('')
  const [adBusy,   setAdBusy]   = useState(false)
  const [adShowPw, setAdShowPw] = useState(false)

  const adminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdErr(''); setAdBusy(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email: adEmail, password: adPass })
    if (error) { setAdErr('Access denied'); setAdBusy(false); return }
    if (data.user.email !== 'admin@glrealty.com') {
      await supabase.auth.signOut()
      setAdErr('Access denied'); setAdBusy(false); return
    }
    await delay(500)
    window.location.href = '/glradmin'
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#2d2e30' }}>
      <div className="h-1 bg-glr-green" />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <GlrLogo size={52} color="#8DC63F" textColor="#ffffff" />
          </div>
          <p className="font-heading font-bold text-glr-green tracking-[0.3em] uppercase text-sm">
            Forward. Moving.
          </p>
          <p className="text-white/25 text-xs tracking-widest uppercase font-heading mt-1">
            Real Estate Management Portal
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl">

          {/* BROKER */}
          <div className="flex-1 rounded-2xl shadow-2xl overflow-hidden" style={card}>
            <div className="px-7 pt-6 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-glr-green" />
                <span className="text-xs font-heading font-bold text-glr-green uppercase tracking-widest">Broker Login</span>
              </div>
              <p className="text-white/30 text-xs mt-0.5 pl-3.5">Full management access</p>
            </div>
            <form onSubmit={brokerLogin} className="px-7 py-6 space-y-4">
              {bErr && <p className="text-red-400 text-xs bg-red-900/30 border border-red-500/25 px-3 py-2.5 rounded-lg">{bErr}</p>}
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" required placeholder="broker@glrealty.com"
                  value={bEmail} onChange={e => setBEmail(e.target.value)}
                  className={inputCls} style={inp} />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <input type={bShowPw ? 'text' : 'password'} required placeholder="••••••••"
                    value={bPass} onChange={e => setBPass(e.target.value)}
                    className={inputCls + ' pr-14'} style={inp} />
                  <button type="button" onClick={() => setBShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-heading font-bold text-glr-green hover:brightness-110">
                    {bShowPw ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={bBusy} className={btnGreen} style={{ background: '#8DC63F', color: '#2d2e30' }}>
                {bBusy ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* AGENT */}
          <div className="flex-1 rounded-2xl shadow-2xl overflow-hidden" style={card}>
            <div className="px-7 pt-6 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span className="text-xs font-heading font-bold text-white/70 uppercase tracking-widest">Agent Login</span>
              </div>
              <p className="text-white/30 text-xs mt-0.5 pl-3.5">Agent access &amp; registration</p>
            </div>

            {aMode === 'in' ? (
              <form onSubmit={agentLogin} className="px-7 py-6 space-y-4">
                {aInfo && <p className="text-glr-green text-xs bg-glr-green/10 border border-glr-green/25 px-3 py-2.5 rounded-lg">{aInfo}</p>}
                {aErr && <p className="text-red-400 text-xs bg-red-900/30 border border-red-500/25 px-3 py-2.5 rounded-lg">{aErr}</p>}
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" required placeholder="agent@example.com"
                    value={aEmail} onChange={e => setAEmail(e.target.value)}
                    className={inputCls} style={inp} />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <div className="relative">
                    <input type={aShowPw ? 'text' : 'password'} required placeholder="••••••••"
                      value={aPass} onChange={e => setAPass(e.target.value)}
                      className={inputCls + ' pr-14'} style={inp} />
                    <button type="button" onClick={() => setAShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-heading font-bold text-glr-green hover:brightness-110">
                      {aShowPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={aBusy} className={btnGreen} style={{ background: '#8DC63F', color: '#fff' }}>
                  {aBusy ? 'Signing in...' : 'Sign In'}
                </button>
                <p className="text-center text-white/30 text-xs">
                  No account?{' '}
                  <button type="button" onClick={() => { setAMode('up'); setAErr(''); setAInfo(''); setAShowPw(false) }}
                    className="text-glr-green hover:underline">Create one</button>
                </p>
              </form>
            ) : (
              <form onSubmit={agentSignup} className="px-7 py-5 space-y-3.5">
                {aErr && <p className="text-red-400 text-xs bg-red-900/30 border border-red-500/25 px-3 py-2.5 rounded-lg">{aErr}</p>}
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input required placeholder="Jane Smith"
                    value={aName} onChange={e => setAName(e.target.value)}
                    className={inputCls} style={inp} />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" required placeholder="agent@example.com"
                    value={aEmail} onChange={e => setAEmail(e.target.value)}
                    className={inputCls} style={inp} />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input placeholder="+1 (555) 000-0000"
                    value={aPhone} onChange={e => setAPhone(e.target.value)}
                    className={inputCls} style={inp} />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <div className="relative">
                    <input type={aShowPw ? 'text' : 'password'} required minLength={6} placeholder="••••••••"
                      value={aPass} onChange={e => setAPass(e.target.value)}
                      className={inputCls + ' pr-14'} style={inp} />
                    <button type="button" onClick={() => setAShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-heading font-bold text-glr-green hover:brightness-110">
                      {aShowPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={aBusy} className={btnGreen} style={{ background: '#8DC63F', color: '#fff' }}>
                  {aBusy ? 'Creating account...' : 'Create Account'}
                </button>
                <p className="text-center text-white/30 text-xs">
                  Have an account?{' '}
                  <button type="button" onClick={() => { setAMode('in'); setAErr(''); setAInfo(''); setAShowPw(false) }}
                    className="text-glr-green hover:underline">Sign in</button>
                </p>
              </form>
            )}
          </div>
        </div>

        <p className="text-white/15 text-xs mt-8 tracking-widest uppercase font-heading">
          GreenLight Realty &copy; {new Date().getFullYear()}
        </p>
      </div>

      {/* Admin dot */}
      <button
        onClick={() => setAdOpen(true)}
        className="fixed bottom-4 right-4 z-40 w-[5px] h-[5px] rounded-full transition-all duration-300"
        style={{ background: 'rgba(141,198,63,0.2)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(141,198,63,0.6)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(141,198,63,0.2)')}
        aria-hidden="true"
      />

      {/* Admin modal */}
      {adOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setAdOpen(false) }}
        >
          <div className="w-full max-w-sm rounded-2xl shadow-2xl" style={{ background: '#1a1b1d', border: '1px solid rgba(141,198,63,0.25)' }}>
            <div className="px-7 pt-7 pb-5 text-center border-b border-white/[0.06]">
              <div className="flex justify-center mb-4">
                <GlrLogo size={36} color="#8DC63F" textColor="#ffffff" />
              </div>
              <h2 className="font-heading font-bold text-white text-lg">Admin</h2>
              <p className="text-white/30 text-xs mt-1">Restricted access</p>
            </div>
            <form onSubmit={adminLogin} className="px-7 py-6 space-y-4">
              {adErr && <p className="text-red-400 text-xs bg-red-900/30 border border-red-500/25 px-3 py-2.5 rounded-lg text-center">{adErr}</p>}
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" required autoFocus placeholder="admin@glrealty.com"
                  value={adEmail} onChange={e => setAdEmail(e.target.value)}
                  className={inputCls} style={inp} />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <input type={adShowPw ? 'text' : 'password'} required placeholder="••••••••"
                    value={adPass} onChange={e => setAdPass(e.target.value)}
                    className={inputCls + ' pr-14'} style={inp} />
                  <button type="button" onClick={() => setAdShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-heading font-bold text-glr-green hover:brightness-110">
                    {adShowPw ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={adBusy}
                  className="flex-1 font-heading font-bold py-2.5 rounded-xl text-sm hover:brightness-110 disabled:opacity-50"
                  style={{ background: '#8DC63F', color: '#2d2e30' }}>
                  {adBusy ? 'Signing in...' : 'Sign In'}
                </button>
                <button type="button" onClick={() => setAdOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm text-white/35 hover:text-white/60 font-heading"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
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
