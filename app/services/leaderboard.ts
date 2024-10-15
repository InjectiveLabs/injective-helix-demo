import { HttpClient } from '@injectivelabs/utils'
import { CompetitionResult } from '@/types'

const httpClient = new HttpClient('https://api.express.injective.dev/')

export const submitClaim = async ({
  name,
  email,
  message,
  signature,
  cosmosPubKey,
  competitionName,
  injectiveAddress
}: {
  name: string
  email: string
  message: string
  signature: string
  cosmosPubKey?: string
  competitionName: string
  injectiveAddress: string
}) => {
  return await httpClient.post(`competition/claim`, {
    name,
    email,
    message,
    signature,
    cosmosPubKey,
    competitionName,
    injectiveAddress
  })
}

export const fetchLeaderboardCompetitionResults = async (
  competitionName: string,
  injectiveAddress: string
) => {
  const { data } = (await httpClient.get(`competition/is-winner`, {
    competitionName,
    injectiveAddress
  })) as {
    data: {
      result?: CompetitionResult
    }
  }

  return data.result
}
