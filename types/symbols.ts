import { Status } from '@injectivelabs/utils'
import { ShallowRef } from 'nuxt/dist/app/compat/capi'
import { UiMarketWithToken } from './trade'
import { OrderbookWorkerMessage } from './worker'
import { UiSpotMarket, UiDerivativeMarket } from '@/types'

export const orderbookWorkerKey = Symbol('OrderbookWorker') as InjectionKey<
  ShallowRef<
    | (Omit<Worker, 'postMessage'> & {
        postMessage(message: OrderbookWorkerMessage): void
      })
    | null
  >
>

export const spotMarketKey = Symbol('SpotMarket') as InjectionKey<
  ComputedRef<UiSpotMarket | undefined>
>
export const derivativeMarketKey = Symbol('DerivativeMarket') as InjectionKey<
  ComputedRef<UiDerivativeMarket | undefined>
>
export const marketKey = Symbol('Market') as InjectionKey<
  ComputedRef<UiMarketWithToken | undefined>
>

export const portfolioStatusKey = Symbol(
  'PortfolioStatus'
) as InjectionKey<Status>
export const unknownTokenStatusKey = Symbol(
  'unknownTokensStatus'
) as InjectionKey<Status>

export const isSpotKey = Symbol('isSpot') as InjectionKey<boolean>
export const aggregationKey = Symbol('aggregation') as InjectionKey<Ref<number>>
export const orderbookStatusKey = Symbol(
  'orderbookStatus'
) as InjectionKey<Status>
