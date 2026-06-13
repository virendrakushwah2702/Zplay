import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { awardSparks } from '@/lib/sparks'

export async function POST(request: NextRequest) {
  try {
    const { gameId } = await request.json()
    if (!gameId) return NextResponse.json({ success: true })

    const supabase = await createClient()

    // Get game with creator and current play count
    const { data: game } = await supabase
      .from('games')
      .select('id, creator_id, play_count, title')
      .eq('id', gameId)
      .single()

    if (!game?.creator_id) return NextResponse.json({ success: true })

    const playCount = game.play_count || 0

    // Award Sparks to creator for each play
    await awardSparks(
      game.creator_id,
      'GAME_PLAYED',
      gameId,
      `Play on: ${game.title || 'Untitled'}`
    )

    // Record creator earnings row (best-effort)
    try {
      await supabase.from('creator_earnings').insert({
        creator_id: game.creator_id,
        game_id: gameId,
        sparks_earned: 2,
        source: 'game_played',
      })
    } catch {}

    // Milestone bonuses
    if (playCount === 10) {
      await awardSparks(game.creator_id, 'GAME_10_PLAYS', gameId, '🎉 10 plays milestone!')
    } else if (playCount === 100) {
      await awardSparks(game.creator_id, 'GAME_100_PLAYS', gameId, '🚀 100 plays milestone!')
    }

    return NextResponse.json({ success: true })
  } catch {
    // Never fail the caller
    return NextResponse.json({ success: true })
  }
}
