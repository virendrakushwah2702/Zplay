'use client'

import { useEffect, useState } from 'react'

export type ZapMood =
  | 'idle'
  | 'excited'
  | 'celebrating'
  | 'gentle'
  | 'playing'
  | 'earning'
  | 'sleeping'
  | 'sad'
  | 'curious'
  | 'proud'
  | 'waiting'
  | 'sharing'

interface ZapProps {
  mood?: ZapMood
  size?: number
  message?: string
  showMessage?: boolean
  animate?: boolean
}

const MOOD_COLORS: Record<ZapMood, string> = {
  idle:        '#6366F1',
  excited:     '#F59E0B',
  celebrating: '#22C55E',
  gentle:      '#8B5CF6',
  playing:     '#EF4444',
  earning:     '#F59E0B',
  sleeping:    '#94A3B8',
  sad:         '#64748B',
  curious:     '#06B6D4',
  proud:       '#7C3AED',
  waiting:     '#6366F1',
  sharing:     '#22C55E',
}

const MOOD_MESSAGES: Record<ZapMood, string> = {
  idle:        'Ready to create something amazing? ⚡',
  excited:     'Building your game right now!',
  celebrating: 'Your game is LIVE! Share it! 🎉',
  gentle:      'A short video keeps Zplay free 💜',
  playing:     '',
  earning:     'You just earned Sparks! ⚡',
  sleeping:    'Wake me up when you create a game...',
  sad:         'Tomorrow is a fresh start! 💙',
  curious:     'People are playing your games! 👀',
  proud:       'Creator+ unlocked! You are amazing! 👑',
  waiting:     'Your game is almost ready...',
  sharing:     'Share it — more plays = more Sparks! 📱',
}

