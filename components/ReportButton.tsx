'use client'
import { useState } from 'react'

interface Props {
  gameId: string
}

const REASONS = [
  'Inappropriate content',
  'Hate speech or discrimination',
  'Violence or dangerous content',
  'Spam or misleading',
  'Content involving minors',
  'Other',
]

export default function ReportButton({ gameId }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, reason: selected }),
      })
      setSubmitted(true)
    } catch {}
    setSubmitting(false)
  }

  if (submitted) return (
    <div style={{
      fontSize: '12px', color: '#22C55E',
      padding: '6px 12px',
    }}>
      ✅ Reported. Thank you.
    </div>
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'none',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '12px',
          color: '#94A3B8',
          cursor: 'pointer',
          fontFamily: 'var(--font-nunito)',
        }}
      >
        🚩 Report
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={e => e.target === e.currentTarget && setOpen(false)}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '380px',
          }}>
            <h3 style={{
              fontWeight: '800', fontSize: '16px',
              margin: '0 0 16px', color: '#1E293B',
            }}>
              🚩 Report this game
            </h3>

            {REASONS.map(reason => (
              <label key={reason} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 0',
                borderBottom: '1px solid #F1F5F9',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#1E293B',
              }}>
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={selected === reason}
                  onChange={() => setSelected(reason)}
                  style={{ accentColor: '#6366F1' }}
                />
                {reason}
              </label>
            ))}

            <div style={{
              display: 'flex', gap: '10px',
              marginTop: '16px',
            }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  flex: 1, padding: '10px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'var(--font-nunito)',
                }}
              >Cancel</button>
              <button
                onClick={submit}
                disabled={!selected || submitting}
                style={{
                  flex: 1, padding: '10px',
                  background: selected ? '#EF4444' : '#E2E8F0',
                  border: 'none',
                  borderRadius: '8px',
                  color: selected ? 'white' : '#94A3B8',
                  cursor: selected ? 'pointer' : 'default',
                  fontSize: '14px',
                  fontWeight: '700',
                  fontFamily: 'var(--font-nunito)',
                }}
              >
                {submitting ? 'Sending...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
