import { NuxtUiIcons } from '@shared/types'
import { getExplorerUrl } from '@shared/utils/network'
import {
  MainPage,
  MenuItem,
  TradeSubPage,
  PortfolioSubPage,
  LeaderboardSubPage
} from '@/types'

export const getMoreMenu = () => [
  {
    isConnectedOnly: true,
    isOpenDepositModal: true,
    label: 'navigation.deposit'
  },
  {
    to: { name: MainPage.LpRewards },
    label: 'navigation.more.lpRewards'
  },
  {
    isConnectedOnly: true,
    label: 'navigation.referral',
    to: { name: MainPage.Referral }
  },
  {
    to: { name: MainPage.FeeDiscounts },
    label: 'navigation.more.tradingDiscounts'
  },
  {
    to: { name: MainPage.Institutional },
    label: 'navigation.more.institutional'
  },
  {
    isExternal: true,
    label: 'navigation.more.bridge',
    to: 'https://bridge.injective.network/'
  },
  {
    isExternal: true,
    to: getExplorerUrl(),
    label: 'navigation.more.explorer'
  },
  {
    isExternal: true,
    label: 'navigation.more.apiDocs',
    to: 'https://api.injective.exchange/'
  },
  {
    isExternal: true,
    label: 'navigation.more.docs',
    to: 'https://docs.helixapp.com/'
  },
  {
    isExternal: true,
    label: 'navigation.more.olp',
    to: 'https://trading.injective.network/program/liquidity/'
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
      name: TradeSubPage.Spot,
      params: { slug: 'inj-usdt' }
    }
  },
  {
    label: 'navigation.vaults',
    to: { name: MainPage.Vaults }
  },
  {
    label: 'navigation.tradingBots',
    to: { name: MainPage.TradingBots }
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
    isExact: true,
    icon: NuxtUiIcons.PieChart,
    label: 'navigation.portfolio',
    to: { name: MainPage.Portfolio }
  },
  {
    icon: NuxtUiIcons.BarChart,
    label: 'navigation.balances',
    to: { name: PortfolioSubPage.Balances }
  },
  {
    icon: NuxtUiIcons.Position,
    label: 'navigation.positions',
    to: { name: PortfolioSubPage.Positions }
  },
  {
    isExpandable: true,
    icon: NuxtUiIcons.Order,
    label: 'navigation.orders',
    children: [
      {
        label: 'navigation.spot',
        to: { name: PortfolioSubPage.OrdersSpot },
        isExact: true
      },
      {
        label: 'navigation.derivative',
        to: { name: PortfolioSubPage.OrdersFutures }
      }
    ]
  },
  {
    isExpandable: true,
    label: 'navigation.history',
    icon: NuxtUiIcons.PortfolioHistory,
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
        label: 'navigation.fundingHistory',
        to: { name: PortfolioSubPage.HistoryFundingHistory }
      }
    ]
  },
  {
    icon: NuxtUiIcons.SubAccount,
    label: 'navigation.subaccounts',
    to: { name: PortfolioSubPage.Subaccounts }
  },
  {
    label: 'navigation.settings',
    icon: NuxtUiIcons.SettingsOutline,
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

export const getGeoRestrictedTopMenu = () => [
  {
    isConnectedOnly: true,
    label: 'navigation.portfolio',
    to: { name: MainPage.Portfolio }
  }
]

export const getMobileMenuItems = () =>
  [
    {
      isExpandable: true,
      isConnectedOnly: true,
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
  ] as MenuItem[]

export const getGeoRestrictedMobileMenuItems = () =>
  [
    {
      isExpandable: true,
      isConnectedOnly: true,
      label: 'navigation.portfolio',
      children: PORTFOLIO_MENU_ITEMS
    }
  ] as MenuItem[]
