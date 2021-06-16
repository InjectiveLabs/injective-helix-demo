import { AccountAddress, ChainId } from '@injectivelabs/ts-types'
import { Web3Exception, ExchangeException } from '@injectivelabs/exceptions'
import { Web3Strategy } from '@injectivelabs/web3-strategy'
import { transactionConsumer } from '~/app/singletons/TransactionConsumer'
import { getWeb3Strategy } from '~/app/web3'

export class TxProvider {
  private message: any

  private address: string

  private web3Strategy: Web3Strategy

  private chainId: ChainId

  constructor({
    message,
    address,
    chainId
  }: {
    message: any
    address: AccountAddress
    chainId: ChainId
  }) {
    this.message = message
    this.address = address
    this.chainId = chainId
    this.web3Strategy = getWeb3Strategy()
  }

  async prepare() {
    const { chainId, address, message } = this

    try {
      return await transactionConsumer.prepareExchangeTxRequest({
        address,
        message,
        chainId
      })
    } catch (e) {
      throw new ExchangeException(e.message)
    }
  }

  async sign(txData: any) {
    const { address, web3Strategy } = this

    try {
      return await web3Strategy.signTypedDataV4(txData, address)
    } catch (e) {
      throw new Web3Exception(e.message)
    }
  }

  async broadcast() {
    const { message, chainId } = this
    const txResponse = await this.prepare()
    const signature = await this.sign(txResponse.getData())

    try {
      return await transactionConsumer.broadcastTxRequest({
        signature,
        message,
        chainId,
        txResponse
      })
    } catch (e) {
      throw new ExchangeException(e.message)
    }
  }
}
