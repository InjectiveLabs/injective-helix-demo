import { BaseAccount, ChainRestAuthApi } from '@injectivelabs/sdk-ts'
import { ENDPOINTS } from '@shared/utils/constant'

export const getAccountDetails = async (address: string) => {
  const chainRestAuthApi = new ChainRestAuthApi(ENDPOINTS.rest)
  const accountDetailsResponse = await chainRestAuthApi.fetchAccount(address)

  return BaseAccount.fromRestApi(accountDetailsResponse).toAccountDetails()
}
