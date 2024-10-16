import { HttpClient } from '@injectivelabs/utils'
import { CompetitionResult } from '@/types'

const httpClient = new HttpClient('https://api.express.injective.dev/')

export const submitClaim = async ({
  name,
  email,
  pubKey,
  message,
  signature,
  competitionName,
  injectiveAddress
}: {
  name: string
  email: string
  message: string
  pubKey?: string
  signature: string
  competitionName: string
  injectiveAddress: string
}) => {
  return await httpClient.post(`competition/claim`, {
    name,
    email,
    pubKey,
    message,
    signature,
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
