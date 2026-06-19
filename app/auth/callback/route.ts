import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { processReferral } from '@/lib/referral'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)
    
    if (session?.user) {
      const { id, email, user_metadata } = session.user
      // Upsert into public.users table to prevent foreign key errors
      const supabase = await createClient()
      await supabase
        .from('users')
        .upsert({
          id,
          email: email || '',
          name: user_metadata?.full_name || user_metadata?.name || null,
          avatar_url: user_metadata?.avatar_url || null
        }, { onConflict: 'id' })

      const cookieStore = await cookies()
      const refCode = cookieStore.get('zplay_ref')?.value
      if (refCode) {
        await processReferral(refCode, session.user.id)
      }
    }
  }
  return NextResponse.redirect(`${origin}/`)
}
