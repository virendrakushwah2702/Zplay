import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { gameId, title, genre } = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('games')
      .update({
        title,
        genre,
        status: 'published',
        published_at: new Date().toISOString(),
        trending_score: 10
      })
      .eq('id', gameId)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, game: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
