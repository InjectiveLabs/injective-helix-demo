import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedEllipsisFormatText } from '@shared/utils/formatter'
import { DEFAULT_TRUNCATE_LENGTH } from '@/app/utils/constants'
import { Referral } from '@/types'

export function useReferralTransformer(referralList: ComputedRef<Referral[]>) {
  const rows = computed(() =>
    referralList.value.map((referral) => {
      return {
        timestamp: new Date(referral.timestamp).toLocaleDateString('en-GB'),
        commission: new BigNumberInBase(referral.commission),
        formattedAddress: sharedEllipsisFormatText(
          referral.address,
          DEFAULT_TRUNCATE_LENGTH
        )
      }
    })
  )

  return { rows }
}
