import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedEllipsisFormatText } from '@shared/utils/formatter'
import { DEFAULT_TRUNCATE_LENGTH } from '@/app/utils/constants'

export function useReferralTransformer(
  referralList: ComputedRef<Record<string, string>[]>
) {
  const rows = computed(() =>
    referralList.value.map((referral) => {
      return {
        formattedAddress: sharedEllipsisFormatText(
          referral.address,
          DEFAULT_TRUNCATE_LENGTH
        ),
        commission: new BigNumberInBase(referral.commission),
        joinDate: new Date(referral.joinDate).toLocaleDateString('en-GB')
      }
    })
  )

  return { rows }
}
