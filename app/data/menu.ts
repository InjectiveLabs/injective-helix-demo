import { MainPage, MenuItem, MenuItemType } from '@/types'
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
        to: '/spot/inj-usdt'
      },
      {
        type: MenuItemType.Link,
        label: 'perpetual',
        description: 'perpetualDescription',
        to: '/futures/btc-usdt-perp'
      },
      {
        type: MenuItemType.Dropdown,
        label: 'tradingBots',
        description: 'tradingBotsDescription',
        items: [
          {
            type: MenuItemType.Link,
            label: 'spot',
            description: 'tradingBotsDescription',
            to: '/trading-bots/grid/spot/inj-usdt'
          },
          {
            type: MenuItemType.Link,
            label: 'perpetual',
            description: 'tradingBotsDescription',
            to: '/trading-bots/grid/spot/inj-usdt'
          }
        ]
      }
    ]
  },
  {
    type: MenuItemType.Link,
    label: 'liquidity',
    to: '/trading-bots/liquidity-bots/spot/inj-usdt'
  },
  {
    type: MenuItemType.Dropdown,
    label: 'rewards',
    items: [
      {
        type: MenuItemType.Link,
        label: 'tradeAndEarn',
        description: 'tradeAndEarnDescription',
        to: '/trade-and-earn'
      },
      {
        type: MenuItemType.Link,
        label: 'lpRewards',
        description: 'lpRewardsSub',
        to: '/trade-and-earn'
      },
      {
        type: MenuItemType.Link,
        label: 'guilds',
        description: 'guildsSub',
        to: '/trade-and-earn'
      },
      {
        type: MenuItemType.Link,
        label: 'openLiquidityProgram',
        description: 'openLiquidityProgramDescription',
        to: '/trade-and-earn'
      }
    ]
  }
]

export const USER_MENU_ITEMS: MenuItem[] = [
  {
    type: MenuItemType.Link,
    label: 'portfolio',
    to: '/portfolio',
    icon: PieChart
  },
  {
    type: MenuItemType.Link,
    label: 'balances',
    icon: BarChart,
    to: '/portfolio/balances'
  },
  {
    type: MenuItemType.Link,
    label: 'positions',
    icon: GraphUp,
    to: '/portfolio/positions'
  },
  {
    type: MenuItemType.Dropdown,
    label: 'orders',
    icon: ListNested,
    items: [
      { type: MenuItemType.Link, label: 'spot', to: '/portfolio/orders/spot' },
      {
        type: MenuItemType.Link,
        label: 'futures',
        to: '/portfolio/orders/futures'
      },
      {
        type: MenuItemType.Link,
        label: 'spotGrid',
        to: '/portfolio/orders/spot-grid'
      },
      {
        type: MenuItemType.Link,
        label: 'futuresGrid',
        to: '/portfolio/orders/futures-grid'
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
        to: '/portfolio/history/swaps'
      },
      {
        type: MenuItemType.Link,
        label: 'wallet',
        to: '/portfolio/history/wallet'
      },
      {
        type: MenuItemType.Link,
        label: 'fundingPayments',
        to: '/portfolio/history/funding-payments'
      }
    ]
  },
  {
    type: MenuItemType.Link,
    label: 'subaccounts',
    icon: Grid,
    to: '/portfolio/subaccounts'
  },
  {
    type: MenuItemType.Link,
    label: 'settings',
    icon: Gear,
    to: '/portfolio/settings'
  }
]
