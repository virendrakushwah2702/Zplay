'use client'

import { useEffect } from 'react'
import { initBannerRefresh } from '@/lib/bannerRefresh'

export default function BannerRefreshInit() {
  useEffect(() => {
    initBannerRefresh()
  }, [])

  return null
}
