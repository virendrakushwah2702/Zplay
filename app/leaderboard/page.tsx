import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leaderboard — Top Creators & Games on Zplay',
  description: 'See the top game creators and most-played games on Zplay. Free AI-generated games.',
}

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const [{ data: topCreators }, { data: topGames }] = await Promise.all([
    supabase
      .from('users')
      .select('id, creator_name, sparks_lifetime')
      .eq('is_creator', true)
      .order('sparks_lifetime', { ascending: false })
      .limit(10),
    supabase
      .from('games')
      .select('id, title, slug, play_count, like_count, genre, users(creator_name)')
      .eq('status', 'published')
      .order('play_count', { ascending: false })
      .limit(10),
  ])

  const medals = ['🥇', '🥈', '🥉']

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
        borderRadius: '16px', padding: '24px',
        marginBottom: '20px', color: 'white',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏆</div>
        <h1 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 4px' }}>
          Leaderboard
        </h1>
        <div style={{ opacity: 0.8, fontSize: '13px' }}>
          Top creators and most-played games
        </div>
      </div>

      {/* Top Creators */}
      <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '12px' }}>
        👑 Top Creators
      </div>

      {(topCreators || []).map((creator, index) => (
        <a
          key={creator.id}
          href={`/creator/${creator.creator_name}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '8px',
            textDecoration: 'none',
            color: '#1E293B',
          }}
        >
          <div style={{
            width: '32px', textAlign: 'center',
            fontSize: index < 3 ? '22px' : '16px',
            fontWeight: '900', color: '#6366F1',
          }}>
            {medals[index] || `#${index + 1}`}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '800', fontSize: '14px' }}>
              {creator.creator_name}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              ⚡ {(creator.sparks_lifetime || 0).toLocaleString()} Sparks earned
            </div>
          </div>
          <div style={{ color: '#6366F1', fontSize: '18px' }}>→</div>
        </a>
      ))}

      {(!topCreators || topCreators.length === 0) && (
        <div style={{ textAlign: 'center', padding: '24px', color: '#64748B', fontSize: '14px' }}>
          No creators yet. Be the first!
        </div>
      )}

      {/* Top Games */}
      <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '12px', marginTop: '24px' }}>
        🎮 Most Played Games
      </div>

      {(topGames || []).map((game, index) => (
        <a
          key={game.id}
          href={`/game/${game.slug || game.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '8px',
            textDecoration: 'none',
            color: '#1E293B',
          }}
        >
          <div style={{
            width: '32px', textAlign: 'center',
            fontSize: index < 3 ? '22px' : '16px',
            fontWeight: '900', color: '#6366F1',
          }}>
            {medals[index] || `#${index + 1}`}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '800', fontSize: '14px' }}>
              {game.title || 'Untitled Game'}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              ▶ {(game.play_count || 0).toLocaleString()} plays ·{' '}
              {(game as any).users?.creator_name || 'Anonymous'} · {game.genre || 'Casual'}
            </div>
          </div>
          <div style={{ color: '#6366F1', fontSize: '18px' }}>→</div>
        </a>
      ))}

      {(!topGames || topGames.length === 0) && (
        <div style={{ textAlign: 'center', padding: '24px', color: '#64748B', fontSize: '14px' }}>
          No games yet. Create the first one!
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
