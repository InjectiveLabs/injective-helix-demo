import { stringToHex } from '@/app/utils/converters'

type SpotGridMarket = {
  slug: string
  contractAddress: string
}

type SpotGridMarketWithSubaccount = SpotGridMarket & { subaccountId: string }

export const spotGridMarkets: SpotGridMarket[] = [
  {
    slug: 'inj-usdt',
    contractAddress: 'inj18hsyd0xgv3cqadpzpa35a66l5346j386an3sju'
  }
]

export const spotGridMarketsWithSubaccount: SpotGridMarketWithSubaccount[] =
  spotGridMarkets.map((market) => ({
    ...market,
    subaccountId: stringToHex(market.slug)
  }))
