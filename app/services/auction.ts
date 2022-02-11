import {
  ExchangeTransformer,
  AuctionModuleState,
  AuctionConsumer
} from '@injectivelabs/chain-consumer'
import { app } from '../singletons/App'

export const chainAuctionConsumer = new AuctionConsumer(
  app.endpoints.sentryGrpcApi
)

export const fetchAuctionModuleState = async (): Promise<AuctionModuleState> => {
  try {
    const state = ExchangeTransformer.grpcAuctionModuleStateToAuctionModuleState(
      await chainAuctionConsumer.fetchModuleState()
    )
    const highestBidAmount = state.highestBid ? state.highestBid.amount : '0'
    const highestBidAmountWithoutDenom = decodeURI(highestBidAmount).replace(
      /[^0-9]/g,
      ''
    )

    return {
      ...state,
      highestBid: {
        bidder: state.highestBid ? state.highestBid.bidder : '',
        amount: highestBidAmountWithoutDenom
      }
    }
  } catch (e: any) {
    throw new Error(e.message)
  }
}
