import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { targetUserId } = await request.json()
    if (!targetUserId) return NextResponse.json({ error: 'Missing targetUserId' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (user.id === targetUserId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .maybeSingle()

    if (existing) {
      // Unfollow
      await supabase.from('follows').delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)

      // Decrement counts (best-effort, ignore errors)
      try { await supabase.rpc('decrement_follower_count', { target_id: targetUserId }) } catch {}
      try { await supabase.rpc('decrement_following_count', { target_id: user.id }) } catch {}

      return NextResponse.json({ following: false })
    } else {
      // Follow
      await supabase.from('follows').insert({
        follower_id: user.id,
        following_id: targetUserId,
      })

      return NextResponse.json({ following: true })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('targetUserId')
    if (!targetUserId) return NextResponse.json({ following: false })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ following: false })

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .maybeSingle()

    return NextResponse.json({ following: !!data })
  } catch {
    return NextResponse.json({ following: false })
  }
}
