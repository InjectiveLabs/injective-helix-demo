import {
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'

export const spotMarketKey = Symbol('Market') as InjectionKey<
  ComputedRef<UiSpotMarketWithToken | undefined>
>

export const derivativeMarketKey = Symbol('Market') as InjectionKey<
  ComputedRef<UiDerivativeMarketWithToken | undefined>
>
