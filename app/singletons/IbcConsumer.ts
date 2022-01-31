import { IBCConsumer } from '@injectivelabs/chain-consumer'
import { app } from './App'

export const ibcConsumer = new IBCConsumer(app.endpoints.sentryGrpcApi)
