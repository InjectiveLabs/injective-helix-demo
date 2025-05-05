import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedToBalanceInToken } from '@shared/utils/formatter'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { LiquidityDashboardTableColumn } from '@/types'
import type { Campaign } from '@injectivelabs/sdk-ts'
import type { TransformedLiquidityDashboard } from '@/types'

export function useLiquidityDashboardTransformer(
  campaignList: ComputedRef<Campaign[]>
) {
  const spotStore = useSpotStore()
  const sharedTokenStore = useSharedTokenStore()

  const rows = computed(() =>
    campaignList.value.reduce((list, campaign) => {
      const market = spotStore.marketByIdOrSlug(campaign.marketId)

      if (!market) {
        return list
      }

      const marketVolumeInUsd = new BigNumberInBase(
        sharedToBalanceInToken({
          value: campaign.userScore || 0,
          decimalPlaces:
            market.quoteToken?.decimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
        })
      ).times(sharedTokenStore.tokenUsdPrice(market.quoteToken))

      const userScore = campaign.userScore

      const totalScore = campaign.totalScore

      const estRewardsInPercentage =
        userScore && totalScore
          ? new BigNumberInBase(userScore).dividedBy(totalScore)
          : ZERO_IN_BASE

      const rewards = campaign.rewards.map((reward) => {
        const token = sharedTokenStore.tokenByDenomOrSymbol(reward.denom)

        const amount = sharedToBalanceInTokenInBase({
          value: new BigNumberInBase(estRewardsInPercentage)
            .times(reward.amount)
            .toFixed(),
          decimalPlaces: token?.decimals
        })

        const amountInUsd = token
          ? amount.times(sharedTokenStore.tokenUsdPrice(token))
          : ZERO_IN_BASE

        return {
          amount,
          symbol: token?.symbol || '',
          amountInUsd
        }
      })

      const totalAmountInUsd = rewards.reduce(
        (total, reward) => total.plus(reward.amountInUsd),
        ZERO_IN_BASE
      )

      list.push({
        campaign,
        totalAmountInUsd,
        marketVolumeInUsd,
        token: market.baseToken,
        campaignId: campaign.campaignId,
        [LiquidityDashboardTableColumn.Market]: market,
        [LiquidityDashboardTableColumn.Rewards]: rewards
      })

      return list
    }, [] as TransformedLiquidityDashboard[])
  )

  return { rows }
}
