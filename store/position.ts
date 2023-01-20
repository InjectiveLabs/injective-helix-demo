import { defineStore } from 'pinia'
import { BigNumberInBase } from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  DerivativeOrderSide,
  MsgCreateBinaryOptionsMarketOrder,
  MsgCreateDerivativeMarketOrder,
  MsgIncreasePositionMargin,
  derivativeMarginToChainMarginToFixed,
  derivativeQuantityToChainQuantityToFixed
  // MsgBatchUpdateOrders
} from '@injectivelabs/sdk-ts'
import {
  derivativeOrderTypeToGrpcOrderType,
  MarketType,
  UiDerivativeLimitOrder,
  UiDerivativeMarketWithToken,
  UiDerivativeOrderbook,
  UiPosition
} from '@injectivelabs/sdk-ui-ts'
import { FEE_RECIPIENT } from '@/app/utils/constants'
import {
  streamSubaccountPositions,
  cancelSubaccountPositionsStream
} from '@/app/client/streams/derivatives'
import { getRoundedLiquidationPrice } from '@/app/client/utils/derivatives'
import { indexerDerivativesApi, msgBroadcastClient } from '@/app/Services'
import { ActivityFetchOptions } from '@/types'

type OrderBookMap = Record<string, UiDerivativeOrderbook>

type PositionStoreState = {
  orderbooks: OrderBookMap
  subaccountPositions: UiPosition[]
  subaccountPositionsCount: number
}

const initialStateFactory = (): PositionStoreState => ({
  orderbooks: {} as OrderBookMap,
  subaccountPositions: [],
  subaccountPositionsCount: 0
})

