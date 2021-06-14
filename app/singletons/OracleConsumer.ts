import { OracleConsumer } from '@injectivelabs/exchange-consumer'
import { app } from './App'

export const oracleConsumer = new OracleConsumer(app.appUrlEndpoint.exchangeUrl)
