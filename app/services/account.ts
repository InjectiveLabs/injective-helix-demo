import {
  SubaccountTransformer,
  SubaccountComposer
} from '@injectivelabs/spot-consumer'
import { AccountAddress } from '@injectivelabs/ts-types'
import { BigNumberInWei } from '@injectivelabs/utils'
import { Web3Exception } from '@injectivelabs/exceptions'
import { subaccountConsumer } from '~/app/singletons/SubaccountConsumer'
import { peggyDenomToTokenFromContractAddress } from '~/app/transformers/peggy'
import { transactionConsumer } from '~/app/singletons/TransactionConsumer'
import { TESTNET_CHAIN_ID } from '~/app/utils/constants'
import { getWeb3Strategy } from '~/app/web3'
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
  ).map((balance) => {
    return {
      denom: balance.denom,
      token: peggyDenomToTokenFromContractAddress(balance.denom),
      totalBalance: balance.deposit ? balance.deposit.availableBalance : '0',
      availableBalance: balance.deposit ? balance.deposit.totalBalance : '0'
    }
  })

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
  const web3Strategy = getWeb3Strategy()
  const message = SubaccountComposer.deposit({
    subaccountId,
    denom,
    injectiveAddress,
    amount: amount.toString()
  })

  const txResponse = await transactionConsumer.prepareTxRequest({
    address,
    message,
    chainId: TESTNET_CHAIN_ID
  })

  try {
    const signature = await web3Strategy.signTypedDataV4(
      txResponse.getData(),
      address
    )

    return await transactionConsumer.broadcastTxRequest({
      signature,
      message,
      pubKeyType: txResponse.getPubKeyType(),
      typedData: txResponse.getData(),
      chainId: TESTNET_CHAIN_ID
    })
  } catch (error) {
    throw new Web3Exception(error.message)
  }
}
