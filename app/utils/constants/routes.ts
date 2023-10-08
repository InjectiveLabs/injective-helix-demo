import { Network, isDevnet, isTestnet } from '@injectivelabs/networks'

export const getRoutes = (network: Network, env: string) => {
  const IS_DEVNET: boolean = isDevnet(network)
  const IS_TESTNET: boolean = isTestnet(network)
  const IS_STAGING = env === 'staging'

  const spot = [
    'inj-usdt',
    'stinj-inj',
    'kava-usdt',
    'atom-usdt',
    'arb-usdt',
    'chz-usdcet',
    'wmatic-usdt',
    'sol-usdcet',
    'canto-usdt',
    'usdt-usdcet',
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
    'orai-usdt'
  ]

  const perpetuals = [
    'btc-usdt-perp',
    'inj-usdt-perp',
    'btc-usdtkv-perp',
    'eth-usdtkv-perp',
    'axl-usdt-perp',
    'xrp-usdt-perp',
    'eth-usdt-perp',
    'bonk-usdt-perp',
    'osmo-usdt-perp',
    'bnb-usdt-perp',
    'stx-usdt-perp',
    'atom-usdt-perp',
    'sei-usdt-perp'
  ]

  const gridTradingSpot = ['inj-usdt']

  const binaryOptions: string[] = []
  const expiryFutures: string[] = ['eth-usdt-19sep22']

  if (IS_DEVNET) {
    spot.push('wbtc-inj')
    spot.push('proj-inj')
  }

  if (IS_TESTNET) {
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

  // Redirection pairs
  const spotMarketRedirectsSlugsPairs = { 'usdt-usdc': 'usdt-usdcet' }

  // Middleware routes
  const walletConnectedRequiredRouteNames = ['activity', 'account', 'bridge']

  // Layout routes
  const footerEnabledRoutes = [
    'index',
    'markets',
    'fee-discounts',
    'leaderboard'
  ]

  const customStaticRoutes: string[] = []
  const upcomingMarketsRoutes: string[] = []
  // const deprecatedMarketsRoutes = []

  const derivativeMarketRouteNames = [
    'perpetuals-perpetual',
    'futures-futures',
    'binary-options-binaryOption',
    'derivatives-derivative'
  ]
  const spotMarketRouteNames = ['spot-spot']

  // Market we want to load to the app state but we don't want to show on the UI
  const usdcConversionModalMarkets = ['usdt-usdcet', 'usdc-usdcet']

  if (IS_STAGING) {
    spot.push(...usdcConversionModalMarkets, 'ldo-usdcet')
  }

  if (IS_DEVNET) {
    spot.push(...usdcConversionModalMarkets, 'proj-usdt')
  }

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

  return {
    MARKETS_SLUGS: {
      spot,
      futures,
      binaryOptions,
      expiryFutures,
      gridTradingSpot,
      usdcConversionModalMarkets,
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
      upcomingMarketsRoutes,
      derivativeMarketRouteNames,
      walletConnectedRequiredRouteNames
    }
  }
}
