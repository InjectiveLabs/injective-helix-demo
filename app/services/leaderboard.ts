import { HttpClient } from '@injectivelabs/utils'
import { CompetitionResult } from '@/types'

const httpClient = new HttpClient('https://api.express.injective.dev/')

export const submitClaim = async ({
  name,
  email,
  wallet,
  pubKey,
  message,
  signature,
  competitionName,
  injectiveAddress
}: {
  name: string
  email: string
  wallet: string
  message: string
  pubKey?: string
  signature: string
  competitionName: string
  injectiveAddress: string
}) => {
  return await httpClient.post(`competition/claim`, {
    name,
    email,
    wallet,
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
  try {
    const { data } = (await httpClient.get(`competition/is-winner`, {
      competitionName,
      injectiveAddress
    })) as {
      data: {
        result?: CompetitionResult
      }
    }

    return data.result
  } catch (e) {
    //
  }
}
