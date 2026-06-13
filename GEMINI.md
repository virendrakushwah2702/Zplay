# Zplay Project Context

## What Is Zplay
Western-first AI game creation platform.
User types prompt → DeepSeek generates HTML5 game → plays in browser.
Domain: zplay.fun | Stack: Next.js 15 + Supabase + DeepSeek

## Local Path
D:\Jai Maa Lalita\ZPlay\

## Architecture Rules
- NEVER call DeepSeek from client side — server only via /api/generate
- All DB operations via Supabase client — never raw SQL from frontend
- Game HTML stored as text in Supabase games.html_content column
- iframes always use sandbox="allow-scripts allow-same-origin"
- Mobile first — 390px base width always
- Touch events alongside mouse events always
- Dark theme (#0a0a1e background, #6366f1 purple accent)

## AI Generation
- Model: deepseek-chat (DeepSeek V4 Flash)
- Cost: Rs.0.068 per game
- Max tokens: 4500 (hard cap always)
- Retry: up to 3 attempts on failure
- System prompt in: lib/gamePrompt.ts

## AdMob IDs
App ID: ca-app-pub-5133858386629375~6325136703
Banner: ca-app-pub-5133858386629375/5011179323
Interstitial: ca-app-pub-5133858386629375/2385015980
Rewarded: ca-app-pub-5133858386629375/7341534042

## Database (Supabase)
8 tables: users, games, game_plays, ad_events,
transactions, creator_earnings, withdrawals, social

## Payment
- India IN: Razorpay
- Global IN: PayPal Business
- India OUT: RazorpayX UPI (Rs.50 minimum)
- Global OUT: PayPal Payouts API ($2 minimum)

## Revenue Model
- Free users: 3 games/day, all ads shown
- Creator Rs.99/month: 50 games, no interstitials
- Pro Rs.199/month: 150 games, no ads
- Studio Rs.499/month: 500 games, no ads + APK export
- Website Engine 1: AdSense + AdinPlay + Media.net

## Coding Standards
- TypeScript strict always
- No any types unless absolutely necessary
- Error boundaries on all iframes
- Loading states on all async operations
- Toast notifications for user feedback
