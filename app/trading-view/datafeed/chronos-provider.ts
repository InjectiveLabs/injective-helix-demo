import { getTimezone } from './helpers'
import { HttpClient } from '@injectivelabs/utils'

export class ChronosApiProvider {
  private client: HttpClient

  private isSpot: boolean

  constructor(endpoint: string) {
    this.client = new HttpClient(endpoint)
    this.isSpot = endpoint.includes('spot')
  }

  getDerivativeBars = async ({
    symbol,
    from,
    to,
    firstDataRequest,
    countBack,
    resolution
  }: {
    to: string
    from: string
    symbol: string
    countBack?: number
    resolution: string
    firstDataRequest?: boolean
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
      endpoint += `&countback=${countBack}`
    }

    if (firstDataRequest) {
      endpoint += `&firstDataRequest=${firstDataRequest}`
    }

    endpoint += `&cache=true`

    return await this.client.get(endpoint)
  }

  getSpotBars = async ({
    symbol,
    from,
    to,
    firstDataRequest,
    countBack,
    resolution
  }: {
    to: string
    from: string
    symbol: string
    countBack?: number
    resolution: string
    firstDataRequest?: boolean
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
      endpoint += `&countback=${countBack}`
    }

    if (firstDataRequest) {
      endpoint += `&firstDataRequest=${firstDataRequest}`
    }

    endpoint += `&cache=true`

    return await this.client.get(endpoint)
  }

  async getBars({
    symbol,
    from,
    to,
    firstDataRequest,
    countBack,
    resolution
  }: {
    to: string
    from: string
    symbol: string
    countBack?: number
    resolution: string
    firstDataRequest?: boolean
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

  async getSymbol(symbol: string) {
    const { data } = await (this.isSpot
      ? this.getSpotSymbol(symbol)
      : this.getDerivativesSymbol(symbol))

    delete data.has_no_volume
    data.visible_plots_set = 'ohlcv'
    data.timezone = getTimezone()

    return data
  }

  async getConfig() {
    const { data } = await (this.isSpot
      ? this.getSpotConfig()
      : this.getDerivativesConfig())

    return data
  }

  getDerivativesSymbol = async (symbol: string): Promise<any> => {
    return await this.client.get(`symbols?symbol=${encodeURI(symbol)}`)
  }

  getSpotSymbol = async (symbol: string): Promise<any> => {
    return await this.client.get(`symbols?symbol=${encodeURI(symbol)}`)
  }

  getDerivativesConfig = async (): Promise<any> => {
    return await this.client.get('config')
  }

  getSpotConfig = async (): Promise<any> => {
    return await this.client.get('config')
  }
}
