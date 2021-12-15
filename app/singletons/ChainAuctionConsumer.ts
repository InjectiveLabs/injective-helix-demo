import { AuctionConsumer } from '@injectivelabs/chain-consumer'
import { app } from './App'

export const chainAuctionConsumer = new AuctionConsumer(
  app.appUrlEndpoint.chainUrl
)
