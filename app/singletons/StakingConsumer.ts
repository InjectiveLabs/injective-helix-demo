import { StakingConsumer } from '@injectivelabs/chain-consumer'
import { app } from './App'

export const stakingConsumer = new StakingConsumer(app.appUrlEndpoint.chainUrl)
