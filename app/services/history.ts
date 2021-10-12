import { DerivativeTransformer } from '@injectivelabs/derivatives-consumer'
import { SpotTransformer } from '@injectivelabs/spot-consumer'
import { SubaccountTransformer } from '@injectivelabs/subaccount-consumer'
import { metricsProvider } from '../providers/MetricsProvider'
import { derivativeConsumer } from '../singletons/DerivativeMarketConsumer'
import { spotConsumer } from '../singletons/SpotMarketConsumer'
import { subaccountConsumer } from '../singletons/SubaccountConsumer'
import { DerivativeOrderSide } from '~/types/derivatives'
import { subaccountHistoryToSubaccountUiHistory } from '~/app/transformers/account'
import { SpotOrderSide } from '~/types/spot'
import {
  AccountMetrics,
  DerivativesMetrics,
  SpotMetrics
} from '~/types/metrics'

export const fetchSubaccountTrades = async ({
  subaccountId
}: {
  orderSide?: DerivativeOrderSide | SpotOrderSide
  subaccountId: string
}) => {
  const promiseForDerivativeTrades = derivativeConsumer.fetchTrades({
    subaccountId
  })
  const derivativeTrades = await metricsProvider.sendAndRecord(
    promiseForDerivativeTrades,
    DerivativesMetrics.FetchTrades
  )

  const promiseForSpotTrades = spotConsumer.fetchTrades({
    subaccountId
  })
  const spotTrades = await metricsProvider.sendAndRecord(
    promiseForSpotTrades,
    SpotMetrics.FetchTrades
  )

  return [
    ...DerivativeTransformer.grpcTradesToTrades(derivativeTrades),
    ...SpotTransformer.grpcTradesToTrades(spotTrades)
  ]
}

export const fetchSubaccountTransfers = async (subaccountId: string) => {
  const promise = subaccountConsumer.fetchSubaccountHistory(subaccountId)
  const subaccountHistory = await metricsProvider.sendAndRecord(
    promise,
    AccountMetrics.FetchSubaccountHistory
  )

  return subaccountHistoryToSubaccountUiHistory(
    SubaccountTransformer.grpcTransferHistoryToTransferHistory(
      subaccountHistory
    )
  )
}
