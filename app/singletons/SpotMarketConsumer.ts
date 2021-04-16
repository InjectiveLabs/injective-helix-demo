import { SpotMarketConsumer } from '@injectivelabs/spot-consumer'
import { app } from './App'

export const spotConsumer = new SpotMarketConsumer(
  app.appUrlEndpoint.exchangeUrl
)
