import { SubaccountConsumer } from '@injectivelabs/subaccount-consumer'
import { app } from './App'

export const subaccountConsumer = new SubaccountConsumer(
  app.appUrlEndpoint.exchangeUrl
)
