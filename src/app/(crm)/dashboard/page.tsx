import { createServerSupabaseClient } from '@/lib/supabase-server'
import Badge from '@/components/Badge'
import type { Agent, Lead } from '@/types'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const [agentsRes, leadsRes, allLeadsRes, docsRes] = await Promise.all([
    supabase.from('agents').select('*').order('created_at', { ascending: false }),
    supabase
      .from('leads')
      .select('*, agents(name)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('leads').select('status, agent_id'),
    supabase.from('documents').select('id, status'),
  ])

  const agents: Agent[] = agentsRes.data ?? []
  const leads: Lead[] = leadsRes.data ?? []
  const allLeads: { status: string; agent_id: string | null }[] = allLeadsRes.data ?? []
  const docs = docsRes.data ?? []

  const activeAgents = agents.filter((a) => a.active).length
  const totalLeads = allLeads.length
  const hotLeads = allLeads.filter((l) => l.status === 'Hot').length
  const docsScanned = docs.filter((d) => d.status === 'Scanned').length

  const stats = [
    { label: 'Active Agents', value: activeAgents, icon: '👥', accent: 'text-glr-green' },
    { label: 'Total Leads', value: totalLeads, icon: '📋', accent: 'text-blue-500' },
    { label: 'Hot Leads', value: hotLeads, icon: '🔥', accent: 'text-red-500' },
    { label: 'Docs Scanned', value: docsScanned, icon: '📄', accent: 'text-amber-500' },
  ]

  // Agent lead counts
  const leadsByAgent: Record<string, number> = {}
  allLeads.forEach((l) => {
    if (l.agent_id) {
      leadsByAgent[l.agent_id] = (leadsByAgent[l.agent_id] ?? 0) + 1
    }
  })

  const agentMax = Math.max(...agents.map((a) => leadsByAgent[a.id] ?? 0), 1)

  return (
    <div className="p-8">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-glr-gray-dark">Dashboard</h1>
          <p className="text-glr-gray text-sm mt-1">Welcome back — here&apos;s your team overview</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 animate-fade-up"
            >
              <div className="text-3xl">{stat.icon}</div>
              <div>
                <p className={`text-3xl font-bold ${stat.accent}`}>{stat.value}</p>
                <p className="text-xs text-glr-gray mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent leads */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-glr-gray-dark mb-4">Recent Leads</h2>
            {leads.length === 0 ? (
              <p className="text-sm text-glr-gray">No leads yet.</p>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-glr-gray-dark">{lead.name}</p>
                      <p className="text-xs text-glr-gray">
                        {lead.agents?.name ?? 'Unassigned'} &middot; {lead.phone}
                      </p>
                    </div>
                    <Badge status={lead.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agent performance */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-glr-gray-dark mb-4">Agent Performance</h2>
            {agents.length === 0 ? (
              <p className="text-sm text-glr-gray">No agents yet.</p>
            ) : (
              <div className="space-y-4">
                {agents.map((agent) => {
                  const count = leadsByAgent[agent.id] ?? 0
                  const pct = Math.round((count / agentMax) * 100)
                  return (
                    <div key={agent.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-glr-gray-dark">{agent.name}</span>
                        <span className="text-glr-gray">{count} leads</span>
                      </div>
                      <div className="h-2 bg-glr-green-light rounded-full overflow-hidden">
                        <div
                          className="h-full bg-glr-green rounded-full transition-all"
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
  )
}
