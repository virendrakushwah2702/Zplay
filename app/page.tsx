'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, Loader2, Play, RefreshCw, Save, Globe, X, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import GameViewer from '@/components/GameViewer'
import CelebrationOverlay from '@/components/CelebrationOverlay'
import ZapMascot, { ZapMood } from '@/components/ZapMascot'
import AuthButton from '@/components/AuthButton'
import CreatorActivationModal from '@/components/CreatorActivationModal'

const EXAMPLE_CHIPS = [
  { emoji: '🏏', text: 'Cricket batting' },
  { emoji: '🚗', text: 'Car racing' },
  { emoji: '⭐', text: 'Catch the stars' },
  { emoji: '🐦', text: 'Flappy bird' },
  { emoji: '🧩', text: 'Memory match' },
  { emoji: '🎯', text: 'Target shooter' },
  { emoji: '🏃', text: 'Endless runner' },
  { emoji: '🐍', text: 'Snake game' },
]

const LOADING_MESSAGES = [
  'Teaching AI cricket rules...',
  'Mixing pixels and stardust...',
  'Almost ready, hold tight...',
  'Adding secret sauce...',
  'Cooking up something fun...',
  'Drawing characters...',
  'Painting the world...',
]

const GENRES = ['Cricket', 'Racing', 'Action', 'Puzzle', 'Funny', 'Desi', 'Other']

interface Game {
  id: string
  title: string
  html_content: string
  genre?: string
  play_count: number
  like_count: number
  created_at: string
  published_at: string
  trending_score: number
  creator_id?: string
  country_origin?: string
  language?: string
  users?: { name?: string; avatar_url?: string } | null
}

