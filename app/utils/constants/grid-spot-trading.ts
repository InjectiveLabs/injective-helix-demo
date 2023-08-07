import { IS_DEVNET, IS_TESTNET } from './setup'
import { stringToHex } from '@/app/utils/converters'
import { SpotGridMarket, SpotGridMarketWithSubaccount } from '@/types'

const mainnetSpotGridMarkets: SpotGridMarket[] = [
  {
    slug: 'inj-usdt',
    contractAddress: 'inj18hsyd0xgv3cqadpzpa35a66l5346j386an3sju'
  }
]

const testnetSpotGridMarkets: SpotGridMarket[] = [
  {
    slug: 'inj-usdt',
    contractAddress: 'inj18hsyd0xgv3cqadpzpa35a66l5346j386an3sju'
  },
  {
    slug: 'weth-usdt',
    contractAddress: 'inj1lktt38e7w03lm548qgs543ggjnuaf4hwqdnc7d'
  }
]

export const spotGridMarkets: SpotGridMarket[] =
  IS_TESTNET || IS_DEVNET ? testnetSpotGridMarkets : mainnetSpotGridMarkets

export const spotGridMarketsWithSubaccount: SpotGridMarketWithSubaccount[] =
  spotGridMarkets.map((market) => ({
    ...market,
    subaccountId: stringToHex(market.slug)
  }))
