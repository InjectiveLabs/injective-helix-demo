import {
  getGenericAuthorizationFromMessageType,
  MsgGrant,
  MsgWithdraw
} from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { gridStrategyAuthorizationMessageTypes } from '../data/grid-strategy'

export const prepareWithdrawMsg = (gridStrategySubaccountId: string) => {
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  const withdrawMsgs = (
    accountStore.subaccountBalancesMap[gridStrategySubaccountId] || []
  )
    .filter((balance) =>
      new BigNumberInBase(balance.availableBalance)
        .dp(0, BigNumberInBase.ROUND_DOWN)
        .gt(0)
    )
    .map((balance) =>
      MsgWithdraw.fromJSON({
        injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
        subaccountId: gridStrategySubaccountId,
        amount: {
          amount: new BigNumberInBase(balance.availableBalance).toFixed(
            0,
            BigNumberInBase.ROUND_DOWN
          ),
          denom: balance.denom
        }
      })
    )

  return withdrawMsgs
}
export const prepareAuthZMsg = (contractAddress: string) => {
  const authZStore = useAuthZStore()
  const sharedWalletStore = useSharedWalletStore()

  const grantAuthZMessages = gridStrategyAuthorizationMessageTypes.map(
    (messageType) =>
      MsgGrant.fromJSON({
        grantee: contractAddress,
        granter: sharedWalletStore.injectiveAddress,
        authorization: getGenericAuthorizationFromMessageType(messageType)
      })
  )

  const isAuthorized = gridStrategyAuthorizationMessageTypes.every((m) =>
    authZStore.granterGrants.some(
      (grant) =>
        grant.authorizationType.endsWith(m) && grant.grantee === contractAddress
    )
  )

  if (!isAuthorized) {
    return grantAuthZMessages
  }

  return []
}
