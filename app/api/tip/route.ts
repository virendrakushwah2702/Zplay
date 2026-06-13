import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deductSparks, awardSparks } from '@/lib/sparks'

const MIN_TIP = 10
const MAX_TIP = 1000

export async function POST(request: NextRequest) {
  try {
    const { recipientId, amount, gameId } = await request.json()

    if (!recipientId || !amount) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    if (amount < MIN_TIP || amount > MAX_TIP) {
      return NextResponse.json(
        { error: `Tip must be between ${MIN_TIP} and ${MAX_TIP} Sparks` },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (user.id === recipientId) {
      return NextResponse.json({ error: 'Cannot tip yourself' }, { status: 400 })
    }

    // Deduct from tipper
    const deducted = await deductSparks(user.id, amount, `Tip to creator`)
    if (!deducted) {
      return NextResponse.json({ error: 'Insufficient Sparks' }, { status: 400 })
    }

    // Award to recipient
    await awardSparks(
      recipientId,
      'GAME_SHARED', // reuse GAME_SHARED event as tip proxy
      gameId || recipientId,
      `⚡ Tip received: ${amount} Sparks`
    )

    // Override the transaction amount — insert a corrective credit transaction
    try {
      await supabase.from('sparks_transactions').insert({
        user_id: recipientId,
        amount,
        event_type: 'TIP_RECEIVED',
        reference_id: gameId || null,
        description: `⚡ Tip of ${amount} Sparks`,
      })
    } catch {}

    return NextResponse.json({ success: true, tipped: amount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
