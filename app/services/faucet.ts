import { HttpClient } from '@injectivelabs/utils'
import { IS_DEVNET } from '@shared/utils/constant'
import { FAUCET_ENDPOINT } from '@/app/utils/constants'

export const fundInjectiveAddress = async (injectiveAddress: string) => {
  const TOTAL_RETRIES = 5
  const DELAY_BETWEEN_CALLS = 1000

  if (IS_DEVNET) {
    return
  }

  const retryHttpCall = async (attempt = 1): Promise<any> => {
    try {
      return await new HttpClient(FAUCET_ENDPOINT).post(`faucet-no-queue`, {
        address: injectiveAddress
      })
    } catch {
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
