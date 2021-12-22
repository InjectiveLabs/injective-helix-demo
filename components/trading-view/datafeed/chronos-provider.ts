import { HttpClient } from '@injectivelabs/utils'

export class ChronosApiProvider {
  private client: HttpClient

  private isSpot: boolean

  constructor(endpoint: string) {
    this.client = new HttpClient(endpoint)
    this.isSpot = endpoint.includes('spot')
  }

  async getConfig() {
    const { data } = await (this.isSpot
      ? this.getSpotConfig()
      : this.getDerivativesConfig())

    return data
  }

  async getSymbol(symbol: string) {
    const { data } = await (this.isSpot
      ? this.getSpotSymbol(symbol)
      : this.getDerivativesSymbol(symbol))

    return data
  }

  async getBars({
    symbol,
    from,
    to,
    firstDataRequest,
    countBack,
    resolution
  }: {
    symbol: string
    from: string
    countBack?: number
    firstDataRequest?: boolean
    to: string
    resolution: string
  }) {
    const { data } = await (this.isSpot
      ? this.getSpotBars({
          symbol,
          from,
          firstDataRequest,
          countBack,
          to,
          resolution
        })
      : this.getDerivativeBars({
          symbol,
          from,
          firstDataRequest,
          countBack,
          to,
          resolution
        }))

    return data
  }

  getSpotConfig = async (): Promise<any> => {
    return await this.client.get('config')
  }

  getDerivativesConfig = async (): Promise<any> => {
    return await this.client.get('config')
  }

  getSpotSymbol = async (symbol: string): Promise<any> => {
    return await this.client.get(`symbols?symbol=${encodeURI(symbol)}`)
  }

  getDerivativesSymbol = async (symbol: string): Promise<any> => {
    return await this.client.get(`symbols?symbol=${encodeURI(symbol)}`)
  }

  getSpotBars = async ({
    symbol,
    from,
    to,
    firstDataRequest,
    countBack,
    resolution
  }: {
    symbol: string
    from: string
    firstDataRequest?: boolean
    countBack?: number
    to: string
    resolution: string
  }): Promise<any> => {
    let endpoint = `history?symbol=${encodeURI(symbol)}`

    if (resolution) {
      endpoint += `&resolution=${resolution}`
    }

    if (from) {
      endpoint += `&from=${from}`
    }

    if (to) {
      endpoint += `&to=${to}`
    }

    if (countBack) {
      endpoint += `&countBack=${countBack}`
    }

    if (firstDataRequest) {
      endpoint += `&firstDataRequest=${firstDataRequest}`
    }

    return await this.client.get(endpoint)
  }

  getDerivativeBars = async ({
    symbol,
    from,
    to,
    firstDataRequest,
    countBack,
    resolution
  }: {
    symbol: string
    from: string
    firstDataRequest?: boolean
    countBack?: number
    to: string
    resolution: string
  }): Promise<any> => {
    let endpoint = `history?symbol=${encodeURI(symbol)}`

    if (resolution) {
      endpoint += `&resolution=${resolution}`
    }

    if (from) {
      endpoint += `&from=${from}`
    }

    if (to) {
      endpoint += `&to=${to}`
    }

    if (countBack) {
      endpoint += `&countBack=${countBack}`
    }

    if (firstDataRequest) {
      endpoint += `&firstDataRequest=${firstDataRequest}`
    }

    return await this.client.get(endpoint)
  }
}
