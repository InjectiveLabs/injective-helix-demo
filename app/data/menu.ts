import { NuxtUiIcons } from '@shared/types'
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
    isConnectedOnly: true,
    isOpenDepositModal: true,
    label: 'navigation.deposit'
  },
  {
    to: { name: MainPage.LpRewards },
    label: 'navigation.more.lpRewards'
  },
  {
    to: { name: MainPage.FeeDiscounts },
    label: 'navigation.more.tradingDiscounts'
  },
  {
    isExternal: true,
    label: 'navigation.more.bridge',

    to: 'https://bridge.injective.network/'
  },
  {
    isExternal: true,
    label: 'navigation.more.explorer',
    to: 'https://explorer.injective.network/'
  },
  {
    isExternal: true,
    label: 'navigation.more.apiDocs',
    to: 'https://api.injective.exchange/'
  },
  {
    isExternal: true,
    label: 'navigation.more.docs',
    to: 'https://docs.injective.network/'
  },
  {
    isExternal: true,
    label: 'navigation.more.olp',

    to: 'https://trading.injective.network/program/liquidity/'
  },
  {
    to: { name: MainPage.Institutional },
    label: 'navigation.more.institutional'
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
  isConnectedOnly: true,
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
