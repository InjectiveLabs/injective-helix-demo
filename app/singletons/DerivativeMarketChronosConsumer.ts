import { DerivativeMarketChronosConsumer } from '@injectivelabs/derivatives-consumer'
import { app } from './App'

export const derivativeChronosConsumer = new DerivativeMarketChronosConsumer(
  app.appUrlEndpoint.baseUrl
)
