import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')
    if (!gameId) return NextResponse.json({ comments: [] })

    const supabase = await createClient()
    const { data: comments } = await supabase
      .from('game_comments')
      .select('id, content, created_at, users(creator_name, id)')
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({ comments: comments || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { gameId, content } = await request.json()
    if (!gameId || !content?.trim()) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    if (content.trim().length > 280) {
      return NextResponse.json({ error: 'Comment too long' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: comment, error } = await supabase
      .from('game_comments')
      .insert({ game_id: gameId, user_id: user.id, content: content.trim() })
      .select('id, content, created_at, users(creator_name, id)')
      .single()

    if (error) throw error

    return NextResponse.json({ comment })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
