import {
  TokenStatic,
  ExecArgCW20Send,
  isCw20ContractAddress,
  MsgExecuteContractCompat,
  NEPTUNE_USDT_CW20_CONTRACT,
  getGenericAuthorizationFromMessageType,
  MsgGrant,
  MsgWithdraw
} from '@injectivelabs/sdk-ts'
import { usdtToken } from '@shared/data/token'
import { NETWORK } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { getCw20AdapterContractForNetwork } from '@injectivelabs/networks'
import { gridStrategyAuthorizationMessageTypes } from '../data/grid-strategy'
import { neptuneService } from '@/app/Services'
import { NEPTUNE_USDT_BUFFER } from '@/app/utils/constants'

export const prepareOrderMessages = ({
  denom,
  amount
}: {
  denom: string
  amount: string
}) => {
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  const bankBalance = new BigNumberInBase(
    accountStore.balancesMap[denom] || '0'
  )

  const hasSufficientBalanceInBank = new BigNumberInBase(bankBalance).gte(
    amount
  )

  if (hasSufficientBalanceInBank) {
    return []
  }

  if (denom === usdtToken.denom) {
    const cw20Balance = accountStore.cw20BalancesMap[NEPTUNE_USDT_CW20_CONTRACT]

    if (!cw20Balance) {
      return []
    }

    const nUsdtNeededInBank = new BigNumberInBase(amount).minus(bankBalance)

    const nUsdtNeededInCw20 = new BigNumberInBase(
      neptuneService.calculateCw20Amount(
        nUsdtNeededInBank.toNumber(),
        accountStore.neptuneUsdtRedemptionRatio
      )
    )
      .times(1 + NEPTUNE_USDT_BUFFER)
      .integerValue(BigNumberInBase.ROUND_UP)

    if (!nUsdtNeededInCw20.isFinite() || !nUsdtNeededInBank.isFinite()) {
      return []
    }

    return [
      neptuneService.createWithdrawMsg({
        amount: nUsdtNeededInCw20.toFixed(),
        sender: sharedWalletStore.injectiveAddress,
        cw20ContractAddress: NEPTUNE_USDT_CW20_CONTRACT
      })
    ]
  }

  const [baseCw20Address] = denom.split('/').reverse()

  if (!baseCw20Address) {
    return []
  }

  const cw20Balance = accountStore.cw20BalancesMap[baseCw20Address]

  if (!cw20Balance) {
    return []
  }

  return [
    MsgExecuteContractCompat.fromJSON({
      contractAddress: baseCw20Address,
      sender: sharedWalletStore.injectiveAddress,
      execArgs: ExecArgCW20Send.fromJSON({
        contractAddress: getCw20AdapterContractForNetwork(NETWORK),
        amount: cw20Balance
      })
    })
  ]
}

/**
 * Add a Cw20 conversion message if:
 * 1. The base token is cw20 and doesn't have enough balance in the bank
 */
export const convertCw20ToBankBalanceForSwap = ({
  token,
  quantity,
  injectiveAddress,
  bankBalancesMap,
  cw20BalancesMap
}: {
  token: TokenStatic
  quantity: string
  injectiveAddress: string
  bankBalancesMap: Record<string, string>
  cw20BalancesMap: Record<string, string>
}) => {
  const [cw20Address] = token.denom.split('/').reverse()

  if (!cw20Address) {
    return
  }

  if (!isCw20ContractAddress(cw20Address)) {
    return
  }

  const quantityInWei = new BigNumberInBase(quantity).toWei(token.decimals)
  const hasSufficientBalanceInBank = new BigNumberInBase(
    bankBalancesMap[token.denom] || 0
  ).gte(quantityInWei.toFixed())

  if (hasSufficientBalanceInBank) {
    return
  }

  return MsgExecuteContractCompat.fromJSON({
    contractAddress: cw20Address,
    sender: injectiveAddress,
    execArgs: ExecArgCW20Send.fromJSON({
      contractAddress: getCw20AdapterContractForNetwork(NETWORK),
      amount: cw20BalancesMap[cw20Address]
    })
  })
}

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
