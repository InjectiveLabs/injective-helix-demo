import { getBridgeRedirectionUrl } from '@/app/utils/network'
import { IS_TESTNET } from '@/app/utils/constants'
import {
  MainPage,
  MenuItem,
  TradeSubPage,
  PortfolioSubPage,
  LeaderboardSubPage
} from '@/types'

export const getMoreMenu = () => [
  {
    isExpandable: true,
    label: 'navigation.deposit',
    description: 'navigation.depositDescription',
    children: [
      {
        isExternal: true,
        label: 'navigation.depositFiat',
        to: 'https://injective.com/getinj/#fiats',
        description: 'navigation.depositFiatDescription'
      },
      {
        isExternal: true,
        to: getBridgeRedirectionUrl(),
        label: 'navigation.depositCrypto',
        description: 'navigation.depositCryptoDescription'
      },
      {
        isExternal: true,
        label: 'navigation.getInj',
        to: 'https://injective.com/getinj/#getinj',
        description: 'navigation.getInjDescription'
      }
    ]
  },
  {
    to: { name: MainPage.LpRewards },
    label: 'navigation.more.lpRewards',
    description: 'navigation.more.lpRewardsSub'
  },
  {
    to: { name: MainPage.FeeDiscounts },
    label: 'navigation.more.tradingDiscounts',
    description: 'navigation.more.tradingDiscountsSub'
  },
  {
    isExternal: true,
    label: 'navigation.more.bridge',
    description: 'navigation.more.bridgeSub',
    to: 'https://bridge.injective.network/'
  },
  {
    isExternal: true,
    label: 'navigation.more.explorer',
    to: 'https://explorer.injective.network/',
    description: 'navigation.more.explorerSub'
  },
  {
    isExternal: true,
    label: 'navigation.more.apiDocs',
    to: 'https://api.injective.exchange/',
    description: 'navigation.more.apiDocsSub'
  },
  {
    isExternal: true,
    label: 'navigation.more.docs',
    to: 'https://docs.injective.network/',
    description: 'navigation.more.docsSub'
  },
  {
    isExternal: true,
    label: 'navigation.more.olp',
    description: 'navigation.more.olpSub',
    to: 'https://trading.injective.network/program/liquidity/'
  },
  {
    to: { name: MainPage.Institutional },
    label: 'navigation.more.institutional',
    description: 'navigation.more.institutionalSub'
  }
]

export const TRADING_OPTIONS = [
  {
    label: 'navigation.markets',
    to: { name: MainPage.Markets }
  },
  {
    label: 'navigation.trade',
    to: {
      name: TradeSubPage.Futures,
      params: { slug: IS_TESTNET ? 'btc-usdt-perp-pyth' : 'btc-usdt-perp' }
    }
  },
  {
    label: 'navigation.vaults',
    to: { name: MainPage.LiquidityProvision }
  },
  {
    label: 'navigation.tradingBots',
    to: { name: MainPage.LiquidityProvision }
  },
  {
    to: { name: LeaderboardSubPage.Pnl },
    label: 'navigation.leaderboard.title'
  }
]

export const POINTS_ITEM = {
  label: 'navigation.points',
  to: { name: MainPage.Points }
}

export const PORTFOLIO_MENU_ITEMS: MenuItem[] = [
  {
    label: 'navigation.portfolio',
    to: { name: MainPage.Portfolio },
    isExact: true
  },
  {
    label: 'navigation.balances',
    to: { name: PortfolioSubPage.Balances }
  },
  {
    label: 'navigation.positions',
    to: { name: PortfolioSubPage.Positions }
  },
  {
    isExpandable: true,
    label: 'navigation.orders',
    children: [
      {
        label: 'navigation.spot',
        to: { name: PortfolioSubPage.OrdersSpot }
      },
      {
        label: 'navigation.derivative',
        to: { name: PortfolioSubPage.OrdersFutures }
      },
      {
        label: 'navigation.spotGrid',
        to: { name: PortfolioSubPage.OrdersSpotGrid }
      }
      // TODO: Uncomment when futures grid is ready
      // {
      //
      //   label: 'navigation.futuresGrid',
      //   to: { name: PortfolioSubPage.OrdersFuturesGrid }
      // }
    ]
  },
  {
    isExpandable: true,
    label: 'navigation.history',
    children: [
      {
        label: 'navigation.swaps',
        to: { name: PortfolioSubPage.HistorySwap }
      },
      {
        label: 'navigation.subaccountHistory',
        to: { name: PortfolioSubPage.HistoryWallet }
      },
      {
        label: 'navigation.fundingPayments',
        to: { name: PortfolioSubPage.HistoryFundingPayments }
      }
    ]
  },
  {
    label: 'navigation.subaccounts',
    to: { name: PortfolioSubPage.Subaccounts }
  },
  {
    label: 'navigation.settings',
    to: { name: PortfolioSubPage.Settings }
  }
]

export const getTopNavMenu = () =>
  [
    ...TRADING_OPTIONS,
    {
      isConnectedOnly: true,
      label: 'navigation.portfolio',
      to: { name: MainPage.Portfolio }
    },
    {
      isExpandable: true,
      children: getMoreMenu(),
      label: 'navigation.more.title'
    }
  ] as MenuItem[]

export const getMobileMenuItems: () => MenuItem[] = () => [
  {
    isExpandable: true,
    label: 'navigation.portfolio',
    children: PORTFOLIO_MENU_ITEMS
  },
  ...TRADING_OPTIONS,
  POINTS_ITEM,
  {
    isExpandable: true,
    children: getMoreMenu(),
    label: 'navigation.more.title'
  }
]
