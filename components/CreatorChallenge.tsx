'use client'

import { useState } from 'react'

interface DayTask {
  day: number
  task: string
  sparks: number
}

const CHALLENGE_DAYS: DayTask[] = [
  { day: 1, task: 'Create your first game', sparks: 5 },
  { day: 2, task: 'Share a game with a friend', sparks: 10 },
  { day: 3, task: 'Get 5 plays on one game', sparks: 15 },
  { day: 5, task: 'Create 3 different games', sparks: 20 },
  { day: 7, task: '7-day streak — unlock Creator+', sparks: 70 },
  { day: 10, task: 'Get 25 total plays', sparks: 30 },
  { day: 15, task: '15-day streak milestone', sparks: 200 },
  { day: 20, task: 'Earn 500 Sparks total', sparks: 50 },
  { day: 30, task: '30-day streak — Master Creator!', sparks: 500 },
]

interface CreatorChallengeProps {
  currentStreak: number
  sparksLifetime: number
}

export default function CreatorChallenge({ currentStreak, sparksLifetime }: CreatorChallengeProps) {
  const [expanded, setExpanded] = useState(false)

  const completedDays = CHALLENGE_DAYS.filter(d => currentStreak >= d.day)
  const nextMilestone = CHALLENGE_DAYS.find(d => currentStreak < d.day)
  const progressPercent = nextMilestone
    ? Math.round((currentStreak / nextMilestone.day) * 100)
    : 100

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1E1B4B, #312E81)',
      borderRadius: '16px',
      padding: '18px',
      marginBottom: '16px',
      color: 'white',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        <div>
          <div style={{ fontWeight: '900', fontSize: '15px' }}>
            🏆 30-Day Creator Challenge
          </div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
            Day {currentStreak} of 30 · {completedDays.length}/{CHALLENGE_DAYS.length} milestones
          </div>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            fontFamily: 'var(--font-nunito)',
          }}
        >
          {expanded ? 'Less ▲' : 'More ▼'}
        </button>
      </div>

      {/* Progress bar */}
      {nextMilestone && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            opacity: 0.7,
            marginBottom: '4px',
          }}>
            <span>Next: Day {nextMilestone.day} — {nextMilestone.task}</span>
            <span>+{nextMilestone.sparks} ⚡</span>
          </div>
          <div style={{
            height: '6px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '99px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #F59E0B, #FCD34D)',
              borderRadius: '99px',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>
            {nextMilestone.day - currentStreak} days remaining
          </div>
        </div>
      )}

      {currentStreak >= 30 && (
        <div style={{
          background: 'rgba(251,191,36,0.2)',
          border: '1px solid rgba(251,191,36,0.4)',
          borderRadius: '10px',
          padding: '10px',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: '800',
        }}>
          🎉 Challenge Complete! You're a Master Creator!
        </div>
      )}

      {/* Expanded milestones */}
      {expanded && (
        <div style={{ marginTop: '12px' }}>
          {CHALLENGE_DAYS.map(({ day, task, sparks }) => {
            const done = currentStreak >= day
            return (
              <div key={day} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                opacity: done ? 1 : 0.55,
              }}>
                <div style={{
                  width: '28px', height: '28px',
                  borderRadius: '50%',
                  background: done ? '#22C55E' : 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', flexShrink: 0,
                }}>
                  {done ? '✓' : day}
                </div>
                <div style={{ flex: 1, fontSize: '13px' }}>{task}</div>
                <div style={{
                  fontSize: '12px', fontWeight: '700',
                  color: '#FCD34D',
                }}>
                  +{sparks} ⚡
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
