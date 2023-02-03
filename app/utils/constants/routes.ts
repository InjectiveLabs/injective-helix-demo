import { Network } from '@injectivelabs/networks'

export const getRoutes = (network: Network, env: string) => {
  const IS_DEVNET: Boolean = [
    Network.Devnet,
    Network.Devnet1,
    Network.Local
  ].includes(network)
  const IS_TESTNET: Boolean = [Network.Testnet, Network.TestnetK8s].includes(
    network
  )
  const IS_STAGING = env === 'staging'
  const IS_MAINNET =
    [
      Network.Public,
      Network.Staging,
      Network.Mainnet,
      Network.MainnetK8s,
      Network.MainnetLB
    ].includes(network) || env === 'mainnet'

  const spot = [
    'inj-usdt',
    'atom-usdt',
    'sol-usdcet',
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

  // Market we want to load to the app state but we don't want to show on the UI
  const hiddenSpotMarkets = ['usdt-usdcet', 'usdc-usdcet']

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

  const binaryOptions: string[] = []
  const expiryFutures: string[] = ['eth-usdt-19sep22']

  if (IS_DEVNET) {
    spot.push('proj-usdt')
  }

  if ((IS_MAINNET && IS_STAGING) || IS_DEVNET) {
    spot.push(...hiddenSpotMarkets)
  }

  // Redirection pairs
  const spotMarketRedirectsSlugsPairs = { 'usdt-usdc': 'usdt-usdcet' }

  // Middleware routes
  const walletConnectedRequiredRouteNames = ['activity', 'account']

  const spotRoutes = spot.map((s) => `/spot/${s}`) || []
  const spotRedirectRoutes = Object.keys(spotRoutes).map((s) => `/spot/${s}`)

  const futures = [...perpetuals, ...expiryFutures]
  const futuresRoutes = futures.map((s) => `/futures/${s}`) || []
  const binaryOptionsRoutes =
    binaryOptions.map((s) => `/binary-options/${s}`) || []

  const customStaticRoutes: string[] = ['register']
  const upcomingMarketsRoutes: string[] = []
  const deprecatedMarketsRoutes = IS_TESTNET || IS_DEVNET ? [] : []

  const derivativeMarketRouteNames = [
    'perpetuals-perpetual',
    'futures-futures',
    'binary-options-binaryOption',
    'derivatives-derivative'
  ]
  const spotMarketRouteNames = ['spot-spot']

  return {
    MARKETS_SLUGS: {
      spot,
      futures,
      expiryFutures,
      binaryOptions,
      hiddenSpotMarkets,
      spotMarketRedirectsSlugsPairs
    },
    ROUTES: {
      spotRoutes: [...spotRoutes, ...spotRedirectRoutes],
      futuresRoutes,
      customStaticRoutes,
      binaryOptionsRoutes,
      spotMarketRouteNames,
      upcomingMarketsRoutes,
      deprecatedMarketsRoutes,
      derivativeMarketRouteNames,
      walletConnectedRequiredRouteNames
    }
  }
}
