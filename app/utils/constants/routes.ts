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
    'strd-usdt',
    'dot-usdt',
    'atom-usdt',
    'usdc-usdt',
    'xprt-usdt',
    'weth-usdt',
    'evmos-usdt',
    'ape-usdt',
    'link-usdt',
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

  const walletConnectedRequiredRouteNames = ['activity', 'account']

  const binaryOptions: string[] = []
  const expiryFutures: string[] = ['eth-usdt-19sep22']

  if (IS_DEVNET) {
    spot.push('proj-usdt')
  }

  if ((IS_MAINNET && IS_STAGING) || IS_DEVNET) {
    spot.push(
      'cre-usdt',
      'sol-usdc',
      'usdc-usdcet',
      'usdcso-usdcet',
      'usdt-usdc'
    )
  }

  const futures = [...perpetuals, ...expiryFutures]
  const spotRoutes = spot.map((s) => `/spot/${s}`) || []
  const futuresRoutes = futures.map((s) => `/futures/${s}`) || []
  const binaryOptionsRoutes =
    binaryOptions.map((s) => `/binary-options/${s}`) || []

  const customStaticRoutes: string[] = ['register']
  const upcomingMarketsRoutes: string[] = []
  const deprecatedMarketsRoutes = IS_TESTNET || IS_DEVNET ? [] : []

  return {
    MARKETS_SLUGS: {
      spot,
      futures,
      binaryOptions,
      expiryFutures
    },
    ROUTES: {
      spotRoutes,
      futuresRoutes,
      binaryOptionsRoutes,
      customStaticRoutes,
      upcomingMarketsRoutes,
      deprecatedMarketsRoutes,
      walletConnectedRequiredRouteNames
    }
  }
}
