import { ExchangeConsumer } from '@injectivelabs/chain-consumer'
import { app } from './App'

export const exchangeConsumer = new ExchangeConsumer(
  app.appUrlEndpoint.chainUrl
)
