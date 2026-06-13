const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at',
  'to','for','of','with','by','from','is','it',
  'this','that','be','are','was','were','have',
  'has','do','does','make','my','your','their',
])

export function generateSlug(prompt: string, gameId: string): string {
  const shortId = gameId.replace(/-/g, '').slice(0, 5)
  const words = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
    .slice(0, 5)
  if (words.length === 0) return `game-${shortId}`
  return `${words.join('-')}-${shortId}`
}

export function generateGameMeta(
  title: string,
  genre: string,
  prompt: string
) {
  const cleanTitle = title || prompt.slice(0, 50)
  return {
    title: `Play ${cleanTitle} Free Online — No Download | Unblocked | Zplay`,
    description: `Play ${cleanTitle} instantly in browser. Free online ${genre || 'casual'} game. No download, no install required. Made with AI in 60 seconds on Zplay.`,
    keywords: `${cleanTitle}, free online game, unblocked game, AI game, browser game, play free`,
  }
}

export async function pingGoogle(slug: string): Promise<void> {
  try {
    const sitemapUrl = encodeURIComponent('https://zplay.fun/sitemap.xml')
    await fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`)
  } catch { /* silent fail — not critical */ }
}
