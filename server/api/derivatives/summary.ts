import { indexerRestDerivativesChronosApi } from '@/app/Services'

export default defineCachedEventHandler(
  async () => {
    const marketSummaries =
      await indexerRestDerivativesChronosApi.fetchMarketsSummary()

    return marketSummaries
  },
  { maxAge: 2 }
)
