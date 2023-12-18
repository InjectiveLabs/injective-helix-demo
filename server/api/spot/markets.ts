import { indexerSpotApi } from '@/app/Services'

export default defineCachedEventHandler(
  async () => {
    const markets = await indexerSpotApi.fetchMarkets()

    return markets
  },
  { maxAge: 60 * 60 }
)
