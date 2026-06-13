'use client'

import { useEffect, useState, useRef } from 'react'
import { Share2, Heart, Wand2, Home, Play } from 'lucide-react'
import Link from 'next/link'
import WebAdLayout from './WebAdLayout'

interface GamePageClientProps {
  game: any
  error: string | null
}

export default function GamePageClient({ game, error }: GamePageClientProps) {
  const [score, setScore] = useState(0)
  const [liked, setLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(0)
  const [showShare, setShowShare] = useState(false)
  // Pre-game interstitial state
  const [gameLoaded, setGameLoaded] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(5)
  // Post-game interstitial state
  const [showPostGameAd, setShowPostGameAd] = useState(false)
  const [postGameScore, setPostGameScore] = useState(0)
  // Exit intent state
  const [showExitIntent, setShowExitIntent] = useState(false)
  const exitIntentFired = useRef(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const replayAdTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Pause ad state
  const [showPauseAd, setShowPauseAd] = useState(false)
  const [pauseSkipCountdown, setPauseSkipCountdown] = useState(5)
  const [pauseCanSkip, setPauseCanSkip] = useState(false)
  const [pauseAdWatch, setPauseAdWatch] = useState(0)
  const pauseSkipTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pauseWatchTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (game) {
      setLocalLikes(game.like_count || 0)
    }
  }, [game])

  // Pre-game countdown
  useEffect(() => {
    if (!game) return
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval)
          setGameLoaded(true)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [game])

  // Exit intent — detect rapid upward scroll
  useEffect(() => {
    if (!game) return
    let lastScrollY = window.scrollY
    const handleScroll = () => {
      const currentY = window.scrollY
      const delta = lastScrollY - currentY
      lastScrollY = currentY
      if (delta > 80 && !exitIntentFired.current) {
        exitIntentFired.current = true
        setShowExitIntent(true)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [game])

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data
      if (!data || typeof data !== 'object') return
      if (data.type === 'like') handleLike()
      if (data.type === 'remix') { window.location.href = '/?remix=' + encodeURIComponent(game?.title || '') }
      if (data.type === 'score') setScore(data.score)
      if (data.type === 'gameover') {
        setPostGameScore(data.score || score)
        setShowPostGameAd(true)
        setShowShare(true)
        // Auto-dismiss post-game ad after 3 seconds
        setTimeout(() => setShowPostGameAd(false), 3000)
        if (game?.id) {
          fetch('/api/play', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameId: game.id, country: 'US', platform: 'web' })
          }).catch(() => {})
        }
      }
      // Game requests replay after player taps Play Again — show ad then approve
      if (data.type === 'requestReplay') {
        setShowPostGameAd(true)
        // Auto-send doReplay after 3s ad window; button click cancels and fires early
        replayAdTimeoutRef.current = setTimeout(() => {
          setShowPostGameAd(false)
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'doReplay' }, '*')
          }
        }, 3000)
      }
      if (data.type === 'pauseAdRequired') {
        startPauseAd()
      }
      if (data.type === 'earlyEnd') {
        setShowShare(true)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, score])

  const handleLike = async () => {
    if (!game || liked) return
    setLiked(true)
    setLocalLikes((p: number) => p + 1)
    try {
      await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id })
      })
    } catch {}
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

  const handleShare = () => {
    if (!game) return
    const text = `Play this game I found on Zplay! 🎮\n${game.title}\nhttps://zplay.fun/game/${game.id}\nMake your own free game in 60 seconds!`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (error) {
    return (
      <WebAdLayout>
        <main className="min-h-screen bg-[#0a0a1e] text-white flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">😢</div>
            <h1 className="text-2xl font-bold mb-2">Game Not Found</h1>
            <p className="text-zinc-400 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-purple text-white font-bold"
            >
              <Home className="w-4 h-4" />
              Back to Zplay
            </Link>
          </div>
        </main>
      </WebAdLayout>
    )
  }

  if (!game) {
    return (
      <WebAdLayout>
        <main className="min-h-screen bg-[#0a0a1e] text-white flex items-center justify-center">
          <div className="text-zinc-400">Loading...</div>
        </main>
      </WebAdLayout>
    )
  }

  return (
    <WebAdLayout>
      <main className="min-h-screen bg-[#0a0a1e] text-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowExitIntent(true)}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
            >
              <Home className="w-4 h-4" />
              Zplay
            </button>
            <span className="text-xs text-zinc-500">{game.play_count || 0} plays</span>
          </div>

          <h1 className="text-2xl font-black mb-1 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {game.title}
          </h1>
          {game.users?.name && (
            <p className="text-zinc-400 text-sm mb-4">by {game.users.name}</p>
          )}

          {/* Game iframe with pre-game interstitial overlay */}
          <div className="relative w-full max-w-[420px] mx-auto" style={{ aspectRatio: '390/580' }}>
            <div className="w-full h-full bg-black rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-2xl">
              {gameLoaded ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={game.html_content}
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  className="w-full h-full"
                  title={game.title}
                />
              ) : (
                // Pre-game interstitial countdown
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0d20]">
                  <div className="text-6xl font-black text-purple-400 mb-4"
                    style={{ textShadow: '0 0 30px rgba(99,102,241,0.8)' }}>
                    {secondsLeft}
                  </div>
                  <p className="text-zinc-400 text-sm mb-6">Game loading...</p>
                  {/* Pre-game ad slot */}
                  <div
                    id="pre-game-ad-slot"
                    style={{
                      width: '300px',
                      height: '160px',
                      background: 'rgba(99,102,241,0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(99,102,241,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Advertisement</p>
                  </div>
                  {/* Skip button — appears after 2 seconds (when secondsLeft <= 2) */}
                  {secondsLeft <= 2 && (
                    <button
                      onClick={() => setGameLoaded(true)}
                      className="px-5 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
                    >
                      Skip →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Pause ad overlay */}
            {showPauseAd && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/97 rounded-2xl" style={{ gap: '8px', padding: '12px' }}>
                <div className="w-full flex items-center justify-between px-2 mb-1">
                  <p style={{ color: 'rgba(251,191,36,0.9)', fontSize: '12px', fontFamily: 'sans-serif', fontWeight: 600 }}>
                    ⏸ Game paused — watch to resume
                  </p>
                  <button
                    onClick={() => pauseCanSkip && handlePauseAdEnd()}
                    style={{
                      background: pauseCanSkip ? 'rgba(99,102,241,0.9)' : 'rgba(50,50,80,0.8)',
                      border: 'none', borderRadius: '6px', padding: '5px 12px',
                      color: pauseCanSkip ? 'white' : 'rgba(255,255,255,0.4)',
                      fontSize: '12px', fontFamily: 'sans-serif', fontWeight: 600,
                      cursor: pauseCanSkip ? 'pointer' : 'not-allowed',
                      minWidth: '90px', textAlign: 'center', transition: 'all 0.3s ease'
                    }}
                  >
                    {pauseCanSkip ? 'Resume ▶' : `Skip in ${pauseSkipCountdown}s`}
                  </button>
                </div>
                <div id="pause-video-ad-slot-page" style={{
                  width: '280px', height: '190px',
                  background: 'linear-gradient(135deg,rgba(251,191,36,0.1),rgba(99,102,241,0.12))',
                  borderRadius: '12px', border: '1px solid rgba(251,191,36,0.25)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '10px', position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(251,191,36,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: 'white' }}>▶</div>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontFamily: 'sans-serif' }}>Video Advertisement</p>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', background: 'rgba(251,191,36,0.8)', width: `${Math.min(100, (pauseAdWatch / 30) * 100)}%`, transition: 'width 1s linear', borderRadius: '0 0 12px 12px' }} />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', fontFamily: 'sans-serif', marginTop: '4px', letterSpacing: '0.5px' }}>
                  AD · Zplay is free thanks to our sponsors
                </p>
              </div>
            )}

            {/* Post-game interstitial overlay */}
            {showPostGameAd && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85 rounded-2xl">
                <p className="text-white font-bold text-lg mb-1">Score: {postGameScore}</p>
                <p className="text-zinc-400 text-xs mb-4">Loading next ad...</p>
                <div
                  id="post-game-ad-slot"
                  style={{
                    width: '280px',
                    height: '130px',
                    background: 'rgba(99,102,241,0.12)',
                    borderRadius: '12px',
                    border: '1px solid rgba(99,102,241,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Ad Slot</p>
                </div>
                <button
                  onClick={() => {
                    // Cancel auto-replay timeout if it hasn't fired yet
                    if (replayAdTimeoutRef.current) {
                      clearTimeout(replayAdTimeoutRef.current)
                      replayAdTimeoutRef.current = null
                    }
                    setShowPostGameAd(false)
                    if (iframeRef.current?.contentWindow) {
                      iframeRef.current.contentWindow.postMessage({ type: 'doReplay' }, '*')
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-sm"
                >
                  Play Again ▶
                </button>
              </div>
            )}
          </div>

          {score > 0 && !showPostGameAd && (
            <div className="mt-3 text-center">
              <span className="px-4 py-1.5 rounded-full bg-zinc-800 text-white text-sm font-bold">
                Score: {score}
              </span>
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 max-w-[420px] mx-auto">
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={handleLike}
              disabled={liked}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-colors ${
                liked ? 'bg-pink-600' : 'bg-zinc-800 hover:bg-zinc-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              {localLikes}
            </button>
            <Link
              href={`/?remix=${encodeURIComponent(game.title)}`}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-semibold transition-colors"
            >
              <Wand2 className="w-4 h-4" />
              Remix
            </Link>
          </div>

          {showShare && !showPostGameAd && (
            <div className="mt-4 max-w-[420px] mx-auto p-3 rounded-xl bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-500 text-center">
              <p className="text-white text-sm font-bold mb-2">🎉 Game Over! Score: {postGameScore || score}</p>
              <button
                onClick={handleShare}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm"
              >
                Share your score on WhatsApp
              </button>
            </div>
          )}

          {/* Bottom banner ad slot */}
          <div className="mt-6 max-w-[420px] mx-auto">
            <div
              id="adsense-slot"
              className="w-full h-24 rounded-xl border border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 text-xs"
            >
              Ad Space
            </div>
          </div>

          <div className="mt-6 max-w-[420px] mx-auto">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl gradient-purple text-white font-bold text-sm"
            >
              <Play className="w-4 h-4" />
              Create your own game — Free
            </Link>
          </div>
        </div>
      </main>

      {/* Exit intent modal */}
      {showExitIntent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#13132b] border border-zinc-700 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">👋</div>
            <h3 className="text-white font-bold text-lg mb-2">Leaving so soon?</h3>
            <p className="text-zinc-400 text-sm mb-4">Discover 500+ free games on Zplay!</p>
            <div
              id="exit-interstitial-slot"
              style={{
                width: '100%',
                height: '100px',
                background: 'rgba(99,102,241,0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Ad Slot</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => { setShowExitIntent(false); exitIntentFired.current = false }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-sm"
              >
                🎮 Play One More Game
              </button>
              <Link
                href="/"
                className="block w-full py-3 rounded-xl bg-zinc-800 text-white text-sm font-semibold"
                onClick={() => setShowExitIntent(false)}
              >
                🏆 See Top Games Today
              </Link>
              <Link
                href="/"
                className="block w-full py-2 text-xs text-zinc-500"
                onClick={() => setShowExitIntent(false)}
              >
                Exit
              </Link>
            </div>
          </div>
        </div>
      )}
    </WebAdLayout>
  )
}
