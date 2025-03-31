import { HttpClient } from '@injectivelabs/utils'
import { IS_TESTNET } from '@shared/utils/constant'

export const fundReferee = async (refereeAddress: string) => {
  // Maybe we can move to env if needed
  const lambdaApi = IS_TESTNET
    ? 'https://182lv47gxg.execute-api.us-east-1.amazonaws.com/v1'
    : 'https://6vomscnow9.execute-api.us-east-1.amazonaws.com/v1'

  const TOTAL_RETRIES = 5
  const DELAY_BETWEEN_CALLS = 1000

  const retryHttpCall = async (attempt = 1): Promise<any> => {
    try {
      return await new HttpClient(lambdaApi).post(`faucet-no-queue`, {
        address: refereeAddress
      })
    } catch (e: any) {
      if (attempt < TOTAL_RETRIES) {
        return new Promise((resolve) =>
          setTimeout(
            () => resolve(retryHttpCall(attempt + 1)),
            DELAY_BETWEEN_CALLS * attempt
          )
        )
      }

      // silent error for now
    }
  }

  return await retryHttpCall()
}
