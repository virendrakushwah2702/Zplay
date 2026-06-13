'use client'

import { useEffect, useState } from 'react'
import ZapMascot from '@/components/ZapMascot'

interface Props {
  show: boolean
  message: string
  subMessage?: string
  onComplete: () => void
}

export default function CelebrationOverlay({
  show, message, subMessage, onComplete
}: Props) {
  const [particles, setParticles] = useState<Array<{
    id: number, x: number, color: string, delay: number
  }>>([])

  useEffect(() => {
    if (!show) return
    const colors = ['#6366F1','#F59E0B','#22C55E','#EF4444','#EC4899','#06B6D4']
    setParticles(Array.from({length:30}, (_,i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
    })))
    const timer = setTimeout(onComplete, 2500)
    return () => clearTimeout(timer)
  }, [show])

  if (!show) return null

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:100,
      display:'flex', alignItems:'center',
      justifyContent:'center', pointerEvents:'none',
      background:'rgba(0,0,0,0.3)',
    }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position:'absolute',
          left: `${p.x}%`,
          top:'-10px',
          width:'10px', height:'10px',
          borderRadius:'50%',
          background: p.color,
          animation: `fall 2s ease-in ${p.delay}s forwards`,
        }}/>
      ))}
      <div style={{
        background:'white', borderRadius:'24px',
        padding:'32px 40px', textAlign:'center',
        boxShadow:'0 20px 60px rgba(0,0,0,0.15)',
        pointerEvents:'auto',
      }}>
        <div style={{marginBottom:'8px', display:'flex', justifyContent:'center'}}>
          <ZapMascot mood="celebrating" size={90} showMessage={false} animate={true} />
        </div>
        <div style={{
          fontWeight:'800', fontSize:'22px',
          color:'#1E293B', fontFamily:'var(--font-nunito)',
          marginBottom:'4px',
        }}>{message}</div>
        {subMessage && (
          <div style={{
            fontSize:'14px', color:'#64748B', fontWeight:'600',
          }}>{subMessage}</div>
        )}
      </div>
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity:1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity:0; }
        }
      `}</style>
    </div>
  )
}
