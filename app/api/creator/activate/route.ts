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

    // Referral creator bonus check
    try {
      const { data: referral } = await supabase
        .from('referrals')
        .select('id, referrer_id, status, sparks_awarded')
        .eq('referred_id', user.id)
        .in('status', ['signup', 'first_game'])
        .maybeSingle()

      if (referral) {
        const { awardSparks } = await import('@/lib/sparks')
        await awardSparks(
          referral.referrer_id,
          'REFERRAL_CREATOR',
          user.id,
          'Your referral activated their creator profile!'
        )
        const newAward = (referral.sparks_awarded || 0) + 200
        await supabase
          .from('referrals')
          .update({ status: 'creator', sparks_awarded: newAward })
          .eq('id', referral.id)
      }
    } catch (err) {
      console.error('Referral creator award error:', err)
    }

    const referralCode = await getOrCreateReferralCode(user.id)

    return NextResponse.json({ success: true, referralCode })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
