import { createClient } from '@/lib/supabase/server'
import { awardSparks } from '@/lib/sparks'

function generateCode(userId: string): string {
  return userId.replace(/-/g, '').slice(0, 8).toUpperCase()
}

export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const supabase = await createClient()

  const { data: user } = await supabase
    .from('users')
    .select('referral_code')
    .eq('id', userId)
    .single()

  if (user?.referral_code) return user.referral_code

  const code = generateCode(userId)

  await supabase
    .from('users')
    .update({ referral_code: code })
    .eq('id', userId)

  return code
}

export async function processReferral(
  referralCode: string,
  newUserId: string
): Promise<void> {
  try {
    const supabase = await createClient()

    // Find referrer
    const { data: referrer } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', referralCode)
      .single()

    if (!referrer || referrer.id === newUserId) return

    // Check not already referred
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', newUserId)
      .single()

    if (existing) return

    // Create referral record
    await supabase.from('referrals').insert({
      referrer_id: referrer.id,
      referred_id: newUserId,
      referral_code: referralCode,
      status: 'signup',
      sparks_awarded: 50,
    })

    // Award signup Sparks to referrer
    await awardSparks(
      referrer.id,
      'REFERRAL_SIGNUP',
      newUserId,
      'Someone joined using your referral link!'
    )
  } catch (error) {
    console.error('processReferral error:', error)
  }
}
