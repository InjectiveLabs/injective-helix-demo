import { Network, isDevnet, isTestnet } from '@injectivelabs/networks'
import { LiquidityRewardsPage, MainPage, TradeSubPage } from '../../../types'

export const getRoutes = (network: Network, env: string) => {
  const IS_DEVNET: boolean = isDevnet(network)
  const IS_TESTNET: boolean = isTestnet(network)
  const IS_STAGING = env === 'staging'

  const spot = [
    'inj-usdt',
    'stinj-inj',
    'atom-usdt',
    'arb-usdt',
    'chz-usdcet',
    'wmatic-usdt',
    'sol-usdcet',
    'canto-usdt',
    'usdt-usdcet',
    'usdc-usdcet',
    'ape-usdt',
    'cre-usdt',
    'link-usdt',
    'strd-usdt',
    'xprt-usdt',
    'weth-usdt',
    'evmos-usdt',
    'gf-usdt',
    'somm-usdt',
    'ethbtctrend-usdt',
    'steadyeth-usdt',
    'steadybtc-usdt',
    'neok-usdt',
    'orai-usdt',
    'kava-usdt',
    'usdtkv-usdt',
    'tia-usdt',
    'usdy-usdt',
    'whale-usdt',
    'sol-usdt'
  ]

  const perpetuals = [
    'btc-usdt-perp',
    'inj-usdt-perp',
    'xrp-usdt-perp',
    'eth-usdt-perp',
    'bonk-usdt-perp',
    'osmo-usdt-perp',
    'bnb-usdt-perp',
    'stx-usdt-perp',
    'atom-usdt-perp',
    'sei-usdt-perp',
    'axl-usdt-perp',
    'btc-usdtkv-perp',
    'eth-usdtkv-perp',
    'pyth-usdt-perp',
    'tia-usdt-perp'
  ]

  const gridTradingSpot = [
    'inj-usdt',
    'atom-usdt',
    'tia-usdt',
    'stinj-inj',
    'weth-usdt',
    'whale-usdt',
    'usdtkv-usdt',
    'wmatic-usdt'
  ]

  const binaryOptions: string[] = []
  const expiryFutures: string[] = ['eth-usdt-19sep22', 'tia-usdt-30nov2023']

  if (IS_DEVNET) {
    spot.push('proj-usdt')
    spot.push('wbtc-inj')
    spot.push('proj-inj')
  }

  if (IS_TESTNET) {
    spot.push('projx-inj')
    spot.push('wbtc-usdt')
    spot.push('usdc-usdt')
    spot.push('demo-usdt')

    perpetuals.push(
      '1mpepe-usdt-perp',
      'xau-usdt-perp',
      'gbp-usdt-perp',
      'jpy-usdt-perp',
      'eur-usdt-perp',
      'sol-usdt-perp',
      'btc-usdt-perp-pyth',
      'arb-usdt-perp'
    )

    expiryFutures.push('tia-usdt-01nov2023')
  }

  if (IS_STAGING) {
    spot.push(
      'ldo-usdcet',
      'usdtkv-usdt',
      'kuji-usdt',
      'pyth-usdt',
      'talis-usdt'
    )
    perpetuals.push('btc-usdtkv-perp', 'eth-usdtkv-perp')
  }

  // Redirection pairs
  const spotMarketRedirectsSlugsPairs = { 'usdt-usdc': 'usdt-usdcet' }

  // Middleware routes
  const walletConnectedRequiredRouteNames = [
    MainPage.Bridge,
    MainPage.Account,
    MainPage.Activity
  ]

  // Layout routes
  const footerEnabledRoutes = [
    MainPage.Index,
    MainPage.Markets,
    MainPage.LpRewards,
    MainPage.Leaderboard,
    MainPage.FeeDiscounts,
    LiquidityRewardsPage.Dashboard,
    LiquidityRewardsPage.CampaignDetails
  ]

  const customStaticRoutes: string[] = []
  const upcomingMarketsRoutes: string[] = []
  // const deprecatedMarketsRoutes = []

  const derivativeMarketRouteNames = [
    TradeSubPage.Futures,
    TradeSubPage.Perpetual,
    TradeSubPage.Derivatives,
    TradeSubPage.BinaryOption
  ]
  const spotMarketRouteNames = [TradeSubPage.Spot]

  const spotRoutes = spot.map((s) => `/spot/${s}`) || []
  const spotRedirectRoutes = Object.keys(spotMarketRedirectsSlugsPairs).map(
    (s) => `/spot/${s}`
  )
  const futures = [...perpetuals, ...expiryFutures]
  const futuresRoutes = futures.map((s) => `/futures/${s}`) || []
  const binaryOptionsRoutes =
    binaryOptions.map((s) => `/binary-options/${s}`) || []

  const gridTradingSpotRoutes = gridTradingSpot.map(
    (s) => `/trading-bots/grid/spot/${s}`
  )
  const liquidityBotSpotRoutes = [`/trading-bots/liquidity-bots/spot/`]

  return {
    MARKETS_SLUGS: {
      spot,
      futures,
      binaryOptions,
      expiryFutures,
      gridTradingSpot,
      spotMarketRedirectsSlugsPairs
    },
    ROUTES: {
      spotRoutes: [...spotRoutes, ...spotRedirectRoutes],
      futuresRoutes,
      customStaticRoutes,
      binaryOptionsRoutes,
      footerEnabledRoutes,
      spotMarketRouteNames,
      gridTradingSpotRoutes,
      liquidityBotSpotRoutes,
      upcomingMarketsRoutes,
      derivativeMarketRouteNames,
      walletConnectedRequiredRouteNames
    }
  }
}
