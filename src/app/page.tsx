'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import GlrLogo from '@/components/GlrLogo'

const BROKER = 'broker@glrealty.com'
const ADMIN  = 'admin@glrealty.com'

export default function Page() {
  const sb = createClient()

  const [bEmail, setBEmail] = useState('')
  const [bPass,  setBPass]  = useState('')
  const [bErr,   setBErr]   = useState('')
  const [bBusy,  setBBusy]  = useState(false)
  const [bShow,  setBShow]  = useState(false)

  const [aMode,  setAMode]  = useState<'in' | 'up'>('in')
  const [aName,  setAName]  = useState('')
  const [aPhone, setAPhone] = useState('')
  const [aEmail, setAEmail] = useState('')
  const [aPass,  setAPass]  = useState('')
  const [aErr,   setAErr]   = useState('')
  const [aMsg,   setAMsg]   = useState('')
  const [aBusy,  setABusy]  = useState(false)
  const [aShow,  setAShow]  = useState(false)

  const [dot,    setDot]    = useState(false)
  const [adEmail,setAdEmail]= useState('')
  const [adPass, setAdPass] = useState('')
  const [adErr,  setAdErr]  = useState('')
  const [adBusy, setAdBusy] = useState(false)
  const [adShow, setAdShow] = useState(false)

  async function brokerLogin(e: React.FormEvent) {
    e.preventDefault()
    setBErr(''); setBBusy(true)
    const { data, error } = await sb.auth.signInWithPassword({ email: bEmail, password: bPass })
    if (error) { setBErr('Invalid credentials'); setBBusy(false); return }
    if (data.user.email !== BROKER) {
      await sb.auth.signOut()
      setBErr('Access denied'); setBBusy(false); return
    }
    await new Promise(r => setTimeout(r, 1000))
    window.location.replace('/dashboard')
  }

  async function agentIn(e: React.FormEvent) {
    e.preventDefault()
    setAErr(''); setABusy(true)
    const { data, error } = await sb.auth.signInWithPassword({ email: aEmail, password: aPass })
    if (error) { setAErr('Invalid credentials'); setABusy(false); return }
    const { data: row } = await sb.from('agents').select('active').eq('email', data.user.email).single()
    if (!row?.active) {
      await sb.auth.signOut()
      setAErr('Account pending broker approval'); setABusy(false); return
    }
    await new Promise(r => setTimeout(r, 800))
    window.location.replace('/agent-dashboard')
  }

  async function agentUp(e: React.FormEvent) {
    e.preventDefault()
    setAErr(''); setABusy(true)
    const { data, error } = await sb.auth.signUp({
      email: aEmail,
      password: aPass,
      options: { data: { name: aName, phone: aPhone } },
    })
    if (error) { setAErr(error.message); setABusy(false); return }
    if (data.user) {
      await sb.from('agents').insert({
        name: aName, email: aEmail, phone: aPhone,
        active: false, access_leads: false, access_docs: false, access_msgs: false,
      })
    }
    setABusy(false)
    setAMsg('Account created. Awaiting broker approval.')
    setAName(''); setAPhone(''); setAEmail(''); setAPass('')
  }

  async function adminLogin(e: React.FormEvent) {
    e.preventDefault()
    setAdErr(''); setAdBusy(true)
    const { data, error } = await sb.auth.signInWithPassword({ email: adEmail, password: adPass })
    if (error) { setAdErr('Access denied'); setAdBusy(false); return }
    if (data.user.email !== ADMIN) {
      await sb.auth.signOut()
      setAdErr('Access denied'); setAdBusy(false); return
    }
    await new Promise(r => setTimeout(r, 1000))
    window.location.replace('/glradmin')
  }

  const card: React.CSSProperties = { background: '#1a1b1d', border: '1px solid rgba(141,198,63,0.2)', borderRadius: 16, padding: '28px 32px', flex: 1 }
  const inp: React.CSSProperties  = { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
  const lbl: React.CSSProperties  = { display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }
  const btn: React.CSSProperties  = { width: '100%', padding: '11px 0', background: '#8DC63F', color: '#2d2e30', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: '0.05em' }
  const eye: React.CSSProperties  = { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8DC63F', cursor: 'pointer', fontSize: 11, fontWeight: 700, padding: 0 }
  const errBox: React.CSSProperties = { background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5', borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 14 }
  const okBox: React.CSSProperties  = { background: 'rgba(141,198,63,0.1)', border: '1px solid rgba(141,198,63,0.3)', color: '#8DC63F', borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 14 }

  return (
    <div style={{ minHeight: '100vh', background: '#2d2e30', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'inherit', position: 'relative' }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GlrLogo size={52} color="#8DC63F" textColor="#ffffff" />
        </div>
        <p style={{ color: '#8DC63F', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', fontSize: 13, marginTop: 12 }}>Forward. Moving.</p>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>Real Estate Management Portal</p>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 720, flexWrap: 'wrap' }}>

        {/* BROKER CARD */}
        <div style={card}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8DC63F' }} />
              <span style={{ ...lbl, marginBottom: 0, color: '#8DC63F' }}>Broker Login</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, paddingLeft: 14 }}>Full management access</p>
          </div>
          <form onSubmit={brokerLogin}>
            {bErr && <div style={errBox}>{bErr}</div>}
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Email</label>
              <input style={inp} type="email" required placeholder="broker@glrealty.com"
                value={bEmail} onChange={e => setBEmail(e.target.value)} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Password</label>
              <div style={{ position: 'relative' }}>
                <input style={{ ...inp, paddingRight: 48 }} type={bShow ? 'text' : 'password'} required placeholder="••••••••"
                  value={bPass} onChange={e => setBPass(e.target.value)} />
                <button type="button" style={eye} onClick={() => setBShow(v => !v)}>{bShow ? 'Hide' : 'Show'}</button>
              </div>
            </div>
            <button style={{ ...btn, opacity: bBusy ? 0.6 : 1 }} disabled={bBusy}>
              {bBusy ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* AGENT CARD */}
        <div style={card}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
              <span style={{ ...lbl, marginBottom: 0, color: 'rgba(255,255,255,0.7)' }}>
                Agent {aMode === 'in' ? 'Login' : 'Sign Up'}
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, paddingLeft: 14 }}>Agent access &amp; registration</p>
          </div>
          {aMsg && <div style={okBox}>{aMsg}</div>}
          {aErr && <div style={errBox}>{aErr}</div>}
          <form onSubmit={aMode === 'in' ? agentIn : agentUp}>
            {aMode === 'up' && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Full Name</label>
                  <input style={inp} required placeholder="Jane Smith" value={aName} onChange={e => setAName(e.target.value)} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Phone</label>
                  <input style={inp} placeholder="+1 (555) 000-0000" value={aPhone} onChange={e => setAPhone(e.target.value)} />
                </div>
              </>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Email</label>
              <input style={inp} type="email" required placeholder="agent@example.com" value={aEmail} onChange={e => setAEmail(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Password</label>
              <div style={{ position: 'relative' }}>
                <input style={{ ...inp, paddingRight: 48 }} type={aShow ? 'text' : 'password'} required minLength={6} placeholder="••••••••"
                  value={aPass} onChange={e => setAPass(e.target.value)} />
                <button type="button" style={eye} onClick={() => setAShow(v => !v)}>{aShow ? 'Hide' : 'Show'}</button>
              </div>
            </div>
            <button style={{ ...btn, marginBottom: 10, opacity: aBusy ? 0.6 : 1 }} disabled={aBusy}>
              {aBusy
                ? (aMode === 'in' ? 'Signing in...' : 'Creating...')
                : (aMode === 'in' ? 'Sign In' : 'Create Account')}
            </button>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
              {aMode === 'in' ? 'No account? ' : 'Have an account? '}
              <button
                type="button"
                onClick={() => { setAMode(aMode === 'in' ? 'up' : 'in'); setAErr(''); setAMsg('') }}
                style={{ background: 'none', border: 'none', color: '#8DC63F', cursor: 'pointer', fontSize: 11, fontWeight: 700, padding: 0 }}
              >
                {aMode === 'in' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </form>
        </div>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10, marginTop: 32, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        GreenLight Realty &copy; {new Date().getFullYear()}
      </p>

      {/* ADMIN DOT */}
      <div
        onClick={() => setDot(true)}
        style={{ position: 'fixed', bottom: 16, right: 16, width: 6, height: 6, borderRadius: '50%', background: 'rgba(141,198,63,0.2)', cursor: 'pointer', transition: 'all 0.3s', zIndex: 40 }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(141,198,63,0.7)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(141,198,63,0.2)' }}
      />

      {/* ADMIN MODAL */}
      {dot && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setDot(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}
        >
          <div style={{ background: '#1a1b1d', border: '1px solid rgba(141,198,63,0.25)', borderRadius: 20, width: '100%', maxWidth: 360, overflow: 'hidden' }}>
            <div style={{ padding: '28px 28px 20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GlrLogo size={36} color="#8DC63F" textColor="#ffffff" />
              </div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginTop: 14 }}>Admin</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 }}>Restricted access</p>
            </div>
            <form onSubmit={adminLogin} style={{ padding: 28 }}>
              {adErr && <div style={{ ...errBox, textAlign: 'center' }}>{adErr}</div>}
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Email</label>
                <input style={inp} type="email" required autoFocus placeholder="admin@glrealty.com"
                  value={adEmail} onChange={e => setAdEmail(e.target.value)} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...inp, paddingRight: 48 }} type={adShow ? 'text' : 'password'} required placeholder="••••••••"
                    value={adPass} onChange={e => setAdPass(e.target.value)} />
                  <button type="button" style={eye} onClick={() => setAdShow(v => !v)}>{adShow ? 'Hide' : 'Show'}</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ ...btn, opacity: adBusy ? 0.6 : 1, flex: 1 }} disabled={adBusy}>
                  {adBusy ? 'Signing in...' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => setDot(false)}
                  style={{ flex: 1, padding: '11px 0', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13 }}
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
