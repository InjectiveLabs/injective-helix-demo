import { HttpClient } from '@injectivelabs/utils'
import { APP_GAS_REBATE_API } from '../utils/constants'
import { explorerConsumer } from '~/app/singletons/ExplorerConsumer'
import { apolloConsumer } from '~/app/singletons/ApolloConsumer'

export const fetchUserTransactionMessages = async (address: string) => {
  const transactions = await explorerConsumer.fetchAccountTransactions({
    account: address,
    limit: 10
  })

  if (!transactions) {
    return []
  }

  if (!transactions.data) {
    return []
  }

  return transactions.data
    .map((transaction) => {
      return transaction.messages
    })
    .reduce((allMessages, messages) => {
      return [...allMessages, ...messages]
    }, [])
}

export const fetchUserDeposits = async (address: string) => {
  try {
    return await apolloConsumer.fetchUserDeposits(address)
  } catch (e) {
    return []
  }
}

export const redeem = async ({
  address,
  injectiveAddress
}: {
  address: string
  injectiveAddress: string
}) => {
  const httpClient = new HttpClient(APP_GAS_REBATE_API)

  try {
    const { data } = await httpClient.get(
      `GasRebatesApi?ethAddress=${address}&address=${injectiveAddress}`
    )

    return data
  } catch (error: any) {
    throw new Error(error.response.data.message)
  }
}
