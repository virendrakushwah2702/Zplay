import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import BannerRefreshInit from '@/components/BannerRefreshInit'
import SparkStreakDisplay from '@/components/SparkStreakDisplay'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: 'Zplay — Build Any Game in 60 Seconds',
  description: 'Create playable games with AI in 60 seconds. No code required. Share with the world and earn money from your creations.',
  keywords: 'AI game maker, create games free, no code games, HTML5 games, game generator',
  openGraph: {
    title: 'Zplay — Build Any Game in 60 Seconds',
    description: 'Create playable games with AI in 60 seconds. No code required.',
    url: 'https://zplay.fun',
    siteName: 'Zplay',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zplay — Build Any Game in 60 Seconds',
    description: 'Create playable games with AI in 60 seconds.',
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `,
          }}
        />
      </head>
      <body className={`${nunito.variable} bg-[#F7F8FA] text-[#1E293B] min-h-screen`}>
        {children}
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          background: 'white',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '8px 0 12px',
          zIndex: 50,
          boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        }}>
          <a href="/" style={{
            display:'flex', flexDirection:'column',
            alignItems:'center', gap:'2px',
            textDecoration:'none', color:'#64748B',
            fontSize:'10px', fontWeight:'600',
          }}>
            <span style={{fontSize:'22px'}}>🏠</span>
            <span>Home</span>
          </a>
          <a href="/" style={{
            display:'flex', flexDirection:'column',
            alignItems:'center', gap:'2px',
            textDecoration:'none', color:'#64748B',
            fontSize:'10px', fontWeight:'600',
          }}>
            <span style={{fontSize:'22px'}}>✨</span>
            <span>Create</span>
          </a>
          <a href="/leaderboard" style={{
            display:'flex', flexDirection:'column',
            alignItems:'center', gap:'2px',
            textDecoration:'none', color:'#64748B',
            fontSize:'10px', fontWeight:'600',
          }}>
            <span style={{fontSize:'22px'}}>🏆</span>
            <span>Top</span>
          </a>
          <SparkStreakDisplay />
          <a href="/dashboard" style={{
            display:'flex', flexDirection:'column',
            alignItems:'center', gap:'2px',
            textDecoration:'none', color:'#64748B',
            fontSize:'10px', fontWeight:'600',
          }}>
            <span style={{fontSize:'22px'}}>👤</span>
            <span>Me</span>
          </a>
        </nav>
        <BannerRefreshInit />
        <Toaster position="top-center" toastOptions={{
          style: { background: '#1e1b4b', color: '#fff', border: '1px solid #6366f1' }
        }} />
      </body>
    </html>
  )
}
