import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const { data: games } = await supabase
    .from('games')
    .select('id, slug, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(50000)

  const gameUrls: MetadataRoute.Sitemap = (games || []).map(game => ({
    url: `https://zplay.fun/game/${game.slug || game.id}`,
    lastModified: new Date(game.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: 'https://zplay.fun',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: 'https://zplay.fun/privacy',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: 'https://zplay.fun/terms',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: 'https://zplay.fun/faq',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: 'https://zplay.fun/unblocked',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ]

  return [...staticPages, ...gameUrls]
}
