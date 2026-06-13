'use client'
import { useEffect, useState } from 'react'

export default function SparkStreakDisplay() {
  const [data, setData] = useState({ balance: 0, streak: 0 })

  useEffect(() => {
    fetch('/api/sparks/balance')
      .then(r => r.json())
      .then(d => setData({ balance: d.balance || 0, streak: d.streak || 0 }))
      .catch(() => {})
  }, [])

  return (
    <>
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '2px',
        color: '#92400E', fontSize: '10px', fontWeight: '700',
      }}>
        <span style={{
          background: '#FFFBEB', border: '1px solid #F59E0B',
          borderRadius: '12px', padding: '2px 10px',
          fontSize: '14px', fontWeight: '800', color: '#92400E',
        }}>⚡ {data.balance}</span>
        <span style={{ color: '#64748B' }}>Sparks</span>
      </div>
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '2px',
        color: '#9A3412', fontSize: '10px', fontWeight: '700',
      }}>
        <span style={{
          background: '#FFF7ED', border: '1px solid #F97316',
          borderRadius: '12px', padding: '2px 10px',
          fontSize: '14px', fontWeight: '800', color: '#9A3412',
        }}>🔥 {data.streak}</span>
        <span style={{ color: '#64748B' }}>Streak</span>
      </div>
    </>
  )
}
