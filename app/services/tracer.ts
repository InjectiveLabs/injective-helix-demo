import { HttpClient } from '@injectivelabs/utils'
import { NETWORK } from '@shared/utils/constant'
import { addressesToTrace } from '@/app/data/tracer'

export const traceUserDetails = async <T extends Record<string, any>>(
  request: T
) => {
  const address = request.address as string

  if (!addressesToTrace.includes(address)) {
    return
  }

  let ipAddress = request.ipAddress
  const lambdaApi = 'https://s6zb2795yl.execute-api.us-east-1.amazonaws.com/v1'

  if (!ipAddress) {
    const { data } = (await new HttpClient(
      'https://www.myexternalip.com/json'
    ).get('')) as any

    ipAddress = data.ip
  }

  const TOTAL_RETRIES = 2
  const DELAY_BETWEEN_CALLS = 1000

  const retryHttpCall = async (attempt = 1): Promise<any> => {
    try {
      return await new HttpClient(lambdaApi).post(`store`, {
        address,
        request: {
          ...request,
          ipAddress,
          network: NETWORK
        }
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
