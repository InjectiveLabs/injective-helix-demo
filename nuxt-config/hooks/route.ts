import path from 'path'
import { NitroConfig } from 'nitropack'
import { Network } from '@injectivelabs/networks'

const VITE_ENV = process.env.VITE_ENV
const NETWORK: Network = process.env.VITE_NETWORK as Network

export const IS_DEVNET: Boolean = [
  Network.Devnet,
  Network.Devnet1,
  Network.Local
].includes(NETWORK)
export const IS_TESTNET: Boolean = [
  Network.Testnet,
  Network.TestnetK8s
].includes(NETWORK)
export const IS_STAGING = VITE_ENV === 'staging'
export const IS_MAINNET = NETWORK === Network.Mainnet || VITE_ENV === 'mainnet'
export const IS_MAINNET_STAGING = IS_MAINNET && IS_STAGING

const resolvePagePath = (page: string) => {
  return path.resolve(__dirname, '..', '..', page)
}

export const spot = [
  'inj-usdt',
  'strd-usdt',
  'cre-usdt',
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

export const perpetuals = [
  'btc-usdt-perp',
  'inj-usdt-perp',
  'bonk-usdt-perp',
  'eth-usdt-perp',
  'osmo-usdt-perp',
  'bnb-usdt-perp',
  'stx-usdt-perp',
  'atom-usdt-perp'
]

export const walletConnectedRequiredRouteNames = ['activity', 'account']

export const binaryOptions: string[] = []
export const expiryFutures: string[] = ['eth-usdt-19sep22']

if (IS_DEVNET) {
  spot.push('proj-usdt')
}

if (IS_MAINNET_STAGING || IS_DEVNET) {
  // perpetuals.push('bonk-usdt-perp')
}

export const futures = [...perpetuals, ...expiryFutures]
export const spotRoutes = spot.map((s) => `/spot/${s}`) || []
export const futuresRoutes = futures.map((s) => `/futures/${s}`) || []
export const binaryOptionsRoutes =
  binaryOptions.map((s) => `/binary-options/${s}`) || []

const customStaticRoutes: string[] = ['register']
const upcomingMarketsRoutes: string[] = []
const deprecatedMarketsRoutes = IS_TESTNET || IS_DEVNET ? [] : []

export default {
  'nitro:config'(nitroConfig: NitroConfig) {
    if (
      nitroConfig.dev ||
      !nitroConfig.prerender ||
      !nitroConfig.prerender.routes
    ) {
      return
    }
    nitroConfig.prerender.routes = [
      ...nitroConfig.prerender.routes,
      ...binaryOptionsRoutes,
      ...customStaticRoutes,
      ...deprecatedMarketsRoutes,
      ...futuresRoutes,
      ...spotRoutes,
      ...upcomingMarketsRoutes
    ]
  },

  'pages:extend'(pages: any[]) {
    const routes = [
      {
        name: 'register',
        path: '/register',
        file: resolvePagePath('pages/account.vue'),
        children: []
      },
      {
        name: 'binary-options-binaryOption',
        path: '/binary-options/:binaryOption',
        file: resolvePagePath('pages/futures/[futures].vue'),
        children: []
      },
      {
        name: 'derivative-derivative',
        path: '/derivative/:derivative',
        file: resolvePagePath('pages/futures/[futures].vue')
      },
      {
        name: 'perpetual-perpetual',
        path: '/perpetual/:perpetual',
        file: resolvePagePath('pages/futures/[futures].vue')
      }
    ]

    pages.push(...routes)
  }
}
