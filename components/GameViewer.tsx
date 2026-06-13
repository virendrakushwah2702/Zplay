'use client'

import { useEffect, useState, useRef } from 'react'
import { X, Share2, Heart, Wand2 } from 'lucide-react'

interface GameViewerProps {
  game: {
    id: string
    title: string
    html_content: string
    play_count?: number
    like_count?: number
    creator_name?: string
  } | null
  isOpen: boolean
  onClose: () => void
  onRemix?: (prompt: string) => void
}

export default function GameViewer({ game, isOpen, onClose, onRemix }: GameViewerProps) {
  const [score, setScore] = useState(0)
  const [liked, setLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(0)
  const [showSharePrompt, setShowSharePrompt] = useState(false)
  const [showReplayAd, setShowReplayAd] = useState(false)
  const [skipCountdown, setSkipCountdown] = useState(5)
  const [canSkip, setCanSkip] = useState(false)
  const [adWatchTime, setAdWatchTime] = useState(0)
  const skipTimerRef = useRef<NodeJS.Timeout | null>(null)
  const watchTimerRef = useRef<NodeJS.Timeout | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  // Pause ad state
  const [showPauseAd, setShowPauseAd] = useState(false)
  const [pauseSkipCountdown, setPauseSkipCountdown] = useState(5)
  const [pauseCanSkip, setPauseCanSkip] = useState(false)
  const [pauseAdWatch, setPauseAdWatch] = useState(0)
  const pauseSkipTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pauseWatchTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isOpen && game) {
      setLiked(false)
      setLocalLikes(game.like_count || 0)
      setScore(0)
      setShowSharePrompt(false)
    }
  }, [isOpen, game])

  useEffect(() => {
    if (!isOpen) return
    const handler = (event: MessageEvent) => {
      const data = event.data
      if (!data || typeof data !== 'object') return
      if (data.type === 'like') handleLike()
      if (data.type === 'remix') handleRemix()
      if (data.type === 'score') setScore(data.score)
      if (data.type === 'gameover') {
        setShowSharePrompt(true)
        fetch('/api/play', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId: game?.id, country: 'US', platform: 'web' })
        }).catch(() => {})
      }
      if (data.type === 'requestReplay') {
        startReplayAd()
      }
      if (data.type === 'pauseAdRequired') {
        startPauseAd()
      }
      if (data.type === 'earlyEnd') {
        setShowSharePrompt(true)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [isOpen, game])

  const handleLike = async () => {
    if (!game || liked) return
    setLiked(true)
    setLocalLikes((p) => p + 1)
    try {
      await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id })
      })
    } catch (e) {}
  }

  const handleRemix = () => {
    if (game && onRemix) {
      onRemix(game.title)
      onClose()
    }
  }

  const handleShare = () => {
    if (!game) return
    const text = 'Play this game I found on Zplay! ' + game.title + ' https://zplay.fun/game/' + game.id + ' Make your own free game in 60 seconds!'
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank')
  }

  const startReplayAd = () => {
    setShowReplayAd(true)
    setSkipCountdown(5)
    setCanSkip(false)
    setAdWatchTime(0)

    // Track watch time for revenue depth reporting
    watchTimerRef.current = setInterval(() => {
      setAdWatchTime(prev => prev + 1)
    }, 1000)

    // Count down to skip button appearance
    let count = 5
    skipTimerRef.current = setInterval(() => {
      count -= 1
      setSkipCountdown(count)
      if (count <= 0) {
        clearInterval(skipTimerRef.current!)
        setCanSkip(true)
      }
    }, 1000)

    // Auto-proceed after 31 seconds as safety fallback
    setTimeout(() => {
      handleAdEnd(false)
    }, 31000)
  }

  const handleAdEnd = (skipped: boolean) => {
    if (skipTimerRef.current) clearInterval(skipTimerRef.current)
    if (watchTimerRef.current) clearInterval(watchTimerRef.current)
    console.log('Replay ad watch depth:', adWatchTime, 'seconds')
    setShowReplayAd(false)
    setCanSkip(false)
    setSkipCountdown(5)
    setAdWatchTime(0)
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'doReplay' }, '*')
    }
  }

  const startPauseAd = () => {
    setShowPauseAd(true)
    setPauseSkipCountdown(5)
    setPauseCanSkip(false)
    setPauseAdWatch(0)

    pauseWatchTimerRef.current = setInterval(() => {
      setPauseAdWatch(prev => prev + 1)
    }, 1000)

    let count = 5
    pauseSkipTimerRef.current = setInterval(() => {
      count -= 1
      setPauseSkipCountdown(count)
      if (count <= 0) {
        clearInterval(pauseSkipTimerRef.current!)
        setPauseCanSkip(true)
      }
    }, 1000)

    // Auto-resume after 31s as safety fallback
    setTimeout(() => handlePauseAdEnd(), 31000)
  }

  const handlePauseAdEnd = () => {
    if (pauseSkipTimerRef.current) clearInterval(pauseSkipTimerRef.current)
    if (pauseWatchTimerRef.current) clearInterval(pauseWatchTimerRef.current)
    setShowPauseAd(false)
    setPauseCanSkip(false)
    setPauseSkipCountdown(5)
    setPauseAdWatch(0)
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'doResume' }, '*')
    }
  }

  if (!isOpen || !game) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative w-full max-w-[420px] flex flex-col items-center">

        <div className="w-full flex items-center justify-between mb-2 px-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-base truncate">{game.title}</h2>
            <p className="text-zinc-400 text-xs truncate">
              {game.creator_name || 'Anonymous'} · {game.play_count || 0} plays
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-2 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full bg-black rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-2xl" style={{height: '560px', position: 'relative'}}>
          <iframe
            ref={iframeRef}
            srcDoc={game.html_content}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            style={{width: '100%', height: '100%', border: 'none', display: 'block'}}
            title={game.title}
          />

          {showReplayAd && (
            <div style={{
              position:'absolute', inset:0,
              background:'rgba(5,5,20,0.96)',
              borderRadius:'16px',
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center',
              zIndex:20, gap:'8px', padding:'12px'
            }}>

              <div style={{
                width:'100%', padding:'4px 8px',
                display:'flex', alignItems:'center',
                justifyContent:'space-between',
                marginBottom:'4px'
              }}>
                <p style={{
                  color:'rgba(165,180,252,0.8)',
                  fontSize:'12px', fontFamily:'sans-serif',
                  fontWeight:'600'
                }}>
                  Get ready for next round...
                </p>
                <button
                  onClick={() => canSkip && handleAdEnd(true)}
                  style={{
                    background: canSkip
                      ? 'rgba(99,102,241,0.9)'
                      : 'rgba(50,50,80,0.8)',
                    border:'none', borderRadius:'6px',
                    padding:'5px 12px',
                    color: canSkip
                      ? 'white'
                      : 'rgba(255,255,255,0.4)',
                    fontSize:'12px', fontFamily:'sans-serif',
                    fontWeight:'600',
                    cursor: canSkip ? 'pointer' : 'not-allowed',
                    minWidth:'85px', textAlign:'center',
                    transition:'all 0.3s ease'
                  }}
                >
                  {canSkip ? 'Skip Ad ›' : `Skip in ${skipCountdown}s`}
                </button>
              </div>

              <div
                id="replay-video-ad-slot"
                style={{
                  width:'300px', height:'200px',
                  background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15))',
                  borderRadius:'12px',
                  border:'1px solid rgba(99,102,241,0.3)',
                  display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center',
                  gap:'10px', position:'relative', overflow:'hidden'
                }}
              >
                <div style={{
                  width:'52px', height:'52px',
                  borderRadius:'50%',
                  background:'rgba(99,102,241,0.35)',
                  display:'flex', alignItems:'center',
                  justifyContent:'center',
                  fontSize:'22px', color:'white'
                }}>▶</div>
                <p style={{
                  color:'rgba(255,255,255,0.3)',
                  fontSize:'11px', fontFamily:'sans-serif'
                }}>
                  Video Advertisement
                </p>
                <div style={{
                  position:'absolute', bottom:0, left:0,
                  height:'3px',
                  background:'rgba(99,102,241,0.8)',
                  width:`${Math.min(100,(adWatchTime/30)*100)}%`,
                  transition:'width 1s linear',
                  borderRadius:'0 0 12px 12px'
                }}/>
              </div>

              <p style={{
                color:'rgba(255,255,255,0.2)',
                fontSize:'10px', fontFamily:'sans-serif',
                marginTop:'4px', letterSpacing:'0.5px'
              }}>
                AD · Zplay is free thanks to our sponsors
              </p>

            </div>
          )}

          {/* Pause ad overlay — shown after 45s pause */}
          {showPauseAd && (
            <div style={{
              position:'absolute', inset:0,
              background:'rgba(5,5,20,0.97)',
              borderRadius:'16px',
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center',
              zIndex:25, gap:'8px', padding:'12px'
            }}>
              <div style={{
                width:'100%', padding:'4px 8px',
                display:'flex', alignItems:'center',
                justifyContent:'space-between', marginBottom:'4px'
              }}>
                <p style={{color:'rgba(251,191,36,0.9)', fontSize:'12px', fontFamily:'sans-serif', fontWeight:600}}>
                  ⏸ Game paused — watch to resume
                </p>
                <button
                  onClick={() => pauseCanSkip && handlePauseAdEnd()}
                  style={{
                    background: pauseCanSkip ? 'rgba(99,102,241,0.9)' : 'rgba(50,50,80,0.8)',
                    border:'none', borderRadius:'6px', padding:'5px 12px',
                    color: pauseCanSkip ? 'white' : 'rgba(255,255,255,0.4)',
                    fontSize:'12px', fontFamily:'sans-serif', fontWeight:600,
                    cursor: pauseCanSkip ? 'pointer' : 'not-allowed',
                    minWidth:'90px', textAlign:'center', transition:'all 0.3s ease'
                  }}
                >
                  {pauseCanSkip ? 'Resume ▶' : `Skip in ${pauseSkipCountdown}s`}
                </button>
              </div>

              <div id="pause-video-ad-slot" style={{
                width:'300px', height:'200px',
                background:'linear-gradient(135deg,rgba(251,191,36,0.1),rgba(99,102,241,0.12))',
                borderRadius:'12px',
                border:'1px solid rgba(251,191,36,0.25)',
                display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
                gap:'10px', position:'relative', overflow:'hidden'
              }}>
                <div style={{
                  width:'52px', height:'52px', borderRadius:'50%',
                  background:'rgba(251,191,36,0.25)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'22px', color:'white'
                }}>▶</div>
                <p style={{color:'rgba(255,255,255,0.3)', fontSize:'11px', fontFamily:'sans-serif'}}>
                  Video Advertisement
                </p>
                <div style={{
                  position:'absolute', bottom:0, left:0, height:'3px',
                  background:'rgba(251,191,36,0.8)',
                  width:`${Math.min(100,(pauseAdWatch/30)*100)}%`,
                  transition:'width 1s linear',
                  borderRadius:'0 0 12px 12px'
                }}/>
              </div>

              <p style={{color:'rgba(255,255,255,0.2)', fontSize:'10px', fontFamily:'sans-serif', marginTop:'4px', letterSpacing:'0.5px'}}>
                AD · Zplay is free thanks to our sponsors
              </p>
            </div>
          )}
        </div>

        {score > 0 && (
          <div className="mt-2 px-4 py-1 rounded-full bg-zinc-800 text-white text-sm font-bold">
            Score: {score}
          </div>
        )}

        <div className="w-full flex items-center justify-around mt-3 gap-2">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={handleLike}
            disabled={liked}
            className={"flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-white text-sm font-semibold transition-colors " + (liked ? 'bg-pink-600' : 'bg-zinc-800 hover:bg-zinc-700')}
          >
            <Heart className={"w-4 h-4 " + (liked ? 'fill-current' : '')} />
            {liked ? 'Liked' : 'Like'} {localLikes > 0 && "(" + localLikes + ")"}
          </button>
          <button
            onClick={handleRemix}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-sm font-semibold transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            Remix
          </button>
        </div>

        {showSharePrompt && (
          <div className="mt-3 w-full p-3 rounded-xl bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-500 text-center">
            <p className="text-white text-sm font-bold mb-2">Game Over! Score: {score}</p>
            <button
              onClick={handleShare}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm"
            >
              Share your score on WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