export const usePositionStore = defineStore('position', {
  state: (): PositionStoreState => initialStateFactory(),
  actions: {
    reset() {
      const positionStore = usePositionStore()

      positionStore.$patch({
        ...initialStateFactory()
      })
    },

    async fetchSubaccountPositions(
      activityFetchOptions?: ActivityFetchOptions
    ) {
      const positionStore = usePositionStore()
      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const paginationOptions = activityFetchOptions?.pagination
      const filters = activityFetchOptions?.filters

      const { positions, pagination } =
        await indexerDerivativesApi.fetchPositions({
          marketId: filters?.marketId,
          marketIds: filters?.marketIds,
          subaccountId: subaccount.subaccountId,
          direction: filters?.direction,
          pagination: {
            skip: paginationOptions ? paginationOptions.skip : 0,
            limit: paginationOptions ? paginationOptions.limit : 0,
            endTime:
              positionStore.subaccountPositions.length > 0
                ? positionStore.subaccountPositions[0].updatedAt
                : 0
          }
        })

      positionStore.$patch({
        subaccountPositions: positions,
        subaccountPositionsCount: pagination.total
      })
    },

    // Fetching multiple market orderbooks for unrealized PnL calculation within
    async fetchMarketsOrderbook() {
      const positionStore = usePositionStore()

      const { markets } = useDerivativeStore()
      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      if (markets.length === 0) {
        return
      }

      const marketsOrderbook = await indexerDerivativesApi.fetchOrderbooks(
        markets.map((market) => market.marketId)
      )
      const marketsOrderbookMap = marketsOrderbook.reduce(
        (marketOrderbooks, { orderbook }, index) => {
          return {
            ...marketOrderbooks,
            [markets[index].marketId]: orderbook
          }
        },
        {} as OrderBookMap
      )

      positionStore.$patch({
        orderbooks: marketsOrderbookMap
      })
    },

    // Fetching multiple market orderbooks for unrealized PnL calculation within a market page
    async fetchOpenPositionsMarketsOrderbook() {
      const positionStore = usePositionStore()

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      const { subaccountPositions } = positionStore

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      if (subaccountPositions.length === 0) {
        return
      }

      const marketsOrderbook = await indexerDerivativesApi.fetchOrderbooks(
        subaccountPositions.map((position) => position.marketId)
      )
      const marketsOrderbookMap = marketsOrderbook.reduce(
        (marketOrderbooks, { orderbook }, index) => {
          return {
            ...marketOrderbooks,
            [subaccountPositions[index].marketId]: orderbook
          }
        },
        {} as OrderBookMap
      )

      positionStore.$patch({
        orderbooks: marketsOrderbookMap
      })
    },

    streamSubaccountPositions(marketId?: string) {
      const positionStore = usePositionStore()

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      streamSubaccountPositions({
        subaccountId: subaccount.subaccountId,
        marketId,
        callback: ({ position }) => {
          if (position) {
            const positionQuantity = new BigNumberInBase(position.quantity)

            const positionExist = positionStore.subaccountPositions.some(
              (p) => p.marketId === position.marketId
            )

            /**
             * Position has been closed
             */
            if (positionExist) {
              if (positionQuantity.lte(0)) {
                const subaccountPositions = [
                  ...positionStore.subaccountPositions
                ].filter((p) => p.marketId !== position.marketId)

                positionStore.$patch({
                  subaccountPositions
                })
              } else {
                const subaccountPositions =
                  positionStore.subaccountPositions.map((p) => {
                    return p.marketId === position.marketId ? position : p
                  })

                positionStore.$patch({
                  subaccountPositions
                })
              }
            } else if (positionQuantity.gt(0)) {
              positionStore.$patch({
                subaccountPositions: [
                  position,
                  ...positionStore.subaccountPositions
                ]
              })
            }
          }
        }
      })
    },

    cancelSubaccountPositionsStream() {
      cancelSubaccountPositionsStream()
    },

    async closePosition({
      market,
      position
    }: {
      market: UiDerivativeMarketWithToken
      position: UiPosition
    }) {
      const appStore = useAppStore()

      const { subaccount } = useAccountStore()
      const { address, injectiveAddress, isUserWalletConnected, validate } =
        useWalletStore()
      const { feeRecipient: referralFeeRecipient } = useReferralStore()

      if (!isUserWalletConnected || !subaccount || !market) {
        return
      }

      await appStore.queue()
      await validate()

      const orderType =
        position.direction === TradeDirection.Long
          ? DerivativeOrderSide.Sell
          : DerivativeOrderSide.Buy
      const liquidationPrice = getRoundedLiquidationPrice(position, market)

      const messageType =
        market.subType === MarketType.BinaryOptions
          ? MsgCreateBinaryOptionsMarketOrder
          : MsgCreateDerivativeMarketOrder

      const message = messageType.fromJSON({
        injectiveAddress,
        margin: '0',
        triggerPrice: '0',
        marketId: position.marketId,
        subaccountId: subaccount.subaccountId,
        orderType: derivativeOrderTypeToGrpcOrderType(orderType),
        feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
        price: liquidationPrice.toFixed(),
        quantity: derivativeQuantityToChainQuantityToFixed({
          value: position.quantity
        })
      })

      await msgBroadcastClient.broadcastOld({
        address,
        msgs: message
      })
    },

    async closeAllPosition(positions: UiPosition[]) {
      const appStore = useAppStore()
      const positionStore = usePositionStore()

      const { subaccount } = useAccountStore()
      const { markets } = useDerivativeStore()
      const { address, injectiveAddress, isUserWalletConnected, validate } =
        useWalletStore()
      const { feeRecipient: referralFeeRecipient } = useReferralStore()

      if (!isUserWalletConnected || !subaccount || positions.length === 0) {
        return
      }

      await appStore.queue()
      await validate()

      const formattedPositions = positions
        .map((position) => {
          const market = markets.find((m) => m.marketId === position.marketId)

          if (!market) {
            return undefined
          }

          const messageType =
            market.subType === MarketType.BinaryOptions
              ? MsgCreateBinaryOptionsMarketOrder
              : MsgCreateDerivativeMarketOrder
          const orderType =
            position.direction === TradeDirection.Long
              ? DerivativeOrderSide.Sell
              : DerivativeOrderSide.Buy
          const liquidationPrice = getRoundedLiquidationPrice(position, market)

          return {
            orderType,
            messageType,
            marketId: market.marketId,
            price: liquidationPrice.toFixed(),
            quantity: derivativeQuantityToChainQuantityToFixed({
              value: position.quantity
            })
          } as {
            messageType:
              | typeof MsgCreateBinaryOptionsMarketOrder
              | typeof MsgCreateDerivativeMarketOrder
            orderType: DerivativeOrderSide
            marketId: string
            price: string
            quantity: string
          }
        })
        .filter((p) => p !== undefined) as {
        messageType:
          | typeof MsgCreateBinaryOptionsMarketOrder
          | typeof MsgCreateDerivativeMarketOrder
        orderType: DerivativeOrderSide
        marketId: string
        price: string
        quantity: string
      }[]

      const messages = formattedPositions.map((position) =>
        position.messageType.fromJSON({
          injectiveAddress,
          margin: '0',
          triggerPrice: '0',
          marketId: position.marketId,
          subaccountId: subaccount.subaccountId,
          orderType: derivativeOrderTypeToGrpcOrderType(position.orderType),
          feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
          price: position.price,
          quantity: position.quantity
        })
      )

      await msgBroadcastClient.broadcastOld({
        address,
        msgs: messages
      })

      await positionStore.fetchSubaccountPositions()
    },

    async closePositionAndReduceOnlyOrders({
      market,
      position
    }: {
      market?: UiDerivativeMarketWithToken
      position: UiPosition
      reduceOnlyOrders: UiDerivativeLimitOrder[]
    }) {
      const appStore = useAppStore()
      const positionStore = usePositionStore()

      const { subaccount } = useAccountStore()
      const { market: currentMarket } = useDerivativeStore()
      const { address, injectiveAddress, isUserWalletConnected, validate } =
        useWalletStore()
      const { feeRecipient: referralFeeRecipient } = useReferralStore()

      const actualMarket = (currentMarket ||
        market) as UiDerivativeMarketWithToken

      if (!isUserWalletConnected || !subaccount || !actualMarket) {
        return
      }

      await appStore.queue()
      await validate()

      const orderType =
        position.direction === TradeDirection.Long
          ? DerivativeOrderSide.Sell
          : DerivativeOrderSide.Buy
      const liquidationPrice = getRoundedLiquidationPrice(
        position,
        actualMarket
      )

      /*
      const message = MsgBatchUpdateOrders.fromJSON({
        injectiveAddress,
        subaccountId: subaccount.subaccountId,
        derivativeOrdersToCancel: reduceOnlyOrders.map((order) => ({
          orderHash: order.orderHash,
          marketId: order.marketId,
          subaccountId: order.subaccountId
        })),
        derivativeOrdersToCreate: [
          {
            orderType: derivativeOrderTypeToGrpcOrderType(orderType),
            feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
            margin: '0',
            triggerPrice: '0',
            marketId: actualMarket.marketId,
            price: liquidationPrice.toFixed(),
            quantity: derivativeQuantityToChainQuantityToFixed({
              value: position.quantity
            })
          }
        ]
      }) */

      const messageType =
        actualMarket.subType === MarketType.BinaryOptions
          ? MsgCreateBinaryOptionsMarketOrder
          : MsgCreateDerivativeMarketOrder

      const message = messageType.fromJSON({
        injectiveAddress,
        margin: '0',
        triggerPrice: '0',
        marketId: actualMarket.marketId,
        subaccountId: subaccount.subaccountId,
        orderType: derivativeOrderTypeToGrpcOrderType(orderType),
        feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
        price: liquidationPrice.toFixed(),
        quantity: derivativeQuantityToChainQuantityToFixed({
          value: position.quantity
        })
      })

      await msgBroadcastClient.broadcastOld({
        address,
        msgs: message
      })

      await positionStore.fetchSubaccountPositions()
    },

    async addMarginToPosition({
      market,
      amount
    }: {
      market: UiDerivativeMarketWithToken
      amount: BigNumberInBase
    }) {
      const appStore = useAppStore()

      const { subaccount } = useAccountStore()
      const { address, injectiveAddress, isUserWalletConnected, validate } =
        useWalletStore()

      if (!isUserWalletConnected || !subaccount || !market) {
        return
      }

      await appStore.queue()
      await validate()

      const message = MsgIncreasePositionMargin.fromJSON({
        injectiveAddress,
        marketId: market.marketId,
        srcSubaccountId: subaccount.subaccountId,
        dstSubaccountId: subaccount.subaccountId,
        amount: derivativeMarginToChainMarginToFixed({
          value: amount,
          quoteDecimals: market.quoteToken.decimals
        })
      })

      await msgBroadcastClient.broadcastOld({
        address,
        msgs: message
      })
    }
  }
})
