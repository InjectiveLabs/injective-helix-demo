import home from './home/en'
import trade from './trade/en'
import guild from './guild/en'
import bridge from './bridge/en'
import market from './market/en'
import wallet from './wallet/en'
import sgt from './spot-grid/en'
import pyth from './pyth/en'
import banners from './banners/en'
import account from './account/en'
import campaign from './campaign/en'
import ethdenver from './ethdenver/en'
import activities from './activity/en'
import leaderboard from './leaderboard/en'
import tradeAndEarn from './tradeAndEarn/en'
import institutional from './institutional/en'
import liquidityBots from './liquidity-bots/en'
import { I18nMessageFunction, TimeDuration } from '@/types'

export default {
  ...sgt,
  ...home,
  ...pyth,
  ...guild,
  ...trade,
  ...market,
  ...bridge,
  ...wallet,
  ...account,
  ...banners,
  ...campaign,
  ...ethdenver,
  ...activities,
  ...activities,
  ...leaderboard,
  ...tradeAndEarn,
  ...institutional,
  ...liquidityBots,
  common: {
    ok: 'OK',
    back: 'Back',
    view: 'View',
    open: 'Open',
    trade: 'Trade',
    value: 'Value',
    close: 'Close',
    active: 'active',
    submit: 'Submit',
    search: 'Search',
    cancel: 'Cancel',
    waived: 'Waived',
    details: 'Details',
    network: 'Network',
    deposit: 'Deposit',
    filters: 'Filters',
    confirm: 'Confirm',
    inactive: 'inactive',
    transfer: 'Transfer',
    withdraw: 'Withdraw',
    download: 'Download',
    required: 'Required',
    available: 'Available',
    ready: 'Ready',
    new: 'New',
    success: 'Success',
    error: 'Error',
    qrCode: 'QR Code',
    somethingHappened: 'Something Happened...',
    [TimeDuration.Day]: 'Day',
    [TimeDuration.Hour]: 'Hour',
    [TimeDuration.Minute]: 'Minute',
    [TimeDuration.Second]: 'Second'
  },
  underMaintenance: 'Under Maintenance',
  welcome_to_ip:
    'Access, create and trade unlimited decentralized finance markets',
  welcome_to_ip_sub:
    'The Canary Chain has a $5,000 trading limit which will be uplifted upon the canonical release over the coming weeks.',
  maintenance_header: 'System maintenance in progress',
  maintenance_subheader:
    'While this relayer is down for maintenance,<strong class="text-blue-500">Injective</strong> is never down! You can find other relayers in the Injective Ecosystem on the button below!',
  maintenance_button: 'View status',
  maintenance_body:
    'We are constantly improving Helix. Please come back later. Follow the latest updates on our public status page.',
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
    title: 'Unavailable Market',
    description: {
      perpetual: 'Perpetual markets are not available in your region.',
      spot: ({ named }: I18nMessageFunction) =>
        `${named('symbol')} is not available in your region.`
    },
    cta: 'Return to homepage',
    swapCta: ({ named }: I18nMessageFunction) =>
      `${named('symbol')} is not available in your region`
  },

  marketBeta: {
    title: 'Acknowledge the risk of trading on the market',
    'I Understand': 'I Understand',
    beta: 'beta',
    description:
      'This market is in the Beta phase. During this phase, typically there is no great depth in the order book. This means slippage may be applied when you make a trade.'
  },

  marketNotOnHelix: {
    title: 'Experimental market',
    cta: 'I Understand',
    description:
      'You are accessing a market available on Injective but not listed on Helix. Please check whether the Market ID is the one you would like to trade.'
  },

  marketNew: {
    title: 'Upcoming market launch',
    depositNow: 'Deposit Now',
    description: ({ interpolate, named }: I18nMessageFunction) =>
      interpolate([
        'The',
        named('baseSymbol'),
        '/',
        named('quoteSymbol'),
        ' spot market will launch soon.'
      ]),
    connectAndDepositNow: 'Connect and Deposit now',
    soonToBeReleased: 'Coming soon!'
  },

  marketExpired: {
    title: 'Market Expired',
    expiredNote:
      'This futures contract has just expired and reached settlement.',
    activityPageNote:
      'If you did hold position(s) till expiry, please go to Activity to check the settlement record.',
    exploreMarkets: 'Explore Markets',
    goToActivity: 'Go To Activity'
  },

  marketNotLiquid: {
    title: ({ named }: I18nMessageFunction) =>
      `${named('slug')} market is no longer liquid`,
    description: ({ named }: I18nMessageFunction) => `
      The majority of trading activities for ${named(
        'content'
      )}. Please proceed to ${named('slug')} for a better trading experience.`,
    cta: ({ named }: I18nMessageFunction) => `Go to ${named('slug')}`,
    'sol-usdcet-description': 'Solana is in the SOL/USDT market'
  },

  marketDeprecated: {
    title: 'No longer tradable',
    description: ({ interpolate, named }: I18nMessageFunction) =>
      interpolate([named('ticker'), ' is no longer tradable on Helix.']),
    subDescriptionOne: ({ named }: I18nMessageFunction) =>
      `If you would like to continue trading ${named(
        'ticker'
      )}, you could still do so with other exchanges in the Injective ecosystem.`,
    subDescriptionTwo: ({ interpolate, named }: I18nMessageFunction) =>
      interpolate([
        'If you would like to withdraw your ',
        named('symbol'),
        ' balances, you could do so via our {network} bridge on the Injective Hub.'
      ]),
    terraDescription:
      'Please note that Terra bridge on the Injective Hub is currently disabled due to the Terra chain halting.',
    exploreOtherMarkets: 'Explore Other Markets',
    injectiveBridge: 'Injective Bridge'
  },

  navigation: {
    balances: 'Balances',
    funding: 'Funding',
    disconnect: 'Disconnect',
    myAccount: 'My Account',
    connectedWallets: 'Connected Wallets',
    connected: 'Connected',
    rewards: 'Rewards',
    dashboard: 'Dashboard',
    trade: 'Trade',
    swap: 'Swap',
    liquidity: 'Liquidity',
    swapDescription: 'Trade through a simple & intuitive interface',
    activities: 'Activities',
    activity: 'Activity',
    portfolio: 'Portfolio',
    guilds: 'Guilds',
    guildsSub: 'Team up with other traders to earn rewards',
    lpRewards: 'LP Rewards',
    lpRewardsSub: 'Rewards for using liquidity bots',
    account: 'Account',
    home: 'Home',
    makerTakerFee: ({ named }: I18nMessageFunction) =>
      `-${named('maker')}% maker / -${named('taker')}% taker`,
    noTierLevel: 'No VIP Tier',
    tradeAndEarn: 'Trade and Earn',
    tradeAndEarnDescription: 'Earn rewards with every trade',
    affiliateProgram: 'Affiliate Program',
    affiliateProgramDescription:
      'Earn crypto commission by inviting friends to trade on Helix',
    openLiquidityProgram: 'Open Liquidity Program',
    openLiquidityProgramDescription:
      'Provide liquidity and earn INJ rewards in our Open Liquidity Program',
    spot: 'Spot',
    new: 'New',
    spotDescription: 'Trade crypto on an on-chain orderbook',
    perpetual: 'Perpetual',
    perpetualDescription: 'Trade perpetual contracts settled in USDT',
    leaderboard: 'Leaderboard',
    connectedUsingAuthZ: ({ named }: I18nMessageFunction) =>
      `Connected to ${named('address')}. Click to close connection.`,

    tradingBots: 'Trading Bots',
    tradingBotsDescription: 'Trade smarter with automated strategies',
    liquidityBots: 'Liquidity Bots',
    liquidityBotsDescription: 'Trade smarter with automated strategies',
    pyth: 'PYTH Airdrop Claim',
    pythDescription: 'Check Airdrop Eligibility and Claim Tokens'
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
    maker: 'Maker',
    taker: 'Taker',
    off: 'Off',
    last_updated_at: 'Last updated at',
    update_daily: 'Update daily',
    in_past_days: ({ named }: I18nMessageFunction) =>
      `In past ${named('days')} days`,
    tierAuthZ: 'Tier (AuthZ)'
  },

  pagination: {
    showRows: 'Show rows',
    showCountOutOfTotal: ({ named }: I18nMessageFunction) =>
      `Showing ${named('from')} - ${named('to')} out of ${named('totalCount')}`,
    paginationPages: ({ named }: I18nMessageFunction) =>
      `From ${named('from')} to ${named('to')} total ${named('totalCount')}`
  },

  filters: {
    clearAll: 'Clear All'
  },

  ninjaPass: {
    congratulations: 'Congratulations! 🎉',
    title: 'You’ve won an exclusive Ninja Pass 🥷',
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
    disclaimerNote: ({ interpolate, named }: I18nMessageFunction) =>
      interpolate([
        'By connecting to a wallet, you acknowledge that you have read, that you agree to, and that you are bound by both the Helix ',
        named('terms'),
        ' and the Injective Labs ',
        named('policy'),
        '.'
      ])
  },

  devMode: {
    connectWithAddress: 'Connect with address',
    connect: 'Connect',
    enterInjectiveAddress: 'Enter your injective address'
  },

  proMode: {
    proMode: 'Pro Mode',
    subaccountManagement: 'Enable subaccount management',
    authzManagement: 'Enable authZ management',
    showSubaccountsWithDust: 'Show subaccounts with dust amounts'
  },

  authZ: {
    granters: 'Granters',
    grantees: 'Grantees'
  },

  scavengerHunt: {
    title: 'You found it! 🕵️‍♀️',
    description: 'The secret word for the Injective Scavenger Hunt is "brand".'
  },

  postOnlyMode: {
    title: 'Post Only Mode!',
    description:
      'Please note that for the 2000 blocks (~30 minutes) immediately after the Injective Volan mainnet upgrade, only limit orders can be placed during this period.'
  }
}
