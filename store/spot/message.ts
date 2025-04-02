import {
  SpotLimitOrder,
  SpotOrderHistory,
  MsgCancelSpotOrder,
  MsgBatchUpdateOrders,
  MsgCreateSpotLimitOrder,
  MsgBatchCancelSpotOrders,
  MsgCreateSpotMarketOrder,
  spotPriceToChainPriceToFixed,
  spotQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { orderSideToOrderType } from '@shared/transformer/trade'
import { backupPromiseCall } from '@/app/utils/async'
import { prepareOrderMessages } from '@/app/utils/market'
import { orderSideToChaseOrderType } from '@/app/utils/trade'
import { UiSpotMarket } from '@/types'

const fetchBalances = (
  {
    shouldFetchCw20Balances
  }: {
    shouldFetchCw20Balances: boolean
  } = { shouldFetchCw20Balances: false }
) => {
  const spotStore = useSpotStore()
  const accountStore = useAccountStore()

  return backupPromiseCall(() =>
    Promise.all([
      spotStore.fetchSubaccountOrders(),
      accountStore.fetchAccountPortfolioBalances(),
      ...(shouldFetchCw20Balances ? [accountStore.fetchCw20Balances()] : [])
    ])
  )
}

export const batchCancelOrder = async (orders: SpotLimitOrder[]) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
    return
  }

  await walletStore.validate()

  const messages = orders.map((order) =>
    MsgBatchCancelSpotOrders.fromJSON({
      injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
      orders: [
        {
          marketId: order.marketId,
          subaccountId: order.subaccountId,
          orderHash: order.orderHash
        }
      ]
    })
  )

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

  await fetchBalances()
}

export const cancelOrder = async (order: SpotLimitOrder | SpotOrderHistory) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
    return
  }

  await walletStore.validate()

  const messages = MsgCancelSpotOrder.fromJSON({
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    marketId: order.marketId,
    subaccountId: order.subaccountId,
    orderHash: order.orderHash
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

  await fetchBalances()
}

export const submitLimitOrder = async ({
  price,
  market,
  quantity,
  orderSide
}: {
  price: BigNumberInBase
  orderSide: OrderSide
  quantity: BigNumberInBase
  market: UiSpotMarket
}) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const referralStore = useReferralStore()
  const sharedWalletStore = useSharedWalletStore()

  if (
    !market ||
    !accountStore.subaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

  await walletStore.validate()
  await appStore.validateGeoIpBasedOnSpotAction({
    baseDenom: market.baseToken.denom,
    quoteDenom: market.quoteToken.denom
  })

  const priceToFixed = spotPriceToChainPriceToFixed({
    value: price.toFixed(),
    baseDecimals: market.baseToken.decimals,
    quoteDecimals: market.quoteToken.decimals
  })
  const quantityToFixed = sharedToBalanceInWei({
    value: quantity.toFixed(),
    decimalPlaces: market.baseToken.decimals
  }).toFixed()

  const orderMessage = MsgCreateSpotLimitOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    marketId: market.marketId,
    feeRecipient: referralStore.feeRecipient,
    price: priceToFixed,
    quantity: quantityToFixed,
    orderType: orderSideToOrderType(orderSide)
  })

  const isBuy = [OrderSide.BuyPO, OrderSide.Buy].includes(orderSide)

  const cw20ConvertMessage = prepareOrderMessages({
    denom: isBuy ? market.quoteDenom : market.baseDenom,
    amount: isBuy
      ? new BigNumberInBase(priceToFixed).times(quantityToFixed).toFixed()
      : quantityToFixed
  })

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [...cw20ConvertMessage, orderMessage]
  })

  await fetchBalances({
    shouldFetchCw20Balances: cw20ConvertMessage.length > 0
  })
}

export const submitMarketOrder = async ({
  price,
  market,
  quantity,
  orderSide
}: {
  orderSide: OrderSide
  price: BigNumberInBase
  quantity: BigNumberInBase
  market: UiSpotMarket
}) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const referralStore = useReferralStore()
  const sharedWalletStore = useSharedWalletStore()

  if (
    !market ||
    !accountStore.subaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

  await walletStore.validate()
  await appStore.validateGeoIpBasedOnSpotAction({
    baseDenom: market.baseToken.denom,
    quoteDenom: market.quoteToken.denom
  })

  const priceToFixed = spotPriceToChainPriceToFixed({
    value: price.toFixed(),
    baseDecimals: market.baseToken.decimals,
    quoteDecimals: market.quoteToken.decimals
  })
  const quantityToFixed = spotQuantityToChainQuantityToFixed({
    value: quantity.toFixed(),
    baseDecimals: market.baseToken.decimals
  })

  const cw20ConvertMessage = prepareOrderMessages({
    denom: orderSide === OrderSide.Buy ? market.quoteDenom : market.baseDenom,
    amount:
      orderSide === OrderSide.Buy
        ? new BigNumberInBase(priceToFixed).times(quantityToFixed).toFixed()
        : quantityToFixed
  })

  const orderMessage = MsgCreateSpotMarketOrder.fromJSON({
    price: priceToFixed,
    quantity: quantityToFixed,
    subaccountId: accountStore.subaccountId,
    injectiveAddress:
      sharedWalletStore.autoSign && sharedWalletStore.isAutoSignEnabled
        ? sharedWalletStore.injectiveAddress
        : sharedWalletStore.authZOrInjectiveAddress,
    marketId: market.marketId,
    feeRecipient: referralStore.feeRecipient,
    orderType: orderSideToOrderType(orderSide)
  })

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [...cw20ConvertMessage, orderMessage]
  })

  await fetchBalances({
    shouldFetchCw20Balances: cw20ConvertMessage.length > 0
  })
}

