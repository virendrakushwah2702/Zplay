export const metadata = {
  title: 'FAQ — Zplay AI Game Creator | How It Works',
  description: 'Frequently asked questions about Zplay. How to create AI games, earn Spark Points, withdraw earnings, and more.',
}

const faqs = [
  {
    q: 'What is Zplay?',
    a: 'Zplay is an AI game creation platform. Type any game idea in plain language and AI builds a complete playable game in 60 seconds — no coding needed.',
  },
  {
    q: 'Is Zplay free to use?',
    a: 'Yes. You get 3 free game generations per day with no account required. Sign in with Google for more features. Paid plans give you more generations and remove ads.',
  },
  {
    q: 'How do I earn money on Zplay?',
    a: 'Creators earn Spark Points every time someone plays their game. 100 Sparks = Rs.1 (India) or $0.012 (Global). Withdraw when you reach Rs.50 or $2.',
  },
  {
    q: 'What is the minimum withdrawal amount?',
    a: 'Rs.50 for India (UPI) and $2 for global users (PayPal). Withdrawals are processed within 24 hours.',
  },
  {
    q: 'Can I make games in Hindi?',
    a: 'Yes! Type your game idea in Hindi, English, or any language. Zplay generates games with culturally relevant themes and content.',
  },
  {
    q: 'Do the games work on mobile?',
    a: 'Yes. All Zplay games are built for mobile-first with touch controls. They work on any device with a web browser — no download needed.',
  },
  {
    q: 'What kinds of games can I make?',
    a: 'Any kind — cricket games, racing games, puzzle games, quiz games, platformers, catching games, shooting games, memory games, and more. If you can describe it, AI can build it.',
  },
  {
    q: 'How does the AI generate games?',
    a: 'Zplay uses DeepSeek AI to generate complete HTML5 games from your description. The AI writes all the game code, graphics, and logic in one shot.',
  },
  {
    q: 'Can I share my game?',
    a: 'Yes. Every published game gets a unique URL you can share on WhatsApp, Instagram, or anywhere. Every play on your shared link earns you Sparks.',
  },
  {
    q: 'Is there an app?',
    a: 'The Android app is coming soon on Google Play Store. Meanwhile, zplay.fun works perfectly as a web app on any device.',
  },
]

export default function FAQPage() {
  return (
    <div style={{
      maxWidth: '680px', margin: '0 auto',
      padding: '32px 16px 80px',
      fontFamily: 'var(--font-nunito)',
      color: '#1E293B',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
        borderRadius: '16px', padding: '24px',
        marginBottom: '24px', color: 'white',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>
          Frequently Asked Questions
        </h1>
        <p style={{ margin: '8px 0 0', opacity: 0.85, fontSize: '14px' }}>
          Everything you need to know about Zplay
        </p>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a,
              }
            }))
          })
        }}
      />

      {faqs.map((faq, i) => (
        <div key={i} style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '10px',
        }}>
          <h2 style={{
            fontSize: '15px', fontWeight: '800',
            color: '#1E293B', margin: '0 0 8px',
          }}>
            <span style={{ color: '#6366F1' }}>Q: </span>{faq.q}
          </h2>
          <p style={{
            fontSize: '14px', color: '#64748B',
            lineHeight: '1.6', margin: 0,
          }}>
            <span style={{ color: '#22C55E', fontWeight: '700' }}>A: </span>
            {faq.a}
          </p>
        </div>
      ))}

      <div style={{
        background: '#EEF2FF',
        border: '1px solid #6366F180',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
        marginTop: '16px',
      }}>
        <p style={{ fontSize: '14px', color: '#6366F1',
                    fontWeight: '700', margin: '0 0 4px' }}>
          Still have questions?
        </p>
        <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
          Email us at{' '}
          <a href="mailto:support@zplay.fun"
             style={{ color: '#6366F1' }}>support@zplay.fun</a>
        </p>
      </div>
    </div>
  )
}
