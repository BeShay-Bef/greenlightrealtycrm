'use client'

import { useEffect, useState } from 'react'
import GlrLogo from '@/components/GlrLogo'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AuthUser {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  email_confirmed_at: string | null
}

export default function GlrAdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [newPass, setNewPass] = useState('')
  const [creating, setCreating] = useState(false)
  const [resetId, setResetId] = useState<string | null>(null)
  const [resetPass, setResetPass] = useState('')
  const [resetting, setResetting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function fetchUsers() {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.status === 403) {
      router.push('/')
      return
    }
    const data = await res.json()
    setUsers(data.users ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  function flash(msg: string, isError = false) {
    if (isError) {
      setError(msg)
      setSuccess('')
    } else {
      setSuccess(msg)
      setError('')
    }
    setTimeout(() => { setError(''); setSuccess('') }, 4000)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, password: newPass }),
    })
    const data = await res.json()
    if (!res.ok) {
      flash(data.error, true)
    } else {
      flash(`User ${data.user.email} created`)
      setNewEmail('')
      setNewPass('')
      await fetchUsers()
    }
    setCreating(false)
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Delete ${email}? This cannot be undone.`)) return
    setDeletingId(id)
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) {
      flash(data.error, true)
    } else {
      flash(`User deleted`)
      await fetchUsers()
    }
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
    if (!res.ok) {
      flash(data.error, true)
    } else {
      flash('Password updated')
      setResetId(null)
      setResetPass('')
    }
    setResetting(false)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  function fmt(ts: string | null) {
    if (!ts) return '—'
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-glr-gray-dark">
      {/* Header */}
      <div className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <GlrLogo size={32} color="#8DC63F" textColor="#ffffff" />
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/40 font-mono">glradmin</span>
          <button
            onClick={handleSignOut}
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <h1 className="text-xl font-bold text-white mb-1">User Management</h1>
        <p className="text-white/40 text-sm mb-8">Manage Supabase Auth users</p>

        {/* Alerts */}
        {error && (
          <div className="mb-5 bg-red-900/40 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 bg-glr-green/20 border border-glr-green/30 text-glr-green text-sm px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Add user form */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Add New User</h2>
          <form onSubmit={handleCreate} className="flex gap-3 flex-wrap">
            <input
              type="email"
              required
              placeholder="email@domain.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 min-w-48 px-4 py-2.5 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-glr-green"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <input
              type="password"
              required
              minLength={8}
              placeholder="Password (min 8 chars)"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="flex-1 min-w-48 px-4 py-2.5 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-glr-green"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              style={{ background: '#8DC63F', color: '#2d2e30' }}
            >
              {creating ? 'Creating…' : 'Create User'}
            </button>
          </form>
        </div>

        {/* Reset password modal */}
        {resetId && (
          <div className="bg-white/5 border border-glr-green/30 rounded-xl p-6 mb-8 animate-fade-up">
            <h2 className="text-sm font-semibold text-glr-green mb-4">Reset Password</h2>
            <form onSubmit={handleReset} className="flex gap-3">
              <input
                type="password"
                required
                minLength={8}
                placeholder="New password"
                value={resetPass}
                onChange={(e) => setResetPass(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-glr-green"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <button
                type="submit"
                disabled={resetting}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                style={{ background: '#8DC63F', color: '#2d2e30' }}
              >
                {resetting ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => { setResetId(null); setResetPass('') }}
                className="px-4 py-2.5 rounded-lg text-sm text-white/50 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Users table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-white/30 text-sm">Loading users…</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-sm">No users found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Created</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Last Sign In</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Confirmed</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">{user.email}</span>
                    </td>
                    <td className="px-6 py-4 text-white/50">{fmt(user.created_at)}</td>
                    <td className="px-6 py-4 text-white/50">{fmt(user.last_sign_in_at)}</td>
                    <td className="px-6 py-4">
                      {user.email_confirmed_at ? (
                        <span className="text-glr-green text-xs font-medium">✓ Yes</span>
                      ) : (
                        <span className="text-white/30 text-xs">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setResetId(user.id); setResetPass('') }}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors text-white/60 hover:text-white hover:bg-white/10"
                        >
                          Reset PW
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.email ?? '')}
                          disabled={deletingId === user.id}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors text-red-400 hover:text-red-300 hover:bg-red-900/30 disabled:opacity-50"
                        >
                          {deletingId === user.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-white/20 text-xs text-center mt-8">
          {users.length} user{users.length !== 1 ? 's' : ''} in Supabase Auth
        </p>
      </div>
    </div>
  )
}
