import { NextResponse } from 'next/server'
import twilio from 'twilio'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { to, body, agent_id } = await request.json()

    if (!to || !body || !agent_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    )
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
    })

    const { error: dbError } = await supabase.from('messages').insert({
      agent_id,
      body,
      from_broker: true,
    })

    if (dbError) {
      console.error('DB insert error:', dbError)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('SMS send error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to send message' },
      { status: 500 }
    )
  }
}
