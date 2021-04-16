import { SubaccountConsumer } from '@injectivelabs/spot-consumer'
import { app } from './App'

export const subaccountConsumer = new SubaccountConsumer(
  app.appUrlEndpoint.exchangeUrl
)
