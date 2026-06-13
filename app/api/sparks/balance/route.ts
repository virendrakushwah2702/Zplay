import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ balance: 0, lifetime: 0 })
    }

    const { data } = await supabase
      .from('users')
      .select('sparks_balance, sparks_lifetime, current_streak, is_creator, creator_name')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      balance: data?.sparks_balance || 0,
      lifetime: data?.sparks_lifetime || 0,
      streak: data?.current_streak || 0,
      isCreator: data?.is_creator || false,
      creatorName: data?.creator_name || null,
    })
  } catch {
    return NextResponse.json({ balance: 0, lifetime: 0, streak: 0 })
  }
}
