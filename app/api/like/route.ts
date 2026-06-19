import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { gameId } = await request.json()
    const supabase = await createClient()

    await supabase.rpc('increment_likes', { game_id: gameId })

    // Award like sparks to player if logged in
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { awardSparks } = await import('@/lib/sparks')
        await awardSparks(authUser.id, 'GAME_LIKED', gameId, 'Liked a game!')
      }
    } catch {}

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
