import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WithdrawForm from './WithdrawForm'

export default async function WithdrawPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users')
    .select('sparks_balance, is_creator, creator_name, referral_code, upi_id, paypal_email')
    .eq('id', user.id)
    .single()

  if (!profile?.is_creator) redirect('/dashboard')

  return (
    <WithdrawForm
      initialBalance={profile.sparks_balance || 0}
      referralCode={profile.referral_code || ''}
      savedUpi={profile.upi_id || ''}
      savedPaypal={profile.paypal_email || ''}
    />
  )
}
