import { SpotMarketChronosConsumer } from '@injectivelabs/spot-consumer'
import { app } from './App'

export const spotChronosConsumer = new SpotMarketChronosConsumer(
  app.appUrlEndpoint.baseUrl
)
