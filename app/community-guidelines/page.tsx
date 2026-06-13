export default function GuidelinesPage() {
  const rules = [
    {
      emoji: '✅',
      title: 'What is Welcome',
      color: '#22C55E',
      bg: '#ECFDF5',
      items: [
        'Games on any topic — sports, puzzles, adventure, quiz, fun',
        'Cultural and regional games in any language',
        'Creative, funny, or experimental game concepts',
        'Remixes and variations of existing games',
        'Educational games for all ages',
      ]
    },
    {
      emoji: '❌',
      title: 'What is Not Allowed',
      color: '#EF4444',
      bg: '#FEF2F2',
      items: [
        'Adult or sexually explicit content of any kind',
        'Content targeting or exploiting children',
        'Hate speech, discrimination, or violence',
        'Games designed to harass specific individuals',
        'Gambling mechanics with real money',
        'Misleading or fraudulent game descriptions',
        'Spam or artificially generated content at scale',
      ]
    },
    {
      emoji: '⚡',
      title: 'Creator Responsibilities',
      color: '#F59E0B',
      bg: '#FFFBEB',
      items: [
        'You are responsible for all games you publish',
        'Respond to reports about your games promptly',
        'Do not artificially inflate play counts',
        'Disclose if your game contains mature themes',
        'Respect other creators and their work',
      ]
    },
    {
      emoji: '🛡️',
      title: 'Enforcement',
      color: '#6366F1',
      bg: '#EEF2FF',
      items: [
        'First violation: Warning and content removal',
        'Second violation: 7-day suspension',
        'Third violation: Permanent account ban',
        'Serious violations (child safety, illegal content): Immediate ban',
        'Banned accounts forfeit all Spark Points',
        'Report violations using the Report button on any game',
      ]
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
        background: 'linear-gradient(135deg, #6366F1, #22C55E)',
        borderRadius: '16px', padding: '24px',
        marginBottom: '24px', color: 'white',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>
          Community Guidelines
        </h1>
        <p style={{ margin: '8px 0 0', opacity: 0.85, fontSize: '14px' }}>
          Zplay is for everyone. These rules keep it that way.
        </p>
      </div>

      {rules.map((rule, i) => (
        <div key={i} style={{
          background: rule.bg,
          border: `1px solid ${rule.color}40`,
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
        }}>
          <h2 style={{
            fontSize: '17px', fontWeight: '900',
            color: rule.color, margin: '0 0 12px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            {rule.emoji} {rule.title}
          </h2>
          {rule.items.map((item, j) => (
            <div key={j} style={{
              display: 'flex', gap: '8px',
              padding: '6px 0',
              borderBottom: j < rule.items.length - 1
                ? `1px solid ${rule.color}20` : 'none',
            }}>
              <span style={{ color: rule.color, fontWeight: '700' }}>•</span>
              <span style={{
                fontSize: '14px', color: '#1E293B',
                lineHeight: '1.5',
              }}>{item}</span>
            </div>
          ))}
        </div>
      ))}

      <div style={{
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '16px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '13px', color: '#64748B', margin: 0,
        }}>
          Questions? Contact us at{' '}
          <a href="mailto:support@zplay.fun"
             style={{ color: '#6366F1', fontWeight: '700' }}>
            support@zplay.fun
          </a>
        </p>
      </div>
    </div>
  )
}
