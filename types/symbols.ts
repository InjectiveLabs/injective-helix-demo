import type { ShallowRef } from 'vue'
import type { Status } from '@injectivelabs/utils'
import type { UiMarketWithToken } from './trade'
import type { OrderbookWorkerMessage } from './worker'

export const OrderbookWorkerKey = Symbol('OrderbookWorker') as InjectionKey<
  ShallowRef<
    | null
    | ({
        postMessage(message: OrderbookWorkerMessage): void
      } & Omit<Worker, 'postMessage'>)
  >
>

export const MarketKey = Symbol('Market') as InjectionKey<
  ComputedRef<undefined | UiMarketWithToken>
>

export const PortfolioStatusKey = Symbol(
  'PortfolioStatus'
) as InjectionKey<Status>

export const OrderbookStatusKey = Symbol(
  'orderbookStatus'
) as InjectionKey<Status>

export const MarkPriceStatusKey = Symbol(
  'markPriceStatus'
) as InjectionKey<Status>

export const IsSpotKey = Symbol('isSpot') as InjectionKey<boolean>
export const InitialStatusKey = Symbol('InitialStatus') as InjectionKey<Status>
export const AggregationKey = Symbol('aggregation') as InjectionKey<Ref<number>>

export const IsRWAMarketOpenKey = Symbol('isRWAMarketOpen') as InjectionKey<
  Ref<boolean>
>
