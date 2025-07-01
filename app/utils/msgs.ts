import { usdtToken } from '@shared/data/token'
import { NETWORK } from '@shared/utils/constant'
import { OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { getDerivativeOrderTypeToSubmit } from './helpers'
import { orderSideToOrderType } from '@shared/transformer/trade'
import { getCw20AdapterContractForNetwork } from '@injectivelabs/networks'
import { gridStrategyAuthorizationMessageTypes } from '../data/grid-strategy'
import {
  MsgGrant,
  MsgWithdraw,
  TradeDirection,
  ExecArgCW20Send,
  isCw20ContractAddress,
  MsgExecuteContractCompat,
  MsgCancelDerivativeOrder,
  NEPTUNE_USDT_CW20_CONTRACT,
  MsgCreateDerivativeMarketOrder,
  derivativePriceToChainPriceToFixed,
  getGenericAuthorizationFromMessageType,
  derivativeQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { neptuneService } from '@/app/Services'
import { NEPTUNE_USDT_BUFFER } from '@/app/utils/constants'
import { ConditionalOrderSide, type UiDerivativeMarket } from '@/types'
import type {
  Msgs,
  PositionV2,
  TokenStatic,
  DerivativeLimitOrder
} from '@injectivelabs/sdk-ts'

export const prepareNeptuneWithdrawMessage = ({
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
  quantity: string
  token: TokenStatic
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

export const createTpSlMessage = ({
  market,
  quantity,
  marketId,
  markPrice,
  triggerPrice,
  subaccountId,
  feeRecipient,
  isExitOrderBuy,
  injectiveAddress
}: {
  marketId: string
  feeRecipient: string
  subaccountId: string
  isExitOrderBuy: boolean
  injectiveAddress: string
  quantity: BigNumberInBase
  market: UiDerivativeMarket
  markPrice: BigNumberInBase
  triggerPrice: BigNumberInBase
}) => {
  const DEFAULT_SLIPPAGE = 0.01 // %1 slippage of the trigger price

  if (triggerPrice.eq(0)) {
    return undefined
  }

  const orderType = getDerivativeOrderTypeToSubmit({
    isBuy: isExitOrderBuy,
    isPostOnly: true,
    isTriggerOrder: true,
    markPrice: markPrice.toFixed(),
    triggerPrice: triggerPrice.toFixed()
  })

  const orderExecutionPriceWithSlippage = (
    isExitOrderBuy
      ? triggerPrice.times(1 + DEFAULT_SLIPPAGE)
      : triggerPrice.times(1 - DEFAULT_SLIPPAGE)
  ).dp(market.priceDecimals)

  const message = MsgCreateDerivativeMarketOrder.fromJSON({
    subaccountId,
    injectiveAddress,
    price: derivativePriceToChainPriceToFixed({
      value: orderExecutionPriceWithSlippage.toFixed(),
      quoteDecimals: market.quoteToken.decimals
    }),
    margin: '0',
    quantity: derivativeQuantityToChainQuantityToFixed({
      value: quantity.toFixed()
    }),
    marketId,
    feeRecipient: feeRecipient,
    triggerPrice: derivativePriceToChainPriceToFixed({
      value: triggerPrice.toFixed(),
      quoteDecimals: market.quoteToken.decimals
    }),
    orderType: orderSideToOrderType(orderType)
  })

  return message
}

export const createCancelTpSlOrderMsgs = ({
  market,
  positions,
  quantity,
  orderSide,
  subaccountId,
  injectiveAddress,
  conditionalOrders
}: {
  orderSide: OrderSide
  subaccountId: string
  positions: PositionV2[]
  injectiveAddress: string
  quantity: BigNumberInBase
  market: UiDerivativeMarket
  conditionalOrders: DerivativeLimitOrder[]
}) => {
  const msgs = [] as Msgs[]

  const position = positions.find(
    (position) =>
      position.marketId === market.marketId &&
      position.subaccountId === subaccountId
  )

  if (!position) {
    return msgs
  }

  const shouldAutoCancelTpSlOnLong =
    position.direction === TradeDirection.Long &&
    [
      OrderSide.Sell,
      OrderSide.SellPO,
      OrderSide.TakeSell,
      OrderSide.StopSell
    ].includes(orderSide)

  const shouldAutoCancelTpSlOnShort =
    position.direction === TradeDirection.Short &&
    [
      OrderSide.Buy,
      OrderSide.BuyPO,
      OrderSide.TakeBuy,
      OrderSide.StopBuy
    ].includes(orderSide)

  const shouldAutoCancelTpSl =
    shouldAutoCancelTpSlOnLong || shouldAutoCancelTpSlOnShort

  if (!shouldAutoCancelTpSl) {
    return msgs
  }

  const availablePositionQuantity = new BigNumberInBase(position.quantity || 0)

  const remainingQuantity = availablePositionQuantity.minus(quantity)

  const selectedPositionConditionalOrders = conditionalOrders.filter(
    (order) => order.marketId === market.marketId
  )

  const tpOrder = selectedPositionConditionalOrders.find(
    (item) =>
      item.orderType === ConditionalOrderSide.TakeBuy ||
      item.orderType === ConditionalOrderSide.TakeSell
  )

  const slOrder = selectedPositionConditionalOrders.find(
    (item) =>
      item.orderType === ConditionalOrderSide.StopBuy ||
      item.orderType === ConditionalOrderSide.StopSell
  )

  if (
    tpOrder &&
    new BigNumberInBase(remainingQuantity).lt(tpOrder.quantity || 0)
  ) {
    const cancelTpMessage = MsgCancelDerivativeOrder.fromJSON({
      injectiveAddress: injectiveAddress,
      marketId: tpOrder.marketId,
      orderHash: tpOrder.orderHash,
      subaccountId: tpOrder.subaccountId
    })

    msgs.push(cancelTpMessage)
  }

  if (
    slOrder &&
    new BigNumberInBase(remainingQuantity).lt(slOrder.quantity || 0)
  ) {
    const cancelSlMessage = MsgCancelDerivativeOrder.fromJSON({
      injectiveAddress: injectiveAddress,
      marketId: slOrder.marketId,
      orderHash: slOrder.orderHash,
      subaccountId: slOrder.subaccountId
    })

    msgs.push(cancelSlMessage)
  }

  return msgs
}
