import {
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { Status } from '@injectivelabs/utils'

export const spotMarketKey = Symbol('Market') as InjectionKey<
  ComputedRef<UiSpotMarketWithToken | undefined>
>

export const derivativeMarketKey = Symbol('Market') as InjectionKey<
  ComputedRef<UiDerivativeMarketWithToken | undefined>
>

export const portfolioStatusKey = Symbol(
  'PortfolioStatus'
) as InjectionKey<Status>

export const tokensStatusKey = Symbol('TokensStatus') as InjectionKey<Status>
