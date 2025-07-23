import { NuxtUiIcons } from '@shared/types'
import {
  MainPage,
  TradeSubPage,
  PortfolioSubPage,
  LeaderboardSubPage
} from '@/types'
import type { MenuItem } from '@/types'

export const getMoreMenu = () => [
  {
    label: 'navigation.swap',
    to: { name: MainPage.Swap }
  },
  {
    to: { name: MainPage.LpRewards },
    label: 'navigation.more.lpRewards'
  },
  {
    isExternal: true,
    label: 'navigation.more.bridge',
    to: 'https://bridge.injective.network/'
  },
  {
    to: { name: MainPage.Vaults },
    label: 'navigation.more.vaults'
  },
  {
    isExternal: true,
    label: 'navigation.more.olp',
    to: 'https://trading.injective.network/program/liquidity/'
  },
  {
    isConnectedOnly: true,
    to: { name: MainPage.Points },
    label: 'navigation.points'
  },
  {
    isDesktopOnly: true,
    isConnectedOnly: true,
    label: 'navigation.settings',
    to: { name: PortfolioSubPage.Settings }
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
    label: 'navigation.tradingBots',
    to: { name: MainPage.TradingBots }
  },
  {
    label: 'navigation.stocks',
    to: { name: TradeSubPage.Stocks }
  },
  {
    to: { name: LeaderboardSubPage.Pnl },
    label: 'navigation.leaderboard'
  },
  {
    isOpenDepositModal: true,
    label: 'navigation.more.deposit'
  }
]

export const REFERRAL_ITEM = {
  isConnectedOnly: true,
  label: 'navigation.more.referral',
  to: { name: MainPage.Referral }
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
    REFERRAL_ITEM,
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
