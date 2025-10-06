import { NETWORK } from '../../utils/constant'
import { Network } from '@injectivelabs/networks'
import { HttpRestClient } from '@injectivelabs/utils'

export class Web3GatewayService {
  private restClient: HttpRestClient

  constructor() {
    this.restClient = new HttpRestClient(
      'https://products.web3-gateway.injective.network'
    )
  }

  async healthCheck(): Promise<boolean> {
    if (NETWORK !== Network.Internal) {
      return true
    }

    const response = (await this.restClient.get('api/health/v1/status')) as {
      status: number
    }

    return response.status === 200
  }
}
