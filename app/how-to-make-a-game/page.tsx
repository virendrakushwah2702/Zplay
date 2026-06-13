export const metadata = {
  title: 'How to Make a Game with AI in 60 Seconds | Zplay',
  description: 'Learn how to create your own game using AI — no coding needed. Type any game idea and AI builds a complete playable game instantly. Free on Zplay.',
}

export default function HowToPage() {
  const steps = [
    {
      num: '1', emoji: '💭',
      title: 'Think of any game idea',
      desc: 'Cricket batting game, car racing, puzzle, quiz, jumping game — anything you can describe in words.',
    },
    {
      num: '2', emoji: '⌨️',
      title: 'Type it in plain language',
      desc: 'No coding language needed. Just describe your game in Hindi or English. Example: "Cricket game where Virat Kohli bats against Bumrah"',
    },
    {
      num: '3', emoji: '⚡',
      title: 'AI builds it in 60 seconds',
      desc: "Zplay's AI writes all the game code, creates the graphics, and makes it playable — automatically.",
    },
    {
      num: '4', emoji: '🎮',
      title: 'Play it instantly',
      desc: 'Your game runs in the browser. No download, no install. Share it with friends on WhatsApp immediately.',
    },
    {
      num: '5', emoji: '⚡',
      title: 'Publish and earn Sparks',
      desc: 'Publish your game to the Zplay community. Every time someone plays it, you earn Spark Points — redeemable for real money.',
    },
  ]

  return (
    <div style={{
      maxWidth: '680px', margin: '0 auto',
      padding: '32px 16px 80px',
      fontFamily: 'var(--font-nunito)',
      color: '#1E293B',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1E293B, #6366F1)',
        borderRadius: '16px', padding: '28px',
        marginBottom: '24px', color: 'white',
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 8px' }}>
          How to Make a Game with AI
        </h1>
        <p style={{ margin: 0, opacity: 0.85, fontSize: '14px' }}>
          No coding. No design skills. Just your idea — and 60 seconds.
        </p>
      </div>

      {steps.map((step, i) => (
        <div key={i} style={{
          display: 'flex', gap: '16px',
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '18px',
          marginBottom: '10px',
          alignItems: 'flex-start',
        }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            color: 'white', fontWeight: '900', fontSize: '16px',
          }}>{step.num}</div>
          <div>
            <div style={{
              fontWeight: '800', fontSize: '15px', marginBottom: '4px',
            }}>
              {step.emoji} {step.title}
            </div>
            <div style={{
              fontSize: '13px', color: '#64748B', lineHeight: '1.5',
            }}>{step.desc}</div>
          </div>
        </div>
      ))}

      <div style={{
        background: '#EEF2FF',
        borderRadius: '16px', padding: '24px',
        textAlign: 'center', marginTop: '20px',
      }}>
        <div style={{
          fontWeight: '900', fontSize: '18px',
          color: '#6366F1', marginBottom: '8px',
        }}>
          Ready to make your first game?
        </div>
        <div style={{
          fontSize: '13px', color: '#64748B', marginBottom: '16px',
        }}>
          Free. No signup required. Works on any device.
        </div>
        <a href="/" style={{
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          color: 'white', borderRadius: '24px',
          padding: '12px 28px', fontWeight: '900',
          fontSize: '15px', textDecoration: 'none',
          display: 'inline-block',
        }}>
          Create My Game ⚡
        </a>
      </div>

      <div style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '12px' }}>
          Game ideas to get you started
        </h2>
        {[
          'Cricket batting game with your favourite player',
          'Dodge the cars on a Delhi highway',
          'Catch falling samosas before they hit the ground',
          'Quiz game about Indian history',
          'Rickshaw racing through Mumbai traffic',
          'Diwali fireworks catching game',
          'IPL super over challenge',
          'Flappy bird with a chai glass',
        ].map((idea, i) => (
          <a key={i} href="/" style={{
            display: 'block',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '8px',
            fontSize: '13px',
            color: '#1E293B',
            textDecoration: 'none',
            fontWeight: '600',
          }}>
            💡 {idea}
          </a>
        ))}
      </div>
    </div>
  )
}
