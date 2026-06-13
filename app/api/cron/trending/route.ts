import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Verify this is called by Vercel Cron (add secret in production)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const supabase = await createClient()

    const { data: games } = await supabase
      .from('games')
      .select('id, play_count, like_count, share_count, published_at')
      .eq('status', 'published')

    if (!games) return NextResponse.json({ updated: 0 })

    const now = new Date()
    let updated = 0

    for (const game of games) {
      const hoursOld = game.published_at
        ? (now.getTime() - new Date(game.published_at).getTime()) / 3600000
        : 24

      const trendingScore =
        (game.play_count || 0) * 3 +
        (game.like_count || 0) * 5 +
        (game.share_count || 0) * 8 -
        hoursOld * 0.5

      await supabase
        .from('games')
        .update({ trending_score: Math.max(0, trendingScore) })
        .eq('id', game.id)

      updated++
    }

    return NextResponse.json({ updated })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
