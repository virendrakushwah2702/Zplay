import { createClient } from '@/lib/supabase/server'
import { awardSparks, type SparkEventType } from '@/lib/sparks'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventType, referenceId } = await request.json()

    if (!eventType) {
      return NextResponse.json({ error: 'eventType required' }, { status: 400 })
    }

    const result = await awardSparks(
      user.id,
      eventType as SparkEventType,
      referenceId
    )

    if (!result) {
      return NextResponse.json({ error: 'Failed to award sparks' }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
