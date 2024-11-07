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
import { FEE_RECIPIENT } from '@/app/utils/constants'
import { backupPromiseCall } from '@/app/utils/async'
import { convertCw20ToBankBalance } from '@/app/utils/market'
import { orderSideToChaseOrderType } from '@/app/utils/trade'
import { UiSpotMarket } from '@/types'

const fetchBalances = (
  {
    shouldFetchCw20Balances
  }: {
    shouldFetchCw20Balances: boolean
  } = { shouldFetchCw20Balances: false }
) => {
  const accountStore = useAccountStore()

  return backupPromiseCall(() =>
    Promise.all([
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

  const cw20ConvertMessage = convertCw20ToBankBalance({
    market,
    injectiveAddress: sharedWalletStore.injectiveAddress,
    bankBalancesMap: accountStore.balancesMap,
    cw20BalancesMap: accountStore.cw20BalancesMap,
    order: {
      market,
      orderSide,
      price: priceToFixed,
      quantity: quantityToFixed
    }
  })

  const orderMessage = MsgCreateSpotLimitOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT,
    price: spotPriceToChainPriceToFixed({
      value: price.toFixed(),
      baseDecimals: market.baseToken.decimals,
      quoteDecimals: market.quoteToken.decimals
    }),
    quantity: sharedToBalanceInWei({
      value: quantity.toFixed(),
      decimalPlaces: market.baseToken.decimals
    }).toFixed(),
    orderType: orderSideToOrderType(orderSide)
  })

  const messages = cw20ConvertMessage
    ? [cw20ConvertMessage, orderMessage]
    : orderMessage

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

  await fetchBalances({ shouldFetchCw20Balances: !!cw20ConvertMessage })
}

export const submitMarketOrder = async ({
  orderSide,
  price,
  market,
  quantity
}: {
  orderSide: OrderSide
  price: BigNumberInBase
  quantity: BigNumberInBase
  market: UiSpotMarket
}) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
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

  const cw20ConvertMessage = convertCw20ToBankBalance({
    market,
    injectiveAddress: sharedWalletStore.injectiveAddress,
    bankBalancesMap: accountStore.balancesMap,
    cw20BalancesMap: accountStore.cw20BalancesMap,
    order: {
      market,
      orderSide,
      price: priceToFixed,
      quantity: quantityToFixed
    }
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
    feeRecipient: FEE_RECIPIENT,
    orderType: orderSideToOrderType(orderSide)
  })

  const messages = cw20ConvertMessage
    ? [cw20ConvertMessage, orderMessage]
    : [orderMessage]

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

  await fetchBalances({ shouldFetchCw20Balances: !!cw20ConvertMessage })
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
    feeRecipient: FEE_RECIPIENT,
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
    feeRecipient: FEE_RECIPIENT,
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
  const sharedWalletStore = useSharedWalletStore()

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
    spotOrdersToCreate: [
      {
        marketId: market.marketId,
        feeRecipient: FEE_RECIPIENT,
        price: spotPriceToChainPriceToFixed({
          value: price.toFixed(),
          baseDecimals: market.baseToken.decimals,
          quoteDecimals: market.quoteToken.decimals
        }),
        triggerPrice: '0',
        quantity: order.quantity,
        orderType: orderSideToChaseOrderType(order.orderSide)
      }
    ]
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })
  await fetchBalances()
}
