import { AccountAddress } from '@injectivelabs/ts-types'
import {
  ReferralTransformer
} from '@injectivelabs/referral-consumer'
import { metricsProvider } from '../providers/MetricsProvider'
import { referralConsumer } from '~/app/singletons/ReferralConsumer'
import { ReferralMetrics } from '~/types/metrics'

export const refer = async ({ address, code }: { address: string, code: string }) => {
  const promise = referralConsumer.refer({ address, code })

  try {
    const response = await metricsProvider.sendAndRecord(
      promise,
      ReferralMetrics.Refer
    )

    return response
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const getFeeRecipient = async (
  address: AccountAddress
): Promise<AccountAddress> => {
  const promise = referralConsumer.getFeeRecipient(address)
  try {
    const response = await metricsProvider.sendAndRecord(
      promise,
      ReferralMetrics.GetFeeRecipient
    )

    return ReferralTransformer.grpcFeeRecipientToFeeRecipient(response)
      .feeRecipient
  } catch (e: any) {
    throw new Error(e.message)
  }
}
