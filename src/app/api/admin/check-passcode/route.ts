import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { passcode } = await request.json()
    const expected = process.env.ADMIN_PASSCODE
    if (!expected || !passcode || passcode !== expected) {
      return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
