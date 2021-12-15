import {
  ExchangeTransformer,
  AuctionModuleState
} from '@injectivelabs/chain-consumer'
import { chainAuctionConsumer } from '~/app/singletons/ChainAuctionConsumer'

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
