import { SpotMarketStream } from '@injectivelabs/spot-consumer'
import { app } from './App'

export const spotMarketStream = new SpotMarketStream(
  app.appUrlEndpoint.exchangeUrl
)
