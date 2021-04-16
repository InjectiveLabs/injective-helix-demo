import { AuthConsumer } from '@injectivelabs/chain-consumer'
import { app } from './App'

export const authConsumer = new AuthConsumer(app.appUrlEndpoint.chainUrl)
