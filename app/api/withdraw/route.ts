import { createClient } from '@/lib/supabase/server'
import { deductSparks } from '@/lib/sparks'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amountSparks, method, upiId, paypalEmail } = await request.json()

    if (!amountSparks || amountSparks < 5000) {
      return NextResponse.json({ error: 'Minimum withdrawal is 5,000 Sparks (Rs.50)' }, { status: 400 })
    }

    if (method === 'upi' && !upiId?.trim()) {
      return NextResponse.json({ error: 'UPI ID is required' }, { status: 400 })
    }

    if (method === 'paypal' && !paypalEmail?.trim()) {
      return NextResponse.json({ error: 'PayPal email is required' }, { status: 400 })
    }

    // 1. Fetch current balance
    const { data: userProfile } = await supabase
      .from('users')
      .select('sparks_balance')
      .eq('id', authUser.id)
      .single()

    if (!userProfile || (userProfile.sparks_balance || 0) < amountSparks) {
      return NextResponse.json({ error: 'Insufficient Sparks balance' }, { status: 400 })
    }

    // 2. Deduct Sparks balance
    const deducted = await deductSparks(
      authUser.id,
      amountSparks,
      `Requested withdrawal of Rs.${(amountSparks / 100).toFixed(2)} via ${method.toUpperCase()}`
    )

    if (!deducted) {
      return NextResponse.json({ error: 'Failed to deduct Sparks' }, { status: 500 })
    }

    const amountInr = amountSparks / 100

    // 3. Create a withdrawal request record
    const { error: withdrawError } = await supabase
      .from('withdrawals')
      .insert({
        creator_id: authUser.id,
        amount_sparks: amountSparks,
        amount_inr: amountInr,
        method,
        upi_id: method === 'upi' ? upiId.trim() : null,
        paypal_email: method === 'paypal' ? paypalEmail.trim() : null,
        status: 'requested'
      })

    if (withdrawError) throw withdrawError

    // 4. Cache payment credentials on user profile for future ease-of-use
    if (method === 'upi') {
      await supabase
        .from('users')
        .update({ upi_id: upiId.trim() })
        .eq('id', authUser.id)
    } else {
      await supabase
        .from('users')
        .update({ paypal_email: paypalEmail.trim() })
        .eq('id', authUser.id)
    }

    return NextResponse.json({ success: true, amountInr })
  } catch (error: any) {
    console.error('Withdrawal API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
