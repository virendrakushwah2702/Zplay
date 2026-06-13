'use client'
import { useState } from 'react'
import ZapMascot from '@/components/ZapMascot'

interface Props {
  sparksEarned: number
  playsCount: number
  gameIds: string[]
  onActivate: (creatorName: string) => void
  onClose: () => void
}

export default function CreatorActivationModal({
  sparksEarned,
  playsCount,
  gameIds,
  onActivate,
  onClose,
}: Props) {
  const [step, setStep] = useState(1)
  const [creatorName, setCreatorName] = useState('')
  const [activating, setActivating] = useState(false)

  const handleActivate = async () => {
    if (!creatorName.trim()) return
    setActivating(true)
    await onActivate(creatorName.trim())
    setActivating(false)
    setStep(3)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '28px 24px',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
      }}>

        {step === 1 && (
          <>
            <ZapMascot mood="curious" size={80} showMessage={false} />
            <h2 style={{
              fontSize: '20px', fontWeight: '900',
              color: '#1E293B', margin: '16px 0 8px',
            }}>
              Psst... people are playing your games! 👀
            </h2>
            <p style={{
              fontSize: '14px', color: '#64748B',
              lineHeight: '1.5', margin: '0 0 16px',
            }}>
              While you were creating, <strong>{playsCount} people</strong> played your games.
              You have already earned{' '}
              <strong style={{ color: '#F59E0B' }}>⚡ {sparksEarned} Sparks</strong>{' '}
              — without even knowing it!
            </p>
            <div style={{
              background: '#FFFBEB',
              border: '1px solid #F59E0B',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px',
            }}>
              <div style={{
                fontSize: '28px', fontWeight: '900',
                color: '#F59E0B',
              }}>⚡ {sparksEarned}</div>
              <div style={{
                fontSize: '12px', color: '#92400E',
                fontWeight: '700',
              }}>Sparks earned — ≈ Rs.{(sparksEarned / 100).toFixed(2)}</div>
            </div>
            <button
              onClick={() => setStep(2)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                border: 'none',
                borderRadius: '16px',
                padding: '14px',
                color: 'white',
                fontWeight: '800',
                fontSize: '16px',
                cursor: 'pointer',
                fontFamily: 'var(--font-nunito)',
              }}
            >
              Become a Creator — Free 🚀
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none',
                color: '#94A3B8', fontSize: '13px',
                cursor: 'pointer', marginTop: '10px',
                fontFamily: 'var(--font-nunito)',
              }}
            >
              Maybe later
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <ZapMascot mood="excited" size={80} showMessage={false} />
            <h2 style={{
              fontSize: '20px', fontWeight: '900',
              color: '#1E293B', margin: '16px 0 8px',
            }}>
              Choose your creator name
            </h2>
            <p style={{
              fontSize: '14px', color: '#64748B',
              margin: '0 0 16px',
            }}>
              This will appear on your public games
            </p>
            <input
              type="text"
              value={creatorName}
              onChange={e => setCreatorName(e.target.value)}
              placeholder="Your creator name..."
              maxLength={30}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #6366F1',
                borderRadius: '12px',
                fontSize: '16px',
                fontFamily: 'var(--font-nunito)',
                fontWeight: '700',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '16px',
              }}
            />
            <button
              onClick={handleActivate}
              disabled={!creatorName.trim() || activating}
              style={{
                width: '100%',
                background: creatorName.trim()
                  ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                  : '#E2E8F0',
                border: 'none',
                borderRadius: '16px',
                padding: '14px',
                color: creatorName.trim() ? 'white' : '#94A3B8',
                fontWeight: '800',
                fontSize: '16px',
                cursor: creatorName.trim() ? 'pointer' : 'default',
                fontFamily: 'var(--font-nunito)',
              }}
            >
              {activating ? 'Activating...' : 'Unlock My Creator Dashboard 🎉'}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <ZapMascot mood="celebrating" size={90} showMessage={false} />
            <h2 style={{
              fontSize: '22px', fontWeight: '900',
              color: '#22C55E', margin: '16px 0 8px',
            }}>
              Welcome, {creatorName}! 🎉
            </h2>
            <p style={{
              fontSize: '14px', color: '#64748B',
              margin: '0 0 16px', lineHeight: '1.5',
            }}>
              You are now a Zplay Creator!
              Your games are earning Sparks every time someone plays.
            </p>
            <div style={{
              background: '#ECFDF5',
              border: '1px solid #22C55E',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#166534',
              lineHeight: '1.6',
            }}>
              ✅ Creator dashboard unlocked<br/>
              ✅ Your game URLs are now public<br/>
              ✅ Earnings tracking activated<br/>
              ✅ Withdraw when you reach Rs.50
            </div>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                border: 'none',
                borderRadius: '16px',
                padding: '14px',
                color: 'white',
                fontWeight: '800',
                fontSize: '16px',
                cursor: 'pointer',
                fontFamily: 'var(--font-nunito)',
              }}
            >
              Go to My Dashboard 🚀
            </button>
          </>
        )}
      </div>
    </div>
  )
}
