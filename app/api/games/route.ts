import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const genre = searchParams.get('genre')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createClient()

    let query = supabase
      .from('games')
      .select(`
        id, title, genre, play_count, like_count,
        created_at, published_at, trending_score,
        creator_id, country_origin, language, html_content,
        users(name, avatar_url)
      `)
      .eq('status', 'published')
      .order('trending_score', { ascending: false })
      .range(offset, offset + limit - 1)

    if (genre && genre !== 'all') {
      query = query.eq('genre', genre)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ games: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

