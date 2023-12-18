import { indexerDerivativesApi } from '@/app/Services'

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery<{ marketStatus?: string }>(event)

    const markets = await indexerDerivativesApi.fetchMarkets({
      marketStatus: query.marketStatus
    })

    return markets
  },
  { maxAge: 60 * 60 }
)
