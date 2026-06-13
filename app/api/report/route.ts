import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { gameId, reason, details } = await request.json()

    if (!gameId || !reason) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase
      .from('reports')
      .insert({
        game_id: gameId,
        reporter_id: user?.id || null,
        reason,
        details: details || null,
        status: 'pending',
      })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
