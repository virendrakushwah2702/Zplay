/**
 * Platform detection for Zplay
 * Detects Capacitor native app vs web browser
 */

export type Platform = 'ios' | 'android' | 'web'

/**
 * Detect if running inside a Capacitor native app
 */
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).Capacitor?.isNativePlatform?.()
}

/**
 * Get the current platform
 */
export function getPlatform(): Platform {
  if (typeof window === 'undefined') return 'web'
  const cap = (window as any).Capacitor
  if (!cap?.isNativePlatform?.()) return 'web'
  const platformName: string = cap.getPlatform?.() || 'web'
  if (platformName === 'ios') return 'ios'
  if (platformName === 'android') return 'android'
  return 'web'
}

/**
 * Returns 'web', 'ios', or 'android' as a string suitable for API calls
 */
export function getPlatformString(): string {
  return getPlatform()
}

/**
 * True when running on a mobile device (native or mobile browser)
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  if (isNativeApp()) return true
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}
