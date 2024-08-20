import {
  MainPage,
  TradeSubPage,
  PortfolioSubPage,
  LiquidityRewardsPage
} from '../../../types'
import { spotSlugs, expirySlugs, derivativeSlugs } from './../../json'

export const getRoutes = () => {
  const gridTradingSpot = [
    'inj-usdt',
    'atom-usdt',
    'tia-usdt',
    'stinj-inj',
    'weth-usdt',
    'whale-usdt',
    'usdtkv-usdt',
    'wmatic-usdt',
    'arb-usdt',
    'kuji-usdt',
    'talis-usdt',
    'sol-usdt',
    'ninja-inj',
    'kira-inj',
    'autism-inj',
    'usdy-usdt',
    'ginger-inj',
    'app-inj',
    'strd-usdt',
    'orai-usdt',
    'ninj-inj',
    'dojo-inj',
    'andr-usdt',
    'hinj-inj',
    'dojo-inj',
    'andr-usdt',
    'hinj-inj',
    'usde-usdt',
    'usdc-usdt',
    'pyth-inj',
    'nonja-inj',
    'sollegacy-usdt',
    'ena-usdt'
  ]

  const futures = [...derivativeSlugs, ...expirySlugs]

  // Middleware routes
  const walletConnectedRequiredRouteNames = [
    MainPage.Portfolio,
    ...Object.values(PortfolioSubPage)
  ]

  // Layout routes
  const footerEnabledRoutes = [
    MainPage.Index,
    MainPage.Markets,
    MainPage.LpRewards,
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
    TradeSubPage.Derivatives
  ]
  const spotMarketRouteNames = [TradeSubPage.Spot]

  const spotRoutes = spotSlugs.map((s) => `/spot/${s}`) || []
  const futuresRoutes = futures.map((s) => `/futures/${s}`) || []

  const gridTradingSpotRoutes = gridTradingSpot.map(
    (s) => `/trading-bots/grid/spot/${s}`
  )

  const gridTradingSpotHistoryRoutes = gridTradingSpot.map(
    (s) => `/trading-bots/grid/spot/${s}/history`
  )

  const liquidityBotSpotRoutes = [`/trading-bots/liquidity-bots/spot/`]

  return {
    MARKETS_SLUGS: {
      futures,
      gridTradingSpot,
      spot: spotSlugs,
      expiryFutures: expirySlugs
    },
    ROUTES: {
      spotRoutes,
      futuresRoutes,
      customStaticRoutes,
      footerEnabledRoutes,
      spotMarketRouteNames,
      liquidityBotSpotRoutes,
      upcomingMarketsRoutes,
      derivativeMarketRouteNames,
      walletConnectedRequiredRouteNames,
      gridTradingSpotRoutes: [
        ...gridTradingSpotRoutes,
        ...gridTradingSpotHistoryRoutes
      ]
    }
  }
}
