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

    // Award play sparks to player if logged in
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { awardSparks } = await import('@/lib/sparks')
        await awardSparks(authUser.id, 'GAME_PLAYED', gameId, 'Played a game!')
      }
    } catch {}

    // Award milestone sparks to creator
    try {
      const { data: game } = await supabase
        .from('games')
        .select('creator_id, play_count')
        .eq('id', gameId)
        .single()

      if (game && game.creator_id) {
        const plays = game.play_count || 0
        const { awardSparks } = await import('@/lib/sparks')
        
        if (plays === 10) {
          await awardSparks(game.creator_id, 'GAME_10_PLAYS', gameId, 'Your game reached 10 plays!')
        } else if (plays === 100) {
          await awardSparks(game.creator_id, 'GAME_100_PLAYS', gameId, 'Your game reached 100 plays!')
        }
      }
    } catch {}

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
