import { Network, isDevnet, isTestnet } from '@injectivelabs/networks'

export const getRoutes = (network: Network, env: string) => {
  const IS_DEVNET: Boolean = isDevnet(network)
  const IS_TESTNET: Boolean = isTestnet(network)
  const IS_STAGING = env === 'staging'
  const IS_MAINNET = (!IS_DEVNET && !IS_TESTNET) || env === 'mainnet'

  const spot = [
    'inj-usdt',
    'atom-usdt',
    'arb-usdt',
    'chz-usdcet',
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
    'steadybtc-usdt'
  ]

  const perpetuals = [
    'btc-usdt-perp',
    'inj-usdt-perp',
    'bonk-usdt-perp',
    'eth-usdt-perp',
    'osmo-usdt-perp',
    'bnb-usdt-perp',
    'stx-usdt-perp',
    'atom-usdt-perp'
  ]

  if (IS_TESTNET) {
    perpetuals.push(
      'gbp-usdt-perp',
      'jpy/usdt-perp',
      'sol-usdt-perp',
      'eur-usdt-perp'
    )
  }

  const binaryOptions: string[] = []
  const expiryFutures: string[] = ['eth-usdt-19sep22']

  // Redirection pairs
  const spotMarketRedirectsSlugsPairs = { 'usdt-usdc': 'usdt-usdcet' }

  // Middleware routes
  const walletConnectedRequiredRouteNames = ['activity', 'account']

  // Layout routes
  const footerEnabledRoutes = [
    'index',
    'markets',
    'fee-discounts',
    'leaderboard'
  ]

  const spotRoutes = spot.map((s) => `/spot/${s}`) || []
  const spotRedirectRoutes = Object.keys(spotMarketRedirectsSlugsPairs).map(
    (s) => `/spot/${s}`
  )

  const futures = [...perpetuals, ...expiryFutures]
  const futuresRoutes = futures.map((s) => `/futures/${s}`) || []
  const binaryOptionsRoutes =
    binaryOptions.map((s) => `/binary-options/${s}`) || []

  const customStaticRoutes: string[] = ['/']
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

  if ((IS_MAINNET && IS_STAGING) || IS_DEVNET) {
    spot.push(...usdcConversionModalMarkets, 'ldo-usdcet')
  }

  if (IS_DEVNET) {
    spot.push('proj-usdt')
  }

  return {
    MARKETS_SLUGS: {
      spot,
      futures,
      binaryOptions,
      expiryFutures,
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
      upcomingMarketsRoutes,
      derivativeMarketRouteNames,
      walletConnectedRequiredRouteNames
    }
  }
}
