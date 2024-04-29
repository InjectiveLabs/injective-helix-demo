import {
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { Status } from '@injectivelabs/utils'
import { ShallowRef } from 'nuxt/dist/app/compat/capi'
import { OrderbookWorkerMessage } from './worker'
import { UiMarketWithToken } from './trade'

export const orderbookWorkerKey = Symbol('OrderbookWorker') as InjectionKey<
  ShallowRef<
    | (Omit<Worker, 'postMessage'> & {
        postMessage(message: OrderbookWorkerMessage): void
      })
    | null
  >
>

export const spotMarketKey = Symbol('SpotMarket') as InjectionKey<
  ComputedRef<UiSpotMarketWithToken | undefined>
>
export const derivativeMarketKey = Symbol('DerivativeMarket') as InjectionKey<
  ComputedRef<UiDerivativeMarketWithToken | undefined>
>
export const marketKey = Symbol('Market') as InjectionKey<
  ComputedRef<UiMarketWithToken | undefined>
>

export const portfolioStatusKey = Symbol(
  'PortfolioStatus'
) as InjectionKey<Status>

export const tokensStatusKey = Symbol('TokensStatus') as InjectionKey<Status>

export const isSpotKey = Symbol('isSpot') as InjectionKey<boolean>
export const aggregationKey = Symbol('aggregation') as InjectionKey<Ref<number>>
