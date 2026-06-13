import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Free Unblocked Games — Play Anywhere | Zplay',
  description: 'Play hundreds of free unblocked games instantly in your browser. No download, no install, no signup required. Works on Chromebooks and school computers.',
}

export default async function UnblockedPage() {
  const supabase = await createClient()
  const { data: games } = await supabase
    .from('games')
    .select('id, title, slug, genre, play_count')
    .eq('status', 'published')
    .order('play_count', { ascending: false })
    .limit(50)

  return (
    <div style={{
      maxWidth: '680px', margin: '0 auto',
      padding: '24px 16px 80px',
      fontFamily: 'var(--font-nunito)',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #22C55E, #06B6D4)',
        borderRadius: '16px', padding: '24px',
        marginBottom: '20px', color: 'white',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>
          🎮 Free Unblocked Games
        </h1>
        <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '14px' }}>
          Play instantly — no download, no signup, no install.
          Works on Chromebooks and school computers.
        </p>
      </div>

      <div style={{
        background: '#FFFBEB',
        border: '1px solid #F59E0B40',
        borderRadius: '12px',
        padding: '14px 16px',
        marginBottom: '20px',
        fontSize: '13px',
        color: '#92400E',
      }}>
        ⚡ <strong>AI-powered games.</strong> Type any game idea and
        our AI builds it in 60 seconds — free, no coding needed.
        <a href="/" style={{ color: '#6366F1', fontWeight: '700',
                              marginLeft: '6px' }}>
          Create your own →
        </a>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
      }}>
        {(games || []).map(game => (
          <a
            key={game.id}
            href={`/game/${game.slug || game.id}`}
            style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '16px',
              textDecoration: 'none',
              color: '#1E293B',
              display: 'block',
              transition: 'box-shadow 0.2s',
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              borderRadius: '8px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              marginBottom: '10px',
            }}>
              🎮
            </div>
            <div style={{
              fontWeight: '800', fontSize: '13px',
              marginBottom: '4px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {game.title || 'Untitled Game'}
            </div>
            <div style={{
              fontSize: '11px', color: '#64748B',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>{game.genre || 'Casual'}</span>
              <span>▶ {game.play_count || 0}</span>
            </div>
          </a>
        ))}
      </div>

      {(!games || games.length === 0) && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
          <p style={{ fontSize: '16px' }}>🎮</p>
          <p>Games loading — check back soon!</p>
          <a href="/" style={{ color: '#6366F1', fontWeight: '700' }}>
            Create the first game →
          </a>
        </div>
      )}

      <div style={{
        marginTop: '24px',
        background: '#EEF2FF',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
      }}>
        <p style={{
          fontWeight: '800', fontSize: '15px',
          color: '#6366F1', margin: '0 0 6px',
        }}>
          Want to make your own game?
        </p>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 12px' }}>
          Type any idea. AI builds it in 60 seconds. Free.
        </p>
        <a href="/" style={{
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          color: 'white', borderRadius: '20px',
          padding: '10px 24px', fontWeight: '800',
          fontSize: '14px', textDecoration: 'none',
          display: 'inline-block',
        }}>
          Create My Game ⚡
        </a>
      </div>
    </div>
  )
}
