export function initBannerRefresh() {
  if (typeof window === 'undefined') return

  const REFRESH_INTERVAL = 28000 // 28 seconds
  const MAX_REFRESHES = 12
  const refreshCounts: Record<string, number> = {}

  function refreshBanner(slotId: string) {
    const el = document.getElementById(slotId)
    if (!el) return

    const count = refreshCounts[slotId] || 0
    if (count >= MAX_REFRESHES) return

    // Check if element is in viewport
    const rect = el.getBoundingClientRect()
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0
    if (!inViewport) return

    // Trigger AdSense/AdinPlay refresh
    if ((window as any).adsbygoogle) {
      try {
        ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      } catch (e) {}
    }

    refreshCounts[slotId] = count + 1

    // Visual pulse to show refresh (debug mode — remove in production)
    el.style.opacity = '0.7'
    setTimeout(() => {
      el.style.opacity = '1'
    }, 200)
  }

  const bannerIds = [
    'zplay-banner-slot',
    'left-skyscraper-slot',
    'right-skyscraper-slot',
    'admob-banner',
  ]

  setInterval(() => {
    bannerIds.forEach((id) => refreshBanner(id))
  }, REFRESH_INTERVAL)
}
