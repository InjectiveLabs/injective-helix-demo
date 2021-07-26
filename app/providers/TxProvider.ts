import { AccountAddress, ChainId } from '@injectivelabs/ts-types'
import { Web3Exception, ExchangeException } from '@injectivelabs/exceptions'
import { Web3Strategy } from '@injectivelabs/web3-strategy'
import { metricsProvider } from './MetricsProvider'
import { transactionConsumer } from '~/app/singletons/TransactionConsumer'
import { getWeb3Strategy } from '~/app/web3'

export class TxProvider {
  private message: any

  private address: string

  private bucket: string

  private feePrice?: string

  private feeDenom?: string

  private web3Strategy: Web3Strategy

  private chainId: ChainId

  constructor({
    message,
    address,
    chainId,
    bucket,
    feePrice,
    feeDenom
  }: {
    message: any
    address: AccountAddress
    chainId: ChainId
    bucket: string
    feePrice?: string
    feeDenom?: string
    gasLimit?: number
  }) {
    this.message = message
    this.address = address
    this.chainId = chainId
    this.bucket = bucket
    this.feePrice = feePrice
    this.feeDenom = feeDenom
    this.web3Strategy = getWeb3Strategy()
  }

  async prepare() {
    const { chainId, feeDenom, feePrice, address, message, bucket } = this

    try {
      const promise = transactionConsumer.prepareExchangeTxRequest({
        address,
        message,
        chainId,
        feePrice,
        feeDenom
      })

      return await metricsProvider.sendAndRecord(promise, `${bucket}PrepareTx`)
    } catch (e) {
      throw new ExchangeException(e.message)
    }
  }

  async sign(txData: any) {
    const { address, web3Strategy, bucket } = this

    try {
      const promise = web3Strategy.signTypedDataV4(txData, address)

      return await metricsProvider.sendAndRecord(promise, `${bucket}SignTx`)
    } catch (e) {
      throw new Web3Exception(e.message)
    }
  }

  async broadcast() {
    const { message, chainId, bucket } = this
    const txResponse = await this.prepare()
    const signature = await this.sign(txResponse.getData())

    try {
      const promise = transactionConsumer.broadcastTxRequest({
        signature,
        message,
        chainId,
        txResponse
      })

      return await metricsProvider.sendAndRecord(
        promise,
        `${bucket}BroadcastTx`
      )
    } catch (e) {
      throw new ExchangeException(e.message)
    }
  }
}
