'use client'

import { useState } from 'react'
import Link from 'next/link'
import CelebrationOverlay from '@/components/CelebrationOverlay'
import toast from 'react-hot-toast'

interface Props {
  initialBalance: number
  referralCode: string
  savedUpi: string
  savedPaypal: string
}

export default function WithdrawForm({
  initialBalance,
  referralCode,
  savedUpi,
  savedPaypal,
}: Props) {
  const [balance, setBalance] = useState(initialBalance)
  const [method, setMethod] = useState<'upi' | 'paypal'>('upi')
  const [upiId, setUpiId] = useState(savedUpi)
  const [paypalEmail, setPaypalEmail] = useState(savedPaypal)
  const [amountSparks, setAmountSparks] = useState(initialBalance >= 5000 ? initialBalance : 5000)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const inrValue = (amountSparks / 100).toFixed(2)

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()

    if (balance < 5000) {
      toast.error('Minimum withdrawal is Rs.50 (5,000 Sparks)')
      return
    }

    if (amountSparks < 5000) {
      toast.error('Minimum withdrawal is 5,000 Sparks')
      return
    }

    if (amountSparks > balance) {
      toast.error('Insufficient Sparks')
      return
    }

    if (method === 'upi' && !upiId.trim()) {
      toast.error('UPI ID is required')
      return
    }

    if (method === 'paypal' && !paypalEmail.trim()) {
      toast.error('PayPal Email is required')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountSparks,
          method,
          upiId: method === 'upi' ? upiId.trim() : undefined,
          paypalEmail: method === 'paypal' ? paypalEmail.trim() : undefined,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setBalance(prev => prev - amountSparks)
        setSuccess(true)
        setShowCelebration(true)
        toast.success('Withdrawal request submitted! 🏦')
      } else {
        toast.error(data.error || 'Withdrawal request failed')
      }
    } catch {
      toast.error('Internal server error')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    const text = `Maine Zplay se Rs.${inrValue} kamaye! Tu bhi apna prompt dal, game bana aur paise kama: https://zplay.fun/join/${referralCode}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (success) {
    return (
      <div style={{
        maxWidth: '480px', margin: '40px auto',
        padding: '32px 24px', background: 'white',
        borderRadius: '24px', border: '1px solid #E2E8F0',
        textAlign: 'center', fontFamily: 'var(--font-nunito)',
        color: '#1E293B',
      }}>
        <CelebrationOverlay
          show={showCelebration}
          message="Withdrawal Successful! 🎉"
          subMessage={`Rs.${inrValue} has been requested`}
          onComplete={() => setShowCelebration(false)}
        />
        
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>💰</div>
        <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#22C55E', margin: '0 0 8px' }}>
          Request Submitted!
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', margin: '0 0 24px' }}>
          Your withdrawal of <strong>Rs.{inrValue}</strong> ({amountSparks.toLocaleString()} Sparks) is being processed. 
          Bank transfers usually complete within 2-24 hours.
        </p>

        <button
          onClick={handleShare}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #22C55E, #16A34A)',
            border: 'none', borderRadius: '16px',
            padding: '14px', color: 'white',
            fontWeight: '800', fontSize: '15px',
            cursor: 'pointer', fontFamily: 'var(--font-nunito)',
            marginBottom: '12px',
          }}
        >
          Share Earnings on WhatsApp 🚀
        </button>

        <Link
          href="/dashboard"
          style={{
            display: 'block', textDecoration: 'none',
            color: '#6366F1', fontWeight: '800',
            fontSize: '14px',
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '480px', margin: '20px auto',
      padding: '24px 16px 80px',
      fontFamily: 'var(--font-nunito)',
      color: '#1E293B',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        borderRadius: '16px', padding: '20px',
        color: 'white', marginBottom: '20px',
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 4px' }}>
          Withdraw Earnings
        </h1>
        <p style={{ fontSize: '13px', opacity: 0.8, margin: 0 }}>
          Exchange your Spark Points for real money
        </p>
      </div>

      <div style={{
        background: '#FFFBEB',
        border: '1px solid #F59E0B',
        borderRadius: '16px', padding: '20px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '13px', color: '#92400E', fontWeight: '700', marginBottom: '4px' }}>
          Available Balance
        </div>
        <div style={{ fontSize: '32px', fontWeight: '900', color: '#F59E0B', marginBottom: '4px' }}>
          ⚡ {balance.toLocaleString()}
        </div>
        <div style={{ fontSize: '13px', color: '#64748B' }}>
          ≈ Rs.{(balance / 100).toFixed(2)}
        </div>
      </div>

      <form onSubmit={handleWithdraw} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
        {/* Method selection */}
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px' }}>
          PAYOUT METHOD
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setMethod('upi')}
            style={{
              padding: '12px',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '14px',
              border: `2px solid ${method === 'upi' ? '#6366F1' : '#E2E8F0'}`,
              background: method === 'upi' ? '#EEF2FF' : 'white',
              color: method === 'upi' ? '#6366F1' : '#64748B',
              cursor: 'pointer',
              fontFamily: 'var(--font-nunito)',
            }}
          >
            🇮🇳 UPI (India)
          </button>
          <button
            type="button"
            onClick={() => setMethod('paypal')}
            style={{
              padding: '12px',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '14px',
              border: `2px solid ${method === 'paypal' ? '#6366F1' : '#E2E8F0'}`,
              background: method === 'paypal' ? '#EEF2FF' : 'white',
              color: method === 'paypal' ? '#6366F1' : '#64748B',
              cursor: 'pointer',
              fontFamily: 'var(--font-nunito)',
            }}
          >
            🌎 PayPal (Global)
          </button>
        </div>

        {/* Inputs */}
        {method === 'upi' ? (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '6px' }}>
              UPI ID (VPA)
            </label>
            <input
              type="text"
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
              placeholder="e.g. name@upi"
              style={{
                width: '100%', padding: '12px',
                border: '1px solid #E2E8F0', borderRadius: '12px',
                fontSize: '14px', fontWeight: '700', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '6px' }}>
              PAYPAL EMAIL
            </label>
            <input
              type="email"
              value={paypalEmail}
              onChange={e => setPaypalEmail(e.target.value)}
              placeholder="e.g. name@paypal.com"
              style={{
                width: '100%', padding: '12px',
                border: '1px solid #E2E8F0', borderRadius: '12px',
                fontSize: '14px', fontWeight: '700', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {/* Amount */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '6px' }}>
            WITHDRAW AMOUNT (SPARK POINTS)
          </label>
          <input
            type="number"
            value={amountSparks}
            onChange={e => setAmountSparks(Math.max(0, parseInt(e.target.value) || 0))}
            min={5000}
            max={balance}
            style={{
              width: '100%', padding: '12px',
              border: '1px solid #E2E8F0', borderRadius: '12px',
              fontSize: '14px', fontWeight: '700', outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '6px',
            }}
          />
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            You will receive: <strong>Rs.{inrValue}</strong>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || balance < 5000}
          style={{
            width: '100%',
            background: balance >= 5000
              ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
              : '#E2E8F0',
            border: 'none', borderRadius: '16px',
            padding: '14px', color: balance >= 5000 ? 'white' : '#94A3B8',
            fontWeight: '800', fontSize: '15px',
            cursor: balance >= 5000 ? 'pointer' : 'default',
            fontFamily: 'var(--font-nunito)',
          }}
        >
          {loading ? 'Processing...' : `Request Payout of Rs.${inrValue} 🏦`}
        </button>

        {balance < 5000 && (
          <div style={{ fontSize: '11px', color: '#EF4444', textAlign: 'center', marginTop: '10px', fontWeight: '700' }}>
            Minimum payout is Rs.50 (5,000 Sparks)
          </div>
        )}
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link href="/dashboard" style={{ color: '#6366F1', fontWeight: '800', fontSize: '13px', textDecoration: 'none' }}>
          ← Cancel and Return
        </Link>
      </div>
    </div>
  )
}
