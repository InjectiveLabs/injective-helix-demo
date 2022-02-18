import { ServiceOptions } from '@injectivelabs/ui-common'
import {
  ReferralConsumer,
  ReferralTransformer
} from '@injectivelabs/referral-consumer'
import { BaseService } from '@injectivelabs/ui-common/dist/BaseService'

export enum ReferralMetrics {
  Refer = 'Refer',
  GetFeeRecipient = 'GetFeeRecipient'
}

export class ReferralService extends BaseService {
  protected consumer: ReferralConsumer

  constructor(options: ServiceOptions) {
    super(options)
    this.consumer = new ReferralConsumer(
      'https://devnet.referral.grpc.injective.dev'
    )
  }

  async refer({ address, code }: { address: string; code: string }) {
    const promise = this.consumer.refer({ address, code })

    try {
      const response = await this.fetchOrFetchAndMeasure(
        promise,
        ReferralMetrics.Refer
      )

      return response
    } catch (e: any) {
      throw new Error(e.message)
    }
  }

  async getFeeRecipient(address: string): Promise<string> {
    const promise = this.consumer.getFeeRecipient(address)

    try {
      const response = await this.fetchOrFetchAndMeasure(
        promise,
        ReferralMetrics.GetFeeRecipient
      )

      return ReferralTransformer.grpcFeeRecipientToFeeRecipient(response)
        .feeRecipient
    } catch (e: any) {
      throw new Error(e.message)
    }
  }
}
