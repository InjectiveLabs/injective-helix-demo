import { Status } from '@injectivelabs/utils'
import { ShallowRef } from 'nuxt/dist/app/compat/capi'
import { UiMarketWithToken } from './trade'
import { OrderbookWorkerMessage } from './worker'
import { UiSpotMarket, UiDerivativeMarket } from '@/types'

export const OrderbookWorkerKey = Symbol('OrderbookWorker') as InjectionKey<
  ShallowRef<
    | (Omit<Worker, 'postMessage'> & {
        postMessage(message: OrderbookWorkerMessage): void
      })
    | null
  >
>

export const SpotMarketKey = Symbol('SpotMarket') as InjectionKey<
  ComputedRef<UiSpotMarket | undefined>
>
export const DerivativeMarketKey = Symbol('DerivativeMarket') as InjectionKey<
  ComputedRef<UiDerivativeMarket | undefined>
>
export const MarketKey = Symbol('Market') as InjectionKey<
  ComputedRef<UiMarketWithToken | undefined>
>

export const PortfolioStatusKey = Symbol(
  'PortfolioStatus'
) as InjectionKey<Status>
export const UnknownTokenStatusKey = Symbol(
  'unknownTokensStatus'
) as InjectionKey<Status>

export const OrderbookStatusKey = Symbol(
  'orderbookStatus'
) as InjectionKey<Status>
export const IsSpotKey = Symbol('isSpot') as InjectionKey<boolean>
export const AggregationKey = Symbol('aggregation') as InjectionKey<Ref<number>>
