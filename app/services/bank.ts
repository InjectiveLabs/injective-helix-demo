import { BankComposer, GrpcCoin } from '@injectivelabs/chain-consumer'
import { BigNumberInWei } from '@injectivelabs/utils'
import { AccountAddress } from '@injectivelabs/ts-types'
import { Web3Exception } from '@injectivelabs/exceptions'
import { getTokenMetaData } from './tokens'
import { metricsProvider } from '~/app/providers/MetricsProvider'
import { tokenMetaToToken } from '~/app/transformers/token'
import { TxProvider } from '~/app/providers/TxProvider'
import { CHAIN_ID } from '~/app/utils/constants'
import { bankConsumer } from '~/app/singletons/BankConsumer'
import { BankBalances, BankBalanceWithTokenMetaData } from '~/types'
import { AccountMetrics, ChainMetrics } from '~/types/metrics'

export const fetchBalances = async (injectiveAddress: string) => {
  const promise = bankConsumer.fetchBalances({
    accountAddress: injectiveAddress
  })

  const balances = await metricsProvider.sendAndRecord(
    promise,
    ChainMetrics.FetchBalances
  )

  return balances.reduce((balances: BankBalances, balance: GrpcCoin) => {
    return { ...balances, [balance.getDenom()]: balance.getAmount() }
  }, {})
}

export const fetchBalance = async ({
  injectiveAddress,
  denom
}: {
  injectiveAddress: string
  denom: string
}) => {
  const promise = bankConsumer.fetchBalance({
    accountAddress: injectiveAddress,
    denom
  })

  const balance = await metricsProvider.sendAndRecord(
    promise,
    ChainMetrics.FetchBalances
  )

  return new BigNumberInWei(balance ? balance.getAmount() : 0)
}

export const transfer = async ({
  address,
  denom,
  amount,
  injectiveAddress,
  destination
}: {
  amount: BigNumberInWei
  address: AccountAddress
  denom: string
  destination: string
  injectiveAddress: AccountAddress
}) => {
  const message = BankComposer.send({
    denom,
    amount: amount.toFixed(),
    srcInjectiveAddress: injectiveAddress,
    dstInjectiveAddress: destination
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      bucket: AccountMetrics.Send,
      chainId: CHAIN_ID
    })

    await txProvider.broadcast()
  } catch (error) {
    throw new Web3Exception(error.message)
  }
}

export const fetchBalancesWithTokenMetaData = (
  balances: BankBalances
): BankBalanceWithTokenMetaData[] => {
  return Object.keys(balances)
    .map((denom) => {
      return {
        denom,
        balance: balances[denom],
        token: tokenMetaToToken(getTokenMetaData(denom))
      }
    })
    .filter(
      (balance) => balance.token !== undefined
    ) as BankBalanceWithTokenMetaData[]
}
