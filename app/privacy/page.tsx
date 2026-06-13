export default function PrivacyPage() {
  return (
    <div style={{
      maxWidth: '680px', margin: '0 auto',
      padding: '32px 16px 80px',
      fontFamily: 'var(--font-nunito)',
      color: '#1E293B',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        borderRadius: '16px', padding: '24px',
        marginBottom: '24px', color: 'white',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>
          Privacy Policy
        </h1>
        <p style={{ margin: '8px 0 0', opacity: 0.8, fontSize: '14px' }}>
          Zplay · zplay.fun · Last updated: June 2026
        </p>
      </div>

      {[
        {
          title: '1. Information We Collect',
          content: `We collect information you provide when creating an account (name, email, profile picture via Google Sign-In). We automatically collect game creation data, play counts, and usage analytics to improve our service. We do not sell your personal data to third parties.`
        },
        {
          title: '2. How We Use Your Information',
          content: `We use your information to provide and improve Zplay services, display your games and creator profile, calculate and pay Spark Points earnings, send important service notifications, and show relevant advertisements through Google AdMob and AppLovin MAX.`
        },
        {
          title: '3. Advertising',
          content: `Zplay uses Google AdMob and AppLovin MAX to display advertisements. These services may collect device identifiers and usage data to serve relevant ads. You can opt out of personalised advertising in your device settings. Rewarded advertisements are always voluntary.`
        },
        {
          title: '4. Creator Earnings and Sparks',
          content: `Spark Points are a virtual rewards currency. When you withdraw Sparks, we collect your UPI ID (India) or PayPal email (global) solely for payment processing. We do not store full payment account details on our servers.`
        },
        {
          title: '5. User-Generated Content',
          content: `Games you create on Zplay are stored on our servers. Published games are visible to all users. You retain creative ownership of your game concepts, but grant Zplay a licence to host, display, and distribute your games on the platform. We moderate content for safety.`
        },
        {
          title: '6. Data Retention',
          content: `We retain your account data while your account is active. You may request deletion of your account and associated data by contacting support@zplay.fun. Game data may be retained for up to 30 days after account deletion for platform integrity purposes.`
        },
        {
          title: "7. Children's Privacy",
          content: `Zplay is rated for users aged 13 and above. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has created an account, please contact us immediately at support@zplay.fun.`
        },
        {
          title: '8. Contact Us',
          content: `For privacy questions or data requests, contact us at support@zplay.fun. We respond to all privacy enquiries within 7 business days.`
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
            color: '#6366F1', margin: '0 0 8px',
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
