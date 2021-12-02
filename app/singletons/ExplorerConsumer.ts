import { HttpException } from '@injectivelabs/exceptions'
import { HttpClient } from '@injectivelabs/utils'
import { app } from '~/app/singletons/App'
import {
  ExplorerApiResponse,
  TransactionFromExplorerApiResponse
} from '~/types/explorer'

class ExplorerConsumer {
  private client: HttpClient

  constructor(baseUrl: string) {
    this.client = new HttpClient(baseUrl)
  }

  async fetchAccountTransactions({
    account,
    before,
    limit,
    skip
  }: {
    account: string
    before?: number | undefined
    skip?: number | undefined
    limit: number
  }) {
    try {
      const response = (await this.client.get(`accountTxs/${account}`, {
        before,
        limit,
        skip
      })) as ExplorerApiResponse<TransactionFromExplorerApiResponse[]>

      return response.data
    } catch (error: any) {
      throw new HttpException(error.message)
    }
  }

  async fetchTransaction({
    hash
  }: {
    hash: string
  }): Promise<TransactionFromExplorerApiResponse> {
    try {
      const response = (await this.client.get(
        `txs/${hash}`
      )) as ExplorerApiResponse<TransactionFromExplorerApiResponse>

      return response.data.data
    } catch (error: any) {
      if (error.response.status === 400) {
        throw new Error(error.message)
      } else {
        throw new HttpException(error.message)
      }
    }
  }
}

export const explorerConsumer = new ExplorerConsumer(
  app.appUrlEndpoint.explorerUrl
)
