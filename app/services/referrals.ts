import {
  ReferralConsumer,
  ReferralInfo,
  ReferralTransformer
} from '@injectivelabs/referral-consumer'
import { IS_DEVNET } from '../utils/constants'

export const referralConsumer = new ReferralConsumer(
  IS_DEVNET
    ? 'https://devnet.referral.grpc.injective.dev'
    : 'https://referral.grpc.injective.network'
)

export enum ReferralMetrics {
  Refer = 'Refer',
  GetFeeRecipient = 'GetFeeRecipient',
  GetReferralInfo = 'GetReferralInfo'
}

export const refer = async ({
  address,
  code
}: {
  address: string
  code: string
}) => {
  try {
    const response = await referralConsumer.refer({ address, code })

    return response
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const getReferralInfo = async (
  address: string
): Promise<ReferralInfo> => {
  try {
    const response = await referralConsumer.getReferralInfo(address)

    return ReferralTransformer.grpcReferralInfoToReferralInfo(response)
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const getFeeRecipient = async (address: string): Promise<string> => {
  try {
    const response = await referralConsumer.getFeeRecipient(address)

    return ReferralTransformer.grpcFeeRecipientToFeeRecipient(response)
      .feeRecipient
  } catch (e: any) {
    throw new Error(e.message)
  }
}