export default function ZapMascot({
  mood = 'idle',
  size = 80,
  message,
  showMessage = true,
  animate = true,
}: ZapProps) {
  const [blink, setBlink] = useState(false)
  const c = MOOD_COLORS[mood]
  const displayMessage = message || MOOD_MESSAGES[mood]

  // Blink animation for idle
  useEffect(() => {
    if (!animate || mood !== 'idle') return
    const interval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 150)
    }, 4000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [mood, animate])

  const animClass = animate ? {
    idle:        'zap-breathe',
    excited:     'zap-bounce',
    celebrating: 'zap-celebrate',
    gentle:      'zap-sway',
    playing:     'zap-lean',
    earning:     'zap-bounce',
    sleeping:    'zap-breathe',
    sad:         '',
    curious:     'zap-sway',
    proud:       'zap-breathe',
    waiting:     'zap-sway',
    sharing:     'zap-bounce',
  }[mood] : ''

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
    }}>
      <div className={animClass} style={{ display: 'inline-block' }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* === BODY === */}
          <rect x="15" y="38" width="90" height="52" rx="26" fill={c}/>
          <rect x="8" y="60" width="24" height="36" rx="12" fill={c}/>
          <rect x="88" y="60" width="24" height="36" rx="12" fill={c}/>

          {/* Face panel */}
          <rect x="25" y="43" width="70" height="42" rx="16"
                fill="white" opacity="0.95"/>

          {/* === EYES === */}
          {blink ? (
            <>
              <path d="M 34 62 Q 42 57 50 62" stroke={c}
                    strokeWidth="3" fill="none" strokeLinecap="round"/>
              <path d="M 70 62 Q 78 57 86 62" stroke={c}
                    strokeWidth="3" fill="none" strokeLinecap="round"/>
            </>
          ) : mood === 'sleeping' ? (
            <>
              <path d="M 34 62 Q 42 57 50 62" stroke={c}
                    strokeWidth="3" fill="none" strokeLinecap="round"/>
              <path d="M 70 62 Q 78 57 86 62" stroke={c}
                    strokeWidth="3" fill="none" strokeLinecap="round"/>
            </>
          ) : mood === 'excited' || mood === 'earning' ? (
            <>
              <text x="40" y="67" fontSize="18"
                    textAnchor="middle" fill={c}>★</text>
              <text x="80" y="67" fontSize="18"
                    textAnchor="middle" fill={c}>★</text>
            </>
          ) : mood === 'sad' ? (
            <>
              <ellipse cx="42" cy="62" rx="7" ry="6" fill={c}/>
              <circle cx="44" cy="60" r="2" fill="white"/>
              <ellipse cx="40" cy="72" rx="2" ry="3"
                       fill="#93C5FD" opacity="0.8"/>
              <ellipse cx="78" cy="62" rx="7" ry="6" fill={c}/>
              <circle cx="80" cy="60" r="2" fill="white"/>
            </>
          ) : mood === 'curious' ? (
            <>
              <circle cx="40" cy="61" r="10" fill={c}/>
              <circle cx="43" cy="58" r="3.5" fill="white"/>
              <circle cx="78" cy="62" r="7" fill={c}/>
              <circle cx="79" cy="60" r="2.5" fill="white"/>
            </>
          ) : mood === 'waiting' ? (
            <>
              <ellipse cx="42" cy="62" rx="8" ry="5" fill={c}/>
              <circle cx="44" cy="61" r="2" fill="white"/>
              <ellipse cx="78" cy="62" rx="8" ry="5" fill={c}/>
              <circle cx="80" cy="61" r="2" fill="white"/>
            </>
          ) : mood === 'sharing' ? (
            <>
              <circle cx="42" cy="62" r="8" fill={c}/>
              <circle cx="44" cy="60" r="2.5" fill="white"/>
              {/* Wink right eye */}
              <path d="M 70 62 Q 78 57 86 62" stroke={c}
                    strokeWidth="3" fill="none" strokeLinecap="round"/>
            </>
          ) : (
            <>
              <circle cx="42" cy="62" r="8" fill={c}/>
              <circle cx="44" cy={mood === 'celebrating' ? '59' : '60'}
                      r={mood === 'celebrating' ? '3' : '2.5'} fill="white"/>
              <circle cx="78" cy="62" r="8" fill={c}/>
              <circle cx="80" cy={mood === 'celebrating' ? '59' : '60'}
                      r={mood === 'celebrating' ? '3' : '2.5'} fill="white"/>
            </>
          )}

          {/* === MOUTH === */}
          {mood === 'celebrating' || mood === 'proud' || mood === 'sharing' ? (
            <path d="M 42 73 Q 60 85 78 73" stroke={c}
                  strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          ) : mood === 'sad' ? (
            <path d="M 42 76 Q 60 68 78 76" stroke={c}
                  strokeWidth="3" fill="none" strokeLinecap="round"/>
          ) : mood === 'sleeping' ? (
            <path d="M 46 74 Q 60 78 74 74" stroke={c}
                  strokeWidth="2.5" fill="none"
                  strokeLinecap="round" opacity="0.5"/>
          ) : mood === 'excited' || mood === 'playing' || mood === 'earning' ? (
            <>
              <path d="M 44 72 Q 60 83 76 72" stroke={c}
                    strokeWidth="3" fill="none" strokeLinecap="round"/>
              <ellipse cx="60" cy="76" rx="10" ry="4"
                       fill={c} opacity="0.2"/>
            </>
          ) : mood === 'gentle' || mood === 'waiting' ? (
            <path d="M 46 73 Q 60 79 74 73" stroke={c}
                  strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          ) : (
            <path d="M 44 73 Q 60 81 76 73" stroke={c}
                  strokeWidth="3" fill="none" strokeLinecap="round"/>
          )}

          {/* === CONTROLLER BUTTONS === */}
          <rect x="12" y="73" width="12" height="4" rx="2"
                fill="white" opacity="0.5"/>
          <rect x="16" y="69" width="4" height="12" rx="2"
                fill="white" opacity="0.5"/>
          <circle cx="97" cy="72" r="2.5" fill="white" opacity="0.5"/>
          <circle cx="97" cy="80" r="2.5" fill="white" opacity="0.5"/>
          <circle cx="93" cy="76" r="2.5" fill="white" opacity="0.5"/>
          <circle cx="101" cy="76" r="2.5" fill="white" opacity="0.5"/>

          {/* Lightning on body */}
          <text x="60" y="37" fontSize="10"
                textAnchor="middle" opacity="0.7">⚡</text>

          {/* === ARMS === */}
          {mood === 'celebrating' || mood === 'earning' ? (
            <>
              <line x1="15" y1="50" x2="2" y2="28" stroke={c}
                    strokeWidth="7" strokeLinecap="round"/>
              <line x1="105" y1="50" x2="118" y2="28" stroke={c}
                    strokeWidth="7" strokeLinecap="round"/>
            </>
          ) : mood === 'playing' ? (
            <>
              <line x1="15" y1="57" x2="7" y2="67" stroke={c}
                    strokeWidth="7" strokeLinecap="round"/>
              <line x1="105" y1="57" x2="113" y2="67" stroke={c}
                    strokeWidth="7" strokeLinecap="round"/>
            </>
          ) : mood === 'sad' ? (
            <>
              <line x1="15" y1="65" x2="7" y2="78" stroke={c}
                    strokeWidth="7" strokeLinecap="round"/>
              <line x1="105" y1="65" x2="113" y2="78" stroke={c}
                    strokeWidth="7" strokeLinecap="round"/>
            </>
          ) : mood === 'sleeping' ? (
            <>
              <line x1="15" y1="65" x2="9" y2="60" stroke={c}
                    strokeWidth="6" strokeLinecap="round" opacity="0.6"/>
              <line x1="105" y1="65" x2="111" y2="60" stroke={c}
                    strokeWidth="6" strokeLinecap="round" opacity="0.6"/>
            </>
          ) : mood === 'gentle' ? (
            <>
              <line x1="15" y1="57" x2="4" y2="46" stroke={c}
                    strokeWidth="7" strokeLinecap="round"/>
              <line x1="105" y1="55" x2="118" y2="44" stroke={c}
                    strokeWidth="7" strokeLinecap="round"/>
            </>
          ) : mood === 'sharing' ? (
            <>
              <line x1="15" y1="57" x2="4" y2="46" stroke={c}
                    strokeWidth="7" strokeLinecap="round"/>
              <line x1="105" y1="50" x2="118" y2="34" stroke={c}
                    strokeWidth="7" strokeLinecap="round"/>
            </>
          ) : mood === 'waiting' ? (
            <>
              <line x1="15" y1="58" x2="4" y2="50" stroke={c}
                    strokeWidth="7" strokeLinecap="round"/>
              <line x1="105" y1="58" x2="116" y2="50" stroke={c}
                    strokeWidth="7" strokeLinecap="round"/>
            </>
          ) : mood === 'proud' ? (
            <>
              <line x1="15" y1="50" x2="2" y2="35" stroke={c}
                    strokeWidth="7" strokeLinecap="round"/>
              <line x1="105" y1="50" x2="118" y2="35" stroke={c}
                    strokeWidth="7" strokeLinecap="round"/>
            </>
          ) : (
            <>
              <line x1="15" y1="57" x2="4" y2="46" stroke={c}
                    strokeWidth="7" strokeLinecap="round"/>
              <line x1="105" y1="57" x2="116" y2="46" stroke={c}
                    strokeWidth="7" strokeLinecap="round"/>
            </>
          )}

          {/* === MOOD EXTRAS === */}
          {mood === 'celebrating' && (
            <>
              <text x="3" y="22" fontSize="14">🎉</text>
              <text x="98" y="20" fontSize="14">🎊</text>
              <text x="56" y="10" fontSize="12">✨</text>
            </>
          )}
          {mood === 'excited' && (
            <>
              <text x="3" y="30" fontSize="13">✨</text>
              <text x="102" y="28" fontSize="13">✨</text>
            </>
          )}
          {mood === 'earning' && (
            <>
              <text x="5" y="24" fontSize="13">⚡</text>
              <text x="92" y="18" fontSize="13">⚡</text>
              <text x="52" y="9" fontSize="11">⚡</text>
            </>
          )}
          {mood === 'sleeping' && (
            <>
              <text x="90" y="30" fontSize="18" fill={c} opacity="0.6">z</text>
              <text x="100" y="18" fontSize="14" fill={c} opacity="0.4">z</text>
              <text x="108" y="10" fontSize="10" fill={c} opacity="0.3">z</text>
            </>
          )}
          {mood === 'proud' && (
            <text x="47" y="32" fontSize="22">👑</text>
          )}
          {mood === 'gentle' && (
            <>
              <text x="113" y="38" fontSize="14">🤚</text>
              <text x="0" y="42" fontSize="11">💜</text>
            </>
          )}
          {mood === 'curious' && (
            <text x="108" y="44" fontSize="16">👉</text>
          )}
          {mood === 'waiting' && (
            <text x="0" y="44" fontSize="13">⌚</text>
          )}
          {mood === 'sharing' && (
            <text x="113" y="28" fontSize="14">📱</text>
          )}
        </svg>
      </div>

      {showMessage && displayMessage && (
        <div style={{
          background: MOOD_COLORS[mood] + '15',
          border: `1px solid ${MOOD_COLORS[mood]}40`,
          borderRadius: '12px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: '700',
          color: MOOD_COLORS[mood],
          textAlign: 'center',
          maxWidth: '200px',
          lineHeight: '1.4',
        }}>
          {displayMessage}
        </div>
      )}
    </div>
  )
}
