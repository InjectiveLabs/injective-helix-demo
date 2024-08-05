import { getBridgeRedirectionUrl } from '@/app/utils/network'
import { IS_TESTNET } from '@/app/utils/constants'
import {
  MainPage,
  MenuItem,
  TradeSubPage,
  MenuItemType,
  PortfolioSubPage,
  TradingInterface,
  TradingBotsSubPage,
  LeaderboardSubPage
} from '@/types'

export const MENU_ITEMS: MenuItem[] = [
  {
    type: MenuItemType.Link,
    label: 'navigation.markets',
    to: { name: MainPage.Markets }
  },

  {
    type: MenuItemType.Dropdown,
    label: 'navigation.trade',
    items: [
      {
        type: MenuItemType.Link,
        label: 'navigation.swap',
        description: 'navigation.swapDescription',
        to: { name: MainPage.Swap }
      },
      {
        type: MenuItemType.Link,
        label: 'navigation.spot',
        description: 'navigation.spotDescription',
        to: { name: TradeSubPage.Spot, params: { slug: 'inj-usdt' } }
      },
      {
        type: MenuItemType.Link,
        label: 'navigation.perpetual',
        description: 'navigation.perpetualDescription',
        to: {
          name: TradeSubPage.Futures,
          params: { slug: IS_TESTNET ? 'btc-usdt-perp-pyth' : 'btc-usdt-perp' }
        }
      },
      {
        type: MenuItemType.Link,
        label: 'navigation.tradingBots',
        description: 'navigation.tradingBotsDescription',
        to: {
          name: TradeSubPage.Spot,
          params: {
            slug: 'inj-usdt'
          },
          query: { interface: TradingInterface.TradingBots }
        }
      }
    ]
  },

  {
    type: MenuItemType.Dropdown,
    label: 'navigation.liquidity',
    items: [
      // TODO: Uncomment when trade and earn is ready
      // {
      //   type: MenuItemType.Link,
      //   label: 'navigation.tradeAndEarn',
      //   description: 'navigation.tradeAndEarnDescription',
      //   to: { name: MainPage.TradeAndEarn }
      // },
      {
        type: MenuItemType.Link,
        label: 'navigation.liquidityBots',
        description: 'navigation.liquidityBotsDescription',
        to: { name: TradingBotsSubPage.LiquiditySpotMarket }
      },

      // TODO: Uncomment when guilds is ready
      // {
      //   type: MenuItemType.Link,
      //   label: 'navigation.guilds',
      //   description: 'navigation.guildsSub',
      //   to: { name: MainPage.Guilds }
      // },
      {
        type: MenuItemType.Link,
        label: 'navigation.rewards',
        description: 'navigation.lpRewardsSub',
        to: { name: MainPage.LpRewards }
      },
      {
        type: MenuItemType.Link,
        label: 'navigation.liquidityProvision',
        description: 'navigation.liquidityProvisionDescription',
        to: { name: MainPage.LiquidityProvision }
      },
      {
        type: MenuItemType.Link,
        label: 'navigation.openLiquidityProgram',
        description: 'navigation.openLiquidityProgramDescription',
        to: 'https://trading.injective.network/program/liquidity',
        isExternal: true
      }
    ]
  },
  {
    type: MenuItemType.Dropdown,
    label: 'navigation.leaderboard.title',
    items: [
      {
        type: MenuItemType.Link,
        isExact: true,
        name: LeaderboardSubPage.Pnl,
        label: 'navigation.leaderboard.pnl.title',
        description: 'navigation.leaderboard.pnl.description',
        to: { name: LeaderboardSubPage.Pnl }
      },
      {
        type: MenuItemType.Link,
        label: 'navigation.leaderboard.competition.title',
        description: 'navigation.leaderboard.competition.description',
        to: { name: LeaderboardSubPage.Competition }
      }
    ]
  }
]

export const USER_MENU_ITEMS: MenuItem[] = [
  {
    type: MenuItemType.Link,
    label: 'navigation.portfolio',
    to: { name: MainPage.Portfolio },
    icon: 'pie-chart',
    isExact: true,
    name: MainPage.Portfolio
  },
  {
    type: MenuItemType.Link,
    label: 'navigation.balances',
    icon: 'bar-chart',
    to: { name: PortfolioSubPage.Balances }
  },
  {
    type: MenuItemType.Link,
    label: 'navigation.positions',
    icon: 'graph-up',
    to: { name: PortfolioSubPage.Positions }
  },
  {
    type: MenuItemType.Dropdown,
    label: 'navigation.orders',
    icon: 'nested-list',
    name: 'portfolio-orders',
    items: [
      {
        type: MenuItemType.Link,
        label: 'navigation.spot',
        to: { name: PortfolioSubPage.OrdersSpot }
      },
      {
        type: MenuItemType.Link,
        label: 'navigation.derivative',
        to: { name: PortfolioSubPage.OrdersFutures }
      },
      {
        type: MenuItemType.Link,
        label: 'navigation.spotGrid',
        to: { name: PortfolioSubPage.OrdersSpotGrid }
      }
      // TODO: Uncomment when futures grid is ready
      // {
      //   type: MenuItemType.Link,
      //   label: 'navigation.futuresGrid',
      //   to: { name: PortfolioSubPage.OrdersFuturesGrid }
      // }
    ]
  },
  {
    type: MenuItemType.Dropdown,
    label: 'navigation.history',
    icon: 'clock-outline',
    name: 'portfolio-history',
    items: [
      {
        type: MenuItemType.Link,
        label: 'navigation.swaps',
        to: { name: PortfolioSubPage.HistorySwap }
      },
      {
        type: MenuItemType.Link,
        label: 'navigation.subaccountHistory',
        to: { name: PortfolioSubPage.HistoryWallet }
      },
      {
        type: MenuItemType.Link,
        label: 'navigation.fundingPayments',
        to: { name: PortfolioSubPage.HistoryFundingPayments }
      }
    ]
  },
  {
    type: MenuItemType.Link,
    label: 'navigation.subaccounts',
    icon: 'box-list',
    to: { name: PortfolioSubPage.Subaccounts }
  },
  {
    type: MenuItemType.Link,
    label: 'navigation.settings',
    icon: 'gear-outline',
    to: { name: PortfolioSubPage.Settings },
    name: PortfolioSubPage.Settings
  }
]

export const getDepositMenuItem = (): MenuItem => ({
  type: MenuItemType.Dropdown,
  label: 'navigation.deposit',
  items: [
    {
      type: MenuItemType.Link,
      label: 'navigation.depositFiat',
      description: 'navigation.depositFiatDescription',
      to: 'https://injective.com/getinj/#fiats',
      isExternal: true
    },
    {
      type: MenuItemType.Link,
      label: 'navigation.depositCrypto',
      description: 'navigation.depositCryptoDescription',
      to: getBridgeRedirectionUrl(),
      isExternal: true
    },
    {
      type: MenuItemType.Link,
      label: 'navigation.getInj',
      description: 'navigation.getInjDescription',
      to: 'https://injective.com/getinj/#getinj',
      isExternal: true
    }
  ]
})

export const PORTFOLIO_MENU_ITEM: MenuItem = {
  type: MenuItemType.Link,
  label: 'navigation.portfolio',
  to: {
    name: MainPage.Portfolio
  }
}
