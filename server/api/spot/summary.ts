import { indexerRestSpotChronosApi } from '@/app/Services'

export default defineCachedEventHandler(
  async () => {
    const marketSummaries =
      await indexerRestSpotChronosApi.fetchMarketsSummary()

    return marketSummaries
  },
  { maxAge: 2 }
)
