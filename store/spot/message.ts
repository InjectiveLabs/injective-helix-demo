import {
  SpotLimitOrder,
  SpotOrderHistory,
  MsgCancelSpotOrder,
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
  const appStore = useAppStore()
  const walletStore = useSharedWalletStore()
  const accountStore = useAccountStore()

  if (!walletStore.isUserConnected || !accountStore.subaccountId) {
    return
  }

  await appStore.queue()
  await walletStore.validate()

  const messages = orders.map((order) =>
    MsgBatchCancelSpotOrders.fromJSON({
      injectiveAddress: walletStore.authZOrInjectiveAddress,
      orders: [
        {
          marketId: order.marketId,
          subaccountId: order.subaccountId,
          orderHash: order.orderHash
        }
      ]
    })
  )

  await walletStore.broadcastWithFeeDelegation(messages)

  await fetchBalances()
}

export const cancelOrder = async (order: SpotLimitOrder | SpotOrderHistory) => {
  const appStore = useAppStore()
  const walletStore = useSharedWalletStore()
  const accountStore = useAccountStore()

  if (!walletStore.isUserConnected || !accountStore.subaccountId) {
    return
  }

  await appStore.queue()
  await walletStore.validate()

  const message = MsgCancelSpotOrder.fromJSON({
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    marketId: order.marketId,
    subaccountId: order.subaccountId,
    orderHash: order.orderHash
  })

  await walletStore.broadcastWithFeeDelegation(message)

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
  const walletStore = useSharedWalletStore()
  const accountStore = useAccountStore()

  if (!walletStore.isUserConnected || !accountStore.subaccountId || !market) {
    return
  }

  await appStore.queue()
  await appStore.validateGeoIp()
  await appStore.validateGeoIpBasedOnSpotAction(market)
  await walletStore.validate()

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
    injectiveAddress: walletStore.injectiveAddress,
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
    injectiveAddress: walletStore.authZOrInjectiveAddress,
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

  const message = cw20ConvertMessage
    ? [cw20ConvertMessage, orderMessage]
    : orderMessage

  await walletStore.broadcastWithFeeDelegation(message)

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
  const walletStore = useSharedWalletStore()
  const accountStore = useAccountStore()

  if (!walletStore.isUserConnected || !accountStore.subaccountId || !market) {
    return
  }

  await appStore.queue()
  await appStore.validateGeoIp()
  await appStore.validateGeoIpBasedOnSpotAction(market)
  await walletStore.validate()

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
    injectiveAddress: walletStore.injectiveAddress,
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
      walletStore.autoSign && walletStore.isAutoSignEnabled
        ? walletStore.injectiveAddress
        : walletStore.authZOrInjectiveAddress,
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT,
    orderType: orderSideToOrderType(orderSide)
  })

  const message = cw20ConvertMessage
    ? [cw20ConvertMessage, orderMessage]
    : [orderMessage]

  await walletStore.broadcastWithFeeDelegation(message)

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
  const walletStore = useSharedWalletStore()
  const accountStore = useAccountStore()

  if (!walletStore.isUserConnected || !accountStore.subaccountId || !market) {
    return
  }

  await appStore.queue()
  await appStore.validateGeoIp()
  await appStore.validateGeoIpBasedOnSpotAction(market)
  await walletStore.validate()

  const message = MsgCreateSpotLimitOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: walletStore.authZOrInjectiveAddress,
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

  await walletStore.broadcastWithFeeDelegation(message)

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
  const walletStore = useSharedWalletStore()
  const accountStore = useAccountStore()

  if (!walletStore.isUserConnected || !accountStore.subaccountId || !market) {
    return
  }

  await appStore.queue()
  await appStore.validateGeoIp()
  await appStore.validateGeoIpBasedOnSpotAction(market)
  await walletStore.validate()

  const message = MsgCreateSpotMarketOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: walletStore.authZOrInjectiveAddress,
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

  await walletStore.broadcastWithFeeDelegation(message)

  await fetchBalances()
}
