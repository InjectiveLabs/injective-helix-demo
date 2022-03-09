import { HttpClient } from '@injectivelabs/utils'
import { APP_GAS_REBATE_API } from '../utils/constants'

export const redeem = async ({
  address,
  injectiveAddress
}: {
  address: string
  injectiveAddress: string
}) => {
  const httpClient = new HttpClient(APP_GAS_REBATE_API)

  try {
    const { data } = await httpClient.get(
      `GasRebatesApi?ethAddress=${address}&address=${injectiveAddress}`
    )

    return data
  } catch (error: any) {
    throw new Error(error.response.data.message)
  }
}
