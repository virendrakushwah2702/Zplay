import { createClient } from '@/lib/supabase/server'

export const SPARK_EVENTS = {
  GAME_GENERATED:           5,
  GAME_PLAYED:              2,
  GAME_10_PLAYS:            25,
  GAME_100_PLAYS:           100,
  GAME_SHARED:              10,
  GAME_LIKED:               3,
  DAILY_LOGIN:              5,
  STREAK_7:                 70,
  STREAK_15:                200,
  STREAK_30:                500,
  REWARDED_VIDEO:           15,
  DAILY_CHALLENGE:          30,
  REFERRAL_SIGNUP:          50,
  REFERRAL_FIRST_GAME:      100,
  REFERRAL_CREATOR:         200,
} as const

export type SparkEventType = keyof typeof SPARK_EVENTS

export async function awardSparks(
  userId: string,
  eventType: SparkEventType,
  referenceId?: string,
  description?: string
): Promise<{ newBalance: number; awarded: number } | null> {
  try {
    const supabase = await createClient()
    const amount = SPARK_EVENTS[eventType]

    // Get current balance
    const { data: user } = await supabase
      .from('users')
      .select('sparks_balance, sparks_lifetime')
      .eq('id', userId)
      .single()

    if (!user) return null

    const newBalance = (user.sparks_balance || 0) + amount
    const newLifetime = (user.sparks_lifetime || 0) + amount

    // Update balance
    await supabase
      .from('users')
      .update({
        sparks_balance: newBalance,
        sparks_lifetime: newLifetime,
      })
      .eq('id', userId)

    // Record transaction
    await supabase
      .from('sparks_transactions')
      .insert({
        user_id: userId,
        amount,
        event_type: eventType,
        reference_id: referenceId || null,
        description: description || `${eventType} event`,
        balance_after: newBalance,
      })

    return { newBalance, awarded: amount }
  } catch (error) {
    console.error('awardSparks error:', error)
    return null
  }
}

export async function deductSparks(
  userId: string,
  amount: number,
  description: string
): Promise<{ newBalance: number } | null> {
  try {
    const supabase = await createClient()

    const { data: user } = await supabase
      .from('users')
      .select('sparks_balance')
      .eq('id', userId)
      .single()

    if (!user || user.sparks_balance < amount) return null

    const newBalance = user.sparks_balance - amount

    await supabase
      .from('users')
      .update({ sparks_balance: newBalance })
      .eq('id', userId)

    await supabase
      .from('sparks_transactions')
      .insert({
        user_id: userId,
        amount: -amount,
        event_type: 'SPEND',
        description,
        balance_after: newBalance,
      })

    return { newBalance }
  } catch (error) {
    console.error('deductSparks error:', error)
    return null
  }
}

export async function getSparkBalance(userId: string): Promise<number> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('users')
      .select('sparks_balance')
      .eq('id', userId)
      .single()
    return data?.sparks_balance || 0
  } catch {
    return 0
  }
}

// Spending costs in Sparks
export const SPARK_COSTS = {
  EXTRA_GENERATION:   50,
  BOOST_24HR:         500,
  STREAK_FREEZE:      20,
  FEATURED_SLOT:      1000,
  DOWNLOAD_HTML:      100,
  REMOVE_WATERMARK:   20,
} as const
