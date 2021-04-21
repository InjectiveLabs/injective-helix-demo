import { GrpcCoin } from '@injectivelabs/chain-consumer'
import { BigNumberInWei } from '@injectivelabs/utils'
import { bankConsumer } from '~/app/singletons/BankConsumer'
import { BankBalances } from '~/types'

export const fetchBalances = async (injectiveAddress: string) => {
  const balances = await bankConsumer.fetchBalances({
    accountAddress: injectiveAddress
  })

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
  const balance = await bankConsumer.fetchBalance({
    accountAddress: injectiveAddress,
    denom
  })

  return new BigNumberInWei(balance ? balance.getAmount() : 0)
}
