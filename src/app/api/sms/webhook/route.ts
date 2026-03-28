import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const formData = await request.formData()
    const from = formData.get('From') as string
    const body = formData.get('Body') as string

    if (!from || !body) {
      return twimlResponse()
    }

    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('phone', from)
      .single()

    if (agent) {
      await supabase.from('messages').insert({
        agent_id: agent.id,
        body,
        from_broker: false,
      })
    }

    return twimlResponse()
  } catch (err) {
    console.error('Webhook error:', err)
    return twimlResponse()
  }
}

function twimlResponse() {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
    { status: 200, headers: { 'Content-Type': 'text/xml' } }
  )
}
