'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'

interface AuthUser {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  email_confirmed_at: string | null
}

function fmt(ts: string | null) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function roleLabel(email: string) {
  if (email === 'broker@glrealty.com') return { label: 'Broker', cls: 'bg-glr-green/15 text-glr-green' }
  if (email === 'admin@glrealty.com')  return { label: 'Admin',  cls: 'bg-purple-500/15 text-purple-400' }
  return { label: 'Agent', cls: 'bg-blue-500/15 text-blue-400' }
}

export default function AdminUsersPage() {
  const [users,      setUsers]      = useState<AuthUser[]>([])
  const [loading,    setLoading]    = useState(true)
  const [newEmail,   setNewEmail]   = useState('')
  const [newPass,    setNewPass]    = useState('')
  const [newRole,    setNewRole]    = useState<'agent' | 'broker' | 'admin'>('agent')
  const [creating,   setCreating]   = useState(false)
  const [resetId,    setResetId]    = useState<string | null>(null)
  const [resetPass,  setResetPass]  = useState('')
  const [resetting,  setResetting]  = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState('')

  async function fetchUsers() {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data.users ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  function flash(msg: string, isError = false) {
    if (isError) { setError(msg); setSuccess('') }
    else { setSuccess(msg); setError('') }
    setTimeout(() => { setError(''); setSuccess('') }, 4000)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const emailToUse =
      newRole === 'broker' ? 'broker@glrealty.com' :
      newRole === 'admin'  ? 'admin@glrealty.com'  :
      newEmail
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailToUse, password: newPass }),
    })
    const data = await res.json()
    if (!res.ok) { flash(data.error, true) }
    else { flash(`User ${data.user.email} created`); setNewEmail(''); setNewPass(''); await fetchUsers() }
    setCreating(false)
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Delete ${email}? This cannot be undone.`)) return
    setDeletingId(id)
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { flash(data.error, true) }
    else { flash('User deleted'); await fetchUsers() }
    setDeletingId(null)
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!resetId) return
    setResetting(true)
    const res = await fetch(`/api/admin/users/${resetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: resetPass }),
    })
    const data = await res.json()
    if (!res.ok) { flash(data.error, true) }
    else { flash('Password updated'); setResetId(null); setResetPass('') }
    setResetting(false)
  }

  const inp: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }
  const inputCls = 'px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-glr-green'

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-white">Users</h1>
        <p className="text-white/40 text-sm mt-1">Manage Supabase Auth users</p>
      </div>

      {error   && <div className="mb-5 bg-red-900/30 border border-red-500/25 text-red-300 text-sm px-4 py-3 rounded-lg">{error}</div>}
      {success && <div className="mb-5 bg-glr-green/15 border border-glr-green/25 text-glr-green text-sm px-4 py-3 rounded-lg">{success}</div>}

      {/* Add user */}
      <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 className="text-xs font-heading font-bold text-white/40 uppercase tracking-widest mb-4">Add New User</h2>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3">
          <select
            value={newRole}
            onChange={e => setNewRole(e.target.value as 'agent' | 'broker' | 'admin')}
            className={`${inputCls} w-32`}
            style={inp}
          >
            <option value="agent">Agent</option>
            <option value="broker">Broker</option>
            <option value="admin">Admin</option>
          </select>
          {newRole === 'agent' && (
            <input
              type="email" required placeholder="agent@example.com"
              value={newEmail} onChange={e => setNewEmail(e.target.value)}
              className={`${inputCls} flex-1 min-w-48`} style={inp}
            />
          )}
          <input
            type="password" required minLength={8} placeholder="Password (min 8 chars)"
            value={newPass} onChange={e => setNewPass(e.target.value)}
            className={`${inputCls} flex-1 min-w-48`} style={inp}
          />
          <button type="submit" disabled={creating}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
            style={{ background: '#8DC63F', color: '#2d2e30' }}>
            {creating ? 'Creating…' : 'Create User'}
          </button>
        </form>
      </div>

      {/* Reset password panel */}
      {resetId && (
        <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(141,198,63,0.25)' }}>
          <h2 className="text-xs font-heading font-bold text-glr-green uppercase tracking-widest mb-4">Reset Password</h2>
          <form onSubmit={handleReset} className="flex gap-3">
            <input
              type="password" required minLength={8} placeholder="New password"
              value={resetPass} onChange={e => setResetPass(e.target.value)}
              className={`${inputCls} flex-1`} style={inp}
            />
            <button type="submit" disabled={resetting}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
              style={{ background: '#8DC63F', color: '#2d2e30' }}>
              {resetting ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => { setResetId(null); setResetPass('') }}
              className="px-4 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 transition-colors">
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Users table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {loading ? (
          <div className="p-8 text-center text-white/30 text-sm">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-white/30 text-sm">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/8">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-wider">Created</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-wider">Last Sign In</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-wider">Confirmed</th>
                <th className="text-right px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(user => {
                const role = roleLabel(user.email ?? '')
                return (
                  <tr key={user.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${role.cls}`}>{role.label}</span>
                    </td>
                    <td className="px-6 py-4 text-white/40">{fmt(user.created_at)}</td>
                    <td className="px-6 py-4 text-white/40">{fmt(user.last_sign_in_at)}</td>
                    <td className="px-6 py-4">
                      {user.email_confirmed_at
                        ? <span className="text-glr-green text-xs font-medium">Yes</span>
                        : <span className="text-white/30 text-xs">Pending</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setResetId(user.id); setResetPass('') }}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium text-white/50 hover:text-white hover:bg-white/8 transition-colors">
                          Reset PW
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.email ?? '')}
                          disabled={deletingId === user.id}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium text-red-400 hover:text-red-300 hover:bg-red-900/25 disabled:opacity-50 transition-colors">
                          {deletingId === user.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-white/20 text-xs text-center mt-6">{users.length} user{users.length !== 1 ? 's' : ''} in Supabase Auth</p>
    </div>
  )
}
