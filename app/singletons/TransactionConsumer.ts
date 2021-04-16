import { TransactionConsumer } from '@injectivelabs/exchange-consumer'
import { app } from './App'

export const transactionConsumer = new TransactionConsumer(
  app.appUrlEndpoint.exchangeUrl
)
