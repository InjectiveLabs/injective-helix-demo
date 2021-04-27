import {
  SubaccountTransformer,
  SubaccountComposer,
  SubaccountStreamType,
  SubaccountBalanceStreamCallback
} from '@injectivelabs/subaccount-consumer'
import { AccountAddress } from '@injectivelabs/ts-types'
import { BigNumberInWei } from '@injectivelabs/utils'
import { Web3Exception } from '@injectivelabs/exceptions'
import { TxProvider } from '../providers/TxProvider'
import { subaccountStream } from '../singletons/SubaccountStream'
import { streamManager } from '../singletons/StreamManager'
import { grpcSubaccountBalanceToUiSubaccountBalance } from '../transformers/account'
import { subaccountConsumer } from '~/app/singletons/SubaccountConsumer'
import { TESTNET_CHAIN_ID } from '~/app/utils/constants'
import { authConsumer } from '~/app/singletons/AuthConsumer'
import { UiSubaccount } from '~/types/subaccount'

export const getInjectiveAddress = (address: AccountAddress): string => {
  return authConsumer.getInjectiveAddress(address)
}

export const fetchSubaccounts = async (
  address: AccountAddress
): Promise<string[]> => {
  return await subaccountConsumer.fetchSubaccounts(address)
}

export const fetchSubaccount = async (
  subaccountId: string
): Promise<UiSubaccount> => {
  const balances = SubaccountTransformer.grpcBalancesToBalances(
    await subaccountConsumer.fetchSubaccountBalances(subaccountId)
  ).map((balance) => grpcSubaccountBalanceToUiSubaccountBalance(balance))

  return {
    subaccountId,
    balances
  }
}

export const fetchSubaccountHistory = async (subaccountId: string) => {
  return SubaccountTransformer.grpcTransferHistoryToTransferHistory(
    await subaccountConsumer.fetchSubaccountHistory(subaccountId)
  )
}

export const streamSubaccountBalances = (
  subaccountId: string,
  callback: SubaccountBalanceStreamCallback
) => {
  const stream = subaccountStream.balances.start({
    subaccountId,
    callback
  })

  streamManager.set(stream, SubaccountStreamType.Balances)
}

export const cancelMarketStreams = () => {
  streamManager.cancel(SubaccountStreamType.Balances)
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
    amount: amount.toString()
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      chainId: TESTNET_CHAIN_ID
    })

    await txProvider.broadcast()
  } catch (error) {
    throw new Web3Exception(error.message)
  }
}
