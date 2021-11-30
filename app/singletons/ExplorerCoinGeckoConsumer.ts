import { HttpClient } from '@injectivelabs/utils'
import { app } from '../singletons/App'

export class ExplorerCoinGeckoConsumer {
  private httpClient: HttpClient

  constructor({ baseUrl }: { baseUrl: string }) {
    this.httpClient = new HttpClient(`${baseUrl}/explorer/v1/`)
  }

  async fetchCoins(ids: string) {
    return (await this.httpClient.get('coin-price', {
      coinIds: ids
    })) as {
      data: {
        data: [
          {
            id: string
            symbol: string
            name: string
            // eslint-disable-next-line camelcase
            current_price: string
          }
        ]
      }
    }
  }
}

export const explorerCoinGeckoConsumer = new ExplorerCoinGeckoConsumer({
  baseUrl: app.appUrlEndpoint.baseUrl
})
