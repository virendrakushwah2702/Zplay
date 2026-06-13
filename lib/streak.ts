import { createClient } from '@/lib/supabase/server'
import { awardSparks } from '@/lib/sparks'

export async function updateStreak(userId: string): Promise<{
  streak: number
  maintained: boolean
  milestone?: number
}> {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data: user } = await supabase
      .from('users')
      .select('current_streak, longest_streak, last_active_date, streak_freeze_count')
      .eq('id', userId)
      .single()

    if (!user) return { streak: 0, maintained: false }

    const lastActive = user.last_active_date
    const currentStreak = user.current_streak || 0

    // Already updated today
    if (lastActive === today) {
      return { streak: currentStreak, maintained: true }
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    let newStreak: number
    let maintained = true

    if (lastActive === yesterdayStr || currentStreak === 0) {
      // Consecutive day or first time
      newStreak = currentStreak + 1
    } else {
      // Streak broken
      newStreak = 1
      maintained = false
    }

    const newLongest = Math.max(newStreak, user.longest_streak || 0)

    await supabase
      .from('users')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_active_date: today,
      })
      .eq('id', userId)

    // Award streak milestone Sparks
    let milestone: number | undefined
    if (newStreak === 7) {
      await awardSparks(userId, 'STREAK_7', undefined, '7-day streak bonus!')
      milestone = 7
    } else if (newStreak === 15) {
      await awardSparks(userId, 'STREAK_15', undefined, '15-day streak — Creator+ unlocked!')
      milestone = 15
    } else if (newStreak === 30) {
      await awardSparks(userId, 'STREAK_30', undefined, '30-day streak champion!')
      milestone = 30
    }

    return { streak: newStreak, maintained, milestone }
  } catch (error) {
    console.error('updateStreak error:', error)
    return { streak: 0, maintained: false }
  }
}
