import { BankConsumer } from '@injectivelabs/chain-consumer'
import { app } from './App'

export const bankConsumer = new BankConsumer(app.appUrlEndpoint.chainUrl)