export default function HomePage() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [generatedGame, setGeneratedGame] = useState<{ id: string; html: string } | null>(null)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [games, setGames] = useState<Game[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeGame, setActiveGame] = useState<Game | null>(null)
  const [userId] = useState<string | undefined>(undefined)
  const [genreFilter, setGenreFilter] = useState<string>('all')
  const [publishTitle, setPublishTitle] = useState('')
  const [publishGenre, setPublishGenre] = useState('Other')
  const [showRewardedConsent, setShowRewardedConsent] = useState(false)
  const [dailyGenCount, setDailyGenCount] = useState(0)
  const [showExitIntent, setShowExitIntent] = useState(false)
  const [showReplayAd, setShowReplayAd] = useState(false)
  const [showPauseAd, setShowPauseAd] = useState(false)
  const [pauseSkipCountdown, setPauseSkipCountdown] = useState(5)
  const [pauseCanSkip, setPauseCanSkip] = useState(false)
  const [pauseAdWatch, setPauseAdWatch] = useState(0)
  const [celebration, setCelebration] = useState({
    show: false, message: '', subMessage: ''
  })
  const [zapMood, setZapMood] = useState<ZapMood>('idle')
  const [zapMessage, setZapMessage] = useState<string>('')
  const [showCreatorModal, setShowCreatorModal] = useState(false)
  const [creatorModalData, setCreatorModalData] = useState({
    sparksEarned: 0,
    playsCount: 0,
    gameIds: [] as string[],
  })
  const replayAdTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pauseSkipTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pauseWatchTimerRef = useRef<NodeJS.Timeout | null>(null)
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const generatedGameRef = useRef<HTMLIFrameElement>(null)

  // Handle remix messages from GameViewer — pre-fill the prompt input
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'remix' && e.data?.prompt) {
        setPrompt(e.data.prompt)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Handle postMessages from the generated game iframe
  useEffect(() => {
    if (!generatedGame) return
    const handler = (event: MessageEvent) => {
      const data = event.data
      if (!data || typeof data !== 'object') return
      if (data.type === 'requestReplay') {
        setShowReplayAd(true)
        replayAdTimeoutRef.current = setTimeout(() => {
          setShowReplayAd(false)
          if (generatedGameRef.current?.contentWindow) {
            generatedGameRef.current.contentWindow.postMessage({ type: 'doReplay' }, '*')
          }
        }, 3000)
      }
      if (data.type === 'pauseAdRequired') {
        startPauseAdHome()
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [generatedGame])

  useEffect(() => {
    loadGames()
  }, [genreFilter])

  useEffect(() => {
    if (!isGenerating) return
    const t = setInterval(() => setLoadingMsg((m: number) => (m + 1) % LOADING_MESSAGES.length), 2000)
    return () => clearInterval(t)
  }, [isGenerating])

  // Load daily generation count from localStorage
  useEffect(() => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const stored = localStorage.getItem('zplay_gen_count')
      if (stored) {
        const { date, count } = JSON.parse(stored)
        if (date === today) {
          setDailyGenCount(count)
        } else {
          localStorage.setItem('zplay_gen_count', JSON.stringify({ date: today, count: 0 }))
        }
      }
    } catch {}
  }, [])

  const loadGames = async () => {
    try {
      const url = genreFilter === 'all'
        ? '/api/games?limit=12'
        : '/api/games?limit=12&genre=' + genreFilter
      const res = await fetch(url)
      const data = await res.json()
      if (data.games) setGames(data.games)
    } catch (err) {
      // soft fail
    }
  }

  const handleChipClick = (text: string) => {
    setPrompt(text)
    promptRef.current?.focus()
  }

  const handleCreatorActivation = async (creatorName: string) => {
    try {
      await fetch('/api/creator/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorName }),
      })
    } catch {}
  }

  const proceedWithGeneration = async () => {
    setIsGenerating(true)
    setError(null)
    setGeneratedGame(null)
    setLoadingMsg(0)
    setZapMood('excited')

    // Update daily count in state and localStorage
    const today = new Date().toISOString().split('T')[0]
    const newCount = dailyGenCount + 1
    setDailyGenCount(newCount)
    try {
      localStorage.setItem('zplay_gen_count', JSON.stringify({ date: today, count: newCount }))
    } catch {}

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), userId, country: 'US', language: 'en' })
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.code === 'LIMIT_REACHED') {
          toast.error('Daily free limit reached. Watch an ad or upgrade!')
        } else {
          toast.error(data.error || 'Generation failed')
        }
        setError(data.error || 'Generation failed')
        return
      }
      setGeneratedGame({ id: data.gameId, html: data.html })
      setZapMood('celebrating')
      setTimeout(() => setZapMood('idle'), 3000)
      setCelebration({
        show: true,
        message: 'Game Created! 🎮',
        subMessage: 'Your game is live - share it!'
      })
      toast.success('🎮 Game ready!')
      // Track generation count for creator activation modal
      try {
        const genCount = parseInt(localStorage.getItem('zplay_gens') || '0') + 1
        localStorage.setItem('zplay_gens', String(genCount))
        if (genCount === 2) {
          setTimeout(() => {
            setCreatorModalData({ sparksEarned: 10, playsCount: 0, gameIds: [] })
            setShowCreatorModal(true)
          }, 3000)
        }
      } catch {}
    } catch (err: any) {
      toast.error('Something went wrong. Try again.')
      setError(err.message)
      setZapMood('sad')
      setTimeout(() => setZapMood('idle'), 2000)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.trim().length < 3) {
      toast.error('Please describe your game (at least 3 characters)')
      return
    }

    // First game is free; from second game onwards show rewarded consent
    if (dailyGenCount >= 1) {
      setShowRewardedConsent(true)
      return
    }

    await proceedWithGeneration()
  }

  const handlePublish = async () => {
    if (!generatedGame) return
    if (!publishTitle.trim()) {
      toast.error('Please enter a title')
      return
    }
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: generatedGame.id, title: publishTitle.trim(), genre: publishGenre })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('🌍 Published to feed!')
        setShowPublishModal(false)
        setGeneratedGame(null)
        setPrompt('')
        setPublishTitle('')
        setPublishGenre('Other')
        loadGames()
      } else {
        toast.error('Publish failed')
      }
    } catch (err) {
      toast.error('Publish failed')
    }
  }

  const openPublishModal = () => {
    setPublishTitle(prompt.slice(0, 60))
    setShowPublishModal(true)
  }

  const handleRemix = (title: string) => {
    setPrompt(title)
    setGeneratedGame(null)
    setTimeout(() => {
      promptRef.current?.focus()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  const startPauseAdHome = () => {
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

    setTimeout(() => handlePauseAdEndHome(), 31000)
  }

  const handlePauseAdEndHome = () => {
    if (pauseSkipTimerRef.current) clearInterval(pauseSkipTimerRef.current)
    if (pauseWatchTimerRef.current) clearInterval(pauseWatchTimerRef.current)
    setShowPauseAd(false)
    setPauseCanSkip(false)
    setPauseSkipCountdown(5)
    setPauseAdWatch(0)
    if (generatedGameRef.current?.contentWindow) {
      generatedGameRef.current.contentWindow.postMessage({ type: 'doResume' }, '*')
    }
  }

  const handleCloseGame = () => {
    setShowExitIntent(true)
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#1E293B] pb-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-600/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6 pb-20">
        <header style={{
          background: 'white',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 16px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          marginLeft: '-16px',
          marginRight: '-16px',
          marginBottom: '12px',
        }}>
          <div style={{
            maxWidth: '480px', margin: '0 auto',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <div style={{
                width:'36px', height:'36px', borderRadius:'10px',
                background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:'900', color:'white', fontSize:'18px',
              }}>Z</div>
              <span style={{
                fontWeight:'800', fontSize:'22px', color:'#1E293B',
                fontFamily:'var(--font-nunito)',
              }}>Zplay</span>
            </div>
            <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
              <span className="spark-badge">⚡ 0</span>
              <span className="streak-badge">🔥 0</span>
              <AuthButton />
            </div>
          </div>
        </header>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px',
          background: 'white',
          borderRadius: '16px',
          marginBottom: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <ZapMascot
            mood={zapMood}
            size={72}
            showMessage={false}
            animate={true}
          />
          <div>
            <div style={{
              fontWeight: '800',
              fontSize: '16px',
              color: '#1E293B',
            }}>
              {zapMood === 'excited' && 'Building your game...'}
              {zapMood === 'celebrating' && 'Your game is LIVE! 🎉'}
              {zapMood === 'sad' && 'Something went wrong...'}
              {zapMood === 'idle' && 'Hi! Ready to create? ⚡'}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#64748B',
              fontWeight: '600',
              marginTop: '2px',
            }}>
              {zapMood === 'excited' && 'AI is working its magic...'}
              {zapMood === 'celebrating' && 'Share it and earn Sparks!'}
              {zapMood === 'sad' && 'Tap Generate to try again'}
              {zapMood === 'idle' && '3 free games today'}
            </div>
          </div>
        </div>

        <div style={{
          background:'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
          border:'1px solid #F59E0B',
          borderRadius:'16px',
          padding:'14px 16px',
          marginBottom:'12px',
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
        }}>
          <div>
            <div style={{
              fontWeight:'800', fontSize:'16px', color:'#92400E',
            }}>🔥 Start your streak!</div>
            <div style={{
              fontSize:'12px', color:'#B45309', marginTop:'2px',
            }}>Create a game today to begin</div>
          </div>
          <div style={{
            background:'#F59E0B', color:'white',
            borderRadius:'20px', padding:'6px 14px',
            fontWeight:'800', fontSize:'13px',
          }}>Day 1</div>
        </div>

        <div style={{
          background:'white',
          border:'1px solid #E2E8F0',
          borderRadius:'16px',
          padding:'14px 16px',
          marginBottom:'12px',
        }}>
          <div style={{
            fontWeight:'800', fontSize:'14px', color:'#1E293B',
            marginBottom:'10px',
          }}>📋 Daily Missions</div>
          {[
            {task:'Create 1 game', sparks:'+30 ⚡', done:false},
            {task:'Play 3 games', sparks:'+15 ⚡', done:false},
            {task:'Share a game', sparks:'+10 ⚡', done:false},
          ].map((m,i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center',
              justifyContent:'space-between',
              padding:'6px 0',
              borderBottom: i < 2 ? '1px solid #F1F5F9' : 'none',
            }}>
              <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                <div style={{
                  width:'20px', height:'20px',
                  borderRadius:'6px',
                  border:'2px solid #CBD5E1',
                  background: m.done ? '#6366F1' : 'white',
                }}/>
                <span style={{
                  fontSize:'13px', color:'#1E293B', fontWeight:'600',
                }}>{m.task}</span>
              </div>
              <span style={{
                fontSize:'12px', color:'#F59E0B', fontWeight:'700',
              }}>{m.sparks}</span>
            </div>
          ))}
        </div>

        <section className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 mb-6">
          <label className="block text-sm font-semibold text-[#1E293B] mb-2">
            Describe your dream game
          </label>
          <textarea
            ref={promptRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Cricket game where Virat Kohli smashes sixes..."
            className="w-full min-h-[80px] px-4 py-3 rounded-xl bg-[#F7F8FA] border border-[#E2E8F0] focus:border-purple-500 focus:outline-none text-[#1E293B] placeholder-[#94A3B8] resize-none text-sm"
            disabled={isGenerating}
          />

          <div className="mt-3 overflow-x-auto">
            <div className="flex gap-2 pb-1">
              {EXAMPLE_CHIPS.map((c) => (
                <button
                  key={c.text}
                  onClick={() => handleChipClick(c.text)}
                  disabled={isGenerating}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-purple-500 text-xs font-medium text-white transition-colors whitespace-nowrap"
                >
                  {c.emoji} {c.text}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base flex items-center justify-center gap-2 transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Game ⚡
              </>
            )}
          </button>

          {isGenerating && (
            <>
              <p className="mt-3 text-center text-sm text-purple-300 font-medium animate-pulse">
                {LOADING_MESSAGES[loadingMsg]}
              </p>
              {/* Interstitial ad slot — shown during generation */}
              <div
                id="zplay-interstitial-slot"
                className="mt-3 w-full flex items-center justify-center"
                style={{
                  height: '100px',
                  background: 'rgba(99,102,241,0.08)',
                  borderRadius: '12px',
                  border: '1px solid rgba(99,102,241,0.2)',
                }}
              >
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Ad Loading...</p>
              </div>
            </>
          )}

          {!isGenerating && (
            <p className="mt-2 text-center text-xs text-zinc-500">
              Powered by DeepSeek AI · 3 free games/day
            </p>
          )}

          {error && !isGenerating && (
            <p className="mt-2 text-center text-xs text-red-400">{error}</p>
          )}
        </section>

        {generatedGame && (
          <section className="bg-[#13132b] border border-purple-900/30 rounded-2xl p-4 sm:p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Your Game is Ready!
              </h2>
            </div>

            <div className="mx-auto w-full max-w-[390px] rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-2xl" style={{height: '580px', position: 'relative'}}>
              <iframe
                ref={generatedGameRef}
                srcDoc={generatedGame.html}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                style={{width: '100%', height: '100%', border: 'none', display: 'block'}}
                title="Generated game"
              />

              {/* Pause ad overlay — shown after 45s pause */}
              {showPauseAd && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(5,5,20,0.97)',
                  borderRadius: '16px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  zIndex: 25, gap: '8px', padding: '16px'
                }}>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <p style={{ color: 'rgba(251,191,36,0.9)', fontSize: '13px', fontFamily: 'sans-serif', fontWeight: 600 }}>
                      ⏸ Game paused — watch to resume
                    </p>
                    <button
                      onClick={() => pauseCanSkip && handlePauseAdEndHome()}
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
                  <div id="pause-video-ad-slot-home" style={{
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

              {/* Replay ad overlay — shown when game requests replay */}
              {showReplayAd && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(5,5,20,0.96)',
                  borderRadius: '16px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  zIndex: 20, gap: '10px', padding: '16px'
                }}>
                  <p style={{ color: 'rgba(165,180,252,0.9)', fontSize: '13px', fontFamily: 'sans-serif', fontWeight: 600 }}>
                    Get ready for next round...
                  </p>
                  <div style={{
                    width: '280px', height: '160px',
                    background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15))',
                    borderRadius: '12px',
                    border: '1px solid rgba(99,102,241,0.3)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(99,102,241,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'white' }}>▶</div>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontFamily: 'sans-serif' }}>Video Advertisement</p>
                  </div>
                  <button
                    onClick={() => {
                      if (replayAdTimeoutRef.current) {
                        clearTimeout(replayAdTimeoutRef.current)
                        replayAdTimeoutRef.current = null
                      }
                      setShowReplayAd(false)
                      if (generatedGameRef.current?.contentWindow) {
                        generatedGameRef.current.contentWindow.postMessage({ type: 'doReplay' }, '*')
                      }
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-sm"
                  >
                    Play Again ▶
                  </button>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', fontFamily: 'sans-serif', letterSpacing: '0.5px' }}>
                    AD · Zplay is free thanks to our sponsors
                  </p>
                </div>
              )}
            </div>

            {/* Banner ad slot — below game iframe, always visible */}
            <div
              id="zplay-banner-slot"
              className="w-full flex justify-center mt-2"
              style={{ minHeight: '50px', background: 'transparent' }}
            >
              <div
                id="admob-banner"
                style={{
                  width: '320px',
                  height: '50px',
                  background: 'rgba(99,102,241,0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.3)',
                }}
              >
                Advertisement
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                onClick={() => toast.success('Draft saved!')}
                className="flex flex-col items-center gap-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button
                onClick={openPublishModal}
                className="flex flex-col items-center gap-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white text-xs font-semibold transition-colors"
              >
                <Globe className="w-4 h-4" />
                Publish
              </button>
              <button
                onClick={handleCloseGame}
                className="flex flex-col items-center gap-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                New Game
              </button>
            </div>
          </section>
        )}

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
              🔥 Trending Games
            </h2>
          </div>

          <div className="mb-3 overflow-x-auto">
            <div className="flex gap-2 pb-1">
              {['all', ...GENRES].map((g) => (
                <button
                  key={g}
                  onClick={() => setGenreFilter(g)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                    genreFilter === g
                      ? 'bg-purple-500 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {games.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center" style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
              <ZapMascot mood="sleeping" size={80} animate={true} showMessage={false} />
              <p style={{color:'#94A3B8', fontSize:'14px', fontWeight:'700', marginTop:'8px'}}>
                No games yet. Wake Zap up — create the first one!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {games.map((game: Game) => (
                <button
                  key={game.id}
                  onClick={() => setActiveGame(game)}
                  className="bg-white border border-[#E2E8F0] rounded-2xl hover:border-purple-500 transition-all hover:scale-[1.02] text-left overflow-hidden group"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 flex items-center justify-center relative overflow-hidden">
                    <div className="text-4xl group-hover:scale-110 transition-transform">
                      {game.genre === 'Cricket' ? '🏏' :
                       game.genre === 'Racing' ? '🚗' :
                       game.genre === 'Action' ? '⚡' :
                       game.genre === 'Puzzle' ? '🧩' :
                       game.genre === 'Funny' ? '😂' :
                       game.genre === 'Desi' ? '🇮🇳' : '🎮'}
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="white" />
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-bold text-[#1E293B] text-xs truncate">{game.title}</h3>
                    <p className="text-[#64748B] text-[10px] truncate mt-0.5">
                      {game.users?.name || 'Anonymous'}
                    </p>
                    <p className="text-purple-400 text-[10px] font-semibold mt-1">
                      🎮 {game.play_count || 0} plays
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <footer className="text-center pt-4 pb-2">
          <p className="text-[#94A3B8] text-xs">
            Made with ❤️ by Zplay — <a href="https://zplay.fun" className="text-purple-400 hover:underline">zplay.fun</a>
          </p>
        </footer>
      </div>

      <CelebrationOverlay
        show={celebration.show}
        message={celebration.message}
        subMessage={celebration.subMessage}
        onComplete={() => setCelebration({show:false,message:'',subMessage:''})}
      />

      {activeGame && (
        <GameViewer
          game={{
            id: activeGame.id,
            title: activeGame.title,
            html_content: activeGame.html_content,
            play_count: activeGame.play_count,
            like_count: activeGame.like_count,
            creator_name: activeGame.users?.name,
          }}
          isOpen={!!activeGame}
          onClose={() => setActiveGame(null)}
          onRemix={handleRemix}
        />
      )}

      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#13132b] border border-purple-900/30 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Publish to Feed 🌍</h3>
              <button
                onClick={() => setShowPublishModal(false)}
                className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Game Title</label>
                <input
                  type="text"
                  value={publishTitle}
                  onChange={(e) => setPublishTitle(e.target.value)}
                  placeholder="My awesome game"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-700 focus:border-purple-500 focus:outline-none text-white placeholder-zinc-500 text-sm"
                  maxLength={80}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Genre</label>
                <select
                  value={publishGenre}
                  onChange={(e) => setPublishGenre(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-700 focus:border-purple-500 focus:outline-none text-white text-sm"
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handlePublish}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:opacity-90 text-white font-bold text-sm flex items-center justify-center gap-2 mt-2"
              >
                <Globe className="w-4 h-4" />
                Publish to Feed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rewarded consent modal — shown before generation 2+ */}
      {showRewardedConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#13132b] border border-purple-500/40 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="text-lg font-bold text-white mb-2">Free Game Generation</h3>
            <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
              Zplay is free because of our sponsors. Watch a short video to generate your next game and keep Zplay free for everyone.
            </p>
            <div
              id="rewarded-ad-slot"
              style={{
                width: '100%',
                height: '120px',
                background: 'rgba(99,102,241,0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Rewarded Ad Slot</p>
            </div>
            <button
              onClick={() => { setShowRewardedConsent(false); proceedWithGeneration() }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-sm mb-2"
            >
              Watch &amp; Generate ⚡
            </button>
            <button
              onClick={() => setShowRewardedConsent(false)}
              className="w-full py-2 text-xs text-purple-400 hover:text-purple-300"
            >
              Upgrade to Creator — No Ads Ever →
            </button>
          </div>
        </div>
      )}

      {/* Exit intent modal — shown when closing generated game */}
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
                onClick={() => { setShowExitIntent(false); window.scrollTo({ top: 9999, behavior: 'smooth' }) }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-sm"
              >
                🎮 Play One More Game
              </button>
              <button
                onClick={() => { setShowExitIntent(false); setGenreFilter('all'); loadGames() }}
                className="w-full py-3 rounded-xl bg-zinc-800 text-white text-sm font-semibold"
              >
                🏆 See Top Games Today
              </button>
              <button
                onClick={() => { setShowExitIntent(false); setGeneratedGame(null); setPrompt('') }}
                className="w-full py-2 text-xs text-zinc-500"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreatorModal && (
        <CreatorActivationModal
          sparksEarned={creatorModalData.sparksEarned}
          playsCount={creatorModalData.playsCount}
          gameIds={creatorModalData.gameIds}
          onActivate={handleCreatorActivation}
          onClose={() => {
            setShowCreatorModal(false)
            window.location.href = '/dashboard'
          }}
        />
      )}
    </main>
  )
}
