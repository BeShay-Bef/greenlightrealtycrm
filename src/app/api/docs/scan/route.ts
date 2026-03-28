import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { base64, fileName, docId } = await request.json()

    if (!base64 || !docId) {
      return NextResponse.json({ error: 'Missing base64 or docId' }, { status: 400 })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Determine media type
    const ext = fileName?.split('.').pop()?.toLowerCase()
    let mediaType = 'image/jpeg'
    if (ext === 'png') mediaType = 'image/png'
    else if (ext === 'webp') mediaType = 'image/webp'
    else if (ext === 'gif') mediaType = 'image/gif'

    const imageUrl = `data:${mediaType};base64,${base64}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a real estate document parser. Extract all relevant fields from this document and return ONLY a valid JSON object (no markdown, no explanation). Include fields like: property_address, buyer_name, seller_name, agent_name, listing_price, closing_date, loan_amount, earnest_money, property_type, mls_number, square_footage, year_built, and any other relevant fields you find. If a field is not present, omit it.`,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'high' },
            },
          ],
        },
      ],
      max_tokens: 1000,
    })

    const content = completion.choices[0]?.message?.content ?? '{}'

    let extracted: Record<string, unknown> = {}
    try {
      const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      extracted = JSON.parse(clean)
    } catch {
      extracted = { raw_text: content }
    }

    const { error: updateError } = await supabase
      .from('documents')
      .update({ status: 'Scanned', extracted_data: extracted })
      .eq('id', docId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, extracted })
  } catch (err) {
    console.error('Doc scan error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Scan failed' },
      { status: 500 }
    )
  }
}
