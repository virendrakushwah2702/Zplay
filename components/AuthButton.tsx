'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) return (
    <div style={{
      width: '80px', height: '32px',
      background: '#E2E8F0', borderRadius: '20px',
      animation: 'pulse 2s infinite'
    }}/>
  )

  if (user) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <img
        src={user.user_metadata?.avatar_url || ''}
        alt=""
        style={{ width: '28px', height: '28px',
                 borderRadius: '50%', border: '2px solid #6366F1' }}
      />
      <button
        onClick={signOut}
        style={{
          background: 'none', border: '1px solid #E2E8F0',
          borderRadius: '20px', padding: '4px 12px',
          fontSize: '12px', color: '#64748B', cursor: 'pointer',
          fontFamily: 'var(--font-nunito)',
        }}
      >Sign out</button>
    </div>
  )

  return (
    <button
      onClick={signIn}
      style={{
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        border: 'none', borderRadius: '20px',
        padding: '8px 16px', color: 'white',
        fontSize: '13px', fontWeight: '700',
        cursor: 'pointer', fontFamily: 'var(--font-nunito)',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}
    >
      <span>🔑</span> Sign in
    </button>
  )
}
