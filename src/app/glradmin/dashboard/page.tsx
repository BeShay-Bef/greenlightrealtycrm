export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function fmt(ts: string) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient()
  const adminSb = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const [agentCountRes, leadCountRes, docCountRes, usersRes, recentAgentsRes, recentLeadsRes] =
    await Promise.all([
      supabase.from('agents').select('id', { count: 'exact', head: true }),
      supabase.from('leads').select('id', { count: 'exact', head: true }),
      supabase.from('documents').select('id', { count: 'exact', head: true }).eq('status', 'Scanned'),
      adminSb.auth.admin.listUsers({ perPage: 1000 }),
      supabase.from('agents').select('id, name, email, active, created_at').order('created_at', { ascending: false }).limit(10),
      supabase.from('leads').select('id, name, status, created_at').order('created_at', { ascending: false }).limit(10),
    ])

  const totalUsers   = usersRes.data?.users.length ?? 0
  const totalAgents  = agentCountRes.count ?? 0
  const totalLeads   = leadCountRes.count ?? 0
  const docsScanned  = docCountRes.count ?? 0
  const recentAgents = recentAgentsRes.data ?? []
  const recentLeads  = recentLeadsRes.data ?? []

  const stats = [
    {
      label: 'Auth Users',
      value: totalUsers,
      icon: (
        <svg className="w-6 h-6 text-glr-green" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      bg: 'bg-glr-green/10',
      val: 'text-glr-green',
    },
    {
      label: 'Total Agents',
      value: totalAgents,
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      bg: 'bg-blue-500/10',
      val: 'text-blue-400',
    },
    {
      label: 'Total Leads',
      value: totalLeads,
      icon: (
        <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      bg: 'bg-amber-400/10',
      val: 'text-amber-400',
    },
    {
      label: 'Docs Scanned',
      value: docsScanned,
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bg: 'bg-purple-500/10',
      val: 'text-purple-400',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">System overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-6 flex items-center gap-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
              {s.icon}
            </div>
            <div>
              <p className={`text-3xl font-bold font-heading ${s.val}`}>{s.value}</p>
              <p className="text-xs text-white/40 font-bold uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Agents */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
            <h2 className="font-heading font-bold text-white text-sm">Recent Agent Sign-ups</h2>
            <a href="/glradmin/agents" className="text-xs text-glr-green hover:brightness-110">View all →</a>
          </div>
          {recentAgents.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-sm">No agents yet.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentAgents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-glr-green/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-glr-green">{agent.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{agent.name}</p>
                      <p className="text-xs text-white/40">{agent.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${agent.active ? 'bg-glr-green/15 text-glr-green' : 'bg-amber-400/15 text-amber-400'}`}>
                      {agent.active ? 'Active' : 'Pending'}
                    </span>
                    <p className="text-xs text-white/30 mt-1">{timeAgo(agent.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
            <h2 className="font-heading font-bold text-white text-sm">Recent Leads</h2>
          </div>
          {recentLeads.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-sm">No leads yet.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between px-6 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-white">{lead.name}</p>
                    <p className="text-xs text-white/40">{fmt(lead.created_at)}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    lead.status === 'Hot' ? 'bg-red-500/15 text-red-400' :
                    lead.status === 'Warm' ? 'bg-amber-400/15 text-amber-400' :
                    'bg-blue-500/15 text-blue-400'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
