import { HttpRestClient } from '@injectivelabs/utils'
import { CHAIN_ID, ENDPOINTS } from '../../utils/constant'

export class FaucetService {
  private restClient: HttpRestClient

  constructor() {
    this.restClient = new HttpRestClient(ENDPOINTS.uiApi)
  }

  async fundInjectiveAddress(injectiveAddress: string) {
    try {
      const response = await this.restClient.get(
        `faucet?address=${injectiveAddress}&chainId=${CHAIN_ID}`
      )

      return response
    } catch (e) {
      console.log(e)
      throw e
    }
  }
}
