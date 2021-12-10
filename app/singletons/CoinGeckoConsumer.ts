import CoinGeckoClient from 'coingecko-api'

export class CoinGeckoConsumer {
  private httpClient: CoinGeckoClient

  constructor() {
    this.httpClient = new CoinGeckoClient()
  }

  async fetchCoins() {
    // @ts-ignore
    return (await this.httpClient.coins.list({ include_platform: false })) as {
      data: {
        id: string
        symbol: string
        name: string
      }[]
    }
  }

  async fetchCoin(id: string) {
    // @ts-ignore
    return (await this.httpClient.coins.fetch(id, {
      localization: false,
      community_data: false,
      tickers: false,
      sparkline: false,
      developer_data: false
    })) as {
      data: {
        id: string
        symbol: string
        name: string
        // eslint-disable-next-line camelcase
        market_data: { current_price: { usd: string } }
      }
    }
  }

  async fetchHistory(id: string, date: string) {
    // @ts-ignore
    return (await this.httpClient.coins.fetchHistory(id, { date })) as {
      data: {
        id: string
        symbol: string
        name: string
        // eslint-disable-next-line camelcase
        market_data: { current_price: { usd: string } }
      }
    }
  }
}

export const coinGeckoConsumer = new CoinGeckoConsumer()
