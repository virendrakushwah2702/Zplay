import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getOrCreateReferralCode } from '@/lib/referral'
import CreatorChallenge from '@/components/CreatorChallenge'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users')
    .select('sparks_balance, sparks_lifetime, current_streak, is_creator, creator_name, referral_code')
    .eq('id', user.id)
    .single()

  const { data: myGames } = await supabase
    .from('games')
    .select('id, title, slug, play_count, like_count, status, created_at')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const sparksBalance = profile?.sparks_balance || 0
  const inrEquivalent = (sparksBalance / 100).toFixed(2)
  const canWithdraw = sparksBalance >= 5000
  const referralCode = profile?.referral_code ||
    await getOrCreateReferralCode(user.id)

  const totalPlays = myGames?.reduce((s, g) => s + (g.play_count || 0), 0) || 0

  return (
    <div style={{
      maxWidth: '680px', margin: '0 auto',
      padding: '20px 16px 80px',
      fontFamily: 'var(--font-nunito)',
      color: '#1E293B',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        borderRadius: '16px', padding: '20px',
        marginBottom: '16px', color: 'white',
      }}>
        <div style={{
          fontSize: '13px', opacity: 0.8, marginBottom: '4px',
        }}>
          {profile?.is_creator ? `👑 Creator: ${profile.creator_name}` : '🎮 Player Account'}
        </div>
        <div style={{ fontSize: '13px', opacity: 0.7 }}>
          {user.email}
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px', marginBottom: '16px',
      }}>
        {[
          { label: '⚡ Sparks', value: sparksBalance.toLocaleString(), color: '#F59E0B' },
          { label: '🎮 Games', value: myGames?.length || 0, color: '#6366F1' },
          { label: '▶ Total Plays', value: totalPlays.toLocaleString(), color: '#22C55E' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '14px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '20px', fontWeight: '900',
              color: stat.color,
            }}>{stat.value}</div>
            <div style={{
              fontSize: '11px', color: '#64748B',
              fontWeight: '700',
            }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Earnings card */}
      <div style={{
        background: canWithdraw ? '#ECFDF5' : '#FFFBEB',
        border: `1px solid ${canWithdraw ? '#22C55E' : '#F59E0B'}`,
        borderRadius: '16px', padding: '20px',
        marginBottom: '16px',
      }}>
        <div style={{
          fontWeight: '800', fontSize: '15px',
          color: '#1E293B', marginBottom: '8px',
        }}>
          💰 Your Earnings
        </div>
        <div style={{
          fontSize: '28px', fontWeight: '900',
          color: '#F59E0B', marginBottom: '4px',
        }}>
          ⚡ {sparksBalance.toLocaleString()}
        </div>
        <div style={{
          fontSize: '13px', color: '#64748B',
          marginBottom: '12px',
        }}>
          ≈ Rs.{inrEquivalent} · Min withdrawal: Rs.50 (5,000 Sparks)
        </div>

        {canWithdraw ? (
          <a href="/dashboard/withdraw" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #22C55E, #16A34A)',
            color: 'white', borderRadius: '12px',
            padding: '10px 20px', fontWeight: '800',
            fontSize: '14px', textDecoration: 'none',
          }}>
            Withdraw Rs.{inrEquivalent} 🏦
          </a>
        ) : (
          <div style={{
            fontSize: '12px', color: '#64748B',
          }}>
            {5000 - sparksBalance} more Sparks to unlock withdrawal
          </div>
        )}
      </div>

      {/* Streak card */}
      <div style={{
        background: '#FFF7ED',
        border: '1px solid #F97316',
        borderRadius: '12px', padding: '16px',
        marginBottom: '16px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontWeight: '800', fontSize: '15px',
            color: '#9A3412',
          }}>🔥 {profile?.current_streak || 0}-day streak</div>
          <div style={{
            fontSize: '12px', color: '#C2410C',
          }}>
            {profile?.current_streak && profile.current_streak >= 7
              ? 'Creator+ active!'
              : `${7 - (profile?.current_streak || 0)} days to Creator+`}
          </div>
        </div>
        <div style={{ fontSize: '32px' }}>🔥</div>
      </div>

      {/* 30-Day Creator Challenge */}
      <CreatorChallenge
        currentStreak={profile?.current_streak || 0}
        sparksLifetime={profile?.sparks_lifetime || 0}
      />

      {/* Referral card */}
      <div style={{
        background: '#EEF2FF',
        border: '1px solid #6366F140',
        borderRadius: '12px', padding: '16px',
        marginBottom: '16px',
      }}>
        <div style={{
          fontWeight: '800', fontSize: '14px',
          color: '#6366F1', marginBottom: '8px',
        }}>
          🔗 Your Referral Link
        </div>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '13px',
          fontWeight: '700',
          color: '#1E293B',
          wordBreak: 'break-all',
          marginBottom: '8px',
        }}>
          zplay.fun/join/{referralCode}
        </div>
        <div style={{
          fontSize: '12px', color: '#64748B',
        }}>
          Earn 50 Sparks when someone signs up using your link
        </div>
      </div>

      {/* My Games */}
      <div style={{
        fontWeight: '800', fontSize: '16px',
        marginBottom: '12px',
      }}>🎮 My Games</div>

      {myGames && myGames.length > 0 ? (
        myGames.map(game => (
          <div key={game.id} style={{
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: '800', fontSize: '14px',
                marginBottom: '4px',
              }}>
                {game.title || 'Untitled Game'}
              </div>
              <div style={{
                fontSize: '12px', color: '#64748B',
                display: 'flex', gap: '12px',
              }}>
                <span>▶ {game.play_count || 0} plays</span>
                <span>❤️ {game.like_count || 0} likes</span>
                <span style={{
                  color: game.status === 'published' ? '#22C55E' : '#F59E0B',
                  fontWeight: '700',
                }}>
                  {game.status === 'published' ? '✅ Live' : '⏸ Draft'}
                </span>
              </div>
            </div>
            <a
              href={`/game/${game.slug || game.id}`}
              style={{
                background: '#EEF2FF',
                color: '#6366F1',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                textDecoration: 'none',
              }}
            >
              Play →
            </a>
          </div>
        ))
      ) : (
        <div style={{
          textAlign: 'center', padding: '32px',
          color: '#64748B', fontSize: '14px',
        }}>
          No games yet.
          <a href="/" style={{ color: '#6366F1', fontWeight: '700',
                               marginLeft: '4px' }}>Create your first →</a>
        </div>
      )}
    </div>
  )
}
