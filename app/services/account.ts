import {
  SubaccountTransformer,
  SubaccountComposer,
  SubaccountStreamType,
  BalanceStreamCallback as SubaccountBalanceStreamCallback
} from '@injectivelabs/subaccount-consumer'
import { AccountAddress } from '@injectivelabs/ts-types'
import { BigNumberInWei } from '@injectivelabs/utils'
import { Web3Exception } from '@injectivelabs/exceptions'
import { TxProvider } from '../providers/TxProvider'
import { subaccountStream } from '../singletons/SubaccountStream'
import { grpcSubaccountBalanceToUiSubaccountBalance } from '../transformers/account'
import { metricsProvider } from '../providers/MetricsProvider'
import { streamProvider } from '../providers/StreamProvider'
import { subaccountConsumer } from '~/app/singletons/SubaccountConsumer'
import { CHAIN_ID } from '~/app/utils/constants'
import { authConsumer } from '~/app/singletons/AuthConsumer'
import { UiSubaccount } from '~/types/subaccount'
import { AccountMetrics } from '~/types/metrics'

export const getInjectiveAddress = (address: AccountAddress): string => {
  return authConsumer.getInjectiveAddress(address)
}

export const fetchSubaccounts = async (
  address: AccountAddress
): Promise<string[]> => {
  const promise = subaccountConsumer.fetchSubaccounts(address)

  return await metricsProvider.sendAndRecord(
    promise,
    AccountMetrics.FetchSubaccount
  )
}

export const fetchSubaccount = async (
  subaccountId: string
): Promise<UiSubaccount> => {
  const promise = subaccountConsumer.fetchSubaccountBalances(subaccountId)
  const balances = await metricsProvider.sendAndRecord(
    promise,
    AccountMetrics.FetchSubaccountBalances
  )

  const uiBalances = SubaccountTransformer.grpcBalancesToBalances(
    balances
  ).map((balance) => grpcSubaccountBalanceToUiSubaccountBalance(balance))

  return {
    subaccountId,
    balances: uiBalances
  }
}

export const fetchSubaccountHistory = async (subaccountId: string) => {
  const promise = subaccountConsumer.fetchSubaccountHistory(subaccountId)
  const history = await metricsProvider.sendAndRecord(
    promise,
    AccountMetrics.FetchSubaccountBalances
  )

  return SubaccountTransformer.grpcTransferHistoryToTransferHistory(history)
}

export const streamSubaccountBalances = ({
  subaccountId,
  callback
}: {
  subaccountId: string
  callback: SubaccountBalanceStreamCallback
}) => {
  const streamFn = subaccountStream.balances.start.bind(
    subaccountStream.balances
  )
  const streamFnArgs = {
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: SubaccountStreamType.Balances
  })
}

export const cancelSubaccountStreams = () => {
  streamProvider.cancel(SubaccountStreamType.Balances)
}

export const deposit = async ({
  amount,
  address,
  injectiveAddress,
  denom,
  subaccountId
}: {
  amount: BigNumberInWei
  denom: string
  subaccountId: string
  address: AccountAddress
  injectiveAddress: AccountAddress
}) => {
  const message = SubaccountComposer.deposit({
    subaccountId,
    denom,
    injectiveAddress,
    amount: amount.toFixed(0)
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      bucket: AccountMetrics.Deposit,
      chainId: CHAIN_ID
    })

    await txProvider.broadcast()
  } catch (error) {
    throw new Web3Exception(error.message)
  }
}

export const withdraw = async ({
  amount,
  address,
  injectiveAddress,
  denom,
  subaccountId
}: {
  amount: BigNumberInWei
  denom: string
  subaccountId: string
  address: AccountAddress
  injectiveAddress: AccountAddress
}) => {
  const message = SubaccountComposer.withdraw({
    subaccountId,
    denom,
    injectiveAddress,
    amount: amount.toFixed(0)
  })

  try {
    const txProvider = new TxProvider({
      address,
      bucket: AccountMetrics.Withdraw,
      message,
      chainId: CHAIN_ID
    })

    await txProvider.broadcast()
  } catch (error) {
    throw new Web3Exception(error.message)
  }
}
