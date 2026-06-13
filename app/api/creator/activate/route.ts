import { createClient } from '@/lib/supabase/server'
import { getOrCreateReferralCode } from '@/lib/referral'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { creatorName } = await request.json()

    if (!creatorName?.trim()) {
      return NextResponse.json({ error: 'Creator name required' }, { status: 400 })
    }

    await supabase
      .from('users')
      .update({
        is_creator: true,
        creator_name: creatorName.trim(),
        creator_activated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    const referralCode = await getOrCreateReferralCode(user.id)

    return NextResponse.json({ success: true, referralCode })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
