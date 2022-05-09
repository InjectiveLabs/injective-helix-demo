import { ServiceOptions } from '@injectivelabs/ui-common'
import {
  AuctionConsumer,
  ExchangeTransformer,
  AuctionModuleState
} from '@injectivelabs/chain-consumer'
import { BaseService } from '@injectivelabs/ui-common/dist/services/BaseService'

export class AuctionService extends BaseService {
  protected consumer: AuctionConsumer

  constructor(options: ServiceOptions) {
    super(options)
    this.consumer = new AuctionConsumer(this.endpoints.sentryGrpcApi)
  }

  async fetchAuctionModuleState(): Promise<AuctionModuleState> {
    try {
      const state = ExchangeTransformer.grpcAuctionModuleStateToAuctionModuleState(
        await this.consumer.fetchModuleState()
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
}
