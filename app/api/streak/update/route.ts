import { createClient } from '@/lib/supabase/server'
import { updateStreak } from '@/lib/streak'
import { awardSparks } from '@/lib/sparks'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Award daily login sparks
    await awardSparks(user.id, 'DAILY_LOGIN', undefined, 'Daily login bonus')

    // Update streak
    const result = await updateStreak(user.id)

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
