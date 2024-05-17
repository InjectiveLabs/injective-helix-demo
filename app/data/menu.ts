import {
  MainPage,
  MenuItem,
  TradeSubPage,
  MenuItemType,
  PortfolioSubPage,
  TradingBotsSubPage,
  TradingInterface
} from '@/types'
import PieChart from '@/components/Asset/Menu/PieChart.vue'
import BarChart from '@/components/Asset/Menu/BarChart.vue'
import Clock from '@/components/Asset/Menu/Clock.vue'
import Gear from '@/components/Asset/Menu/Gear.vue'
import GraphUp from '@/components/Asset/Menu/GraphUp.vue'
import Grid from '@/components/Asset/Menu/Grid.vue'
import ListNested from '@/components/Asset/Menu/ListNested.vue'

export const MENU_ITEMS: MenuItem[] = [
  { type: MenuItemType.Link, label: 'markets', to: { name: MainPage.Markets } },

  {
    type: MenuItemType.Dropdown,
    label: 'trade',
    items: [
      {
        type: MenuItemType.Link,
        label: 'swap',
        description: 'swapDescription',
        to: { name: MainPage.Swap }
      },
      {
        type: MenuItemType.Link,
        label: 'spot',
        description: 'spotDescription',
        to: { name: TradeSubPage.Spot, params: { slug: 'inj-usdt' } }
      },
      {
        type: MenuItemType.Link,
        label: 'perpetual',
        description: 'perpetualDescription',
        to: { name: TradeSubPage.Futures, params: { slug: 'btc-usdt-perp' } }
      },
      {
        type: MenuItemType.Link,
        label: 'tradingBots',
        description: 'tradingBotsDescription',
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
    label: 'liquidity',
    type: MenuItemType.Dropdown,
    items: [
      {
        type: MenuItemType.Link,
        label: 'liquidityBots',
        description: 'liquidityBotsDescription',
        to: { name: TradingBotsSubPage.LiquiditySpotMarket }
      },
      {
        type: MenuItemType.Link,
        label: 'liquidityProvision',
        description: 'liquidityProvisionDescription',
        to: { name: MainPage.LiquidityProvision }
      }
    ]
  },

  {
    type: MenuItemType.Dropdown,
    label: 'rewards',
    items: [
      {
        type: MenuItemType.Link,
        label: 'tradeAndEarn',
        description: 'tradeAndEarnDescription',
        to: { name: MainPage.TradeAndEarn }
      },
      {
        type: MenuItemType.Link,
        label: 'lpRewards',
        description: 'lpRewardsSub',
        to: { name: MainPage.LpRewards }
      },
      {
        type: MenuItemType.Link,
        label: 'guilds',
        description: 'guildsSub',
        to: { name: MainPage.Guilds }
      },
      {
        type: MenuItemType.Link,
        label: 'openLiquidityProgram',
        description: 'openLiquidityProgramDescription',
        to: 'https://trading.injective.network/program/liquidity',
        isExternal: true
      }
    ]
  },

  {
    type: MenuItemType.Link,
    label: 'leaderboard',
    to: { name: MainPage.PnlLeaderboard }
  }
]

export const USER_MENU_ITEMS: MenuItem[] = [
  {
    type: MenuItemType.Link,
    label: 'portfolio',
    to: { name: MainPage.Portfolio },
    icon: PieChart
  },
  {
    type: MenuItemType.Link,
    label: 'balances',
    icon: BarChart,
    to: { name: PortfolioSubPage.Balances }
  },
  {
    type: MenuItemType.Link,
    label: 'positions',
    icon: GraphUp,
    to: { name: PortfolioSubPage.Positions }
  },
  {
    type: MenuItemType.Dropdown,
    label: 'orders',
    icon: ListNested,
    items: [
      {
        type: MenuItemType.Link,
        label: 'spot',
        to: { name: PortfolioSubPage.OrdersSpot }
      },
      {
        type: MenuItemType.Link,
        label: 'futures',
        to: { name: PortfolioSubPage.OrdersFutures }
      },
      {
        type: MenuItemType.Link,
        label: 'spotGrid',
        to: { name: PortfolioSubPage.OrdersSpotGrid }
      },
      {
        type: MenuItemType.Link,
        label: 'futuresGrid',
        to: { name: PortfolioSubPage.OrdersFuturesGrid }
      }
    ]
  },
  {
    type: MenuItemType.Dropdown,
    label: 'history',
    icon: Clock,
    items: [
      {
        type: MenuItemType.Link,
        label: 'swaps',
        to: { name: PortfolioSubPage.HistorySwap }
      },
      {
        type: MenuItemType.Link,
        label: 'wallet',
        to: { name: PortfolioSubPage.HistoryWallet }
      },
      {
        type: MenuItemType.Link,
        label: 'fundingPayments',
        to: { name: PortfolioSubPage.HistoryFundingPayments }
      }
    ]
  },
  {
    type: MenuItemType.Link,
    label: 'subaccounts',
    icon: Grid,
    to: { name: PortfolioSubPage.Subaccounts }
  },
  {
    type: MenuItemType.Link,
    label: 'settings',
    icon: Gear,
    to: { name: PortfolioSubPage.Settings }
  }
]
