import { GrpcCoin } from '@injectivelabs/chain-consumer'
import { BigNumberInWei } from '@injectivelabs/utils'
import { metricsProvider } from '../providers/MetricsProvider'
import { bankConsumer } from '~/app/singletons/BankConsumer'
import { BankBalances } from '~/types'
import { ChainMetrics } from '~/types/metrics'

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
