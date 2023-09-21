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
  }
]

const testnetSpotGridMarkets: SpotGridMarket[] = [
  {
    slug: 'inj-usdt',
    contractAddress: 'inj1djlhetddzrztjn4v0s4vt0dca3y8hwshkh37zg'
  },
  {
    slug: 'weth-usdt',
    contractAddress: 'inj1lktt38e7w03lm548qgs543ggjnuaf4hwqdnc7d'
  }
]

export const spotGridMarkets: SpotGridMarket[] =
  IS_TESTNET || IS_DEVNET ? testnetSpotGridMarkets : mainnetSpotGridMarkets
