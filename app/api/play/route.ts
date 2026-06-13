import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { gameId, country = 'US', platform = 'web' } = await request.json()
    const supabase = await createClient()

    // Increment play count
    await supabase.rpc('increment_plays', { game_id: gameId })

    // Record play event
    await supabase.from('game_plays').insert({
      game_id: gameId,
      country_code: country,
      platform
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
