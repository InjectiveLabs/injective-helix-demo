import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'

export const spotMarketKey = Symbol('Market') as InjectionKey<
  ComputedRef<UiSpotMarketWithToken | undefined>
>
