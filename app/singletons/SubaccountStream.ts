import { SubaccountStream } from '@injectivelabs/subaccount-consumer'
import { app } from './App'

export const subaccountStream = new SubaccountStream(
  app.appUrlEndpoint.exchangeUrl
)
