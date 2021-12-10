import { DMMConsumer } from '@injectivelabs/exchange-consumer'
import { app } from './App'

export const dmmConsumer = new DMMConsumer(app.appUrlEndpoint.dmmExchangeUrl)
