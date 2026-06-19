import { createClient } from '@/lib/supabase/server'
import { generateGameMeta } from '@/lib/seo'
import GamePageClient from './GamePageClient'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  try {
    const supabase = await createClient()
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)
    
    let query = supabase
      .from('games')
      .select('id, title, description, genre, slug, prompt, status, creator_id')
    
    if (isUuid) {
      query = query.eq('id', id)
    } else {
      query = query.eq('slug', id)
    }
    
    const { data: game } = await query.single()

    if (game) {
      if (game.status !== 'published') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.id !== game.creator_id) {
          return { title: 'Private Game — Zplay' }
        }
      }

      const meta = generateGameMeta(
        game.title || '',
        game.genre || 'casual',
        game.prompt || game.title || ''
      )
      const canonicalId = game.slug || game.id
      return {
        title: meta.title,
        description: meta.description,
        keywords: meta.keywords,
        openGraph: {
          title: meta.title,
          description: meta.description,
          url: `https://zplay.fun/game/${canonicalId}`,
          siteName: 'Zplay',
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: meta.title,
          description: meta.description,
        },
        alternates: {
          canonical: `https://zplay.fun/game/${canonicalId}`,
        },
      }
    }
  } catch {}
  return {
    title: 'Play on Zplay',
    description: 'Play this AI-generated game for free on Zplay.',
  }
}

export default async function GamePage({ params }: PageProps) {
  const { id } = await params

  let game: any = null
  let error: string | null = null

  try {
    const supabase = await createClient()
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)
    
    let query = supabase
      .from('games')
      .select('id, title, description, html_content, genre, play_count, like_count, creator_id, country_origin, language, slug, status, users(name)')
    
    if (isUuid) {
      query = query.eq('id', id)
    } else {
      query = query.eq('slug', id)
    }

    const { data, error: err } = await query.single()

    if (err || !data) {
      error = 'Game not found'
    } else {
      if (data.status !== 'published') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.id !== data.creator_id) {
          error = 'Game not found'
        } else {
          game = data
        }
      } else {
        game = data
      }
    }
  } catch (err: any) {
    error = err.message || 'Failed to load game'
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoGame",
            "name": game?.title || 'Zplay Game',
            "description": `Play ${game?.title || 'this game'} free online. Made with AI on Zplay.`,
            "genre": game?.genre || 'Casual',
            "playMode": "SinglePlayer",
            "applicationCategory": "Game",
            "operatingSystem": "Any web browser",
            "url": `https://zplay.fun/game/${game?.slug || game?.id || id}`,
            "publisher": {
              "@type": "Organization",
              "name": "Zplay",
              "url": "https://zplay.fun"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            }
          })
        }}
      />
      <GamePageClient game={game} error={error} />
    </>
  )
}
