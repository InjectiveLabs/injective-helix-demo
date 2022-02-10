import { ReferralConsumer } from '@injectivelabs/referral-consumer'
import { app } from './App'

export const referralConsumer = new ReferralConsumer(
  'https://devnet.referral.grpc.injective.dev'
)
