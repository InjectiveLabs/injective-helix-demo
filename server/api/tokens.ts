import { bankApi } from '@/app/Services'

export default defineCachedEventHandler(
  async () => {
    const totalSupply = await bankApi.fetchTotalSupply({ limit: 1000 })

    return totalSupply
  },
  { maxAge: 60 * 60 }
)
