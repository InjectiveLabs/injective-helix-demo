import { DMMConsumer } from '@injectivelabs/exchange-consumer'
import { app } from './App'

const dmmPlaygroundExchangeUrl = 'https://dmm.exchange.injective.dev'

export const dmmConsumer = new DMMConsumer(dmmPlaygroundExchangeUrl)
