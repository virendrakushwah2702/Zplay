export default function TermsPage() {
  return (
    <div style={{
      maxWidth: '680px', margin: '0 auto',
      padding: '32px 16px 80px',
      fontFamily: 'var(--font-nunito)',
      color: '#1E293B',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1E293B, #334155)',
        borderRadius: '16px', padding: '24px',
        marginBottom: '24px', color: 'white',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>
          Terms of Service
        </h1>
        <p style={{ margin: '8px 0 0', opacity: 0.8, fontSize: '14px' }}>
          Zplay · zplay.fun · Last updated: June 2026
        </p>
      </div>

      {[
        {
          title: '1. Acceptance of Terms',
          content: `By using Zplay, you agree to these Terms of Service. If you do not agree, please do not use the platform. We may update these terms and will notify users of significant changes.`
        },
        {
          title: '2. User Accounts',
          content: `You must provide accurate information when creating an account. You are responsible for maintaining the security of your account. Accounts are for individual use only. You must be at least 13 years old to create an account.`
        },
        {
          title: '3. User-Generated Content',
          content: `You are responsible for all games and content you create on Zplay. You must not create content that is illegal, harmful, hateful, sexually explicit, or violates others' rights. We reserve the right to remove any content that violates these terms without notice.`
        },
        {
          title: '4. Spark Points and Earnings',
          content: `Spark Points are a virtual rewards currency earned through platform activity. 100 Sparks = approximately Rs.1 (India) or $0.012 (Global). Minimum withdrawal is 5,000 Sparks (Rs.50 or $2). Zplay reserves the right to modify Spark values with 30 days notice. Sparks have no cash value until withdrawn and may be forfeited if your account is terminated for policy violations.`
        },
        {
          title: '5. Creator Revenue Sharing',
          content: `Creators earn 40% of advertising revenue generated from plays of their free games. Creators earn 70% of revenue from paid game sales. Revenue is calculated and paid monthly. Minimum payout thresholds apply. Revenue sharing may be adjusted with 60 days notice to creators.`
        },
        {
          title: '6. Prohibited Activities',
          content: `You must not attempt to manipulate play counts or advertising revenue. You must not use automated tools to generate games or plays artificially. You must not upload malicious code. Violations may result in immediate account termination and forfeiture of all earned Sparks.`
        },
        {
          title: '7. Platform Fees',
          content: `Zplay retains 60% of advertising revenue from free games and 30% of paid game sales as platform fees. Subscription fees are charged monthly and are non-refundable after 7 days. Credit pack purchases are non-refundable.`
        },
        {
          title: '8. Limitation of Liability',
          content: `Zplay is provided as-is. We do not guarantee uninterrupted service or specific earnings from the platform. Our liability is limited to the amount you paid us in the 12 months prior to any claim.`
        },
        {
          title: '9. Governing Law',
          content: `These terms are governed by the laws of India. Disputes shall be resolved in courts of Indore, Madhya Pradesh, India.`
        },
        {
          title: '10. Contact',
          content: `For terms questions, contact legal@zplay.fun or support@zplay.fun.`
        },
      ].map((section, i) => (
        <div key={i} style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '12px',
        }}>
          <h2 style={{
            fontSize: '16px', fontWeight: '800',
            color: '#1E293B', margin: '0 0 8px',
          }}>{section.title}</h2>
          <p style={{
            fontSize: '14px', color: '#64748B',
            lineHeight: '1.6', margin: 0,
          }}>{section.content}</p>
        </div>
      ))}
    </div>
  )
}
