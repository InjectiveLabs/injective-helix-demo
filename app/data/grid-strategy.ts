import { IS_DEVNET, IS_TESTNET } from '@/app/utils/constants/setup'
import { SpotGridMarket, SpotGridMessages } from '@/types'

export const gridStrategyAuthorizationMessageTypes = [
  SpotGridMessages.MsgWithdraw,
  SpotGridMessages.MsgBatchUpdateOrders,
  SpotGridMessages.MsgCreateSpotMarketOrder
]

const mainnetSpotGridMarkets: SpotGridMarket[] = [
  {
    slug: 'inj-usdt',
    contractAddress: 'inj1x4kr29dlf9u4r7ya6mr2jvs0pc9sfhnlhlr9np'
  },
  {
    slug: 'atom-usdt',
    contractAddress: 'inj1c5jsz3dk2g6wywygchwrlwxl5gyz2yu7rnxxdr'
  }
]

const testnetSpotGridMarkets: SpotGridMarket[] = [
  {
    slug: 'inj-usdt',
    contractAddress: 'inj1djlhetddzrztjn4v0s4vt0dca3y8hwshkh37zg'
  },
  {
    slug: 'atom-usdt',
    contractAddress: 'inj14yr8nj6tndmr4xyw9c66feqepv59revxsm7450'
  },
  {
    slug: 'tia-usdt',
    contractAddress: 'inj18sl3ysva0czdgc2eqmqlrhfeu2v4l8vx4245ql'
  }

  // Add This Market Later
  // {
  //   slug: 'weth-usdt',
  //   contractAddress: 'inj1aehu642q3td95jlpprgcypmstmn3pknaq4rsjn'
  // }
]

export const spotGridMarkets: SpotGridMarket[] =
  IS_TESTNET || IS_DEVNET ? testnetSpotGridMarkets : mainnetSpotGridMarkets
