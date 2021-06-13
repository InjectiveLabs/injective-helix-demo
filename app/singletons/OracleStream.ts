import { OracleStream } from '@injectivelabs/exchange-consumer'
import { app } from './App'

export const oracleStream = new OracleStream(app.appUrlEndpoint.exchangeUrl)
