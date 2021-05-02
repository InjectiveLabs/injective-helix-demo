import { DerivativeMarketConsumer } from '@injectivelabs/derivatives-consumer'
import { app } from './App'

export const derivativeConsumer = new DerivativeMarketConsumer(
  app.appUrlEndpoint.exchangeUrl
)