export const submitStopLimitOrder = async ({
  price,
  market,
  quantity,
  orderSide,
  triggerPrice
}: {
  price: BigNumberInBase
  orderSide: OrderSide
  quantity: BigNumberInBase
  triggerPrice: BigNumberInBase
  market: UiSpotMarket
}) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const referralStore = useReferralStore()
  const sharedWalletStore = useSharedWalletStore()

  if (
    !market ||
    !accountStore.subaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

  await walletStore.validate()
  await appStore.validateGeoIpBasedOnSpotAction({
    baseDenom: market.baseToken.denom,
    quoteDenom: market.quoteToken.denom
  })

  const messages = MsgCreateSpotLimitOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    marketId: market.marketId,
    feeRecipient: referralStore.feeRecipient,
    price: spotPriceToChainPriceToFixed({
      value: price.toFixed(),
      baseDecimals: market.baseToken.decimals,
      quoteDecimals: market.quoteToken.decimals
    }),
    triggerPrice: spotPriceToChainPriceToFixed({
      value: triggerPrice.toFixed(),
      baseDecimals: market.baseToken.decimals,
      quoteDecimals: market.quoteToken.decimals
    }),
    quantity: sharedToBalanceInWei({
      value: quantity.toFixed(),
      decimalPlaces: market.baseToken.decimals
    }).toFixed(),
    orderType: orderSideToOrderType(orderSide)
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

  await fetchBalances()
}

export const submitStopMarketOrder = async ({
  price,
  market,
  quantity,
  orderSide,
  triggerPrice
}: {
  price: BigNumberInBase
  orderSide: OrderSide
  quantity: BigNumberInBase
  triggerPrice: BigNumberInBase
  market: UiSpotMarket
}) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const referralStore = useReferralStore()
  const sharedWalletStore = useSharedWalletStore()

  if (
    !market ||
    !accountStore.subaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

  await walletStore.validate()
  await appStore.validateGeoIpBasedOnSpotAction({
    baseDenom: market.baseToken.denom,
    quoteDenom: market.quoteToken.denom
  })

  const messages = MsgCreateSpotMarketOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    marketId: market.marketId,
    feeRecipient: referralStore.feeRecipient,
    price: spotPriceToChainPriceToFixed({
      value: price.toFixed(),
      baseDecimals: market.baseToken.decimals,
      quoteDecimals: market.quoteToken.decimals
    }),
    triggerPrice: spotPriceToChainPriceToFixed({
      value: triggerPrice.toFixed(),
      baseDecimals: market.baseToken.decimals,
      quoteDecimals: market.quoteToken.decimals
    }),
    quantity: sharedToBalanceInWei({
      value: quantity.toFixed(),
      decimalPlaces: market.baseToken.decimals
    }).toFixed(),
    orderType: orderSideToOrderType(orderSide)
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

  await fetchBalances()
}

export async function submitChase({
  order,
  market,
  price
}: {
  order: SpotLimitOrder
  market: UiSpotMarket
  price: BigNumberInBase
}) {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const referralStore = useReferralStore()
  const sharedWalletStore = useSharedWalletStore()

  const priceToFixed = spotPriceToChainPriceToFixed({
    value: price.toFixed(),
    baseDecimals: market.baseToken.decimals,
    quoteDecimals: market.quoteToken.decimals
  })

  const cw20ConvertMessage = prepareOrderMessages({
    denom:
      order.orderSide === OrderSide.Buy ? market.quoteDenom : market.baseDenom,
    amount:
      order.orderSide === OrderSide.Buy
        ? order.quantity
        : new BigNumberInBase(priceToFixed).times(order.quantity).toFixed()
  })

  const messages = MsgBatchUpdateOrders.fromJSON({
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    subaccountId: order.subaccountId,
    spotOrdersToCancel: [
      {
        marketId: order.marketId,
        subaccountId: order.subaccountId,
        orderHash: order.orderHash
      }
    ],
    ...cw20ConvertMessage,
    spotOrdersToCreate: [
      {
        marketId: market.marketId,
        feeRecipient: referralStore.feeRecipient,
        price: priceToFixed,
        triggerPrice: '0',
        quantity: order.quantity,
        orderType: orderSideToChaseOrderType(order.orderSide)
      }
    ]
  })

  await appStore.validateGeoIpBasedOnSpotAction({
    baseDenom: market.baseToken.denom,
    quoteDenom: market.quoteToken.denom
  })
  await walletStore.validate()

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })
  await fetchBalances({
    shouldFetchCw20Balances: cw20ConvertMessage.length > 0
  })
}
