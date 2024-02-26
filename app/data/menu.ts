import { MainPage, MenuItem, MenuItemType } from '@/types'

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

export const USER_MENU_ITEMS: MenuItem[] = []
