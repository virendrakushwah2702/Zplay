import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username} — Zplay Creator`,
    description: `Play games created by ${username} on Zplay. Free AI-generated games.`,
  }
}

export default async function CreatorProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: creator } = await supabase
    .from('users')
    .select('id, creator_name, sparks_lifetime, created_at')
    .eq('creator_name', username)
    .eq('is_creator', true)
    .single()

  if (!creator) {
    return (
      <div style={{
        maxWidth: '680px', margin: '0 auto',
        padding: '40px 16px',
        textAlign: 'center',
        fontFamily: 'var(--font-nunito)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
        <h1 style={{ color: '#1E293B' }}>Creator not found</h1>
        <a href="/" style={{ color: '#6366F1' }}>← Back to Zplay</a>
      </div>
    )
  }

  const { data: games } = await supabase
    .from('games')
    .select('id, title, slug, play_count, like_count, genre')
    .eq('creator_id', creator.id)
    .eq('status', 'published')
    .order('play_count', { ascending: false })
    .limit(20)

  const totalPlays = games?.reduce((s, g) => s + (g.play_count || 0), 0) || 0

  return (
    <div style={{
      maxWidth: '680px', margin: '0 auto',
      padding: '20px 16px 80px',
      fontFamily: 'var(--font-nunito)',
      color: '#1E293B',
    }}>
      {/* Creator header */}
      <div style={{
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        borderRadius: '16px', padding: '24px',
        marginBottom: '16px', color: 'white',
        textAlign: 'center',
      }}>
        <div style={{
          width: '64px', height: '64px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px', margin: '0 auto 12px',
        }}>
          🎮
        </div>
        <h1 style={{
          fontSize: '22px', fontWeight: '900',
          margin: '0 0 4px',
        }}>
          {creator.creator_name}
        </h1>
        <div style={{ opacity: 0.8, fontSize: '13px' }}>
          Zplay Creator
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px', marginBottom: '20px',
      }}>
        {[
          { label: '🎮 Games', value: games?.length || 0 },
          { label: '▶ Total Plays', value: totalPlays.toLocaleString() },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '24px', fontWeight: '900',
              color: '#6366F1',
            }}>{stat.value}</div>
            <div style={{
              fontSize: '12px', color: '#64748B',
              fontWeight: '700',
            }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Games list */}
      <div style={{
        fontWeight: '800', fontSize: '15px',
        marginBottom: '12px',
      }}>
        Games by {creator.creator_name}
      </div>

      {(games || []).map(game => (
        <a
          key={game.id}
          href={`/game/${game.slug || game.id}`}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '8px',
            textDecoration: 'none',
            color: '#1E293B',
          }}
        >
          <div>
            <div style={{
              fontWeight: '800', fontSize: '14px',
              marginBottom: '3px',
            }}>
              {game.title || 'Untitled Game'}
            </div>
            <div style={{
              fontSize: '12px', color: '#64748B',
            }}>
              ▶ {game.play_count || 0} plays · {game.genre || 'Casual'}
            </div>
          </div>
          <div style={{ color: '#6366F1', fontSize: '18px' }}>→</div>
        </a>
      ))}

      {(!games || games.length === 0) && (
        <div style={{
          textAlign: 'center', padding: '32px',
          color: '#64748B',
        }}>
          No published games yet.
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <a href="/" style={{
          color: '#6366F1', fontWeight: '700',
          fontSize: '14px', textDecoration: 'none',
        }}>
          ← Back to Zplay
        </a>
      </div>
    </div>
  )
}
