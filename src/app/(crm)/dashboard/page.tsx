import { createServerSupabaseClient } from '@/lib/supabase-server'
import Badge from '@/components/Badge'
import type { Agent, Lead } from '@/types'

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const [agentsRes, leadsRes, allLeadsRes, docsRes, recentLeadsRes] = await Promise.all([
    supabase.from('agents').select('*').order('created_at', { ascending: false }),
    supabase
      .from('leads')
      .select('*, agents(name)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('leads').select('status, agent_id'),
    supabase.from('documents').select('id, status'),
    supabase
      .from('leads')
      .select('id, name, status, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const agents: Agent[] = agentsRes.data ?? []
  const leads: Lead[] = leadsRes.data ?? []
  const allLeads: { status: string; agent_id: string | null }[] = allLeadsRes.data ?? []
  const docs = docsRes.data ?? []
  const recentLeads = recentLeadsRes.data ?? []

  const activeAgents = agents.filter((a) => a.active).length
  const totalLeads = allLeads.length
  const hotLeads = allLeads.filter((l) => l.status === 'Hot').length
  const docsScanned = docs.filter((d) => d.status === 'Scanned').length

  const stats = [
    {
      label: 'Active Agents',
      value: activeAgents,
      icon: (
        <svg className="w-6 h-6 text-glr-green" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      iconBg: 'bg-glr-green-light',
      valueColor: 'text-glr-green',
    },
    {
      label: 'Total Leads',
      value: totalLeads,
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      iconBg: 'bg-blue-50',
      valueColor: 'text-blue-500',
    },
    {
      label: 'Hot Leads',
      value: hotLeads,
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      iconBg: 'bg-red-50',
      valueColor: 'text-red-500',
    },
    {
      label: 'Docs Scanned',
      value: docsScanned,
      icon: (
        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      iconBg: 'bg-amber-50',
      valueColor: 'text-amber-500',
    },
  ]

  // Agent lead counts
  const leadsByAgent: Record<string, number> = {}
  allLeads.forEach((l) => {
    if (l.agent_id) {
      leadsByAgent[l.agent_id] = (leadsByAgent[l.agent_id] ?? 0) + 1
    }
  })
  const agentMax = Math.max(...agents.map((a) => leadsByAgent[a.id] ?? 0), 1)
  const activeAgentList = agents.filter((a) => a.active)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-glr-gray-dark">Dashboard</h1>
        <p className="text-glr-gray text-sm mt-1">Welcome back — here&apos;s your team overview</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-5 card-hover animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}
            >
              {stat.icon}
            </div>
            <div>
              <p className={`stat-num ${stat.valueColor}`}>{stat.value}</p>
              <p className="text-xs text-glr-gray font-bold uppercase tracking-wider mt-1.5">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Activity Feed ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-heading font-bold text-glr-gray-dark">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentLeads.length === 0 ? (
              <div className="p-8 text-center text-glr-gray text-sm">
                <p>No recent activity yet.</p>
              </div>
            ) : (
              recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center gap-4 px-6 py-3.5 table-row-hover"
                >
                  <div className="w-8 h-8 rounded-full bg-glr-green-light flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-glr-green">
                      {lead.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-glr-gray-dark truncate">
                      {lead.name}
                    </p>
                    <p className="text-xs text-glr-gray">New lead added</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge status={lead.status as Lead['status']} dot={false} />
                    <span className="text-xs text-glr-gray">{timeAgo(lead.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Recent Leads list */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-heading font-bold text-glr-gray-dark">Recent Leads</h2>
              <a
                href="/leads"
                className="text-xs font-semibold text-glr-green hover:text-glr-green-dark transition-colors"
              >
                View all →
              </a>
            </div>
            {leads.length === 0 ? (
              <div className="p-8 text-center text-glr-gray text-sm">
                <p>No leads yet. Add your first lead.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between px-6 py-3.5 table-row-hover"
                  >
                    <div>
                      <p className="text-sm font-semibold text-glr-gray-dark">{lead.name}</p>
                      <p className="text-xs text-glr-gray mt-0.5">
                        {lead.agents?.name ?? 'Unassigned'} &middot; {lead.phone || lead.email}
                      </p>
                    </div>
                    <Badge status={lead.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agent performance */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-heading font-bold text-glr-gray-dark">Agent Performance</h2>
            </div>
            <div className="px-6 py-4">
              {activeAgentList.length === 0 ? (
                <p className="text-sm text-glr-gray py-4 text-center">No active agents yet.</p>
              ) : (
                <div className="space-y-4">
                  {activeAgentList.map((agent) => {
                    const count = leadsByAgent[agent.id] ?? 0
                    const pct = Math.round((count / agentMax) * 100)
                    return (
                      <div key={agent.id}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium text-glr-gray-dark">{agent.name}</span>
                          <span className="text-glr-gray text-xs font-semibold">
                            {count} lead{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="h-2 bg-glr-green-light rounded-full overflow-hidden">
                          <div
                            className="h-full bg-glr-green rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
