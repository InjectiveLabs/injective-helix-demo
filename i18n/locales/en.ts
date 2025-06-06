import home from './en/home'
import trade from './en/trade'
import guild from './en/guild'
import sgt from './en/spotGrid'
import market from './en/market'
import wallet from './en/wallet'
import points from './en/points'
import banners from './en/banners'
import account from './en/account'
import referral from './en/referral'
import campaign from './en/campaign'
import portfolio from './en/portfolio'
import activities from './en/activity'
import leaderboard from './en/leaderboard'
import tradeAndEarn from './en/tradeAndEarn'
import institutional from './en/institutional'
import liquidityBots from './en/liquidityBots'
import liquidityProvision from './en/liquidityProvision'
import { TimeDuration } from './../../types'

export default {
  ...sgt,
  ...home,
  ...guild,
  ...trade,
  ...market,
  ...wallet,
  ...points,
  ...account,
  ...banners,
  ...campaign,
  ...referral,
  ...portfolio,
  ...activities,
  ...activities,
  ...leaderboard,
  ...tradeAndEarn,
  ...institutional,
  ...liquidityBots,
  ...liquidityProvision,

  common: {
    or: 'or',
    ok: 'OK',
    and: 'and',
    BTC: 'BTC',
    roi: 'ROI',
    pnl: 'PnL',
    max: 'Max',
    docs: 'docs',
    back: 'Back',
    base: 'Base',
    copy: 'Copy',
    here: 'here',
    view: 'View',
    open: 'Open',
    days: 'Days',
    sort: 'Sort',
    quote: 'Quote',
    helix: 'Helix',
    trade: 'Trade',
    value: 'Value',
    close: 'Close',
    enable: 'Enable',
    create: 'Create',
    active: 'active',
    submit: 'Submit',
    search: 'Search',
    cancel: 'Cancel',
    waived: 'Waived',
    sortBy: 'Sort By',
    details: 'Details',
    runtime: 'Runtime',
    network: 'Network',
    deposit: 'Deposit',
    filters: 'Filters',
    confirm: 'Confirm',
    popular: 'Popular',
    disabled: 'Disabled',
    inactive: 'inactive',
    transfer: 'Transfer',
    withdraw: 'Withdraw',
    download: 'Download',
    required: 'Required',
    learnMore: 'Learn more',
    ascending: 'Ascending',
    descending: 'Descending',
    marketType: 'Market Type',
    tradingDocs: 'Trading Docs',
    unauthorized: 'Unauthorized',
    sortDirection: 'Sort Direction',
    marketCategory: 'Market Category',
    dontShowAgain: "Don't Show Again",
    notAvailableinAutoSignMode: 'Not available in Auto-Sign Mode',
    notAvailableinAuthZMode: 'Not available in Access Control Mode',
    notAvailableinAuthZOrAutoSignMode:
      'Not available in Access Control Mode or Auto-Sign Mode',
    available: 'Available',
    baseAndQuote: 'Base and Quote',
    otherWallets: 'Other Wallets',
    ready: 'Ready',
    new: 'New',
    success: 'Success',
    error: 'Error',
    qrCode: 'QR Code',
    somethingHappened: 'Something Happened...',
    [TimeDuration.Day]: 'Day',
    [TimeDuration.Hour]: 'Hour',
    [TimeDuration.Minute]: 'Minute',
    [TimeDuration.Second]: 'Second',
    legacy: {
      title: 'Legacy',
      migrate: 'Migrate',
      attention: 'Attention: ',
      actionRequired: 'Action Required',
      learnMore: 'Learn more',
      affectedMarkets: 'Affected markets and tokens: ',
      goToTokenMigrationPage: 'Go to token migration page',
      marketIsMigrating:
        'Attention: This market will be migrating to the latest native issuance of this asset. Please migrate your tokens and visit the updated listing here: ',
      spotGridIsMigrating:
        'Attention: This market will be migrating to the latest native issuance of this asset. Please delete any active strategies on the legacy market, and create any new strategies on the new markets page. ',
      attentionBanner:
        '{aaa} Helix will be migrating all Wormhole-wrapped assets to the native issuance of the token. Please ensure any open limit order or active spot grid trading strategy related to these markets is canceled, and migrate to the current issuance of each asset. Affected markets include SOL/USDT, WMATIC/USDT, and ARB/USDT. {bbb}',
      goToNewMarket: 'Go to new {market} market',
      goToNewSGT: 'Go to new {market} spot grid'
    }
  },

  globalBanner: {
    title: 'Deposit assets on Injective to get started on Helix'
  },
  underMaintenance: 'Under Maintenance',
  welcome_to_ip:
    'Access, create and trade unlimited decentralized finance markets',
  welcome_to_ip_sub:
    'The Canary Chain has a $5,000 trading limit which will be uplifted upon the canonical release over the coming weeks.',
  maintenance_header: 'System maintenance in progress',
  maintenance_body:
    'We are constantly improving Helix. Please come back later.',
  token_allowance_successful: 'Token allowance set successful',
  'There are no results found - Markets':
    'There are no markets found. You can go ahead and propose some!',
  getting_started: 'Getting Started',
  'Transfer Assets Now': 'Transfer Assets Now',
  Restrictions: 'Restrictions',
  Languages: 'Languages',
  'Injective Chain Balance': 'Injective Balance',
  'ERC20 Balance': 'ERC20 Balance',
  'Join our Ecosystem now': 'Join the Injective Ecosystem!',
  'Ready to get started?': 'Injective Bridge',
  'Cta Note':
    'Transfer assets to Injective and experience lightning fast speeds, zero gas fees and a world of unlimited DeFi Markets.',
  recent_news: 'Recent news',
  injective_home_title_1: 'Injective eliminates all barriers to trading',
  injective_home_title_2: 'Join a global community',
  injective_home_subtitle_1:
    'Access unlimited DeFi markets. With Injective, you can trade any financial market on the first fast, cross-chain, low fee, secure, and fully decentralized derivatives exchange protocol. ',
  injective_home_subtitle_2:
    'Injective is governed entirely by the community.  Early adopters are encouraged to learn more about Injective products, connect with other community members, and have your say in shaping the future of the protocol.',
  gas_fees: 'Gas Fees',
  Total: 'Total',
  'Successfully Transferred': 'Successfully Transferred',
  'Enter amount': 'Enter amount',
  'Acknowledge Terms': 'Acknowledge Terms',
  'Fee Discounts': 'Fee Discounts',
  staked_amount: 'Staked Amount',
  'My Tier': 'My Tier',
  'My Tier Tooltip':
    'The fee tier you currently hold on Injective based on your INJ staked amount and fees paid on the protocol in the current epoch. You can see a full breakdown of the tiers in the table below.',
  'My Staked Amount': 'Staked Amount',
  'My Staked Amount Tooltip':
    'The amount of INJ that you have staked. Staking INJ secures the protocol, earns you rewards and can help you obtain a more preferable fee tier.',
  'My Fee Paid Amount': 'Total Fees Paid',
  'My Fee Paid Amount Tooltip':
    'The total fees you have paid on Injective during the current epoch. You pay fees during trades and traders on the protocol. The amount of fees paid helps determine your fee tier.',
  'Frequently Asked Questions': 'Frequently Asked Questions',
  'Search for FAQs': 'Search for FAQs',
  'faq-category-All': 'All',
  'faq-category-General': 'General',
  and: 'and',
  Rewards: 'Rewards',
  injStaking: 'INJ Staking',
  resources: 'Resources',
  calculator: 'Calculator',
  remaining: 'remaining',
  campaign_duration: 'Campaign Duration',
  campaign_duration_tooltip:
    'The duration of this campaign. A new campaign will start immediately after the previous campaign until 2026.',
  switch_to_injective_address: 'Switch to Injective Address',
  switch_to_ethereum_address: 'Switch to Ethereum Address',

  terra: 'Terra',
  overview: 'Overview',

  marketRestricted: {
    title: {
      perpetual: 'Perpetual Trading Restricted',
      spot: '{symbol} Restricted'
    },
    description: {
      perpetual:
        'Perpetual contracts are not available in your region due to regulatory restrictions. However, you can still trade on the spot market.',
      spot: '{symbol} is not available in your region due to regulatory restrictions.'
    },
    cta: 'Return to homepage',
    tradeSpot: 'Trade Spot',
    swapCta: '{symbol} is not available in your region.'
  },

  marketNotOnHelix: {
    title: 'Experimental market',
    cta: 'I Understand',
    termsAndCondition: 'Terms and Conditions',
    description:
      'You are accessing a market available on Injective but not listed on Helix. Please check whether the Market ID is the one you would like to trade.',
    description2:
      'By proceeding, you acknowledge that you have read, that you agree to, and that you are bound by the Helix {0} as to any use you make of Helix'
  },

  geoRestricted: {
    title: 'Helix not available in your region.',
    description:
      "We're unable to offer Helix in your region due to regulatory requirements. Our team is actively working to expand our service area while ensuring full compliance with local laws. We appreciate your interest and hope to welcome you to our growing global community soon. If you have any open positions, you may close them from the portfolio page.",
    cta: 'Got it'
  },

  marketExpired: {
    title: 'Market Expired',
    expiredNote:
      'This futures contract has just expired and reached settlement.',
    activityPageNote:
      'If you did hold position(s) till expiry, please go to futures trade history to check the settlement record.',
    exploreMarkets: 'Explore Markets',
    goToFutures: 'Go To Futures trade history'
  },

  marketNotLiquid: {
    title: '{slug} market is no longer liquid',
    description:
      'The majority of trading activities for {content}. Please proceed to {slug} for a better trading experience.',
    cta: 'Go to {slug}',
    'sol-usdcet-description': 'Solana is in the SOL/USDT market'
  },

  navigation: {
    swap: 'Swap',
    home: 'Home',
    trade: 'Trade',
    points: 'Points',
    vaults: 'Vaults',
    guilds: 'Guilds',
    getInj: 'Get INJ',
    funding: 'Funding',
    rewards: 'Rewards',
    deposit: 'Deposit',
    account: 'Account',
    depositFiat: 'Fiat',
    balances: 'Balances',
    activity: 'Activity',
    referral: 'Referral',
    connected: 'Connected',
    dashboard: 'Dashboard',
    liquidity: 'Liquidity',
    portfolio: 'Portfolio',
    myAccount: 'My Account',
    depositCrypto: 'Crypto',
    lpRewards: 'LP Rewards',
    disconnect: 'Disconnect',
    activities: 'Activities',
    depositDescription: 'TBD',
    connectedWallets: 'Connected Wallets',
    subaccountHistory: 'Subaccount History',
    getInjDescription: 'Deposit INJ from a CEX to your account',
    swapDescription: 'Quickly swap assets through a simple interface',
    depositFiatDescription: 'Deposit via bank transfer or a bank card',
    guildsSub: 'Create and join Guilds to win team-based competitions',
    depositCryptoDescription: 'Deposit crypto into your trading account',
    more: {
      olp: 'OLP',
      docs: 'Docs',
      title: 'More',
      bridge: 'Bridge',
      explorer: 'Explorer',
      portfolio: 'Portfolio',
      lpRewards: 'LP Rewards',
      apiDocs: 'API Documentation',
      institutional: 'Institutional',
      tradingDiscounts: 'Trading Discounts'
    },

    makerTakerFee: '-{maker}% maker / -{taker}% taker',
    noTierLevel: 'No VIP Tier',
    tradeAndEarn: 'Trade and Earn',
    tradeAndEarnDescription: 'Earn rewards with every trade',
    affiliateProgram: 'Affiliate Program',
    affiliateProgramDescription:
      'Earn crypto commission by inviting friends to trade on Helix',
    openLiquidityProgram: 'Open Liquidity Program',
    openLiquidityProgramDescription:
      'Earn rewards for providing liquidity on Helix',
    spot: 'Spot',
    new: 'New',
    markets: 'Markets',
    spotDescription: 'Buy and sell crypto assets using advanced trading tools',
    perpetual: 'Perpetual',
    perpetualDescription: 'Trade perpetual & pre-launch futures with leverage',
    connectedUsingAuthZ: 'Connected to {address}. Click to close connection.',
    tradingBots: 'Trading Bots',
    tradingBotsDescription: 'Trade smarter with automated trading strategies ',
    liquidityBots: 'Bots',
    liquidityBotsDescription: 'Setup and manage liquidity bots',
    liquidityProvision: 'Provision',
    liquidityProvisionDescription: 'Earn yield through different options',
    positions: 'Positions',
    orders: 'Orders',
    spotGrid: 'Spot Grid',
    derivative: 'Derivative',
    derivativeGrid: 'Derivative Grid',
    futures: 'Futures',
    futuresGrid: 'Futures Grid',
    swaps: 'Swaps',
    wallet: 'Wallet',
    fundingHistory: 'Funding History',
    subaccounts: 'Subaccounts',
    settings: 'Settings',
    derivativesGrid: 'Derivatives Grid',
    history: 'History',
    leaderboard: {
      title: 'Leaderboard',
      pnl: {
        title: 'PnL Leaderboard',
        description: 'Top Traders on Helix by PnL'
      },
      competition: {
        title: 'Trading Competitions',
        description: 'Top Traders Competing for Top Rewards'
      }
    }
  },

  feeDiscounts: {
    page_title: 'Fee Discounts',
    page_description:
      "Trading fees are based on a user's staked amount of INJ and the total trading volume in the past 28 days.",
    page_description_warning:
      'Please note that the maker fee discounts are only applicable to markets with a non-negative maker fee.',
    my_tier: 'My Tier',
    my_staked_amount: 'Staked Amount',
    my_staked_amount_tooltip:
      'The amount of INJ that you have staked. Staking INJ secures the protocol, earns you rewards and can help you obtain a more preferable fee tier.',
    my_trading_volume: 'My Trading Volume',
    trading_volume: 'Trading Volume',
    trading_volume_tooltip:
      'The total volume traded on a 28-day rolling basis. Only markets in USD quote denoms are included at this moment.',
    maker_rate_discount: 'Maker Rate Discount',
    maker_rate_discount_tooltip: 'Maker fee discount based on the fee tier.',
    taker_rate_discount: 'Taker Rate Discount',
    taker_rate_discount_tooltip: 'Taker fee discount based on the fee tier.',
    staked_amount: 'Staked Amount',
    staked_amount_tooltip:
      'The amount of INJ required to be staked. Staking INJ secures the protocol, earns rewards and can help obtain a more preferable fee tier.',
    tier: 'Tier',
    current_apr: 'Current APR',
    fees_taker_maker: 'Fees (Taker / Maker)',
    fees_taker_maker_percent: '{takerFee}% / {makerFee}%',
    viewFeeDiscounts: 'View Fee Discounts',
    maker: 'Maker',
    taker: 'Taker',
    off: 'Off',
    last_updated_at: 'Last updated at',
    update_daily: 'Update daily',
    in_past_days: 'In past {days} days',
    tierAuthZ: 'Tier (AuthZ)'
  },

  pagination: {
    showRows: 'Show rows',
    showCountOutOfTotal: 'Showing {from} - {to} out of {totalCount}',
    paginationPages: 'From {from} to {to} total {totalCount}`'
  },

  filters: {
    clearAll: 'Clear All'
  },

  ninjaPass: {
    congratulations: 'Congratulations! 🎉',
    title: "You've won an exclusive Ninja Pass 🥷",
    description:
      'It will serve as your gateway into exclusive Injective events, products, giveaways and many more surprises.',
    verifyNow: 'Verify now',
    later: 'Later'
  },

  terms: {
    title: 'In addition, you hereby represent, warrant, and agree that:',
    acknowledge_1:
      'You are not a person or company who is a resident of, is located, incorporated, or has a registered agent in, the United States of America (with respect to trading perpetual contracts), the UK (unless you are an Investment Professional), or a Restricted Territory (as defined in the Helix Terms and Conditions).',
    acknowledge_2:
      'You will not now or in the future access this site or use helixapp.com while located in the United States of America (with respect to trading perpetual contracts), the UK (unless you are an Investment Professional), or a Restricted Territory (as defined in the Helix Terms and Conditions).',
    acknowledge_3:
      'You are not using, and will not in the future use, a virtual private network or other means to mask your physical location from a Restricted Territory.',
    acknowledge_4:
      'You are lawfully permitted to access this site and trade on helixapp.com under the laws of the jurisdiction in which you reside and are located.',
    acknowledge_5:
      'You understand the risks associated with using leverage, entering into perpetual contracts, and trading in digital assets.',
    disclaimer: 'Disclaimer',
    privacyPolicy: 'Privacy Policy',
    termsAndCondition: 'Terms and Conditions',
    disclaimerNote:
      'By connecting to a wallet, you acknowledge that you have read, that you agree to, and that you are bound by both the Helix {0} and the Injective Labs {1}.'
  },

  devMode: {
    connect: 'Connect',
    connectWithAddress: 'Connect with address',
    connectWithPrivateKey: 'Connect with private key',
    enterPrivateKey: 'Enter your private key',
    enterInjectiveAddress: 'Enter your injective address'
  },

  authZ: {
    granters: 'Granters',
    grantees: 'Grantees'
  },

  postOnlyMode: {
    title: 'Post Only Mode!',
    description:
      'Please note that for the 2000 blocks (~30 minutes) immediately after the Injective Volan mainnet upgrade, only limit orders can be placed during this period.'
  },

  onboarding: {
    qr: {
      bridge: 'Bridge',
      cta: 'Buy INJ with Card'
    },
    copy: 'Copy',
    depositNow: 'Deposit Now',
    fundsNeeded: 'Funds Needed',
    depositInjNetworkAsset: 'Deposit INJ Network Assets',
    processing: 'Processing your transfer',
    success: 'Your transaction has been confirmed',
    depositNowDescription:
      'You can transfer INJ from anywhere the INJ network is supported, including some exchanges.',
    fundsNeededDescription:
      'You can transfer INJ from anywhere the INJ network is supported, including some exchanges.',
    scanQrCodeOrCopy:
      'Scan the QR code or copy your new address below to begin',
    addFundsScanQrCodeOrCopy: 'Scan the QR code or copy your new address below',
    processingMessage:
      'Processing is taking more than usual. Please wait for a while.',
    closeAndContinue: 'Close and continue',
    injectiveBridge: 'Injective Bridge',
    processingMessageInfo:
      'Your transfer is being processed in the background, and you can safely close this modal. You can check the bridged amount on the balances page or by viewing your bridge history on the ',
    onramperSuccess:
      'Success! You bought {cryptoAmount} {crypto} for {fiatCurrency}. Tokens are on their way.'
  },

  notFound404: {
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist.',
    backToHome: 'Back to home page'
  },

  helix: 'Helix',

  maintenance: {
    title: 'Scheduled Maintenance',
    description:
      "We're carrying out a few updates. During this time, some features will be unavailable for a little while.",
    governance: 'Governance Proposal',
    governanceDescription: 'Check details on the latest chain upgrade',
    subscribe: 'Subscribe for Alerts',
    subscribeDescription: 'Get real-time notifications via Notifi',
    footer:
      "We're making Helix better. We appreciate your patience and will be back soon!"
  }
}
