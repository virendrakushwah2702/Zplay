'use client'

import { useState, useEffect } from 'react'

interface Comment {
  id: string
  content: string
  created_at: string
  users: { creator_name: string | null; id: string } | null
}

interface GameCommentsProps {
  gameId: string
}

export default function GameComments({ gameId }: GameCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/comments?gameId=${gameId}`)
      .then(r => r.json())
      .then(d => setComments(d.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [gameId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, content: newComment.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to post')
        return
      }
      if (data.comment) {
        setComments(prev => [data.comment, ...prev])
        setNewComment('')
      }
    } catch {
      setError('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div style={{ maxWidth: '420px', margin: '16px auto 0', fontFamily: 'var(--font-nunito)' }}>
      <div style={{ fontWeight: '800', fontSize: '14px', color: '#1E293B', marginBottom: '10px' }}>
        💬 Comments ({comments.length})
      </div>

      {/* Post form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Say something..."
            maxLength={280}
            style={{
              flex: 1,
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '13px',
              fontFamily: 'var(--font-nunito)',
              outline: 'none',
              background: 'white',
            }}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            style={{
              background: newComment.trim() ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : '#E2E8F0',
              color: newComment.trim() ? 'white' : '#94A3B8',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 14px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: newComment.trim() ? 'pointer' : 'default',
              fontFamily: 'var(--font-nunito)',
            }}
          >
            {submitting ? '...' : 'Post'}
          </button>
        </div>
        {error && (
          <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{error}</div>
        )}
      </form>

      {/* Comments list */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '13px', padding: '16px' }}>
          Loading...
        </div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '13px', padding: '16px' }}>
          No comments yet. Be the first!
        </div>
      ) : (
        comments.map(comment => (
          <div key={comment.id} style={{
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '10px 12px',
            marginBottom: '8px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: '700', fontSize: '12px', color: '#6366F1' }}>
                {comment.users?.creator_name || 'Player'}
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                {timeAgo(comment.created_at)}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#1E293B', lineHeight: '1.4' }}>
              {comment.content}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
