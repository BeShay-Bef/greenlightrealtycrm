import { NextResponse } from 'next/server'
import twilio from 'twilio'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { body } = await request.json()

    if (!body) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 })
    }

    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    )
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, phone')
      .eq('active', true)
      .not('phone', 'is', null)
      .neq('phone', '')

    if (agentsError) {
      return NextResponse.json({ error: agentsError.message }, { status: 500 })
    }

    if (!agents || agents.length === 0) {
      return NextResponse.json({ error: 'No active agents with phone numbers' }, { status: 400 })
    }

    const results = await Promise.allSettled(
      agents.map(async (agent: { id: string; phone: string }) => {
        await twilioClient.messages.create({
          body,
          from: process.env.TWILIO_PHONE_NUMBER!,
          to: agent.phone,
        })
        await supabase.from('messages').insert({
          agent_id: agent.id,
          body,
          from_broker: true,
        })
      })
    )

    const failed = results.filter((r) => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      sent: agents.length - failed,
      failed,
    })
  } catch (err) {
    console.error('Group SMS error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to send group message' },
      { status: 500 }
    )
  }
}
