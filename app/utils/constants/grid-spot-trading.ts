import { IS_DEVNET, IS_TESTNET } from './setup'
import { stringToHex } from '@/app/utils/converters'

type SpotGridMarket = {
  slug: string
  contractAddress: string
}

type SpotGridMarketWithSubaccount = SpotGridMarket & { subaccountId: string }

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
  }
]

export const spotGridMarkets: SpotGridMarket[] =
  IS_TESTNET || IS_DEVNET ? testnetSpotGridMarkets : mainnetSpotGridMarkets

export const spotGridMarketsWithSubaccount: SpotGridMarketWithSubaccount[] =
  spotGridMarkets.map((market) => ({
    ...market,
    subaccountId: stringToHex(market.slug)
  }))
