import { DerivativeMarketStream } from '@injectivelabs/derivatives-consumer'
import { app } from './App'

export const derivativeMarketStream = new DerivativeMarketStream(
  app.appUrlEndpoint.exchangeUrl
)
