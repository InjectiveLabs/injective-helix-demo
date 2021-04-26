import { SubaccountStream } from '@injectivelabs/spot-consumer'
import { app } from './App'

export const subaccountStream = new SubaccountStream(
  app.appUrlEndpoint.exchangeUrl
)
