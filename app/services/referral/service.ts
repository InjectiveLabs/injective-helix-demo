import { ServiceOptions } from '@injectivelabs/ui-common'
import {
  ReferralConsumer,
  ReferralInfo,
  ReferralTransformer
} from '@injectivelabs/referral-consumer'
import { BaseService } from '@injectivelabs/ui-common/dist/services/BaseService'
import { IS_DEVNET } from '~/app/utils/constants'

export enum ReferralMetrics {
  Refer = 'Refer',
  GetFeeRecipient = 'GetFeeRecipient',
  GetReferralInfo = 'GetReferralInfo'
}

export class ReferralService extends BaseService {
  protected consumer: ReferralConsumer

  constructor(options: ServiceOptions) {
    super(options)
    this.consumer = new ReferralConsumer(
      IS_DEVNET
        ? 'https://devnet.referral.grpc.injective.dev'
        : 'https://referral.grpc.injective.network'
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

  async getReferralInfo(address: string): Promise<ReferralInfo> {
    const promise = this.consumer.getReferralInfo(address)

    try {
      const response = await this.fetchOrFetchAndMeasure(
        promise,
        ReferralMetrics.GetReferralInfo
      )

      return ReferralTransformer.grpcReferralInfoToReferralInfo(response)
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
