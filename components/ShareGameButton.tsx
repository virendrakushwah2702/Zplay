'use client'
import { Share2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ShareGameButtonProps {
  gameUrl: string
  title: string
}

export default function ShareGameButton({ gameUrl, title }: ShareGameButtonProps) {
  const handleShare = async () => {
    const text = `Play this game I created on Zplay! 🎮\n${title}\n${gameUrl}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: gameUrl
        })
      } catch {}
    } else {
      navigator.clipboard.writeText(gameUrl)
      toast.success('Link copied to clipboard! 🔗')
    }
  }

  return (
    <button
      onClick={handleShare}
      style={{
        background: '#EEF2FF',
        border: '1px solid #E2E8F0',
        color: '#6366F1',
        borderRadius: '8px',
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <Share2 className="w-3.5 h-3.5" />
      Share
    </button>
  )
}
