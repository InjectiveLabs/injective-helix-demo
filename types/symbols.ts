import { ShallowRef } from 'vue'
import { Status } from '@injectivelabs/utils'
import { UiMarketWithToken } from './trade'
import { OrderbookWorkerMessage } from './worker'

export const OrderbookWorkerKey = Symbol('OrderbookWorker') as InjectionKey<
  ShallowRef<
    | (Omit<Worker, 'postMessage'> & {
        postMessage(message: OrderbookWorkerMessage): void
      })
    | null
  >
>

export const MarketKey = Symbol('Market') as InjectionKey<
  ComputedRef<UiMarketWithToken | undefined>
>

export const PortfolioStatusKey = Symbol(
  'PortfolioStatus'
) as InjectionKey<Status>

export const OrderbookStatusKey = Symbol(
  'orderbookStatus'
) as InjectionKey<Status>
export const IsSpotKey = Symbol('isSpot') as InjectionKey<boolean>
export const AggregationKey = Symbol('aggregation') as InjectionKey<Ref<number>>
