import { ServiceOptions } from '@injectivelabs/ui-common'
import { BaseService } from '@injectivelabs/ui-common/dist/services/BaseService'
import { ExplorerConsumer } from './consumer'
import { app } from '~/app/singletons/App'

export enum ExplorerMetrics {
  FetchAccountTxs = 'FetchAccountTxs'
}

export class ExplorerService extends BaseService {
  protected consumer: ExplorerConsumer

  constructor(options: ServiceOptions) {
    super(options)
    this.consumer = new ExplorerConsumer(
      `${app.endpoints.exchangeApi}/api/explorer/v1`
    )
  }

  async fetchAccountTransactions({
    address,
    limit,
    type
  }: {
    address: string
    limit: number
    type?: string
  }) {
    const promise = this.consumer.fetchAccountTransactions({
      address,
      limit,
      type
    })

    try {
      const response = await this.fetchOrFetchAndMeasure(
        promise,
        ExplorerMetrics.FetchAccountTxs
      )

      return response.data
    } catch (e: any) {
      throw new Error(e.message)
    }
  }
}
