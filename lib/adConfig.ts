export const AD_CONFIG = {
  ADMOB: {
    APP_ID: 'ca-app-pub-5133858386629375~6325136703',
    BANNER: 'ca-app-pub-5133858386629375/5011179323',
    INTERSTITIAL: 'ca-app-pub-5133858386629375/2385015980',
    REWARDED: 'ca-app-pub-5133858386629375/7341534042',
  },

  APP_RULES: {
    MAX_INTERSTITIALS_PER_SESSION: 2,
    MAX_REWARDED_PER_DAY: 8,
    FIRST_GAME_NO_PRE_AD: true,
    NO_ADS_PAID_USERS: true,
    BANNER_REFRESH_SECONDS: 28,
    INTERSTITIAL_COOLDOWN_SECONDS: 30,
    EXIT_INTENT_AD: true,
  },

  WEB_RULES: {
    BANNER_REFRESH_SECONDS: 28,
    VERTICAL_BANNER_DESKTOP_ONLY: true,
    PRE_GAME_AD: true,
    POST_GAME_AD: true,
    EXIT_INTENT_POPUP: true,
    GEO_PRIORITY: 'western',
  },

  GEO_TIERS: {
    tier1: ['US','GB','AU','CA','DE','FR','JP','NL','SE','NO','DK','FI','IE','NZ','CH','AT','BE'],
    tier2: ['AE','SA','SG','MY','HK','KR','IL','QA','KW','BH'],
    tier3: ['IN','PK','BD','ID','PH','VN','TH','BR','MX','NG','KE','ZA','EG'],
  },

  ECPM: {
    tier1: { banner: 165, interstitial: 750, rewarded: 1400, native: 300 },
    tier2: { banner: 85, interstitial: 380, rewarded: 650, native: 150 },
    tier3: { banner: 22, interstitial: 120, rewarded: 220, native: 40 },
  },

  REVENUE_TARGETS: {
    india_net_per_gen: 0.784,
    western_net_per_gen: 6.38,
    website_india_per_play: 0.662,
    website_western_per_play: 4.72,
    api_cost_per_game: 0.197,
  },

  REWARDED_CONSENT_MESSAGE: {
    title: 'Free Game Generation',
    body: 'Zplay is free because of our sponsors. Watch a short video to generate your next game and keep Zplay free for everyone.',
    button: 'Watch & Generate ⚡',
    skip_option: 'Upgrade to Creator — No Ads Ever →',
  },

  EXIT_INTENT: {
    app_message: 'Leaving so soon? Discover 500+ free games on Zplay!',
    app_button1: '🎮 Play One More Game',
    app_button2: '🏆 See Top Games Today',
    app_button3: 'Exit',
    web_message: 'Before you go — one more quick game?',
    web_button: 'Play a Quick Game',
  },
}
