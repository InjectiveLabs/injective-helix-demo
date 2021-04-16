import { SubaccountTransformer } from '@injectivelabs/spot-consumer'
import { AccountAddress } from '@injectivelabs/ts-types'
import { authConsumer } from '~/app/singletons/AuthConsumer'
import { UiSubaccount } from '~/types/subaccount'
import { subaccountConsumer } from '../singletons/SubaccountConsumer'
import { peggyDenomToTokenFromContractAddress } from '../transformers/peggy'

export const getInjectiveAddress = (address: AccountAddress): string => {
  return authConsumer.getInjectiveAddress(address)
}

export const fetchSubaccounts = async (
  address: AccountAddress
): Promise<string[]> => {
  return subaccountConsumer.fetchSubaccounts(address)
}

export const fetchSubaccount = async (
  subaccountId: string
): Promise<UiSubaccount> => {
  const balances = SubaccountTransformer.balancesToUiBalances(
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
  try {
    const history = await subaccountConsumer.fetchSubaccountHistory(
      subaccountId
    )

    return SubaccountTransformer.transferHistoryToUiTransferHistory(history)
  } catch (e) {
    console.log('x')

    return []
  }
}
